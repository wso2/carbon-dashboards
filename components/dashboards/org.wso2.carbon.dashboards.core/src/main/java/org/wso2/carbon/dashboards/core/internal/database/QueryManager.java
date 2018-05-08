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
import org.wso2.carbon.dashboards.core.exception.DashboardRuntimeException;
import org.wso2.carbon.database.query.manager.QueryProvider;
import org.wso2.carbon.database.query.manager.config.Queries;
import org.wso2.carbon.database.query.manager.exception.QueryMappingNotAvailableException;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.constructor.Constructor;
import org.yaml.snakeyaml.introspector.BeanAccess;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Provides SQl queries.
 *
 * @since 4.0.0
 */
public class QueryManager {
    public static final String DASHBOARD_RESOURCE_TABLE = "DASHBOARD_RESOURCE";
    public static final String WIDGET_RESOURCE_TABLE = "WIDGET_RESOURCE";
    public static final String TABLE_CHECK = "table_check";
    public static final String CREATE_DASHBOARD_RESOURCE_TABLE = "create_dashboard_resource_table";
    public static final String CREATE_WIDGET_RESOURCE_TABLE = "create_widget_resource_table";
    public static final String TABLE_NAME_PLACEHOLDER = "{{TABLE_NAME}}";
    public static final String ADD_DASHBOARD_CONTENT_QUERY = "add_dashboard";
    public static final String ADD_WIDGET_CONFIG_QUERY = "add_widget_config";
    public static final String GET_WIDGET_CONFIG_QUERY = "get_widget_config";
    public static final String GET_WIDGET_NAME_ID_MAP_QUERY = "get_widget_name_id_map";
    public static final String DELETE_WIDGET_BY_ID = "delete_widget_by_id";
    public static final String GET_DASHBOARD_METADATA_LIST_QUERY = "get_dashboard_metadata_list";
    public static final String GET_DASHBOARD_BY_URL_QUERY = "get_dashboard_by_url";
    public static final String DELETE_DASHBOARD_BY_URL_QUERY = "delete_dashboard_by_url";
    public static final String UPDATE_DASHBOARD_CONTENT_QUERY = "update_dashboard_content";
    public static final String DEFAULT_DB_TYPE = "H2";
    public static final String DEFAULT_DB_VERSION = "default";
    private static final String FILE_SQL_QUERIES = "sql-queries.yaml";

    private final List<Queries> componentQueries;
    private final List<Queries> deploymentQueries;

    private final Map<String, Map<String, String>> queryMap = new HashMap<>();

    public QueryManager(DashboardConfigurations dashboardConfigurations) {
        this.componentQueries = readConfigs();
        this.deploymentQueries = dashboardConfigurations.getQueries();
    }

    @SuppressWarnings("unchecked, rawtypes")
    private List<Queries> readConfigs() {
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
        return queries;
    }

    /**
     * Get SQL query.
     *
     * @param connection SQLConnection object.
     * @param key        Query key
     * @return SQL query
     * @throws SQLException
     */
    public String getQuery(Connection connection, String key) throws SQLException {
        return getQuery(connection.getMetaData().getDatabaseProductName(),
                connection.getMetaData().getDatabaseProductVersion(), key);
    }

    /**
     * Get SQL query for specific database type and version.
     *
     * @param dbType    Database type
     * @param dbVersion Database version
     * @param key       Query key
     * @return SQL query
     * @throws SQLException
     */
    public String getQuery(String dbType, String dbVersion, String key) throws SQLException {
        String dbKey = dbType + "_" + dbVersion;

        Map<String, String> queries = queryMap.get(dbKey);
        if (queries == null) {
            try {
                queries = QueryProvider.mergeMapping(dbType, dbVersion, componentQueries, deploymentQueries);
            } catch (QueryMappingNotAvailableException e) {
                throw new SQLException("Cannot find database queries for " + dbType + " " + dbVersion + ".", e);
            }
            queryMap.put(dbKey, queries);
        }

        String query = queries.get(key);
        if (query == null) {
            throw new SQLException("Cannot find query for " + key + " in " + dbType + " " + dbVersion + ".");
        }
        return queryMap.get(dbKey).get(key);
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
