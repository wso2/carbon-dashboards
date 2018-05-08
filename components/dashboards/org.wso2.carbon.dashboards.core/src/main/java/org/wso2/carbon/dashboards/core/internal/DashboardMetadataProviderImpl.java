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

import org.osgi.framework.BundleContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.carbon.analytics.idp.client.core.api.IdPClient;
import org.wso2.carbon.analytics.idp.client.core.exception.IdPClientException;
import org.wso2.carbon.analytics.permissions.PermissionManager;
import org.wso2.carbon.analytics.permissions.PermissionProvider;
import org.wso2.carbon.analytics.permissions.bean.Permission;
import org.wso2.carbon.analytics.permissions.bean.Role;
import org.wso2.carbon.analytics.permissions.exceptions.PermissionException;
import org.wso2.carbon.config.ConfigurationException;
import org.wso2.carbon.config.provider.ConfigProvider;
import org.wso2.carbon.dashboards.core.DashboardMetadataProvider;
import org.wso2.carbon.dashboards.core.bean.DashboardConfigurations;
import org.wso2.carbon.dashboards.core.bean.DashboardMetadata;
import org.wso2.carbon.dashboards.core.exception.DashboardException;
import org.wso2.carbon.dashboards.core.exception.DashboardRuntimeException;
import org.wso2.carbon.dashboards.core.exception.UnauthorizedException;
import org.wso2.carbon.dashboards.core.internal.database.DashboardMetadataDao;
import org.wso2.carbon.dashboards.core.internal.database.DashboardMetadataDaoFactory;
import org.wso2.carbon.dashboards.core.internal.roles.provider.RolesProvider;
import org.wso2.carbon.datasource.core.api.DataSourceService;

import java.util.ArrayList;
import java.util.HashMap;
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
@Component(service = DashboardMetadataProvider.class, immediate = true)
public class DashboardMetadataProviderImpl implements DashboardMetadataProvider {

    private static final Logger LOGGER = LoggerFactory.getLogger(DashboardMetadataProviderImpl.class);
    private static final String PERMISSION_APP_NAME = "DASH";
    private static final String PERMISSION_SUFFIX_VIEWER = ".viewer";
    private static final String PERMISSION_SUFFIX_EDITOR = ".editor";
    private static final String PERMISSION_SUFFIX_OWNER = ".owner";

    private DashboardMetadataDao dao;
    private DataSourceService dataSourceService;
    private ConfigProvider configProvider;
    private PermissionProvider permissionProvider;
    private IdPClient identityClient;
    private RolesProvider rolesProvider;

    /**
     * Creates a new dashboard data provider.
     */
    public DashboardMetadataProviderImpl() {
    }

    DashboardMetadataProviderImpl(DashboardMetadataDao dao, PermissionProvider permissionProvider, RolesProvider
            rolesProvider) {
        this.dao = dao;
        this.permissionProvider = permissionProvider;
        this.rolesProvider = rolesProvider;
    }

    @Activate
    protected void activate(BundleContext bundleContext) {
        try {
            this.dao = DashboardMetadataDaoFactory.createDao(dataSourceService, configProvider);
            this.dao.initDashboardTable();
        } catch (DashboardException e) {
            throw new DashboardRuntimeException("Cannot create DAO for DB access.", e);
        }
        LOGGER.debug("{} activated.", this.getClass().getName());
    }

    @Deactivate
    protected void deactivate(BundleContext bundleContext) {
        LOGGER.debug("{} deactivated.", this.getClass().getName());
    }

    @Reference(service = DataSourceService.class,
            cardinality = ReferenceCardinality.AT_LEAST_ONE,
            policy = ReferencePolicy.DYNAMIC,
            unbind = "unsetDataSourceService")
    protected void setDataSourceService(DataSourceService dataSourceService) {
        this.dataSourceService = dataSourceService;
    }

    protected void unsetDataSourceService(DataSourceService dataSourceService) {
        this.dataSourceService = null;
    }

    @Reference(service = ConfigProvider.class,
            cardinality = ReferenceCardinality.MANDATORY,
            policy = ReferencePolicy.DYNAMIC,
            unbind = "unsetConfigProvider")
    protected void setConfigProvider(ConfigProvider configProvider) {
        this.configProvider = configProvider;
    }

    protected void unsetConfigProvider(ConfigProvider configProvider) {
        this.configProvider = null;
    }

    @Reference(
            name = "permission-manager",
            service = PermissionManager.class,
            cardinality = ReferenceCardinality.MANDATORY,
            policy = ReferencePolicy.DYNAMIC,
            unbind = "unsetPermissionManager"
    )
    protected void setPermissionManager(PermissionManager permissionManager) {
        this.permissionProvider = permissionManager.getProvider();
    }

    protected void unsetPermissionManager(PermissionManager permissionManager) {
        this.permissionProvider = null;
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
    public void add(String user, DashboardMetadata dashboardMetadata) throws DashboardException {
        // TODO: 11/10/17 validate parameters
        List<String> creatorRoleIds;
        RolesProvider rolesProvider = null;
        try {
            rolesProvider = new RolesProvider(configProvider.getConfigurationObject(DashboardConfigurations.class));
            creatorRoleIds = rolesProvider.getCreatorRoleIds();
        } catch (ConfigurationException e) {
            throw new DashboardException("Error in reading dashboard creator roles !", e);
        }
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


    @Reference(
            name = "IdPClient",
            service = IdPClient.class,
            cardinality = ReferenceCardinality.MANDATORY,
            policy = ReferencePolicy.DYNAMIC,
            unbind = "unsetIdP"
    )
    protected void setIdP(IdPClient client) {
        this.identityClient = client;
    }

    protected void unsetIdP(IdPClient client) {
        this.identityClient = null;
    }

}
