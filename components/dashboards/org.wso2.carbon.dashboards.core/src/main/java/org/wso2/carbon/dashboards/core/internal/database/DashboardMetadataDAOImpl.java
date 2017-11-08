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
import org.wso2.carbon.dashboards.core.internal.dao.DashboardMetadataDAO;
import org.wso2.carbon.dashboards.core.internal.dao.utils.DAOUtils;
import org.wso2.carbon.dashboards.core.internal.dao.utils.SQLConstants;

import java.io.UnsupportedEncodingException;
import java.sql.Blob;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * This is a core class of the DashboardMetadata JDBC Based implementation.
 */
public class DashboardMetadataDAOImpl implements DashboardMetadataDAO {
    private static final Logger log = LoggerFactory.getLogger(DashboardMetadataDAOImpl.class);

    @Override
    public void update(DashboardMetadata dashboardMetadata) throws DashboardException {
        Connection conn = null;
        PreparedStatement ps = null;
        String query = QueryManager.getInstance().getQuery(SQLConstants.UPDATE_DASHBOARD_CONTENT_QUERY);
        try {
            conn = DAOUtils.getInstance().getConnection();
            conn.setAutoCommit(false);
            ps = conn.prepareStatement(query);
            Blob blob = conn.createBlob();
            ps.setString(1, dashboardMetadata.getName());
            ps.setString(2, dashboardMetadata.getDescription());
            blob.setBytes(1, new Gson().toJson(dashboardMetadata.getPages()).getBytes("UTF-8"));
            ps.setBlob(3, blob);
            ps.setString(4, dashboardMetadata.getUrl());
            ps.setString(5, dashboardMetadata.getParentId());
            ps.setString(6, dashboardMetadata.getLandingPage());
            ps.execute();
            conn.commit();
        } catch (SQLException | DashboardException | UnsupportedEncodingException e) {
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException e1) {
                    log.error("Failed to rollback the update  ", e1);
                }
            }
            String msg = "Error in updating dashboard core : " + e.getMessage();
            log.error(msg, e);
            throw new DashboardException(msg, e);
        } finally {
            DAOUtils.closeAllConnections(ps, conn, null);
        }
    }

    @Override
    public void add(DashboardMetadata dashboardMetadata) throws DashboardException {
        Connection conn = null;
        PreparedStatement ps = null;
        String query = QueryManager.getInstance().getQuery(SQLConstants.ADD_DASHBOARD_CONTENT_QUERY);
        try {
            conn = DAOUtils.getInstance().getConnection();
            conn.setAutoCommit(false);
            ps = conn.prepareStatement(query);
            Blob blob = conn.createBlob();
            ps.setString(1, dashboardMetadata.getUrl());
            ps.setString(2, dashboardMetadata.getName());
            ps.setString(3, dashboardMetadata.getDescription());
            ps.setString(4, dashboardMetadata.getParentId());
            ps.setString(5, dashboardMetadata.getLandingPage());
            blob.setBytes(1, new Gson().toJson(dashboardMetadata.getPages()).getBytes("UTF-8"));
            ps.setBlob(6, blob);
            ps.execute();
            conn.commit();
        } catch (SQLException | UnsupportedEncodingException e) {
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException e1) {
                    log.error("Failed to rollback the add  ", e1);
                }
            }
            String msg = "Error in adding dashboard core: " + e.getMessage();
            log.error(msg, e);
            throw new DashboardException(msg, e);
        } finally {
            DAOUtils.closeAllConnections(ps, conn, null);
        }
    }

    @Override
    public void delete(String owner, String url) throws DashboardException {
        Connection conn = null;
        PreparedStatement ps = null;
        String query = QueryManager.getInstance().getQuery(SQLConstants.DELETE_DASHBOARD_BY_URL_QUERY);
        try {
            conn = DAOUtils.getInstance().getConnection();
            conn.setAutoCommit(false);
            ps = conn.prepareStatement(query);
            ps.setString(1, url);
            ps.execute();
            conn.commit();
        } catch (SQLException e) {
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException e1) {
                    log.error("Failed to rollback the delete  ", e1);
                }
            }
            String msg = "Error in deleting dashboard core : " + e.getMessage();
            log.error(msg, e);
            throw new DashboardException(msg, e);
        } finally {
            DAOUtils.closeAllConnections(ps, conn, null);
        }
    }

    @Override
    public DashboardMetadata get(String url) throws DashboardException {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet result = null;
        String query = QueryManager.getInstance().getQuery(SQLConstants.GET_DASHBOARD_BY_URL_QUERY);
        try {
            conn = DAOUtils.getInstance().getConnection();
            ps = conn.prepareStatement(query);
            ps.setString(1, url);
            result = ps.executeQuery();
            if (result.next()) {
                return getDashboardJSON(result);
            }
        } catch (SQLException | UnsupportedEncodingException e) {
            String msg = "Error in accessing dashboard core : " + e.getMessage();
            log.error(msg, e);
            throw new DashboardException(msg, e);
        } finally {
            DAOUtils.closeAllConnections(ps, conn, result);
        }
        return null;
    }

    @Override
    public List<DashboardMetadata> list(String owner, PaginationContext paginationContext) throws DashboardException {
        List<DashboardMetadata> list = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet result = null;
        String query = QueryManager.getInstance().getQuery(SQLConstants.GET_DASHBOARD_METADATA_LIST_QUERY);
        try {
            conn = DAOUtils.getInstance().getConnection();
            ps = conn.prepareStatement(query);
            result = ps.executeQuery();
            metadataParser(list, result);

        } catch (SQLException | UnsupportedEncodingException e) {
            String msg = "Error in accessing dashboard core : " + e.getMessage();
            log.error(msg, e);
            throw new DashboardException(msg, e);
        } finally {
            DAOUtils.closeAllConnections(ps, conn, result);
        }
        return list;
    }

    private void metadataParser(List<DashboardMetadata> list, ResultSet result) throws SQLException,
            UnsupportedEncodingException {
        while (result.next()) {
            DashboardMetadata dashboardMetadata = getMetadata(result);
            list.add(dashboardMetadata);
        }
    }

    private DashboardMetadata getMetadata(ResultSet result) throws SQLException, UnsupportedEncodingException {
        DashboardMetadata dashboardMetadata = new DashboardMetadata();
        dashboardMetadata.setUrl(result.getString(SQLConstants.DASHBOARD_URL));
        dashboardMetadata.setName(result.getString(SQLConstants.DASHBOARD_NAME));
        dashboardMetadata.setDescription(result.getString(SQLConstants.DASHBOARD_DESCRIPTION));
        dashboardMetadata.setParentId(result.getString(SQLConstants.DASHBOARD_PARENT_ID));
        dashboardMetadata.setId(result.getString(SQLConstants.DASHBOARD_ID));
        dashboardMetadata.setLandingPage(result.getString(SQLConstants.DASHBOARD_LANDING_PAGE));
        return dashboardMetadata;
    }

    private DashboardMetadata getDashboardJSON(ResultSet result) throws SQLException, UnsupportedEncodingException {
        DashboardMetadata dashboardMetadata = getMetadata(result);
        Blob contentBlob = result.getBlob(SQLConstants.DASHBOARD_CONTENT);
        dashboardMetadata.setPages((new String(contentBlob.getBytes(1, (int) contentBlob.length()),
                "UTF-8")));
        return dashboardMetadata;

    }
}
