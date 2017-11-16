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
import org.wso2.carbon.config.provider.ConfigProvider;
import org.wso2.carbon.dashboards.core.DashboardMetadataProvider;
import org.wso2.carbon.dashboards.core.bean.DashboardMetadata;
import org.wso2.carbon.dashboards.core.exception.DashboardException;
import org.wso2.carbon.dashboards.core.exception.DashboardRuntimeException;
import org.wso2.carbon.dashboards.core.internal.database.DashboardMetadataDao;
import org.wso2.carbon.dashboards.core.internal.database.DashboardMetadataDaoFactory;
import org.wso2.carbon.datasource.core.api.DataSourceService;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * Default dashboard metadata provider.
 *
 * @since 4.0.0
 */
@Component(service = DashboardMetadataProvider.class, immediate = true)
public class DashboardMetadataProviderImpl implements DashboardMetadataProvider {

    private static final Logger LOGGER = LoggerFactory.getLogger(DashboardMetadataProviderImpl.class);
    private static final String PERMISSION_APP_NAME = "DASH";

    private DashboardMetadataDao dao;
    private DataSourceService dataSourceService;
    private ConfigProvider configProvider;
    private PermissionProvider permissionProvider;
    private IdPClient identityClient;

    /**
     * Creates a new dashboard data provider.
     */
    public DashboardMetadataProviderImpl() {
    }

    DashboardMetadataProviderImpl(DashboardMetadataDao dao, PermissionProvider permissionProvider) {
        this.dao = dao;
        this.permissionProvider = permissionProvider;
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
    public Set<DashboardMetadata> getAll() throws DashboardException {
        return dao.getAll();
    }

    @Override
    public void add(DashboardMetadata dashboardMetadata) throws DashboardException {
        // TODO: 11/10/17 validate parameters
        dao.add(dashboardMetadata);
        for (Permission permission : buildDashboardPermissions(dashboardMetadata.getUrl())) {
            permissionProvider.addPermission(permission);
        }
    }

    @Override
    public void update(DashboardMetadata dashboardMetadata) throws DashboardException {
        // TODO: 11/10/17 validate parameters
        dao.update(dashboardMetadata);
    }

    @Override
    public void delete(String dashboardUrl) throws DashboardException {
        // TODO: 11/10/17 validate parameters
        dao.delete(dashboardUrl);
        for (Permission permission : buildDashboardPermissions(dashboardUrl)) {
            permissionProvider.deletePermission(permission);
        }
    }

    @Override
    public Map<String, List<Role>> getDashboardRoles(String dashboardUrl) throws DashboardException {
        Map<String, List<Role>> roles = new HashMap<>();
        try {
            roles.put("owners", permissionProvider.getGrantedRoles(
                    new Permission(PERMISSION_APP_NAME, "dashboard." + dashboardUrl + ".owner")));
            roles.put("editors", permissionProvider.getGrantedRoles(
                    new Permission(PERMISSION_APP_NAME, "dashboard." + dashboardUrl + ".editor")));
            roles.put("viewers", permissionProvider.getGrantedRoles(
                    new Permission(PERMISSION_APP_NAME, "dashboard." + dashboardUrl + ".viewer")));
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
    public void updateDashboardRoles(String dashboardUrl, Map<String, List<String>> roleIdMap)
            throws DashboardException {

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
            Permission permission = new Permission(PERMISSION_APP_NAME,
                    "dashboard." + dashboardUrl + "." + entry.getKey().toString());

            permissionProvider.revokePermission(permission);
            for (String roleId : (List<String>) entry.getValue()) {
                permissionProvider.grantPermission(permission, allRoleMap.get(roleId));
            }
            iterator.remove();
        }
    }

    /**
     * Build basic dashboard permission string.
     *
     * @param dashboardUrl
     * @return
     */
    private List<Permission> buildDashboardPermissions(String dashboardUrl) {
        String prefix = "dashboard." + dashboardUrl;
        List<Permission> permissions = new ArrayList<>();
        permissions.add(new Permission(PERMISSION_APP_NAME, prefix + ".owner"));
        permissions.add(new Permission(PERMISSION_APP_NAME, prefix + ".editor"));
        permissions.add(new Permission(PERMISSION_APP_NAME, prefix + ".viewer"));
        return permissions;
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
