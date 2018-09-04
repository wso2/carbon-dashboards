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

import org.wso2.carbon.dashboards.core.bean.DashboardConfigurations;
import org.wso2.carbon.dashboards.core.exception.DashboardException;
import org.wso2.carbon.datasource.core.api.DataSourceService;
import org.wso2.carbon.datasource.core.exception.DataSourceException;

import javax.sql.DataSource;

/**
 * Factory for {@link DashboardMetadataDao} class.
 *
 * @since 4.0.0
 */
public class WidgetMetadataDaoFactory {

    private static final String DATA_SOURCE_NAME_DASHBOARD = "WSO2_DASHBOARD_DB";

    /**
     * Creates a new DAO.
     *
     * @param dataSourceService       data sources service
     * @param dashboardConfigurations dashboard configurations
     * @return DAO
     * @throws DashboardException if cannot find required data source or load dashboard configurations
     */
    public static WidgetMetadataDao createDao(DataSourceService dataSourceService,
                                              DashboardConfigurations dashboardConfigurations)
            throws DashboardException {
        DataSource dataSource;
        try {
            dataSource = (DataSource) dataSourceService.getDataSource(DATA_SOURCE_NAME_DASHBOARD);
        } catch (DataSourceException e) {
            throw new DashboardException("Cannot find data source named '" + DATA_SOURCE_NAME_DASHBOARD + "'.", e);
        }
        QueryManager queryManager = new QueryManager(dashboardConfigurations);
        return new WidgetMetadataDao(dataSource, queryManager);
    }
}
