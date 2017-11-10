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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.carbon.dashboards.core.bean.DashboardConfigurations;
import org.wso2.carbon.dashboards.core.exception.DashboardRuntimeException;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;
import java.util.Properties;

/**
 * Provides SQl queries.
 *
 * @since 4.0.0
 */
public class QueryProvider {

    // TODO: 11/10/17 Re-think this class after the common SQL query provider get released.

    public static final String ADD_DASHBOARD_CONTENT_QUERY = "add_dashboard";
    public static final String GET_DASHBOARD_METADATA_LIST_QUERY = "get_dashboard_metadata_list";
    public static final String GET_DASHBOARD_BY_URL_QUERY = "get_dashboard_by_url";
    public static final String DELETE_DASHBOARD_BY_URL_QUERY = "delete_dashboard_by_url";
    public static final String UPDATE_DASHBOARD_CONTENT_QUERY = "update_dashboard_content";
    private static final String FILE_DEFAULT_SQL_QUERIES = "default-sql-queries.properties";
    private static final Logger LOGGER = LoggerFactory.getLogger(QueryProvider.class);

    private final Map<String, String> queries;

    public QueryProvider(DashboardConfigurations dashboardConfigurations) {
        this.queries = readConfigs(dashboardConfigurations);
    }

    @SuppressWarnings("unchecked, rawtypes")
    private Map<String, String> readConfigs(DashboardConfigurations dashboardConfigurations) {
        Properties defaultSqlQueries = new Properties();
        try (InputStream inputStream = this.getClass().getClassLoader().getResourceAsStream(FILE_DEFAULT_SQL_QUERIES)) {
            if (inputStream == null) {
                throw new DashboardRuntimeException(
                        "Cannot find file '" + FILE_DEFAULT_SQL_QUERIES + "' in class path.");
            }
            defaultSqlQueries.load(inputStream);
        } catch (IllegalArgumentException e) {
            throw new DashboardRuntimeException("Property file '" + FILE_DEFAULT_SQL_QUERIES + "' is invalid.", e);
        } catch (IOException e) {
            throw new DashboardRuntimeException("Cannot read property file '" + FILE_DEFAULT_SQL_QUERIES + "'.", e);
        }

        // TODO: 11/10/17 Merge default SQL queries with DashboardConfigurations.getQueries()
        return (Map) defaultSqlQueries;
    }

    public String getQuery(String key) {
        if (!this.queries.containsKey(key)) {
            throw new DashboardRuntimeException("Cannot find the SQl query for key '" + key + "'.");
        }
        return this.queries.get(key);
    }
}
