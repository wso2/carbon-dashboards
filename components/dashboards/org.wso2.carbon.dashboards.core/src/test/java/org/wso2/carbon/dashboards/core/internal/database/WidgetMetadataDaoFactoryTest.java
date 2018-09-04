/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package org.wso2.carbon.dashboards.core.internal.database;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.wso2.carbon.dashboards.core.bean.DashboardConfigurations;
import org.wso2.carbon.dashboards.core.exception.DashboardException;
import org.wso2.carbon.datasource.core.api.DataSourceService;
import org.wso2.carbon.datasource.core.exception.DataSourceException;

import javax.sql.DataSource;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Test cases for {@link WidgetMetadataDaoFactoryTest} class.
 *
 * @since 4.0.0
 */
public class WidgetMetadataDaoFactoryTest {

    @Test
    void testCreateDaoWhenDataSourceServiceThrowException() throws Exception {
        DataSourceService dataSourceService = mock(DataSourceService.class);
        when(dataSourceService.getDataSource(anyString())).thenThrow(DataSourceException.class);
        DashboardConfigurations dashboardConfigurations = new DashboardConfigurations();

        Assertions.assertThrows(DashboardException.class,
                                () -> WidgetMetadataDaoFactory.createDao(dataSourceService, dashboardConfigurations));
    }

    @Test
    void testCreateDaoSuccess() throws Exception {
        DataSource dataSource = mock(DataSource.class);
        DataSourceService dataSourceService = mock(DataSourceService.class);
        when(dataSourceService.getDataSource(anyString())).thenReturn(dataSource);
        DashboardConfigurations dashboardConfigurations = new DashboardConfigurations();

        try {
            WidgetMetadataDaoFactory.createDao(dataSourceService, dashboardConfigurations);
        } catch (DashboardException e) {
            Assertions.fail("DAO instantiation failed", e);
        }
    }
}
