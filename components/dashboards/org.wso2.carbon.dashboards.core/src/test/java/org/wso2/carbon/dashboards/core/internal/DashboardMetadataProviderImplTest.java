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

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.wso2.carbon.analytics.idp.client.core.api.IdPClient;
import org.wso2.carbon.analytics.idp.client.core.models.Role;
import org.wso2.carbon.analytics.permissions.PermissionProvider;
import org.wso2.carbon.analytics.permissions.bean.Permission;
import org.wso2.carbon.config.provider.ConfigProvider;
import org.wso2.carbon.dashboards.core.bean.DashboardConfigurations;
import org.wso2.carbon.dashboards.core.bean.DashboardMetadata;
import org.wso2.carbon.dashboards.core.exception.DashboardRuntimeException;
import org.wso2.carbon.dashboards.core.exception.UnauthorizedException;
import org.wso2.carbon.dashboards.core.internal.database.DashboardMetadataDao;
import org.wso2.carbon.dashboards.core.internal.roles.provider.RolesProvider;
import org.wso2.carbon.datasource.core.api.DataSourceService;
import org.wso2.carbon.datasource.core.exception.DataSourceException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Test cases for {@link DashboardMetadataProviderImpl} class.
 *
 * @since 4.0.0
 */
public class DashboardMetadataProviderImplTest {

    @Test
    void testGet() throws Exception {
        DashboardMetadataDao dao = mock(DashboardMetadataDao.class);
        when(dao.get(eq("foo"))).thenReturn(Optional.of(new DashboardMetadata()));
        when(dao.get(eq("bar"))).thenReturn(Optional.empty());
        when(dao.get(eq("foo-bar"))).thenReturn(Optional.empty());
        PermissionProvider permissionProvider = mock(PermissionProvider.class);
        DashboardMetadataProviderImpl dashboardMetadataProvider =
                new DashboardMetadataProviderImpl(dao, permissionProvider, new RolesProvider(new
                        DashboardConfigurations()));
        when(permissionProvider.hasPermission(eq("testUser"), Mockito.isA(Permission.class))).thenReturn(true);
        Assertions.assertTrue(dashboardMetadataProvider.getDashboardByUser("testUser", "foo", "designer").isPresent());
        Assertions.assertFalse(dashboardMetadataProvider.getDashboardByUser("testUser", "bar", null).isPresent());
        Assertions.assertFalse(dashboardMetadataProvider.
                getDashboardByUser("testUser", "foo-bar", "settings").isPresent());
        verify(dao, times(3)).get(anyString());
    }

    @Test
    void testGetAll() throws Exception {
        DashboardMetadataDao dao = mock(DashboardMetadataDao.class);
        when(dao.getAll()).thenReturn(Collections.singleton(new DashboardMetadata()));
        PermissionProvider permissionProvider = mock(PermissionProvider.class);
        DashboardMetadataProviderImpl dashboardMetadataProvider =
                new DashboardMetadataProviderImpl(dao, permissionProvider, new RolesProvider(new
                        DashboardConfigurations()));
        when(permissionProvider.hasPermission(eq("testUser"), Mockito.isA(Permission.class))).thenReturn(true);
        Assertions.assertEquals(1, dashboardMetadataProvider.getAllByUser("testUser").size());
        verify(dao).getAll();
    }

    @Test
    void testAdd() throws Exception {
        final DashboardMetadata dashboardMetadata = new DashboardMetadata();
        DashboardMetadataDao dao = mock(DashboardMetadataDao.class);

        DashboardMetadataProviderImpl dashboardMetadataProvider =
                new DashboardMetadataProviderImpl(dao, new MockPermissionProvider(), new RolesProvider(new
                        DashboardConfigurations()));
        ConfigProvider configProvider = mock(ConfigProvider.class);
        IdPClient idPClient = mock(IdPClient.class);
        when(configProvider.getConfigurationObject(DashboardConfigurations.class)).
                thenReturn(new DashboardConfigurations());
        dashboardMetadataProvider.setConfigProvider(configProvider);
        dashboardMetadataProvider.setIdP(idPClient);
        List<org.wso2.carbon.analytics.idp.client.core.models.Role> userRoles = new ArrayList<>();
        userRoles.add(new org.wso2.carbon.analytics.idp.client.core.models.Role
                ("admin", "admin"));
        when(idPClient.getUserRoles(anyString())).thenReturn(userRoles);
        dashboardMetadataProvider.add("", dashboardMetadata);
        verify(dao).add(eq(dashboardMetadata));
    }

