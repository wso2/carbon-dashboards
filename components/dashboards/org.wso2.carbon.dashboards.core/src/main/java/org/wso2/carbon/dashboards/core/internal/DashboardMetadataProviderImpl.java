/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
package org.wso2.carbon.dashboards.core.internal;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.carbon.analytics.idp.client.core.api.IdPClient;
import org.wso2.carbon.analytics.idp.client.core.exception.IdPClientException;
import org.wso2.carbon.analytics.permissions.PermissionProvider;
import org.wso2.carbon.analytics.permissions.bean.Permission;
import org.wso2.carbon.analytics.permissions.bean.Role;
import org.wso2.carbon.analytics.permissions.exceptions.PermissionException;
import org.wso2.carbon.dashboards.core.DashboardMetadataProvider;
import org.wso2.carbon.dashboards.core.WidgetMetadataProvider;
import org.wso2.carbon.dashboards.core.bean.DashboardConfigurations;
import org.wso2.carbon.dashboards.core.bean.DashboardMetadata;
import org.wso2.carbon.dashboards.core.bean.importer.DashboardArtifact;
import org.wso2.carbon.dashboards.core.bean.importer.Page;
import org.wso2.carbon.dashboards.core.bean.importer.PageContent;
import org.wso2.carbon.dashboards.core.bean.importer.WidgetCollection;
import org.wso2.carbon.dashboards.core.bean.importer.WidgetType;
import org.wso2.carbon.dashboards.core.bean.widget.GeneratedWidgetConfigs;
import org.wso2.carbon.dashboards.core.exception.DashboardException;
import org.wso2.carbon.dashboards.core.exception.DashboardRuntimeException;
import org.wso2.carbon.dashboards.core.exception.UnauthorizedException;
import org.wso2.carbon.dashboards.core.internal.database.DashboardMetadataDao;
import org.wso2.carbon.dashboards.core.internal.database.DashboardMetadataDaoFactory;
import org.wso2.carbon.dashboards.core.internal.roles.provider.RolesProvider;
import org.wso2.carbon.datasource.core.api.DataSourceService;
import org.wso2.carbon.uiserver.api.App;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Default dashboard metadata provider.
 *
 * @since 4.0.0
 */
public class DashboardMetadataProviderImpl implements DashboardMetadataProvider {

    private static final Logger LOGGER = LoggerFactory.getLogger(DashboardMetadataProviderImpl.class);
    private static final String PERMISSION_APP_NAME = "DASH";
    private static final String PERMISSION_SUFFIX_VIEWER = ".viewer";
    private static final String PERMISSION_SUFFIX_EDITOR = ".editor";
    private static final String PERMISSION_SUFFIX_OWNER = ".owner";
    private static final String UNIVERSAL_WIDGET = "UniversalWidget";

    private final DashboardMetadataDao dao;
    private DataSourceService dataSourceService;
    private final DashboardConfigurations dashboardConfigurations;
    private final PermissionProvider permissionProvider;
    private final IdPClient identityClient;

    private WidgetMetadataProvider widgetMetadataProvider;

    public DashboardMetadataProviderImpl(DataSourceService dataSourceService,
                                         DashboardConfigurations dashboardConfigurations,
                                         PermissionProvider permissionProvider, IdPClient identityClient) {
        try {
            this.dao = DashboardMetadataDaoFactory.createDao(dataSourceService, dashboardConfigurations);
            this.dao.initDashboardTable();
        } catch (DashboardException e) {
            throw new DashboardRuntimeException("Cannot create dashboard DAO for DB access.", e);
        }
        this.dataSourceService = dataSourceService;
        this.dashboardConfigurations = dashboardConfigurations;
        this.permissionProvider = permissionProvider;
        this.identityClient = identityClient;
    }

    DashboardMetadataProviderImpl(DashboardMetadataDao dao, DashboardConfigurations dashboardConfigurations,
                                  PermissionProvider permissionProvider, IdPClient identityClient) {
        this.dao = dao;
        this.dashboardConfigurations = dashboardConfigurations;
        this.permissionProvider = permissionProvider;
        this.identityClient = identityClient;
    }

    @Override
    public void init(App dashboardApp) {
        this.widgetMetadataProvider = new WidgetMetadataProviderImpl(dashboardApp, dataSourceService,
                                                                     dashboardConfigurations);
        DashboardImporter dashboardImporter = new DashboardImporter(this, widgetMetadataProvider);
        dashboardImporter.importDashboards();
    }

    void setWidgetMetadataProvider(WidgetMetadataProvider widgetMetadataProvider) {
        this.widgetMetadataProvider = widgetMetadataProvider;
    }

    @Override
    public WidgetMetadataProvider getWidgetMetadataProvider() {
        return widgetMetadataProvider;
    }

