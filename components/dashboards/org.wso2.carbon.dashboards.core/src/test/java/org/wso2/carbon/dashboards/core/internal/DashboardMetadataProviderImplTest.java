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
import org.wso2.carbon.config.provider.ConfigProvider;
import org.wso2.carbon.dashboards.core.bean.DashboardConfigurations;
import org.wso2.carbon.dashboards.core.bean.DashboardMetadata;
import org.wso2.carbon.dashboards.core.exception.DashboardRuntimeException;
import org.wso2.carbon.dashboards.core.internal.database.DashboardMetadataDao;
import org.wso2.carbon.datasource.core.api.DataSourceService;
import org.wso2.carbon.datasource.core.exception.DataSourceException;

import java.util.Collections;
import java.util.Optional;

import javax.sql.DataSource;

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
        DashboardMetadataProviderImpl dashboardMetadataProvider =
                new DashboardMetadataProviderImpl(dao, new MockPermissionProvider());

        Assertions.assertTrue(dashboardMetadataProvider.get("foo").isPresent());
        Assertions.assertFalse(dashboardMetadataProvider.get("bar").isPresent());
        verify(dao, times(2)).get(anyString());
    }

    @Test
    void testGetAll() throws Exception {
        DashboardMetadataDao dao = mock(DashboardMetadataDao.class);
        when(dao.getAll()).thenReturn(Collections.singleton(new DashboardMetadata()));
        DashboardMetadataProviderImpl dashboardMetadataProvider =
                new DashboardMetadataProviderImpl(dao, new MockPermissionProvider());

        Assertions.assertEquals(dashboardMetadataProvider.getAll().size(), 1);
        verify(dao).getAll();
    }

    @Test
    void testAdd() throws Exception {
        final DashboardMetadata dashboardMetadata = new DashboardMetadata();
        DashboardMetadataDao dao = mock(DashboardMetadataDao.class);
        DashboardMetadataProviderImpl dashboardMetadataProvider =
                new DashboardMetadataProviderImpl(dao, new MockPermissionProvider());

        dashboardMetadataProvider.add(dashboardMetadata);
        verify(dao).add(eq(dashboardMetadata));
    }

    @Test
    void testUpdate() throws Exception {
        final DashboardMetadata dashboardMetadata = new DashboardMetadata();
        DashboardMetadataDao dao = mock(DashboardMetadataDao.class);
        DashboardMetadataProviderImpl dashboardMetadataProvider =
                new DashboardMetadataProviderImpl(dao, new MockPermissionProvider());

        dashboardMetadataProvider.update(dashboardMetadata);
        verify(dao).update(eq(dashboardMetadata));
    }

    @Test
    void testDelete() throws Exception {
        final String dashboardUrl = "foo";
        DashboardMetadataDao dao = mock(DashboardMetadataDao.class);
        DashboardMetadataProviderImpl dashboardMetadataProvider =
                new DashboardMetadataProviderImpl(dao, new MockPermissionProvider());

        dashboardMetadataProvider.delete(dashboardUrl);
        verify(dao).delete(eq(dashboardUrl));
    }

    @Test
    void testActivateThrowException() throws Exception {
        DataSourceService dataSourceService = mock(DataSourceService.class);
        when(dataSourceService.getDataSource(anyString())).thenThrow(DataSourceException.class);
        DashboardMetadataProviderImpl dashboardMetadataProvider = new DashboardMetadataProviderImpl();
        dashboardMetadataProvider.setDataSourceService(dataSourceService);
        dashboardMetadataProvider.setConfigProvider(mock(ConfigProvider.class));

        Assertions.assertThrows(DashboardRuntimeException.class, () -> dashboardMetadataProvider.activate(null));
    }

    @Test
    void testActivate() throws Exception {
        DataSourceService dataSourceService = mock(DataSourceService.class);
        when(dataSourceService.getDataSource(anyString())).thenReturn(mock(DataSource.class));
        ConfigProvider configProvider = mock(ConfigProvider.class);
        when(configProvider.getConfigurationObject(eq(DashboardConfigurations.class)))
                .thenReturn(new DashboardConfigurations());
        DashboardMetadataProviderImpl dashboardMetadataProvider = new DashboardMetadataProviderImpl();
        dashboardMetadataProvider.setDataSourceService(dataSourceService);
        dashboardMetadataProvider.setConfigProvider(configProvider);

        try {
            dashboardMetadataProvider.activate(null);
        } catch (DashboardRuntimeException e) {
            Assertions.fail("Dashboard data provider activation failed.", e);
        }
    }
}