    @Test
    void testUnauthorizedAdd() throws Exception {
        final DashboardMetadata dashboardMetadata = new DashboardMetadata();
        DashboardMetadataDao dao = mock(DashboardMetadataDao.class);

        DashboardMetadataProviderImpl dashboardMetadataProvider =
                new DashboardMetadataProviderImpl(dao, new MockPermissionProvider(), new RolesProvider(new
                        DashboardConfigurations()));
        ConfigProvider configProvider = mock(ConfigProvider.class);
        IdPClient idPClient = mock(IdPClient.class);
        when(configProvider.getConfigurationObject(DashboardConfigurations.class)).
                thenReturn(new DashboardConfigurations());
        dashboardMetadataProvider.setConfigProvider(configProvider);
        dashboardMetadataProvider.setIdP(idPClient);
        List<Role> userRoles = new ArrayList<>();
        userRoles.add(new org.wso2.carbon.analytics.idp.client.core.models.Role
                ("test_role", "test_role"));
        when(idPClient.getUserRoles(anyString())).thenReturn(userRoles);
        when(idPClient.getAdminRole()).thenReturn(new Role("test_role2", "test_role2"));
        Assertions.assertThrows(UnauthorizedException.class, () -> dashboardMetadataProvider.
                add("testUser", dashboardMetadata));
    }

    @Test
    void testUpdate() throws Exception {
        final DashboardMetadata dashboardMetadata = new DashboardMetadata();
        DashboardMetadataDao dao = mock(DashboardMetadataDao.class);
        PermissionProvider permissionProvider = mock(PermissionProvider.class);
        DashboardMetadataProviderImpl dashboardMetadataProvider =
                new DashboardMetadataProviderImpl(dao, permissionProvider, new RolesProvider(new
                        DashboardConfigurations()));
        when(permissionProvider.hasPermission(eq("testUser"), Mockito.isA(Permission.class))).thenReturn(true);
        dashboardMetadataProvider.update("testUser", dashboardMetadata);
        verify(dao).update(eq(dashboardMetadata));
    }

    @Test
    void testUnauthorizedUpdate() throws Exception {
        final DashboardMetadata dashboardMetadata = new DashboardMetadata();
        DashboardMetadataDao dao = mock(DashboardMetadataDao.class);
        PermissionProvider permissionProvider = mock(PermissionProvider.class);
        DashboardMetadataProviderImpl dashboardMetadataProvider =
                new DashboardMetadataProviderImpl(dao, permissionProvider, new RolesProvider(new
                        DashboardConfigurations()));
        when(permissionProvider.hasPermission(eq("testUser"), anyString())).thenReturn(true);
        Assertions.assertThrows(UnauthorizedException.class, () -> dashboardMetadataProvider.
                update("testUser1", dashboardMetadata));
    }

    @Test
    void testDelete() throws Exception {
        final String dashboardUrl = "foo";
        DashboardMetadataDao dao = mock(DashboardMetadataDao.class);
        PermissionProvider permissionProvider = mock(PermissionProvider.class);
        DashboardMetadataProviderImpl dashboardMetadataProvider =
                new DashboardMetadataProviderImpl(dao, permissionProvider, new RolesProvider(new
                        DashboardConfigurations()));
        when(permissionProvider.hasPermission(eq("testUser"), Mockito.isA(Permission.class))).thenReturn(true);
        dashboardMetadataProvider.delete("testUser", dashboardUrl);
        verify(dao).delete(eq(dashboardUrl));
    }

    @Test
    void testUnauthorizedDelete() throws Exception {
        final String dashboardUrl = "fooo";
        DashboardMetadataDao dao = mock(DashboardMetadataDao.class);
        PermissionProvider permissionProvider = mock(PermissionProvider.class);
        DashboardMetadataProviderImpl dashboardMetadataProvider =
                new DashboardMetadataProviderImpl(dao, permissionProvider, new RolesProvider(new
                        DashboardConfigurations()));
        when(permissionProvider.hasPermission(eq("testUser"), anyString())).thenReturn(true);
        Assertions.assertThrows(UnauthorizedException.class, () -> dashboardMetadataProvider.
                delete("testUser1", dashboardUrl));
    }

    @Test
    void testActivateThrowException() throws Exception {
        DataSourceService dataSourceService = mock(DataSourceService.class);
        when(dataSourceService.getDataSource(anyString())).thenThrow(DataSourceException.class);
        DashboardMetadataProviderImpl dashboardMetadataProvider = new DashboardMetadataProviderImpl();
        dashboardMetadataProvider.setDataSourceService(dataSourceService);
        dashboardMetadataProvider.setConfigProvider(mock(ConfigProvider.class));

        Assertions.assertThrows(DashboardRuntimeException.class, () -> dashboardMetadataProvider.
                activate(null));
    }
}
