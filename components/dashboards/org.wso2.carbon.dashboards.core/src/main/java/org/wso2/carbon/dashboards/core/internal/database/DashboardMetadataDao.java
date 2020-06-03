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
import com.google.gson.JsonArray;
import com.google.gson.JsonParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.carbon.dashboards.core.bean.DashboardMetadata;
import org.wso2.carbon.dashboards.core.bean.DashboardMetadataContent;
import org.wso2.carbon.dashboards.core.exception.DashboardException;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.sql.Blob;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import javax.sql.DataSource;

/**
 * This is a core class of the DashboardMetadata JDBC Based implementation.
 */
public class DashboardMetadataDao {

    private static final Logger LOGGER = LoggerFactory.getLogger(DashboardMetadataDao.class);
    private static final Gson GSON = new Gson();
    private static final String COLUMN_DASHBOARD_LANDING_PAGE = "LANDING_PAGE";
    private static final String COLUMN_DASHBOARD_PARENT_ID = "PARENT_ID";
    private static final String COLUMN_DASHBOARD_CONTENT = "CONTENT";
    private static final String COLUMN_DASHBOARD_DESCRIPTION = "DESCRIPTION";
    private static final String COLUMN_DASHBOARD_NAME = "NAME";
    private static final String COLUMN_DASHBOARD_URL = "URL";
    private static final String COLUMN_DASHBOARD_OWNER = "OWNER";
    private static final String POSTGRESQL_DB_TYPE = "PostgreSQL";

    private final DataSource dataSource;
    private final QueryManager queryManager;

    public DashboardMetadataDao(DataSource dataSource, QueryManager queryManager) {
        this.dataSource = dataSource;
        this.queryManager = queryManager;
    }

    public void initDashboardTable() throws DashboardException {
        if (!tableExists(QueryManager.DASHBOARD_RESOURCE_TABLE)) {
            this.createDashboardResourceTable();
        }
    }

    /**
     * Create dashboard resource table.
     * @throws DashboardException when faild to execute the table create queries.
     */
    private void createDashboardResourceTable() throws DashboardException {
        Connection connection = null;
        PreparedStatement ps = null;
        String query = null;
        try {
            connection = getConnection();
            connection.setAutoCommit(false);
            query = queryManager.getQuery(connection, QueryManager.CREATE_DASHBOARD_RESOURCE_TABLE);
            ps = connection.prepareStatement(query);
            ps.executeUpdate();
            connection.commit();
        } catch (SQLException e) {
            rollbackQuietly(connection);
            LOGGER.debug("Failed to execute SQL query {}", query);
            throw new DashboardException("Unable to create the '" + QueryManager.DASHBOARD_RESOURCE_TABLE +
                    "' table.", e);
        } finally {
            closeQuietly(connection, ps, null);
        }
    }

    /**
     * Method for checking whether or not the given table (which reflects the current event table instance) exists.
     *
     * @return true/false based on the table existence.
     */
    public boolean tableExists(String tableName) {
        Connection connection = null;
        PreparedStatement ps = null;
        String query = null;
        try {
            connection = getConnection();
            query = queryManager.getQuery(connection, QueryManager.TABLE_CHECK);
            ps = connection.prepareStatement(query.replace(QueryManager.TABLE_NAME_PLACEHOLDER, tableName));
            ps.execute();
            return true;
        } catch (SQLException e) {
            rollbackQuietly(connection);
            LOGGER.debug("Table '{}' assumed to not exist since its existence check query {} resulted "
                    + "in exception {}.", tableName, query, e.getMessage());
            return false;
        } finally {
            closeQuietly(connection, ps, null);
        }
    }

