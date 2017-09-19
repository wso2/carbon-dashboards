/*
 *  Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */
package org.wso2.carbon.dashboards.core.internal.dao.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.carbon.config.provider.ConfigProvider;
import org.wso2.carbon.dashboards.core.bean.DashboardConfigurations;
import org.wso2.carbon.dashboards.core.internal.DataHolder;

import java.util.HashMap;
import java.util.Map;

/**
 * Holds the database queries.
 */
public class QueryManager {
    private static final Logger LOGGER = LoggerFactory.getLogger(QueryManager.class);
    private static QueryManager instance = new QueryManager();

    private Map<String, String> queries;

    private QueryManager() {
        this.queries = readConfigs();
    }

    public static QueryManager getInstance() {
        return instance;
    }

    private Map<String, String> readConfigs() {
        // TODO: Get the relevant type of the database from the config provider.
        String databaseType = "h2";

        ConfigProvider configProvider = DataHolder.getInstance().getConfigProvider();
        try {
            DashboardConfigurations dashboardConfigurations = configProvider
                    .getConfigurationObject(DashboardConfigurations.class);
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