    @Override
    public Optional<DashboardMetadata> get(String dashboardUrl) throws DashboardException {
        // TODO: 11/10/17 validate parameters
        return dao.get(dashboardUrl);
    }

    @Override
    public Optional<DashboardMetadata> getDashboardByUser(String user, String dashboardUrl, String originComponent)
            throws DashboardException {
        // TODO: 11/10/17 validate parameters
        boolean isAuthorized = originComponent != null ? checkPermissions(user, dashboardUrl, originComponent) :
                checkPermissions(user, dashboardUrl);
        if (isAuthorized) {
            return get(dashboardUrl);
        } else {
            throw new UnauthorizedException("Insufficient permissions to retrieve the dashboard with ID" +
                    dashboardUrl);
        }
    }

    @Override
    public Set<DashboardMetadata> getAllByUser(String user) throws DashboardException {
        Set<DashboardMetadata> dashboardList = dao.getAll();
        return dashboardList.stream().
                filter(dashboardMetadata -> {
                    if (permissionProvider.hasPermission(user, new Permission(PERMISSION_APP_NAME,
                            dashboardMetadata.getUrl() + PERMISSION_SUFFIX_OWNER))) {
                        dashboardMetadata.setHasOwnerPermission(true);
                        dashboardMetadata.setHasDesignerPermission(true);
                        dashboardMetadata.setHasViewerPermission(true);
                        return true;
                    } else if (permissionProvider.hasPermission(user, new Permission(PERMISSION_APP_NAME,
                            dashboardMetadata.getUrl() + PERMISSION_SUFFIX_EDITOR))) {
                        dashboardMetadata.setHasDesignerPermission(true);
                        dashboardMetadata.setHasViewerPermission(true);
                        return true;
                    } else if (permissionProvider.hasPermission(user, new Permission(PERMISSION_APP_NAME,
                            dashboardMetadata.getUrl() + PERMISSION_SUFFIX_VIEWER))) {
                        dashboardMetadata.setHasViewerPermission(true);
                        return true;
                    }
                    return false;
                }).collect(Collectors.toSet());
    }

    @Override
    public void add(DashboardMetadata dashboardMetadata) throws DashboardException {
        RolesProvider rolesProvider = new RolesProvider(dashboardConfigurations);

        dao.add(dashboardMetadata);
        for (Permission permission : buildDashboardPermissions(dashboardMetadata.getUrl())) {
            permissionProvider.addPermission(permission);
            for (String roleId: rolesProvider.getCreatorRoleIds()) {
                permissionProvider.grantPermission(permission, new Role(roleId, ""));
            }
        }
    }

    @Override
    public void add(String user, DashboardMetadata dashboardMetadata) throws DashboardException {
        // TODO: 11/10/17 validate parameters
        RolesProvider rolesProvider = new RolesProvider(dashboardConfigurations);
        List<String> creatorRoleIds = rolesProvider.getCreatorRoleIds();
        Set<String> filteredRoleIds = creatorRoleIds.stream()
                .filter(role -> hasRoles(user, role))
                .collect(Collectors.toSet());
        if (!filteredRoleIds.isEmpty()) {
            dao.add(dashboardMetadata);
            for (Permission permission : buildDashboardPermissions(dashboardMetadata.getUrl())) {
                permissionProvider.addPermission(permission);
                for (String roleId : rolesProvider.getCreatorRoleIds()) {
                    permissionProvider.grantPermission(permission, new Role(roleId, ""));
                }
            }
        } else {
            throw new UnauthorizedException("Insufficient permissions to add dashboards");
        }
    }

    @Override
    public void update(DashboardMetadata dashboardMetadata) throws DashboardException {
        dao.update(dashboardMetadata);
    }

    @Override
    public void update(String user, DashboardMetadata dashboardMetadata) throws DashboardException {
        // TODO: 11/10/17 validate parameters
        if (permissionProvider.hasPermission(user, new Permission(PERMISSION_APP_NAME, dashboardMetadata.getUrl() +
                PERMISSION_SUFFIX_OWNER))
                || permissionProvider.hasPermission(user, new Permission(PERMISSION_APP_NAME,
                dashboardMetadata.getUrl() + PERMISSION_SUFFIX_EDITOR))) {
            dao.update(dashboardMetadata);
        } else {
            throw new UnauthorizedException("Insufficient permissions to update the dashboard with ID "
                    + dashboardMetadata.getUrl());
        }
    }

    @Override
    public void delete(String user, String dashboardUrl) throws DashboardException {
        // TODO: 11/10/17 validate parameters
        if (permissionProvider.hasPermission(user, new Permission(PERMISSION_APP_NAME,
                dashboardUrl + PERMISSION_SUFFIX_OWNER))) {
            dao.delete(dashboardUrl);
            for (Permission permission : buildDashboardPermissions(dashboardUrl)) {
                permissionProvider.deletePermission(permission);
            }
        } else {
            throw new UnauthorizedException("Insufficient permissions to delete the dashboard with the ID " +
                    dashboardUrl);
        }
    }

