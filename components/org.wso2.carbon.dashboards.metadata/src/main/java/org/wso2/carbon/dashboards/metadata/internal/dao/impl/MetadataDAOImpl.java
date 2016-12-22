/*
 *  Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
package org.wso2.carbon.dashboards.metadata.internal.dao.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.carbon.dashboards.metadata.bean.Metadata;
import org.wso2.carbon.dashboards.metadata.bean.PaginationContext;

import org.wso2.carbon.dashboards.metadata.exception.MetadataException;
import org.wso2.carbon.dashboards.metadata.internal.dao.MetadataDAO;
import org.wso2.carbon.dashboards.metadata.internal.dao.utils.DAOUtils;
import org.wso2.carbon.dashboards.metadata.internal.dao.utils.SQLConstants;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * This is a core class of the Metadata JDBC Based implementation.
 */
public class MetadataDAOImpl implements MetadataDAO {

    private static final Logger log = LoggerFactory.getLogger(MetadataDAOImpl.class);

    @Override
    public boolean isExists(String url) throws MetadataException {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet result = null;
        try {
            conn = DAOUtils.getInstance().getConnection();
            ps = conn.prepareStatement(SQLConstants.GET_METADATA_BY_URL);
            ps.setString(1, url);
            result = ps.executeQuery();
            if (result.next()) {
                return true;
            }
        } catch (SQLException e) {
            String msg = "Error in deleting dashboard metadata : " + e.getMessage();
            log.error(msg, e);
            throw new MetadataException(msg, e);
        } finally {
            DAOUtils.closeAllConnections(ps, conn, result);
        }
        return false;
    }

    @Override
    public boolean isExistsByVersion(String url, String version) throws MetadataException {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet result = null;
        try {
            conn = DAOUtils.getInstance().getConnection();
            ps = conn.prepareStatement(SQLConstants.GET_METADATA_BY_URL_AND_VERSION);
            ps.setString(1, url);
            ps.setString(2, version);

            result = ps.executeQuery();
            if (result.next()) {
                return true;
            }
        } catch (SQLException e) {
            String msg = "Error in deleting dashboard metadata : " + e.getMessage();
            log.error(msg, e);
            throw new MetadataException(msg, e);
        } finally {
            DAOUtils.closeAllConnections(ps, conn, result);
        }
        return false;
    }

    @Override
    public boolean isExistsOwner(String owner, String url) throws MetadataException {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet result = null;
        try {
            conn = DAOUtils.getInstance().getConnection();
            ps = conn.prepareStatement(SQLConstants.GET_METADATA_BY_OWNER_AND_URL);
            ps.setString(1, owner);
            ps.setString(2, url);

            result = ps.executeQuery();
            if (result.next()) {
                return true;
            }
        } catch (SQLException e) {
            String msg = "Error in deleting dashboard metadata : " + e.getMessage();
            log.error(msg, e);
            throw new MetadataException(msg, e);
        } finally {
            DAOUtils.closeAllConnections(ps, conn, result);
        }
        return false;
    }

    @Override
    public boolean isExists(String owner, String url, String version) throws MetadataException {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet result = null;
        try {
            conn = DAOUtils.getInstance().getConnection();
            ps = conn.prepareStatement(SQLConstants.GET_METADATA_QUERY);
            ps.setString(1, owner);
            ps.setString(2, url);
            ps.setString(3, version);

            result = ps.executeQuery();
            if (result.next()) {
                return true;
            }
        } catch (SQLException e) {
            String msg = "Error in deleting dashboard metadata : " + e.getMessage();
            log.error(msg, e);
            throw new MetadataException(msg, e);
        } finally {
            DAOUtils.closeAllConnections(ps, conn, result);
        }
        return false;
    }

