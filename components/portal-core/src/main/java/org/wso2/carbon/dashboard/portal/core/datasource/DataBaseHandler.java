/*
*  Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*  WSO2 Inc. licenses this file to you under the Apache License,
*  Version 2.0 (the "License"); you may not use this file except
*  in compliance with the License.
*  You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*
*/

package org.wso2.carbon.dashboard.portal.core.datasource;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.wso2.carbon.dashboard.portal.core.DashboardPortalException;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * This class is used to handle all the database related operations related with
 * Dashboard Database
 */
public class DataBaseHandler {
    private static final Log log = LogFactory.getLog(DataBaseHandler.class);
    private static DataBaseHandler instance;
    private DataBaseInitializer dataBaseInitializer;

    /**
     * To maintain a single instance of DatabaseHandler
     *
     * @return currently active instance of DatabaseHandler
     * @throws DashboardPortalException
     */
    public static DataBaseHandler getInstance() throws DashboardPortalException {
        if (instance == null) {
            synchronized (DataBaseHandler.class) {
                if (instance == null) {
                    instance = new DataBaseHandler();
                }
            }
        }
        return instance;
    }

    private DataBaseHandler() throws DashboardPortalException {
        dataBaseInitializer = DataBaseInitializer.getInstance();
    }

    /**
     * This is used to insert a gadget usage info
     *
     * @param tenantID    Tenant ID of the tenant which the dashboard belongs to
     * @param dashboardID Dashboard ID of the dashboard
     * @param gadgetId    Gadget ID that is used in the dashboard
     * @param gadgetState State of the gadget whether it is exist or not
     * @param usageData   Representation of the usage info of the particular gadget in the dashboard
     * @throws DashboardPortalException
     */
    public void insertGadgetUsageInfo(int tenantID, String dashboardID, String gadgetId, String gadgetState,
            String usageData) throws DashboardPortalException {
        try {
            Connection connection = dataBaseInitializer.getDBConnection();
            PreparedStatement preparedStatement = connection
                    .prepareStatement(DataSourceConstants.SQL_INSERT_USAGE_OPERATION);
            preparedStatement.setInt(1, tenantID);
            preparedStatement.setString(2, dashboardID);
            preparedStatement.setString(3, gadgetId);
            preparedStatement.setString(4, gadgetState);
            preparedStatement.setString(5, usageData);
            preparedStatement.executeUpdate();
            if (!connection.getAutoCommit()) {
                connection.commit();
            }
        } catch (SQLException e) {
            log.error("Cannot insert the gadget usage info ", e);
        }
    }

    /**
     * To update or insert the gadget usage info
     *
     * @param tenantID    ID of the tenant which the dashboard belongs to
     * @param dashboardID ID of the dashboard
     * @param gadgetId    ID of the gadget
     * @param gadgetState State of the gadget whether it is deleted or not
     * @param usageData   Usage information of the gadget
     */
    public void updateOrInsertGadgetUsageInfo(int tenantID, String dashboardID, String gadgetId, String gadgetState,
            String usageData) throws DashboardPortalException {
        if (getGadgetUsageInfo(tenantID, dashboardID, gadgetId) != null) {
            updateGadgetUsageInfo(tenantID, dashboardID, gadgetId, gadgetState, usageData);
        } else {
            insertGadgetUsageInfo(tenantID, dashboardID, gadgetId, gadgetState, usageData);
        }
    }