    @Override
    public Map<String, List<Role>> getDashboardRoles(String dashboardUrl) throws DashboardException {
        Map<String, List<Role>> roles = new HashMap<>();
        try {
            roles.put("owners", permissionProvider.getGrantedRoles(
                    new Permission(PERMISSION_APP_NAME, dashboardUrl + PERMISSION_SUFFIX_OWNER)));
            roles.put("editors", permissionProvider.getGrantedRoles(
                    new Permission(PERMISSION_APP_NAME, dashboardUrl + PERMISSION_SUFFIX_EDITOR)));
            roles.put("viewers", permissionProvider.getGrantedRoles(
                    new Permission(PERMISSION_APP_NAME, dashboardUrl + PERMISSION_SUFFIX_VIEWER)));
        } catch (PermissionException e) {
            throw new DashboardException("Unable to get roles for the dashboard '" + dashboardUrl + "'", e);
        }
        return roles;
    }

    @Override
    public List<org.wso2.carbon.analytics.idp.client.core.models.Role> getAllRoles() throws DashboardException {
        try {
            return identityClient.getAllRoles();
        } catch (IdPClientException e) {
            throw new DashboardException("Unable to get all user roles.", e);
        }
    }

    @Override
    public List<org.wso2.carbon.analytics.idp.client.core.models.Role> getRolesByUsername(String username)
            throws DashboardException {
        try {
            return identityClient.getUserRoles(username);
        } catch (IdPClientException e) {
            throw new DashboardException("Unable to get user roles.", e);
        }
    }

    @Override
    public void updateDashboardRoles(String user, String dashboardUrl, Map<String, List<String>> roleIdMap)
            throws DashboardException {
        if (permissionProvider.hasPermission(user, new Permission(PERMISSION_APP_NAME,
                dashboardUrl + PERMISSION_SUFFIX_OWNER))) {
            List<org.wso2.carbon.analytics.idp.client.core.models.Role> allRoles = null;
            try {
                allRoles = identityClient.getAllRoles();
            } catch (IdPClientException e) {
                throw new DashboardException("Unable to get all user roles.", e);
            }
            Map<String, Role> allRoleMap = new HashMap<>();
            for (org.wso2.carbon.analytics.idp.client.core.models.Role role : allRoles) {
                allRoleMap.put(role.getDisplayName(), new Role(role.getId(), role.getDisplayName()));
            }

            Iterator iterator = roleIdMap.entrySet().iterator();
            while (iterator.hasNext()) {
                Map.Entry entry = (Map.Entry) iterator.next();
                Permission permission = new Permission(PERMISSION_APP_NAME, dashboardUrl + "." + entry.getKey()
                        .toString());
                permissionProvider.revokePermission(permission);
                for (String roleId : (List<String>) entry.getValue()) {
                    permissionProvider.grantPermission(permission, allRoleMap.get(roleId));
                }
                iterator.remove();
            }
        } else {
            throw new UnauthorizedException("Insufficient permissions to update roles of the dashboard with ID" +
                    dashboardUrl);
        }
    }

    /**
     * Return exportable dashboard definition.
     *
     * @param dashboardUrl URL of the dashboard
     * @return Exportable dashboard definition
     * @throws DashboardException If an error occurred while reading or processing dashboards
     */
    @Override
    public DashboardArtifact exportDashboard(String dashboardUrl) throws DashboardException {
        Optional<DashboardMetadata> dashboardMetadataOptional = dao.get(dashboardUrl);
        if (!dashboardMetadataOptional.isPresent()) {
            throw new DashboardException("Cannot find the dashboard '" + dashboardUrl + "'");
        }

        DashboardArtifact artifact = new DashboardArtifact();

        // Set JSON parsed content to pages.
        DashboardMetadata dashboardMetadata = dashboardMetadataOptional.get();
        // Convert stringified pages object to proper JSONElement before exporting.
        dashboardMetadata.setPages(new JsonParser().parse((String) dashboardMetadata.getPages()));
        artifact.setDashboard(dashboardMetadata);

        Map<WidgetType, Set<String>> widgets = findWidgets(dashboardMetadata);

        // Set metadata of generated widgets
        Set<GeneratedWidgetConfigs> generatedWidgetConfigs = widgetMetadataProvider
                .getGeneratedWidgetConfigs(widgets.get(WidgetType.GENERATED));
        WidgetCollection widgetCollection = new WidgetCollection();
        widgetCollection.setGenerated(generatedWidgetConfigs);

        // Set list of custom widgets
        widgetCollection.setCustom(widgets.get(WidgetType.CUSTOM));
        artifact.setWidgets(widgetCollection);
        return artifact;
    }