    public void update(DashboardMetadata dashboardMetadata) throws DashboardException {
        Connection connection = null;
        PreparedStatement ps = null;
        String query = null;
        try {
            connection = getConnection();
            query = queryManager.getQuery(connection, QueryManager.UPDATE_DASHBOARD_CONTENT_QUERY);
            connection.setAutoCommit(false);
            String dbType = connection.getMetaData().getDatabaseProductName();
            ps = connection.prepareStatement(query);
            ps.setString(1, dashboardMetadata.getName());
            ps.setString(2, dashboardMetadata.getDescription());
            if (dbType.equalsIgnoreCase(POSTGRESQL_DB_TYPE)) {
                ps.setBinaryStream(3, new ByteArrayInputStream(toJsonBytes(dashboardMetadata.getContent())));
                ps.setInt(4, Integer.parseInt(dashboardMetadata.getParentId()));
            } else {
                Blob blob = connection.createBlob();
                blob.setBytes(1, toJsonBytes(dashboardMetadata.getContent()));
                ps.setBlob(3, blob);
                ps.setString(4, dashboardMetadata.getParentId());
            }
            ps.setString(5, dashboardMetadata.getLandingPage());
            ps.setString(6, dashboardMetadata.getUrl());
            ps.executeUpdate();
            connection.commit();
        } catch (SQLException e) {
            rollbackQuietly(connection);
            LOGGER.debug("Failed to execute SQL query {}", query);
            throw new DashboardException(
                    "Cannot update dashboard " + dashboardMetadata + ".", e);
        } finally {
            closeQuietly(connection, ps, null);
        }
    }

    public void add(DashboardMetadata dashboardMetadata) throws DashboardException {
        Connection connection = null;
        PreparedStatement ps = null;
        String query = null;
        try {
            connection = getConnection();
            query = queryManager.getQuery(connection, QueryManager.ADD_DASHBOARD_CONTENT_QUERY);
            connection.setAutoCommit(false);
            String dbType = connection.getMetaData().getDatabaseProductName();
            ps = connection.prepareStatement(query);
            ps.setString(1, dashboardMetadata.getUrl());
            ps.setString(2, dashboardMetadata.getOwner());
            ps.setString(3, dashboardMetadata.getName());
            ps.setString(4, dashboardMetadata.getDescription());
            ps.setString(6, dashboardMetadata.getLandingPage());
            if (dbType.equalsIgnoreCase(POSTGRESQL_DB_TYPE)) {
                ps.setInt(5, Integer.parseInt(dashboardMetadata.getParentId()));
                ps.setBinaryStream(7, new ByteArrayInputStream(toJsonBytes(dashboardMetadata.getContent())));
            } else {
                ps.setString(5, dashboardMetadata.getParentId());
                Blob blob = connection.createBlob();
                blob.setBytes(1, toJsonBytes(dashboardMetadata.getContent()));
                ps.setBlob(7, blob);
            }
            ps.executeUpdate();
            connection.commit();
        } catch (SQLException e) {
            rollbackQuietly(connection);
            LOGGER.debug("Failed to execute SQL query {}", query);
            throw new DashboardException("Cannot create a new dashboard with " + dashboardMetadata + ".", e);
        } finally {
            closeQuietly(connection, ps, null);
        }
    }

    public void delete(String url) throws DashboardException {
        Connection connection = null;
        PreparedStatement ps = null;
        String query = null;
        try {
            connection = getConnection();
            query = queryManager.getQuery(connection, QueryManager.DELETE_DASHBOARD_BY_URL_QUERY);
            connection.setAutoCommit(false);
            ps = connection.prepareStatement(query);
            ps.setString(1, url);
            ps.executeUpdate();
            connection.commit();
        } catch (SQLException e) {
            rollbackQuietly(connection);
            LOGGER.debug("Failed to execute SQL query {}", query);
            throw new DashboardException("Cannot delete dashboard '" + url + "'.", e);
        } finally {
            closeQuietly(connection, ps, null);
        }
    }