    /**
     * To update the record on a gadget usage
     *
     * @param tenantID    ID of the tenant which the dashboard belongs to
     * @param dashboardID ID of the dashboard
     * @param gadgetId    ID of the gadget
     * @param gadgetState State of the gadget whether it is deleted or not
     * @param usageData   Usage information of the gadget
     * @throws DashboardPortalException
     */
    public void updateGadgetUsageInfo(int tenantID, String dashboardID, String gadgetId, String gadgetState,
            String usageData) throws DashboardPortalException {
        Connection connection = null;
        PreparedStatement preparedStatement = null;
        try {
            connection = dataBaseInitializer.getDBConnection();
            preparedStatement = connection.prepareStatement(DataSourceConstants.SQL_UPDATE_USAGE_OPERATION);
            preparedStatement.setString(1, gadgetState);
            preparedStatement.setString(2, usageData);
            preparedStatement.setInt(3, tenantID);
            preparedStatement.setString(4, dashboardID);
            preparedStatement.setString(5, gadgetId);
            preparedStatement.executeUpdate();
            if (!connection.getAutoCommit()) {
                connection.commit();
            }
        } catch (SQLException e) {
            log.error("Cannot insert the gadget usage info ", e);
        } finally {
            closeDatabaseResources(connection, preparedStatement, null);
        }
    }

    /**
     * To get the gadget usage info
     *
     * @param tenantID    ID of the tenant which the dashboard created in
     * @param dashboardID ID of the dashboard
     * @param gadgetId    ID of the gadget
     */
    public String getGadgetUsageInfo(int tenantID, String dashboardID, String gadgetId)
            throws DashboardPortalException {
        Connection connection = null;
        PreparedStatement preparedStatement = null;
        ResultSet resultSet = null;
        String gadgetUsageInfo = null;
        try {
            connection = dataBaseInitializer.getDBConnection();
            preparedStatement = connection.prepareStatement(DataSourceConstants.SQL_SELECT_USAGE_OPERATION);
            preparedStatement.setInt(1, tenantID);
            preparedStatement.setString(2, dashboardID);
            preparedStatement.setString(3, gadgetId);
            resultSet = preparedStatement.executeQuery();
            if (!connection.getAutoCommit()) {
                connection.commit();
            }
            if (resultSet.next()) {
                gadgetUsageInfo = resultSet.getString(1);
            }
            return gadgetUsageInfo;
        } catch (SQLException e) {
            log.error("Cannot insert the gadget usage info ", e);
        } finally {
            closeDatabaseResources(connection, preparedStatement, resultSet);
        }
        return null;
    }

    /**
     * To get the IDs of the dashboard that uses particular gadget
     *
     * @param tenantId ID of the tenant this specific gadget belongs to
     * @param gadgetId ID of the gadget
     * @return list of the IDs of the dashboard
     * @throws DashboardPortalException
     */
    public List<String> getDashboardUsingGadget(int tenantId, String gadgetId) throws DashboardPortalException {
        Connection connection = null;
        PreparedStatement preparedStatement = null;
        ResultSet resultSet = null;
        List<String> dashboards = new ArrayList<String>();
        try {
            connection = dataBaseInitializer.getDBConnection();
            preparedStatement = connection
                    .prepareStatement(DataSourceConstants.SQL_GET_DASHBOARD_USING_GADGET_OPERATION);
            preparedStatement.setInt(1, tenantId);
            preparedStatement.setString(2, gadgetId);
            resultSet = preparedStatement.executeQuery();
            if (!connection.getAutoCommit()) {
                connection.commit();
            }
            while (resultSet.next()) {
                dashboards.add(resultSet.getString(1));
            }
            return dashboards;
        } catch (SQLException e) {
            log.error("Cannot insert the gadget usage info ", e);
        } finally {
            closeDatabaseResources(connection, preparedStatement, resultSet);
        }
        return null;
    }

