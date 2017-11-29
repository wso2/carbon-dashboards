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
import org.wso2.carbon.dashboards.core.internal.database.DashboardMetadataDao;
import org.wso2.carbon.dashboards.core.internal.database.DashboardMetadataDaoFactory;
import org.wso2.carbon.dashboards.core.internal.roles.provider.RolesProvider;
import org.wso2.carbon.datasource.core.api.DataSourceService;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import javax.ws.rs.core.Response;
import static javax.ws.rs.core.Response.Status.CREATED;
import static javax.ws.rs.core.Response.Status.NOT_FOUND;
import static javax.ws.rs.core.Response.Status.UNAUTHORIZED;

/**
 * Default dashboard metadata provider.
 *
 * @since 4.0.0
 */
@Component(service = DashboardMetadataProvider.class, immediate = true)
public class DashboardMetadataProviderImpl implements DashboardMetadataProvider {

    private static final Logger LOGGER = LoggerFactory.getLogger(DashboardMetadataProviderImpl.class);
    private static final String PERMISSION_APP_NAME = "DASH";
    private static final String VIEWER_PERMISSION_SUFFIX = ".viewer";
    private static final String EDITOR_PERMISSION_SUFFIX = ".editor";
    private static final String OWNER_PERMISSION_SUFFIX = ".owner";

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
    public Response getDashboardByUser(String user, String dashboardUrl, Optional<String> originComponent) throws
            DashboardException {
        // TODO: 11/10/17 validate parameters
        if (checkPermissions(user, dashboardUrl, originComponent)) {
            return dao.get(dashboardUrl).map(metadata -> Response.ok().entity(metadata).build())
                    .orElse(Response.status(NOT_FOUND).entity("Cannot find a dashboard for ID '" + dashboardUrl + "'" +
                            ".").build());
        } else {
            return Response.status(UNAUTHORIZED).entity("You are not authorized to access dashboard with the ID " +
                    "" + dashboardUrl).build();
        }
    }

    /**
     * This method is to check permission based on the origin component type of the request
     *
     * @param user            logged in user
     * @param dashboardUrl    dashboard URL
     * @param originComponent origin component - designer/settings
     * @return boolean
     */
    private boolean checkPermissions(String user, String dashboardUrl, Optional<String> originComponent) {
        switch (originComponent.orElse("")) {
            case "designer":
                return permissionProvider.hasPermission(user, new Permission(PERMISSION_APP_NAME, dashboardUrl.concat
                        (EDITOR_PERMISSION_SUFFIX)));
            case "settings":
                return permissionProvider.hasPermission(user, new Permission(PERMISSION_APP_NAME, dashboardUrl.concat
                        (OWNER_PERMISSION_SUFFIX)));
            default:
                return permissionProvider.hasPermission(user, new Permission(PERMISSION_APP_NAME, dashboardUrl.concat
                        (VIEWER_PERMISSION_SUFFIX))) || permissionProvider.hasPermission(user, new Permission
                        (PERMISSION_APP_NAME, dashboardUrl.concat(EDITOR_PERMISSION_SUFFIX))) || permissionProvider
                        .hasPermission(user, new Permission(PERMISSION_APP_NAME, dashboardUrl.concat
                                (OWNER_PERMISSION_SUFFIX)));
        }
    }

    @Override
    public Response getAllByUser(String user) throws DashboardException {
        Set<DashboardMetadata> dashboardList = dao.getAll();
        Set<DashboardMetadata> dlist = dashboardList.stream().filter(dashboardMetadata -> {
            if (permissionProvider.hasPermission(user, new Permission(PERMISSION_APP_NAME, dashboardMetadata.getUrl()
                    .concat(OWNER_PERMISSION_SUFFIX)))) {
                dashboardMetadata.setHasOwnerPermission(true);
                dashboardMetadata.setHasDesignerPermission(true);
                dashboardMetadata.setHasViewerPermission(true);
                return true;
            } else if (permissionProvider.hasPermission(user, new Permission(PERMISSION_APP_NAME, dashboardMetadata
                    .getUrl().concat(EDITOR_PERMISSION_SUFFIX)))) {
                dashboardMetadata.setHasDesignerPermission(true);
                dashboardMetadata.setHasViewerPermission(true);
                return true;
            } else if (permissionProvider.hasPermission(user, new Permission(PERMISSION_APP_NAME, dashboardMetadata
                    .getUrl().concat(VIEWER_PERMISSION_SUFFIX)))) {
                dashboardMetadata.setHasViewerPermission(true);
                return true;
            }
            return false;
        }).collect(Collectors.toSet());
        return Response.ok().entity(dlist).build();
    }

