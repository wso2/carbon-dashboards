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
import org.wso2.carbon.dashboards.core.bean.DashboardMetadata;
import org.wso2.carbon.dashboards.core.bean.PaginationContext;
import org.wso2.carbon.dashboards.core.exception.DashboardException;

import java.nio.charset.StandardCharsets;
import java.sql.Blob;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import javax.sql.DataSource;

/**
 * This is a core class of the DashboardMetadata JDBC Based implementation.
 */
public class DashboardMetadataDAOImpl implements DashboardMetadataDAO {

    private static final Logger LOGGER = LoggerFactory.getLogger(DashboardMetadataDAOImpl.class);
    private static final Gson GSON = new Gson();
    private static final String COLUMN_DASHBOARD_LANDING_PAGE = "DASHBOARD_LANDING_PAGE";
    private static final String COLUMN_DASHBOARD_ID = "DASHBOARD_ID";
    private static final String COLUMN_DASHBOARD_PARENT_ID = "DASHBOARD_PARENT_ID";
    private static final String COLUMN_DASHBOARD_CONTENT = "DASHBOARD_CONTENT";
    private static final String COLUMN_DASHBOARD_DESCRIPTION = "DASHBOARD_DESCRIPTION";
    private static final String COLUMN_DASHBOARD_NAME = "DASHBOARD_NAME";
    private static final String COLUMN_DASHBOARD_URL = "DASHBOARD_URL";

    private final DataSource dataSource;
    private final QueryManager queryManager;

    public DashboardMetadataDAOImpl(DataSource dataSource, QueryManager queryManager) {
        this.dataSource = dataSource;
        this.queryManager = queryManager;
    }

    @Override
    public void update(DashboardMetadata dashboardMetadata) throws DashboardException {
        Connection connection = null;
        PreparedStatement ps = null;
        String query = queryManager.getQuery(QueryManager.UPDATE_DASHBOARD_CONTENT_QUERY);
        try {
            connection = getConnection();
            connection.setAutoCommit(false);
            ps = connection.prepareStatement(query);
            ps.setString(1, dashboardMetadata.getName());
            ps.setString(2, dashboardMetadata.getDescription());
            Blob blob = connection.createBlob();
            blob.setBytes(1, toJsonBytes(dashboardMetadata.getPages()));
            ps.setBlob(3, blob);
            ps.setString(4, dashboardMetadata.getUrl());
            ps.setString(5, dashboardMetadata.getParentId());
            ps.setString(6, dashboardMetadata.getLandingPage());
            ps.executeUpdate();
            connection.commit();
        } catch (SQLException e) {
            rollbackQuietly(connection);
            throw new DashboardException(
                    "Cannot update dashboard '" + dashboardMetadata.getId() + "' with " + dashboardMetadata + ".", e);
        } finally {
            closeQuietly(connection, ps, null);
        }
    }

    @Override
    public void add(DashboardMetadata dashboardMetadata) throws DashboardException {
        Connection connection = null;
        PreparedStatement ps = null;
        String query = queryManager.getQuery(QueryManager.ADD_DASHBOARD_CONTENT_QUERY);
        try {
            connection = getConnection();
            connection.setAutoCommit(false);
            ps = connection.prepareStatement(query);
            Blob blob = connection.createBlob();
            ps.setString(1, dashboardMetadata.getUrl());
            ps.setString(2, dashboardMetadata.getName());
            ps.setString(3, dashboardMetadata.getDescription());
            ps.setString(4, dashboardMetadata.getParentId());
            ps.setString(5, dashboardMetadata.getLandingPage());
            blob.setBytes(1, toJsonBytes(dashboardMetadata.getPages()));
            ps.setBlob(6, blob);
            ps.executeUpdate();
            connection.commit();
        } catch (SQLException e) {
            rollbackQuietly(connection);
            throw new DashboardException("Cannot create a new dashboard with " + dashboardMetadata + ".", e);
        } finally {
            closeQuietly(connection, ps, null);
        }
    }

