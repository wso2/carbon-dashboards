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

import com.google.gson.Gson;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.carbon.dashboards.core.bean.widget.GeneratedWidgetConfigs;
import org.wso2.carbon.dashboards.core.exception.DashboardException;

import java.nio.charset.StandardCharsets;
import java.sql.Blob;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashSet;
import java.util.Set;
import javax.sql.DataSource;

/**
 * This is a core class of the WidgetMetadataDao JDBC Based implementation.
 */
public class WidgetMetadataDao {

    private static final Logger LOGGER = LoggerFactory.getLogger(WidgetMetadataDao.class);
    private static final String COLUMN_WIDGET_ID = "WIDGET_ID";
    private static final String COLUMN_WIDGET_NAME = "WIDGET_NAME";
    private static final String COLUMN_WIDGET_CONFIGS = "WIDGET_CONFIGS";

    private final DataSource dataSource;
    private final QueryProvider queryProvider;
    private static final Gson GSON = new Gson();

    public WidgetMetadataDao(DataSource dataSource, QueryProvider queryProvider) {
        this.dataSource = dataSource;
        this.queryProvider = queryProvider;
    }

    private Connection getConnection() throws SQLException {
        return dataSource.getConnection();
    }

    public void addGeneratedWidgetConfigs(GeneratedWidgetConfigs generatedWidgetConfigs) throws DashboardException {
        Connection connection = null;
        PreparedStatement ps = null;
        String query = queryProvider.getQuery(QueryProvider.ADD_WIDGET_CONFIG_QUERY);
        generatedWidgetConfigs.setId(generatedWidgetConfigs.getName().replace(" ", "-"));
        try {
            connection = getConnection();
            connection.setAutoCommit(false);
            ps = connection.prepareStatement(query);
            ps.setString(1, generatedWidgetConfigs.getId());
            ps.setString(2, generatedWidgetConfigs.getName());
            Blob blob = connection.createBlob();
            blob.setBytes(1, toJsonBytes(generatedWidgetConfigs));
            ps.setObject(3, blob);
            ps.executeUpdate();
            connection.commit();
        } catch (SQLException e) {
            rollbackQuietly(connection);
            LOGGER.debug("Failed to execute SQL query {}", query);
            throw new DashboardException("Cannot create a new widget with " + generatedWidgetConfigs + ".", e);
        } finally {
            closeQuietly(connection, ps, null);
        }
    }

    private static byte[] toJsonBytes(Object generatedWidgetConfigs) {
        return GSON.toJson(generatedWidgetConfigs).getBytes(StandardCharsets.UTF_8);
    }

    private static GeneratedWidgetConfigs fromJsonBytes(Blob byteBlob) throws SQLException {
        return GSON.fromJson(new String(byteBlob.getBytes(1, (int) byteBlob.length()), StandardCharsets.UTF_8),
                GeneratedWidgetConfigs.class);
    }

    public GeneratedWidgetConfigs getGeneratedWidgetConfigsForId(String widgetId) throws
            DashboardException {
        Connection connection = null;
        PreparedStatement ps = null;
        ResultSet resultSet = null;
        String query = queryProvider.getQuery(QueryProvider.GET_WIDGET_CONFIG_QUERY);
        try {
            connection = getConnection();
            ps = connection.prepareStatement(query);
            ps.setString(1, widgetId);
            resultSet = ps.executeQuery();
            if (resultSet.next()) {
                return fromJsonBytes(resultSet.getBlob(COLUMN_WIDGET_CONFIGS));
            }
        } catch (SQLException e) {
            rollbackQuietly(connection);
            LOGGER.debug("Failed to execute SQL query {}", query);
            throw new DashboardException("Cannot get widget configuration for widget id  " + widgetId + ".", e);
        } finally {
            closeQuietly(connection, ps, resultSet);
        }
        return null;
    }

    public Set<GeneratedWidgetConfigs> getGeneratedWidgetIdSet() throws DashboardException {
        Connection connection = null;
        PreparedStatement ps = null;
        ResultSet resultSet = null;
        String query = queryProvider.getQuery(QueryProvider.GET_WIDGET_NAME_ID_MAP_QUERY);
        try {
            connection = getConnection();
            ps = connection.prepareStatement(query);
            resultSet = ps.executeQuery();
            Set<GeneratedWidgetConfigs> widgetNameSet = new HashSet<>();
            while (resultSet.next()) {
                GeneratedWidgetConfigs generatedWidgetConfigs = new GeneratedWidgetConfigs();
                generatedWidgetConfigs.setId(resultSet.getString(COLUMN_WIDGET_ID));
                generatedWidgetConfigs.setName(resultSet.getString(COLUMN_WIDGET_NAME));
                widgetNameSet.add(generatedWidgetConfigs);
            }
            return widgetNameSet;
        } catch (SQLException e) {
            rollbackQuietly(connection);
            LOGGER.debug("Failed to execute SQL query {}", query);
            throw new DashboardException("Failed to get widget widget name set.", e);
        } finally {
            closeQuietly(connection, ps, resultSet);
        }
    }

    public void delete(String widgetId) throws DashboardException {
        Connection connection = null;
        PreparedStatement ps = null;
        String query = queryProvider.getQuery(QueryProvider.DELETE_WIDGET_BY_ID);
        try {
            connection = getConnection();
            connection.setAutoCommit(false);
            ps = connection.prepareStatement(query);
            ps.setString(1, widgetId);
            ps.executeUpdate();
            connection.commit();
        } catch (SQLException e) {
            rollbackQuietly(connection);
            LOGGER.debug("Failed to execute SQL query {}", query);
            throw new DashboardException("Cannot delete widget id: '" + widgetId + "'.", e);
        } finally {
            closeQuietly(connection, ps, null);
        }
    }

    static void closeQuietly(Connection connection, PreparedStatement preparedStatement, ResultSet resultSet) {
        if (resultSet != null) {
            try {
                resultSet.close();
            } catch (SQLException e) {
                LOGGER.error("An error occurred when closing result set.", e);
            }
        }
        if (preparedStatement != null) {
            try {
                preparedStatement.close();
            } catch (SQLException e) {
                LOGGER.error("An error occurred when closing prepared statement.", e);
            }
        }
        if (connection != null) {
            try {
                connection.close();
            } catch (SQLException e) {
                LOGGER.error("An error occurred when closing DB connection.", e);
            }
        }
    }

    static void rollbackQuietly(Connection connection) {
        if (connection != null) {
            try {
                connection.rollback();
            } catch (SQLException e) {
                LOGGER.error("An error occurred when rollbacking DB connection.", e);
            }
        }
    }
}