    public Optional<DashboardMetadata> get(String url) throws DashboardException {
        Connection connection = null;
        PreparedStatement ps = null;
        ResultSet result = null;
        String query = null;
        try {
            connection = getConnection();
            String dbType = connection.getMetaData().getDatabaseProductName();
            query = queryManager.getQuery(connection, QueryManager.GET_DASHBOARD_BY_URL_QUERY);
            ps = connection.prepareStatement(query);
            ps.setString(1, url);
            result = ps.executeQuery();

            if (result.next()) {
                DashboardMetadata dashboardMetadata = toDashboardMetadata(result);
                if (dbType.equalsIgnoreCase(POSTGRESQL_DB_TYPE)) {
                    dashboardMetadata.setParentId(String.valueOf(result.getInt(COLUMN_DASHBOARD_PARENT_ID)));
                    dashboardMetadata.setContent(
                            parseDashboardMetadataContent(result.getBinaryStream(COLUMN_DASHBOARD_CONTENT)));
                } else {
                    dashboardMetadata.setContent(
                            parseDashboardMetadataContent(result.getBlob(COLUMN_DASHBOARD_CONTENT)));
                }
                return Optional.of(dashboardMetadata);
            } else {
                return Optional.empty();
            }
        } catch (SQLException e) {
            LOGGER.debug("Failed to execute SQL query {}", query);
            throw new DashboardException("Cannot retrieve dashboard for URl '" + url + "'.", e);
        } catch (IOException e) {
            LOGGER.debug("Failed to read dashboard content");
            throw new DashboardException("Cannot retrieve dashboard for URl '" + url + "'.", e);
        } finally {
            closeQuietly(connection, ps, result);
        }
    }

    public List<DashboardMetadata> getAll() throws DashboardException {
        List<DashboardMetadata> dashboardMetadatas = new ArrayList<>();
        Connection connection = null;
        PreparedStatement ps = null;
        ResultSet results = null;
        String query = null;
        try {
            connection = getConnection();
            query = queryManager.getQuery(connection, QueryManager.GET_DASHBOARD_METADATA_LIST_QUERY);
            ps = connection.prepareStatement(query);
            results = ps.executeQuery();
            while (results.next()) {
                dashboardMetadatas.add(toDashboardMetadata(results));
            }
        } catch (SQLException e) {
            LOGGER.debug("Failed to execute SQL query {}", query);
            throw new DashboardException("Cannot retrieve dashboards.", e);
        } finally {
            closeQuietly(connection, ps, results);
        }

        return dashboardMetadatas;
    }

    private Connection getConnection() throws SQLException {
        return dataSource.getConnection();
    }

    private static byte[] toJsonBytes(Object dashboardPages) {
        return GSON.toJson(dashboardPages).getBytes(StandardCharsets.UTF_8);
    }

    private static DashboardMetadataContent parseDashboardMetadataContent(Blob blob) throws SQLException {
        String content = new String(blob.getBytes(1, (int) blob.length()), StandardCharsets.UTF_8);
        try {
            return new Gson().fromJson(content, DashboardMetadataContent.class);
        } catch (JsonParseException e) {
            JsonArray pages = new Gson().fromJson(content, JsonArray.class);
            DashboardMetadataContent dashboardMetadataContent = new DashboardMetadataContent(pages);
            return dashboardMetadataContent;
        }
    }

    private static DashboardMetadataContent parseDashboardMetadataContent(InputStream inputStream)
            throws IOException {
        ByteArrayInputStream binaryStream = (ByteArrayInputStream) inputStream;
        byte[] buffer = new byte[binaryStream.available()];
        binaryStream.read(buffer);
        String content = new String(buffer, StandardCharsets.UTF_8);
        try {
            return new Gson().fromJson(content, DashboardMetadataContent.class);
        } catch (JsonParseException e) {
            JsonArray pages = new Gson().fromJson(content, JsonArray.class);
            return new DashboardMetadataContent(pages);
        }
    }

    private static DashboardMetadata toDashboardMetadata(ResultSet result) throws SQLException {
        DashboardMetadata dashboardMetadata = new DashboardMetadata();
        dashboardMetadata.setName(result.getString(COLUMN_DASHBOARD_NAME));
        dashboardMetadata.setOwner(result.getString(COLUMN_DASHBOARD_OWNER));
        dashboardMetadata.setUrl(result.getString(COLUMN_DASHBOARD_URL));
        dashboardMetadata.setDescription(result.getString(COLUMN_DASHBOARD_DESCRIPTION));
        dashboardMetadata.setParentId(result.getString(COLUMN_DASHBOARD_PARENT_ID));
        dashboardMetadata.setLandingPage(result.getString(COLUMN_DASHBOARD_LANDING_PAGE));
        return dashboardMetadata;
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

