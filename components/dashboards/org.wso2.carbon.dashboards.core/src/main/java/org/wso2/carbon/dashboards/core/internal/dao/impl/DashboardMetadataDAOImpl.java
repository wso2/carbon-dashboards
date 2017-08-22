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
package org.wso2.carbon.dashboards.core.internal.dao.impl;

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
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
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
        String query = SQLConstants.MERGE_METADATA_QUERY_BY_URL_AND_OWNER;
        try {
            conn = DAOUtils.getInstance().getConnection();
            conn.setAutoCommit(false);
            ps = conn.prepareStatement(query);
            Blob blob = conn.createBlob();
            ps.setString(1, dashboardMetadata.getName());
            ps.setString(2, dashboardMetadata.getVersion());
            ps.setString(3, dashboardMetadata.getDescription());
            ps.setString(4, dashboardMetadata.getOwner());
            ps.setString(5, dashboardMetadata.getLastUpdatedBy());
            ps.setBoolean(6, dashboardMetadata.isShared());
            ps.setTimestamp(7, new Timestamp(new Date().getTime()));
            blob.setBytes(1, new Gson().toJson(dashboardMetadata.getContent()).getBytes("UTF-8"));
            ps.setBlob(8, blob);
            ps.setString(9, dashboardMetadata.getUrl());
            ps.setTimestamp(10, new Timestamp(dashboardMetadata.getCreatedTime()));
            ps.setString(11, dashboardMetadata.getParentId());
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
        String query = SQLConstants.ADD_METADATA_QUERY;
        try {
            conn = DAOUtils.getInstance().getConnection();
            conn.setAutoCommit(false);
            ps = conn.prepareStatement(query);
            Blob blob = conn.createBlob();
            ps.setString(1, dashboardMetadata.getUrl());
            ps.setString(2, dashboardMetadata.getName());
            ps.setString(3, dashboardMetadata.getVersion());
            ps.setString(4, dashboardMetadata.getOwner());
            ps.setString(5, dashboardMetadata.getLastUpdatedBy());
            ps.setString(6, dashboardMetadata.getDescription());
            ps.setBoolean(7, dashboardMetadata.isShared());
            ps.setString(8, dashboardMetadata.getParentId());
            blob.setBytes(1, new Gson().toJson(dashboardMetadata.getContent()).getBytes("UTF-8"));
            ps.setBlob(9, blob);
            ps.setTimestamp(10, new Timestamp(new Date().getTime()));
            ps.setTimestamp(11, new Timestamp(new Date().getTime()));
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
        String dbQuery = SQLConstants.DELETE_METADATA_QUERY;
        try {
            conn = DAOUtils.getInstance().getConnection();
            conn.setAutoCommit(false);
            ps = conn.prepareStatement(dbQuery);

            ps.setString(1, owner);
            ps.setString(2, url);
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
        String dbQuery = SQLConstants.GET_METADATA_BY_URL;
        try {
            conn = DAOUtils.getInstance().getConnection();
            ps = conn.prepareStatement(dbQuery);
            ps.setString(1, url);
            result = ps.executeQuery();
            if (result.next()) {
                return getMetadata(result);
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
        try {
            conn = DAOUtils.getInstance().getConnection();
            ps = conn.prepareStatement(SQLConstants.GET_METADATA_BY_OWNER);
            ps.setString(1, owner);
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
        dashboardMetadata.setVersion(result.getString(SQLConstants.DASHBOARD_VERSION));
        dashboardMetadata.setOwner(result.getString(SQLConstants.DASHBOARD_OWNER));
        dashboardMetadata.setLastUpdatedBy(result.getString(SQLConstants.DASHBOARD_UPDATEDBY));
        dashboardMetadata.setDescription(result.getString(SQLConstants.DASHBOARD_DESCRIPTION));
        dashboardMetadata.setShared(result.getBoolean(SQLConstants.DASHBOARD_SHARED));
        Blob contentBlob = result.getBlob(SQLConstants.DASHBOARD_CONTENT);
        dashboardMetadata.setContent((new String(contentBlob.getBytes(1, (int) contentBlob.length()), "UTF-8")));
        dashboardMetadata.setParentId(result.getString(SQLConstants.DASHBOARD_PARENT_ID));
        dashboardMetadata.setCreatedTime(result.getTimestamp(SQLConstants.DASHBOARD_CREATED_TIME).getTime());
        dashboardMetadata.setLastUpdatedTime(result.getTimestamp(SQLConstants.DASHBOARD_LAST_UPDATED).getTime());
        dashboardMetadata.setId(result.getString(SQLConstants.DASHBOARD_ID));
        return dashboardMetadata;
    }
}