    /**
     * Find widgets by analyzing a dashboard pages.
     *
     * @param dashboardMetadata Dashboard definition
     * @return Set of widget IDs
     * @throws DashboardException If an error occurred while reading or processing dashboards
     */
    private Map<WidgetType, Set<String>> findWidgets(DashboardMetadata dashboardMetadata) throws DashboardException {
        Page[] dashboardPages = new Gson().fromJson((JsonElement) dashboardMetadata.getPages(),
                Page[].class);
        Map<WidgetType, Set<String>> widgets = new HashMap<>();
        widgets.put(WidgetType.GENERATED, new HashSet<>());
        widgets.put(WidgetType.CUSTOM, new HashSet<>());
        for (Page page : dashboardPages) {
            findWidgets(page.getContent(), widgets);
        }
        return widgets;
    }

    /**
     * Recursively find widgets by analyzing dashboard page contents.
     *
     * @param contents Dashboard page content
     * @param widgets  Set of widget IDs
     */
    private void findWidgets(Set<PageContent> contents, Map<WidgetType, Set<String>> widgets) {
        for (PageContent content : contents) {
            if (content.getComponent() != null) {
                if (UNIVERSAL_WIDGET.equals(content.getComponent())) {
                    widgets.get(WidgetType.GENERATED).add((String) content.getProps().get("widgetID"));
                } else {
                    widgets.get(WidgetType.CUSTOM).add(content.getComponent());
                }
            }
            if (content.getContent() != null) {
                findWidgets(content.getContent(), widgets);
            }
        }
    }

    /**
     * Build basic dashboard permission string.
     *
     * @param dashboardUrl
     * @return
     */
    private List<Permission> buildDashboardPermissions(String dashboardUrl) {
        List<Permission> permissions = new ArrayList<>();
        permissions.add(new Permission(PERMISSION_APP_NAME, dashboardUrl + PERMISSION_SUFFIX_OWNER));
        permissions.add(new Permission(PERMISSION_APP_NAME, dashboardUrl + PERMISSION_SUFFIX_EDITOR));
        permissions.add(new Permission(PERMISSION_APP_NAME, dashboardUrl + PERMISSION_SUFFIX_VIEWER));
        return permissions;
    }

    private boolean hasRoles(String user, String roleId) {
        try {
            org.wso2.carbon.analytics.idp.client.core.models.Role adminRole = identityClient.getAdminRole();
            return identityClient.getUserRoles(user).stream()
                    .anyMatch(userRole -> Objects.equals(userRole.getId(), roleId) || Objects.equals(userRole
                            .getId(), adminRole.getId()));
        } catch (IdPClientException e) {
            LOGGER.error("Error in retrieving user roles for the user " + user, e);
        }
        return false;
    }

    /**
     * This method is to check permission based on the origin component type of the request
     *
     * @param user            logged in user
     * @param dashboardUrl    dashboard URL
     * @param originComponent origin component - designer/settings
     * @return boolean
     */
    private boolean checkPermissions(String user, String dashboardUrl, String originComponent) {
        switch (originComponent) {
            case "designer":
                return hasPermission(user, dashboardUrl, PERMISSION_SUFFIX_EDITOR) ||
                        hasPermission(user, dashboardUrl, PERMISSION_SUFFIX_OWNER);
            case "settings":
                return hasPermission(user, dashboardUrl, PERMISSION_SUFFIX_OWNER);
            default:
                return false;
        }
    }

    /**
     * This method is to check permission based on the origin component type of the request
     *
     * @param user         logged in user
     * @param dashboardUrl dashboard URL
     * @return boolean
     */
    private boolean checkPermissions(String user, String dashboardUrl) {
        return hasPermission(user, dashboardUrl, PERMISSION_SUFFIX_VIEWER) ||
                hasPermission(user, dashboardUrl, PERMISSION_SUFFIX_EDITOR) ||
                hasPermission(user, dashboardUrl, PERMISSION_SUFFIX_OWNER);
    }

    /**
     * This method is to check whether the user has appropriate permissions
     *
     * @param user             Username
     * @param dashboardUrl     dashboardUrl
     * @param permissionSuffix viewer/editor/owner
     * @return boolean
     */
    private boolean hasPermission(String user, String dashboardUrl, String permissionSuffix) {
        return permissionProvider.hasPermission(user, new Permission(PERMISSION_APP_NAME, dashboardUrl +
                permissionSuffix));
    }
  
    /**
     * Returns dashboardConfigurations for report generation
     * @return DashboardConfigurations
     */
    @Override
    public DashboardConfigurations getReportGenerationConfigurations() {
        return this.dashboardConfigurations;
    }
}
