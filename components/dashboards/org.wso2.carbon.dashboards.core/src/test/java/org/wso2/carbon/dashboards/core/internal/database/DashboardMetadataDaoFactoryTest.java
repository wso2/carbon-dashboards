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

package org.wso2.carbon.dashboards.core.internal.database;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.wso2.carbon.config.ConfigurationException;
import org.wso2.carbon.config.provider.ConfigProvider;
import org.wso2.carbon.dashboards.core.bean.DashboardConfigurations;
import org.wso2.carbon.dashboards.core.exception.DashboardException;
import org.wso2.carbon.datasource.core.api.DataSourceService;
import org.wso2.carbon.datasource.core.exception.DataSourceException;

import javax.sql.DataSource;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Test cases for {@link DashboardMetadataDaoFactory} class.
 *
 * @since 4.0.0
 */
public class DashboardMetadataDaoFactoryTest {

    @Test
    void createDaoWhenDataSourceServiceThrowException() throws Exception {
        DataSourceService dataSourceService = mock(DataSourceService.class);
        when(dataSourceService.getDataSource(anyString())).thenThrow(DataSourceException.class);
        ConfigProvider configProvider = mock(ConfigProvider.class);

        Assertions.assertThrows(DashboardException.class,
                                () -> DashboardMetadataDaoFactory.createDao(dataSourceService, configProvider));
    }

    @Test
    void createDaoWhenConfigProviderThrowException() throws Exception {
        DataSource dataSource = mock(DataSource.class);
        DataSourceService dataSourceService = mock(DataSourceService.class);
        when(dataSourceService.getDataSource(anyString())).thenReturn(dataSource);

        ConfigProvider configProvider = mock(ConfigProvider.class);
        when(configProvider.getConfigurationObject(eq(DashboardConfigurations.class)))
                .thenThrow(ConfigurationException.class);

        Assertions.assertThrows(DashboardException.class,
                                () -> DashboardMetadataDaoFactory.createDao(dataSourceService, configProvider));
    }

    @Test
    void createDaoSuccess() throws Exception {
        DataSource dataSource = mock(DataSource.class);
        DataSourceService dataSourceService = mock(DataSourceService.class);
        when(dataSourceService.getDataSource(anyString())).thenReturn(dataSource);

        ConfigProvider configProvider = mock(ConfigProvider.class);
        when(configProvider.getConfigurationObject(eq(DashboardConfigurations.class)))
                .thenReturn(new DashboardConfigurations());

        try {
            DashboardMetadataDaoFactory.createDao(dataSourceService, configProvider);
        } catch (DashboardException e) {
            Assertions.fail("DAO instantiation failed", e);
        }
    }
}
