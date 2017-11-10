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
import org.wso2.carbon.config.provider.ConfigProvider;
import org.wso2.carbon.dashboards.core.bean.DashboardConfigurations;

import java.util.HashMap;
import java.util.Map;

/**
 * Holds the database queries.
 */
public class QueryProvider {

    public static final String ADD_DASHBOARD_CONTENT_QUERY = "add_dashboard";
    public static final String GET_DASHBOARD_METADATA_LIST_QUERY = "get_dashboard_metadata_list";
    public static final String GET_DASHBOARD_BY_URL_QUERY = "get_dashboard_by_url";
    public static final String DELETE_DASHBOARD_BY_URL_QUERY = "delete_dashboard_by_url";
    public static final String UPDATE_DASHBOARD_CONTENT_QUERY = "update_dashboard_content";
    private static final Logger LOGGER = LoggerFactory.getLogger(QueryProvider.class);

    private final Map<String, String> queries;

    public QueryProvider(ConfigProvider configProvider) {
        this.queries = readConfigs(configProvider);
    }

    private Map<String, String> readConfigs(ConfigProvider configProvider) {
        // TODO: Get the relevant type of the database from the config provider.
        String databaseType = "h2";
        try {
            DashboardConfigurations dashboardConfigurations = configProvider.getConfigurationObject(
                    DashboardConfigurations.class);
            if (!dashboardConfigurations.getQueries().containsKey(databaseType)) {
                throw new RuntimeException("Unable to find the database type: " + databaseType);
            }
            return dashboardConfigurations.getQueries().get(databaseType);
        } catch (Exception e) {
            LOGGER.error(e.getMessage(), e);
        }
        return new HashMap<>();
    }

    public String getQuery(String key) {
        if (!this.queries.containsKey(key)) {
            throw new RuntimeException("Unable to find the configuration entry for the key: " + key);
        }
        return this.queries.get(key);
    }
}