    @Override
    public void delete(String owner, String url) throws DashboardException {
        Connection connection = null;
        PreparedStatement ps = null;
        String query = queryManager.getQuery(QueryManager.DELETE_DASHBOARD_BY_URL_QUERY);
        try {
            connection = getConnection();
            connection.setAutoCommit(false);
            ps = connection.prepareStatement(query);
            ps.setString(1, url);
            ps.executeUpdate();
            connection.commit();
        } catch (SQLException e) {
            rollbackQuietly(connection);
            throw new DashboardException("Cannot delete dashboard '" + url + "' of owner '" + owner + "'.", e);
        } finally {
            closeQuietly(connection, ps, null);
        }
    }

    @Override
    public DashboardMetadata get(String url) throws DashboardException {
        DashboardMetadata dashboardMetadata = null;
        Connection connection = null;
        PreparedStatement ps = null;
        ResultSet results = null;
        String query = queryManager.getQuery(QueryManager.GET_DASHBOARD_BY_URL_QUERY);
        try {
            connection = getConnection();
            ps = connection.prepareStatement(query);
            ps.setString(1, url);
            results = ps.executeQuery();
            if (results.next()) {
                dashboardMetadata = toDashboardMetadata(results);
            }
        } catch (SQLException e) {
            throw new DashboardException("Cannot retrieve dashboard for URl '" + url + "'.", e);
        } finally {
            closeQuietly(connection, ps, results);
        }

        return dashboardMetadata;
    }

    @Override
    public List<DashboardMetadata> list(String owner, PaginationContext paginationContext) throws DashboardException {
        List<DashboardMetadata> dashboardMetadataList = new ArrayList<>();
        Connection connection = null;
        PreparedStatement ps = null;
        ResultSet result = null;
        String query = queryManager.getQuery(QueryManager.GET_DASHBOARD_METADATA_LIST_QUERY);
        try {
            connection = getConnection();
            ps = connection.prepareStatement(query);
            result = ps.executeQuery();
            while (result.next()) {
                dashboardMetadataList.add(toDashboardMetadata(result));
            }
        } catch (SQLException e) {
            throw new DashboardException("Cannot retrieve dashboards of owner '" + owner + "'.", e);
        } finally {
            closeQuietly(connection, ps, result);
        }

        return dashboardMetadataList;
    }

    private Connection getConnection() throws SQLException {
        return dataSource.getConnection();
    }

    private static byte[] toJsonBytes(Object dashboardPages) {
        return GSON.toJson(dashboardPages).getBytes(StandardCharsets.UTF_8);
    }

    private static Object fromJasonBytes(Blob byteBlob) throws SQLException {
        return new String(byteBlob.getBytes(1, (int) byteBlob.length()), StandardCharsets.UTF_8);
    }

    private static DashboardMetadata toDashboardMetadata(ResultSet result) throws SQLException {
        DashboardMetadata dashboardMetadata = new DashboardMetadata();
        dashboardMetadata.setId(result.getString(COLUMN_DASHBOARD_ID));
        dashboardMetadata.setName(result.getString(COLUMN_DASHBOARD_NAME));
        dashboardMetadata.setUrl(result.getString(COLUMN_DASHBOARD_URL));
        dashboardMetadata.setDescription(result.getString(COLUMN_DASHBOARD_DESCRIPTION));
        dashboardMetadata.setParentId(result.getString(COLUMN_DASHBOARD_PARENT_ID));
        dashboardMetadata.setLandingPage(result.getString(COLUMN_DASHBOARD_LANDING_PAGE));
        dashboardMetadata.setPages(fromJasonBytes(result.getBlob(COLUMN_DASHBOARD_CONTENT)));
        return dashboardMetadata;
    }

    private static void closeQuietly(Connection connection, PreparedStatement preparedStatement, ResultSet resultSet) {
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

    private static void rollbackQuietly(Connection connection) {
        if (connection != null) {
            try {
                connection.rollback();
            } catch (SQLException e) {
                LOGGER.error("An error occurred when rollbacking DB connection.", e);
            }
        }
    }
}