    /**
     * To delete the gadget usage information of partciular gadget in particular dashboard
     *
     * @param tenantId    Id of the tenant, dashboard belongs to
     * @param dashboardId Id of the dashboard
     * @param gadgetId    Id of the gadget
     * @throws DashboardPortalException
     */
    public void deleteGadgetUsageInformation(int tenantId, String dashboardId, String gadgetId)
            throws DashboardPortalException {
        Connection connection = null;
        PreparedStatement preparedStatement = null;
        try {
            connection = dataBaseInitializer.getDBConnection();
            preparedStatement = connection.prepareStatement(DataSourceConstants.SQL_DELETE_GADGET_USAGE_OPERATION);
            preparedStatement.setInt(1, tenantId);
            preparedStatement.setString(2, dashboardId);
            preparedStatement.setString(3, gadgetId);
            preparedStatement.executeUpdate();
            if (!connection.getAutoCommit()) {
                connection.commit();
            }
        } catch (SQLException e) {
            log.error("Cannot insert the gadget usage info ", e);
        } finally {
            closeDatabaseResources(connection, preparedStatement, null);
        }
    }

    /**
     * To update the gadget state information
     *
     * @param tenantId    Id of the tenant which gadget belongs to
     * @param gadgetId    Id of the gadget
     * @param gadgetState State of the gadget, whether is it in active or delete state
     * @throws DashboardPortalException
     */
    public void updateGadgetStateInformation(int tenantId, String gadgetId, String gadgetState)
            throws DashboardPortalException {
        Connection connection = null;
        PreparedStatement preparedStatement = null;
        try {
            connection = dataBaseInitializer.getDBConnection();
            preparedStatement = connection.prepareStatement(DataSourceConstants.SQL_UPDATE_GADGET_STATE_OPERATION);
            preparedStatement.setString(1, gadgetState);
            preparedStatement.setInt(2, tenantId);
            preparedStatement.setString(3, gadgetId);
            preparedStatement.executeUpdate();
            if (!connection.getAutoCommit()) {
                connection.commit();
            }
        } catch (SQLException e) {
            log.error("Cannot insert the gadget usage info ", e);
        } finally {
            closeDatabaseResources(connection, preparedStatement, null);
        }
    }

    /**
     * To update the databse when a dashboard is deleted
     *
     * @param tenantId    Id of the tenant which the dashboard belongs to
     * @param dashboardId Id of the dashboard
     * @throws DashboardPortalException
     */
    public void updateAfterDeletingDashboard(int tenantId, String dashboardId) throws DashboardPortalException {
        Connection connection = null;
        PreparedStatement preparedStatement = null;
        try {
            connection = dataBaseInitializer.getDBConnection();
            preparedStatement = connection.prepareStatement(DataSourceConstants.SQL_DELETE_DASHBOARD_OPERATION);
            preparedStatement.setInt(1, tenantId);
            preparedStatement.setString(2, dashboardId);
            preparedStatement.executeUpdate();
            if (!dashboardId.contains("$")) {
                preparedStatement = connection.prepareStatement(DataSourceConstants.SQL_DELETE_ALL_DASHBOARD_OPERATION);
                preparedStatement.setInt(1, tenantId);
                preparedStatement.setString(2, dashboardId + "$%");
                preparedStatement.executeUpdate();
            }
            if (!connection.getAutoCommit()) {
                connection.commit();
            }
        } catch (SQLException e) {
            log.error("Cannot insert the gadget usage info ", e);
        } finally {
            closeDatabaseResources(connection, preparedStatement, null);
        }
    }

    /**
     * To check whether a dashboard related usage information is updated in database
     *
     * @param tenantId    Id of the tenant which the dashboard belongs to
     * @param dashboardId Id of the dashboard
     * @return whether a dashboard related information exist in database
     * @throws DashboardPortalException
     */
    public boolean checkDashboard(int tenantId, String dashboardId) throws DashboardPortalException {
        Connection connection = null;
        PreparedStatement preparedStatement = null;
        ResultSet resultSet;
        try {
            connection = dataBaseInitializer.getDBConnection();
            preparedStatement = connection.prepareStatement(DataSourceConstants.SQL_CHECK_DASHBOARD_OPERATION);
            preparedStatement.setInt(1, tenantId);
            preparedStatement.setString(2, dashboardId);
            resultSet = preparedStatement.executeQuery();
            if (!connection.getAutoCommit()) {
                connection.commit();
            }
            if (resultSet.next()) {
                return true;
            }
        } catch (SQLException e) {
            log.error("Cannot insert the gadget usage info ", e);
        } finally {
            closeDatabaseResources(connection, preparedStatement, null);
        }
        return false;
    }