    @Override
    public void update(Metadata metadata) throws MetadataException {
        Connection conn = null;
        PreparedStatement ps = null;
        String query = SQLConstants.MERGE_METADATA_QUERY_BY_URL_AND_OWNER;
        try {
            conn = DAOUtils.getInstance().getConnection();
            conn.setAutoCommit(false);
            ps = conn.prepareStatement(query);
            ps.setString(1, metadata.getName());
            ps.setString(2, metadata.getVersion());
            ps.setString(3, metadata.getDescription());
            ps.setString(4, metadata.getOwner());
            ps.setString(5, metadata.getLastUpdatedBy());
            ps.setBoolean(6, metadata.isShared());
            ps.setTimestamp(7, new Timestamp(new Date().getTime()));
            ps.setBinaryStream(8, metadata.getContentStream(), metadata.getContentStream().available());
            ps.setString(9, metadata.getUrl());
            ps.setTimestamp(10,  new Timestamp(metadata.getCreatedTime()));
            ps.setString(11, metadata.getParentId());
            ps.execute();
            conn.commit();
        } catch (SQLException | MetadataException | IOException e) {
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException e1) {
                    log.error("Failed to rollback the update  ", e1);
                }
            }
            String msg = "Error in updating dashboard metadata : " + e.getMessage();
            log.error(msg, e);
            throw new MetadataException(msg, e);
        } finally {
            DAOUtils.closeAllConnections(ps, conn, null);
        }
    }

    @Override
    public void add(Metadata metadata) throws MetadataException {
        Connection conn = null;
        PreparedStatement ps = null;
        String query = SQLConstants.ADD_METADATA_QUERY;
        try {
            conn = DAOUtils.getInstance().getConnection();
            conn.setAutoCommit(false);
            ps = conn.prepareStatement(query);
            ps.setString(1, metadata.getUrl());
            ps.setString(2, metadata.getName());
            ps.setString(3, metadata.getVersion());
            ps.setString(4, metadata.getOwner());
            ps.setString(5, metadata.getLastUpdatedBy());
            ps.setString(6, metadata.getDescription());
            ps.setBoolean(7, metadata.isShared());
            ps.setString(8, metadata.getParentId());
            ps.setBinaryStream(9, metadata.getContentStream(), metadata.getContentStream().available());
            ps.setTimestamp(10, new Timestamp(new Date().getTime()));
            ps.setTimestamp(11, new Timestamp(new Date().getTime()));
            ps.execute();
            conn.commit();
        } catch (SQLException | IOException e) {
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException e1) {
                    log.error("Failed to rollback the add  ", e1);
                }
            }
            String msg = "Error in adding dashboard metadata: " + e.getMessage();
            log.error(msg, e);
            throw new MetadataException(msg, e);
        } finally {
            DAOUtils.closeAllConnections(ps, conn, null);
        }
    }

    @Override
    public void delete(String url) throws MetadataException {
        Connection conn = null;
        PreparedStatement ps = null;
        String dbQuery = SQLConstants.DELETE_METADATA_URL;
        try {
            conn = DAOUtils.getInstance().getConnection();
            conn.setAutoCommit(false);
            ps = conn.prepareStatement(dbQuery);
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
            String msg = "Error in deleting dashboard metadata : " + e.getMessage();
            log.error(msg, e);
            throw new MetadataException(msg, e);
        } finally {
            DAOUtils.closeAllConnections(ps, conn, null);
        }
    }

    @Override
    public void delete(String owner, String url) throws MetadataException {
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
            String msg = "Error in deleting dashboard metadata : " + e.getMessage();
            log.error(msg, e);
            throw new MetadataException(msg, e);
        } finally {
            DAOUtils.closeAllConnections(ps, conn, null);
        }
    }

    @Override
    public void delete(String owner, String url, String version) throws MetadataException {
        Connection conn = null;
        PreparedStatement ps = null;
        String dbQuery = SQLConstants.DELETE_METADATA_QUERY;
        try {
            conn = DAOUtils.getInstance().getConnection();
            conn.setAutoCommit(false);
            ps = conn.prepareStatement(dbQuery);
            ps.setString(1, owner);
            ps.setString(2, url);
            ps.setString(3, version);


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
            String msg = "Error in deleting dashboard metadata : " + e.getMessage();
            log.error(msg, e);
            throw new MetadataException(msg, e);
        } finally {
            DAOUtils.closeAllConnections(ps, conn, null);
        }
    }


    @Override
    public Metadata get(String url) throws MetadataException {
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
        } catch (SQLException e) {
            String msg = "Error in deleting dashboard metadata : " + e.getMessage();
            log.error(msg, e);
            throw new MetadataException(msg, e);
        } finally {
            DAOUtils.closeAllConnections(ps, conn, result);
        }
        return null;
    }

    @Override
    public List<Metadata> list(String url, String version, PaginationContext paginationContext)
            throws MetadataException {
        List<Metadata> list = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet result = null;
        try {
            conn = DAOUtils.getInstance().getConnection();
            ps = conn.prepareStatement(SQLConstants.GET_METADATA_BY_URL_AND_VERSION);
            ps.setString(1, url);
            ps.setString(2, version);
            result = ps.executeQuery();
            metadataParser(list, result);

        } catch (SQLException e) {
            String msg = "Error in deleting dashboard metadata : " + e.getMessage();
            log.error(msg, e);
            throw new MetadataException(msg, e);
        } finally {
            DAOUtils.closeAllConnections(ps, conn, result);
        }
        return list;
    }

    @Override
    public List<Metadata> listByOwner(String owner, String url, PaginationContext paginationContext)
            throws MetadataException {
        List<Metadata> list = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet result = null;
        try {
            conn = DAOUtils.getInstance().getConnection();
            ps = conn.prepareStatement(SQLConstants.GET_METADATA_BY_OWNER_AND_URL);
            ps.setString(1, owner);
            ps.setString(2, url);
            result = ps.executeQuery();
            metadataParser(list, result);

        } catch (SQLException e) {
            String msg = "Error in deleting dashboard metadata : " + e.getMessage();
            log.error(msg, e);
            throw new MetadataException(msg, e);
        } finally {
            DAOUtils.closeAllConnections(ps, conn, result);
        }
        return list;
    }

    @Override
    public List<Metadata> list(String owner, String url, String version, PaginationContext paginationContext)
            throws MetadataException {
        List<Metadata> list = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet result = null;
        try {
            conn = DAOUtils.getInstance().getConnection();
            ps = conn.prepareStatement(SQLConstants.GET_METADATA_QUERY);
            ps.setString(1, owner);
            ps.setString(2, url);
            ps.setString(3, version);
            result = ps.executeQuery();
            metadataParser(list, result);

        } catch (SQLException e) {
            String msg = "Error in deleting dashboard metadata : " + e.getMessage();
            log.error(msg, e);
            throw new MetadataException(msg, e);
        } finally {
            DAOUtils.closeAllConnections(ps, conn, result);
        }
        return list;
    }

    @Override
    public List<Metadata> listByURL(String url, PaginationContext paginationContext) throws MetadataException {
        List<Metadata> list = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet result = null;
        try {
            conn = DAOUtils.getInstance().getConnection();
            ps = conn.prepareStatement(SQLConstants.GET_METADATA_BY_URL);
            ps.setString(1, url);
            result = ps.executeQuery();
            metadataParser(list, result);

        } catch (SQLException e) {
            String msg = "Error in deleting dashboard metadata : " + e.getMessage();
            log.error(msg, e);
            throw new MetadataException(msg, e);
        } finally {
            DAOUtils.closeAllConnections(ps, conn, result);
        }
        return list;
    }


    private void metadataParser(List<Metadata> list, ResultSet result) throws SQLException {
        while (result.next()) {
            Metadata metadata = getMetadata(result);
            list.add(metadata);
        }
    }

    private Metadata getMetadata(ResultSet result) throws SQLException {
        Metadata metadata = new Metadata();
        metadata.setUrl(result.getString(SQLConstants.DASHBOARD_URL));
        metadata.setName(result.getString(SQLConstants.DASHBOARD_NAME));
        metadata.setVersion(result.getString(SQLConstants.DASHBOARD_VERSION));
        metadata.setOwner(result.getString(SQLConstants.DASHBOARD_OWNER));
        metadata.setLastUpdatedBy(result.getString(SQLConstants.DASHBOARD_UPDATEDBY));
        metadata.setDescription(result.getString(SQLConstants.DASHBOARD_DESCRIPTION));
        metadata.setShared(result.getBoolean(SQLConstants.DASHBOARD_SHARED));
        metadata.setContent(result.getBinaryStream(SQLConstants.DASHBOARD_CONTENT));
        metadata.setParentId(result.getString(SQLConstants.DASHBOARD_PARENT_ID));
        metadata.setCreatedTime(result.getTimestamp(SQLConstants.DASHBOARD_CREATED_TIME).getTime());
        metadata.setLastUpdatedTime(result.getTimestamp(SQLConstants.DASHBOARD_LAST_UPDATED).getTime());
        metadata.setId(result.getString(SQLConstants.DASHBOARD_ID));
        return metadata;
    }
}