    @Override
    public Response add(String user, DashboardMetadata dashboardMetadata) throws DashboardException {
        // TODO: 11/10/17 validate parameters
        List<Role> creatorRoles;
        RolesProvider rolesProvider = null;
        try {
            rolesProvider = new RolesProvider(configProvider.getConfigurationObject(DashboardConfigurations
                    .class));
            creatorRoles = rolesProvider.getCreatorRoles();
        } catch (ConfigurationException e) {
            throw new DashboardException("Error in reading dashboard creator roles !", e);
        }
        Set<Role> filteredRole = creatorRoles.stream().filter(role -> hasRoles(user, role)).collect(Collectors.toSet());
        if (!filteredRole.isEmpty()) {
            dao.add(dashboardMetadata);
            for (Permission permission : buildDashboardPermissions(dashboardMetadata.getUrl())) {
                permissionProvider.addPermission(permission);
                for (Role role : rolesProvider.getCreatorRoles()) {
                    permissionProvider.grantPermission(permission, role);
                }
            }
            return Response.status(CREATED).build();
        } else {
            return Response.status(UNAUTHORIZED).entity("You do not have sufficient priviledges to add dashboards")
                    .build();
        }
    }

    @Override
    public Response update(String user, DashboardMetadata dashboardMetadata) throws DashboardException {
        // TODO: 11/10/17 validate parameters
        if (permissionProvider.hasPermission(user, new Permission(PERMISSION_APP_NAME, dashboardMetadata.getUrl()
                .concat(OWNER_PERMISSION_SUFFIX)))
                || permissionProvider.hasPermission(user, new Permission(PERMISSION_APP_NAME,
                dashboardMetadata.getUrl().concat(EDITOR_PERMISSION_SUFFIX)))) {
            dao.update(dashboardMetadata);
            return Response.ok().build();
        } else {
            return Response.status(UNAUTHORIZED).entity("You do not sufficient priviledges to update the dashboard " +
                    "with the ID " + dashboardMetadata.getUrl()).build();
        }

    }

    @Override
    public Response delete(String user, String dashboardUrl) throws DashboardException {
        // TODO: 11/10/17 validate parameters
        if (permissionProvider.hasPermission(user, new Permission(PERMISSION_APP_NAME, dashboardUrl.concat
                (OWNER_PERMISSION_SUFFIX)))) {
            dao.delete(dashboardUrl);
            for (Permission permission : buildDashboardPermissions(dashboardUrl)) {
                permissionProvider.deletePermission(permission);
            }
            return Response.ok().build();
        } else {
            return Response.status(UNAUTHORIZED).entity("You are not authorized to delete the dashboard with the ID " +
                    "" + dashboardUrl).build();
        }
    }

    @Override
    public Map<String, List<Role>> getDashboardRoles(String dashboardUrl) throws DashboardException {
        Map<String, List<Role>> roles = new HashMap<>();
        try {
            roles.put("owners", permissionProvider.getGrantedRoles(
                    new Permission(PERMISSION_APP_NAME, dashboardUrl.concat(OWNER_PERMISSION_SUFFIX))));
            roles.put("editors", permissionProvider.getGrantedRoles(
                    new Permission(PERMISSION_APP_NAME, dashboardUrl.concat(EDITOR_PERMISSION_SUFFIX))));
            roles.put("viewers", permissionProvider.getGrantedRoles(
                    new Permission(PERMISSION_APP_NAME, dashboardUrl.concat(VIEWER_PERMISSION_SUFFIX))));
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
    public Response updateDashboardRoles(String user, String dashboardUrl, Map<String, List<String>> roleIdMap)
            throws DashboardException {
        if (permissionProvider.hasPermission(user, new Permission(PERMISSION_APP_NAME, dashboardUrl.concat
                (OWNER_PERMISSION_SUFFIX)))) {
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
            return Response.ok().build();
        } else {
            return Response.status(UNAUTHORIZED).entity("You do not have sufficient priviledges to update roles for " +
                    "the dashboard " + dashboardUrl).build();
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
        permissions.add(new Permission(PERMISSION_APP_NAME, dashboardUrl.concat(OWNER_PERMISSION_SUFFIX)));
        permissions.add(new Permission(PERMISSION_APP_NAME, dashboardUrl.concat(EDITOR_PERMISSION_SUFFIX)));
        permissions.add(new Permission(PERMISSION_APP_NAME, dashboardUrl.concat(VIEWER_PERMISSION_SUFFIX)));
        return permissions;
    }

    private boolean hasRoles(String user, Role role) {
        try {
            List<org.wso2.carbon.analytics.idp.client.core.models.Role> userRoles = identityClient.getUserRoles(user);
            Set<org.wso2.carbon.analytics.idp.client.core.models.Role> filteredUserRoles = userRoles.stream().filter
                    (userRole -> userRole.getId().equals(role.getId())).collect(Collectors.toSet());
            if (filteredUserRoles.isEmpty()) {
                return false;
            }
            return true;
        } catch (IdPClientException e) {
            LOGGER.error("Error in retrieving user roles for the user " + user, e);
        }
        return false;
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
