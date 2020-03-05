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
import org.wso2.carbon.dashboards.core.DashboardThemeConfigProvider;
import org.wso2.carbon.dashboards.core.WidgetMetadataProvider;
import org.wso2.carbon.dashboards.core.bean.DashboardConfigurations;
import org.wso2.carbon.dashboards.core.bean.DashboardMetadata;
import org.wso2.carbon.dashboards.core.exception.UnauthorizedException;
import org.wso2.carbon.dashboards.core.internal.database.DashboardMetadataDao;

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
        when(permissionProvider.hasPermission(eq("testUser"), Mockito.isA(Permission.class))).thenReturn(true);

        DashboardMetadataProviderImpl dashboardMetadataProvider = createDashboardProvider(dao, permissionProvider);

        Assertions.assertTrue(dashboardMetadataProvider.getDashboardByUser("testUser", "foo", "designer").isPresent());
        Assertions.assertFalse(dashboardMetadataProvider.getDashboardByUser("testUser", "bar", null).isPresent());
        Assertions.assertFalse(dashboardMetadataProvider.
                getDashboardByUser("testUser", "foo-bar", "settings").isPresent());
        verify(dao, times(4)).get(anyString());
    }

    @Test
    void testGetAll() throws Exception {
        DashboardMetadataDao dao = mock(DashboardMetadataDao.class);
        DashboardMetadata dashboardMetadata = new DashboardMetadata();
        dashboardMetadata.setUrl("testUrl");
        when(dao.getAll()).thenReturn(Collections.singleton(dashboardMetadata));
        when(dao.get(dashboardMetadata.getUrl())).thenReturn(Optional.of(dashboardMetadata));

        PermissionProvider permissionProvider = mock(PermissionProvider.class);
        when(permissionProvider.hasPermission(eq("testUser"), Mockito.isA(Permission.class))).thenReturn(true);

        DashboardMetadataProviderImpl dashboardMetadataProvider = createDashboardProvider(dao, permissionProvider);
        Assertions.assertEquals(1, dashboardMetadataProvider.getAllByUser("testUser").size());
        verify(dao).getAll();
    }

    @Test
    void testAdd() throws Exception {
        final DashboardMetadata dashboardMetadata = new DashboardMetadata();
        DashboardMetadataDao dao = mock(DashboardMetadataDao.class);

        PermissionProvider permissionProvider = mock(PermissionProvider.class);

        IdPClient idPClient = mock(IdPClient.class);
        DashboardThemeConfigProvider dashboardThemeConfigProvider = mock(DashboardThemeConfigProvider.class);
        List<org.wso2.carbon.analytics.idp.client.core.models.Role> userRoles = new ArrayList<>();
        userRoles.add(new org.wso2.carbon.analytics.idp.client.core.models.Role
                              ("1", "admin"));
        when(idPClient.getUserRoles(anyString())).thenReturn(userRoles);

        DashboardMetadataProviderImpl dashboardMetadataProvider = createDashboardProvider(dao, permissionProvider,
                idPClient, dashboardThemeConfigProvider);
        dashboardMetadataProvider.add("", dashboardMetadata);
        verify(dao).add(eq(dashboardMetadata));
    }

    @Test
    void testUnauthorizedAdd() throws Exception {
        final DashboardMetadata dashboardMetadata = new DashboardMetadata();
        DashboardMetadataDao dao = mock(DashboardMetadataDao.class);

        PermissionProvider permissionProvider = mock(PermissionProvider.class);

        IdPClient idPClient = mock(IdPClient.class);
        DashboardThemeConfigProvider dashboardThemeConfigProvider = mock(DashboardThemeConfigProvider.class);
        List<Role> userRoles = new ArrayList<>();
        userRoles.add(new org.wso2.carbon.analytics.idp.client.core.models.Role
                              ("test_role", "test_role"));
        when(idPClient.getUserRoles(anyString())).thenReturn(userRoles);
        when(idPClient.getAdminRole()).thenReturn(new Role("test_role2", "test_role2"));

        DashboardMetadataProviderImpl dashboardMetadataProvider = createDashboardProvider(dao, permissionProvider,
                idPClient, dashboardThemeConfigProvider);
        Assertions.assertThrows(UnauthorizedException.class, () -> dashboardMetadataProvider.
                add("testUser", dashboardMetadata));
    }

    @Test
    void testUpdate() throws Exception {
        final DashboardMetadata dashboardMetadata = new DashboardMetadata();
        DashboardMetadataDao dao = mock(DashboardMetadataDao.class);
        PermissionProvider permissionProvider = mock(PermissionProvider.class);
        DashboardMetadataProviderImpl dashboardMetadataProvider = createDashboardProvider(dao, permissionProvider);

        when(permissionProvider.hasPermission(eq("testUser"), Mockito.isA(Permission.class))).thenReturn(true);
        dashboardMetadataProvider.update("testUser", dashboardMetadata);
        verify(dao).update(eq(dashboardMetadata));
    }

    @Test
    void testUnauthorizedUpdate() {
        final DashboardMetadata dashboardMetadata = new DashboardMetadata();
        DashboardMetadataDao dao = mock(DashboardMetadataDao.class);
        PermissionProvider permissionProvider = mock(PermissionProvider.class);
        DashboardMetadataProviderImpl dashboardMetadataProvider = createDashboardProvider(dao, permissionProvider);

        when(permissionProvider.hasPermission(eq("testUser"), anyString())).thenReturn(true);
        Assertions.assertThrows(UnauthorizedException.class, () -> dashboardMetadataProvider.
                update("testUser1", dashboardMetadata));
    }

    @Test
    void testDelete() throws Exception {
        final String dashboardUrl = "foo";
        DashboardMetadataDao dao = mock(DashboardMetadataDao.class);
        PermissionProvider permissionProvider = mock(PermissionProvider.class);
        DashboardMetadataProviderImpl dashboardMetadataProvider = createDashboardProvider(dao, permissionProvider);

        when(permissionProvider.hasPermission(eq("testUser"), Mockito.isA(Permission.class))).thenReturn(true);
        dashboardMetadataProvider.delete("testUser", dashboardUrl);
        verify(dao).delete(eq(dashboardUrl));
    }

    @Test
    void testUnauthorizedDelete() {
        final String dashboardUrl = "fooo";
        DashboardMetadataDao dao = mock(DashboardMetadataDao.class);
        PermissionProvider permissionProvider = mock(PermissionProvider.class);
        DashboardMetadataProviderImpl dashboardMetadataProvider = createDashboardProvider(dao, permissionProvider);

        when(permissionProvider.hasPermission(eq("testUser"), anyString())).thenReturn(true);
        Assertions.assertThrows(UnauthorizedException.class, () -> dashboardMetadataProvider.
                delete("testUser1", dashboardUrl));
    }

    private static DashboardMetadataProviderImpl createDashboardProvider(DashboardMetadataDao dao,
                                                                         PermissionProvider permissionProvider) {
        return createDashboardProvider(dao, permissionProvider, mock(IdPClient.class),
                mock(DashboardThemeConfigProvider.class));
    }

    private static DashboardMetadataProviderImpl createDashboardProvider(DashboardMetadataDao dao,
                                                                         PermissionProvider permissionProvider,
                                                                         IdPClient idPClient,
                                                                         DashboardThemeConfigProvider
                                                                                 dashboardThemeConfigProvider) {
        DashboardMetadataProviderImpl provider = new DashboardMetadataProviderImpl(dao,
                                                                                   new DashboardConfigurations(),
                                                                                   permissionProvider,
                                                                                   idPClient,
                                                                                   dashboardThemeConfigProvider);
        provider.setWidgetMetadataProvider(mock(WidgetMetadataProvider.class));
        return provider;
    }
}