    /**
     * To check whether a dashboard contains a gadget that is already deleted
     *
     * @param tenantId    Id of the tenant which the dashboard belongs to
     * @param dashboardId Id of the dashboard
     * @return true if the dashboard contains gadget that is already deleted, otherwise false
     * @throws DashboardPortalException
     */
    public boolean isDashboardDefective(int tenantId, String dashboardId) throws DashboardPortalException {
        Connection connection = null;
        PreparedStatement preparedStatement = null;
        ResultSet resultSet;
        String deletedGadgetState = "DELETED";
        try {
            connection = dataBaseInitializer.getDBConnection();
            preparedStatement = connection.prepareStatement(DataSourceConstants.SQL_CHECK_DEFECTIVE_DASHBOARD);
            preparedStatement.setInt(1, tenantId);
            preparedStatement.setString(2, dashboardId);
            preparedStatement.setString(3, deletedGadgetState);
            resultSet = preparedStatement.executeQuery();
            if (!connection.getAutoCommit()) {
                connection.commit();
            }
            if (resultSet.next()) {
                return true;
            }
        } catch (SQLException e) {
            log.error("Cannot check defective dashboard ", e);
        } finally {
            closeDatabaseResources(connection, preparedStatement, null);
        }
        return false;
    }

    /**
     * To get the details of the defective usage data
     * @param tenantId Id of the tenant which dashboard belongs to
     * @param dashboardId Id of the dashboard
     * @return Array list of usage data which has the deleted gadgets
     * @throws DashboardPortalException
     */
    public List<String> getDefectiveUsageData(int tenantId, String dashboardId) throws DashboardPortalException {
        Connection connection = null;
        PreparedStatement preparedStatement = null;
        ResultSet resultSet = null;
        List<String> defectiveUsageData = new ArrayList<String>();
        String deletedGadgetState = "DELETED";
        try {
            connection = dataBaseInitializer.getDBConnection();
            preparedStatement = connection.prepareStatement(DataSourceConstants.SQL_CHECK_DEFECTIVE_DASHBOARD);
            preparedStatement.setInt(1, tenantId);
            preparedStatement.setString(2, dashboardId);
            preparedStatement.setString(3, deletedGadgetState);
            resultSet = preparedStatement.executeQuery();
            if (!connection.getAutoCommit()) {
                connection.commit();
            }
            while (resultSet.next()) {
                defectiveUsageData.add(resultSet.getString("USAGE_DATA"));
            }
        } catch (SQLException e) {
            log.error("Cannot check defective dashboard ", e);
        } finally {
            closeDatabaseResources(connection, preparedStatement, resultSet);
        }
        return defectiveUsageData;
    }

    /**
     * Close a given set of database resources.
     *
     * @param connection        Connection to be closed
     * @param preparedStatement PreparedStatement to be closed
     * @param resultSet         ResultSet to be closed
     */
    private static void closeDatabaseResources(Connection connection, PreparedStatement preparedStatement,
            ResultSet resultSet) {
        // Close the resultSet
        if (resultSet != null) {
            try {
                resultSet.close();
            } catch (SQLException e) {
                log.error("Could not close result set: " + e.getMessage(), e);
            }
        }
        // Close the statement
        if (preparedStatement != null) {
            try {
                preparedStatement.close();
            } catch (SQLException e) {
                log.error("Database error. Could not close statement: " + e.getMessage(), e);
            }
        }
        // Close the connection
        if (connection != null) {
            try {
                connection.close();
            } catch (SQLException e) {
                log.error("Database error. Could not close statement: " + e.getMessage(), e);
            }
        }
    }
}
