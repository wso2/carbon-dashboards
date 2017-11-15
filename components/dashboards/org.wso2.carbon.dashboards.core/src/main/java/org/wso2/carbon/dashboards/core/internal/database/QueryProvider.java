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
import org.wso2.carbon.dashboards.core.bean.QueryConfiguration;
import org.wso2.carbon.dashboards.core.exception.DashboardRuntimeException;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.constructor.Constructor;
import org.yaml.snakeyaml.introspector.BeanAccess;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Objects;

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
    public static final String DEFAULT_DB_TYPE = "h2";
    public static final String DEFAULT_DB_VERSION = "1.2.140";
    private static final String FILE_SQL_QUERIES = "sql-queries.yaml";

    private final List<QueryConfiguration> queries;

    public QueryProvider(DashboardConfigurations dashboardConfigurations) {
        this.queries = readConfigs(dashboardConfigurations);
    }

    @SuppressWarnings("unchecked, rawtypes")
    private List<QueryConfiguration> readConfigs(DashboardConfigurations dashboardConfigurations) {
        List queries;
        try (InputStream inputStream = this.getClass().getClassLoader().getResourceAsStream(FILE_SQL_QUERIES)) {
            if (inputStream == null) {
                throw new DashboardRuntimeException("Cannot find file '" + FILE_SQL_QUERIES + "' in class path.");
            }
            Yaml yaml = new Yaml(new OsgiClassLoaderConstructor());
            yaml.setBeanAccess(BeanAccess.FIELD);
            queries = yaml.loadAs(inputStream, DashboardConfigurations.class).getQueries();
        } catch (IOException e) {
            throw new DashboardRuntimeException("Cannot read YAML file '" + FILE_SQL_QUERIES + "' from classpath.", e);
        } catch (Exception e) {
            throw new DashboardRuntimeException("YAML file '" + FILE_SQL_QUERIES + "' is invalid.", e);
        }

        // TODO: 11/10/17 Merge default SQL queries with DashboardConfigurations.getQueries()
        return queries;
    }

    @Deprecated
    public String getQuery(String key) throws DashboardRuntimeException {
        return getQuery(DEFAULT_DB_TYPE, DEFAULT_DB_VERSION, key);
    }

    public String getQuery(String dbType, String dbVersion, String key) throws DashboardRuntimeException {
        QueryConfiguration queryConfiguration = queries.stream()
                .filter(queryConfig -> Objects.equals(dbType, queryConfig.getType()) &&
                                       Objects.equals(dbVersion, queryConfig.getVersion()))
                .findFirst()
                .orElseThrow(() -> new DashboardRuntimeException(
                        "Cannot find SQL query configuration for database type '" + dbType + "'."));
        return queryConfiguration.getQuery(key)
                .orElseThrow(() -> new DashboardRuntimeException("Cannot find the SQl query for key '" + key + "'."));
    }

    /**
     * YAML constructor that loads classes in an OSGi environment.
     *
     * @since 4.0.0
     */
    private static class OsgiClassLoaderConstructor extends Constructor {

        @Override
        protected Class<?> getClassForName(String name) throws ClassNotFoundException {
            return Class.forName(name, true, this.getClass().getClassLoader());
        }
    }
}
