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
import org.json.simple.JSONObject;
import org.json.simple.parser.ParseException;
import org.wso2.carbon.context.PrivilegedCarbonContext;
import org.wso2.carbon.dashboard.portal.core.DashboardPortalException;
import org.wso2.carbon.dashboard.portal.core.PortalConstants;
import org.wso2.carbon.dashboard.portal.core.PortalUtils;
import org.wso2.carbon.dashboard.portal.core.internal.ServiceHolder;
import org.wso2.carbon.ndatasource.common.DataSourceException;
import org.wso2.carbon.ndatasource.core.DataSourceService;
import org.wso2.carbon.utils.CarbonUtils;
import org.wso2.carbon.utils.multitenancy.MultitenantConstants;

import javax.sql.DataSource;
import java.io.*;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.StringTokenizer;

/**
 * To initialize the Database and create the relevant tables
 */
public class DSDataSourceManager {
    private static DSDataSourceManager instance;
    private static final Log log = LogFactory.getLog(DSDataSourceManager.class);
    private static DataSource dataSource;
    private static Statement statement;
    private static String delimeter = ";";

    /**
     * To maintain a single ative instance
     *
     * @throws DashboardPortalException
     */
    public static DSDataSourceManager getInstance() throws DashboardPortalException {
        if (instance == null) {
            synchronized (DSDataSourceManager.class) {
                if (instance == null) {
                    instance = new DSDataSourceManager();
                }
            }
        }
        return instance;
    }

    private DSDataSourceManager() throws DashboardPortalException {
        DataSourceService service = ServiceHolder.getDataSourceService();
        if (service != null) {
            try {
                JSONObject dataSourceConfig = PortalUtils.getConfiguration(PortalConstants.DATASOURCE_CONFIG_PROPERTY);
                String dataSourceName = dataSourceConfig.get(PortalConstants.DATASOURCE_NAME_PROPERTY).toString();
                PrivilegedCarbonContext.startTenantFlow();
                PrivilegedCarbonContext.getThreadLocalCarbonContext()
                        .setTenantDomain(MultitenantConstants.SUPER_TENANT_DOMAIN_NAME, true);
                dataSource = (DataSource) service.getDataSource(dataSourceName).getDSObject();
                if (System.getProperty("setup") == null && !dataSource.getConnection().getMetaData()
                        .getDatabaseProductName().toLowerCase().equals(DataSourceConstants.H2_SCRIPT_NAME)) {
                    if (log.isDebugEnabled()) {
                        log.debug("Dashboards Database schema initialization check was skipped since "
                                + "\'setup\' variable was not given during startup");
                    }
                } else {
                    if (!isGadgetUsageTableExist()) {
                        if (log.isDebugEnabled()) {
                            log.debug("Tables not found in the databse. Creating GADGET_USAGE table");
                        }
                        createUsageDatabase();
                    }
                }
            } catch (DataSourceException e) {
                throw new DashboardPortalException("Error in getting the datasource", e);
            } catch (IOException e) {
                throw new DashboardPortalException("Error in reading the configuration file portal.json", e);
            } catch (ParseException e) {
                throw new DashboardPortalException("Error in parsing the configuration file portal.json", e);
            } catch (SQLException e) {
                throw new DashboardPortalException("Error checking database type", e);
            } finally {
                PrivilegedCarbonContext.endTenantFlow();
            }
        } else {
            throw new DashboardPortalException("Data source service is null, cannot execute queries", null);
        }
    }

    /**
     * To check whether the gadget usage table is already created
     *
     * @return true if the gadget usage table is already exist otherwise false;
     */
    private boolean isGadgetUsageTableExist() {
        try {
            if (log.isDebugEnabled()) {
                log.debug("Running a query to test the database tables existence");
            }
            // check whether the tables are already created with a query
            Connection conn = dataSource.getConnection();
            Statement statement = null;
            ResultSet rs = null;
            try {
                statement = conn.createStatement();
                rs = statement.executeQuery(DataSourceConstants.DB_CHECK_SQL);
                if (rs != null) {
                    rs.close();
                }
            } finally {
                closeDatabaseResources(conn, statement, rs);
            }
        } catch (SQLException e) {
            if (log.isDebugEnabled()) {
                log.debug("Table does not exist, so skipping the table creation");
            }
            return false;
        }
        return true;
    }

    /**
     * To create the gadget usage table
     *
     * @throws DashboardPortalException
     */
    private void createUsageDatabase() throws DashboardPortalException {
        Connection conn = null;
        try {
            conn = dataSource.getConnection();
            statement = conn.createStatement();
            executeScript();
            if (!conn.getAutoCommit()) {
                conn.commit();
            }
            if (log.isDebugEnabled()) {
                log.debug("Gadget usage table is created successfully.");
            }
        } catch (SQLException e) {
            String msg = "Failed to create database tables for dashboard server. " + e.getMessage();
            throw new DashboardPortalException(msg, e);
        } finally {
            closeDatabaseResources(conn, statement, null);
        }
    }

    /**
     * To execute the table creation script depending on the datasource user using
     *
     * @throws DashboardPortalException
     */
    private void executeScript() throws DashboardPortalException {
        String databaseType;
        try {
            databaseType = dataSource.getConnection().getMetaData().getDatabaseProductName().toLowerCase();
        } catch (SQLException e) {
            throw new DashboardPortalException("Error occurred while getting database type", e);
        }
        if (databaseType.equalsIgnoreCase(DataSourceConstants.MSSQL_PRODUCT_NAME)) {
            databaseType = DataSourceConstants.MSSQL_SCRIPT_NAME;
        }
        if (databaseType.equalsIgnoreCase(DataSourceConstants.ORACLE_SCRIPT_NAME) || databaseType
                .equalsIgnoreCase(DataSourceConstants.DB2_SCRIPT_NAME) ||
                databaseType.equalsIgnoreCase(DataSourceConstants.ORACLE_RAC_SCRIPT_NAME)) {
            delimeter = "/";
        }
        String dbScriptLocation = getDbScriptLocation(databaseType);
        StringBuffer sql = new StringBuffer();
        BufferedReader reader = null;

        try {
            InputStream is = new FileInputStream(dbScriptLocation);
            reader = new BufferedReader(new InputStreamReader(is));
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.startsWith("//")) {
                    continue;
                }
                if (line.startsWith("--")) {
                    continue;
                }
                StringTokenizer st = new StringTokenizer(line);
                if (st.hasMoreTokens()) {
                    String token = st.nextToken();
                    if ("REM".equalsIgnoreCase(token)) {
                        continue;
                    }
                }
                sql.append(" ").append(line);
                if (line.contains("--")) {
                    sql.append("\n");
                }
                if (sql.toString().endsWith(delimeter)) {
                    executeQuery(sql.substring(0, sql.length() - delimeter.length()));
                    sql.replace(0, sql.length(), "");
                }
            }
            // Catch any statements not followed by ;
            if (sql.length() > 0) {
                executeQuery(sql.toString());
            }
        } catch (IOException e) {
            throw new DashboardPortalException(
                    "Error occurred while executing SQL script for creating Dashboard Server database", e);
        } finally {
            if (reader != null) {
                try {
                    reader.close();
                } catch (IOException e) {
                    log.error("Error occurred while closing stream for Identity SQL script", e);
                }
            }
        }
    }

    /**
     * To get the location for the required db script to be executed
     *
     * @param databaseType Type of the database to be created
     * @return the location of relevant db script
     */
    private String getDbScriptLocation(String databaseType) {
        String scriptName = databaseType + DataSourceConstants.SQL_EXTENSION;
        if (log.isDebugEnabled()) {
            log.debug("Loading database script from :" + scriptName);
        }
        return CarbonUtils.getCarbonHome() + PortalConstants.DB_SCRIPTS_LOCATION + scriptName;
    }

    /**
     * executes given sql
     *
     * @param sql Sql query to be executed
     * @throws DashboardPortalException
     */
    private void executeQuery(String sql) throws DashboardPortalException {
        // Check and ignore empty statements
        if (sql.trim().isEmpty()) {
            return;
        }
        ResultSet resultSet = null;
        Connection conn = null;
        try {
            if (log.isDebugEnabled()) {
                log.debug("SQL : " + sql);
            }
            boolean ret;
            int updateCount, updateCountTotal = 0;
            ret = statement.execute(sql);
            updateCount = statement.getUpdateCount();
            resultSet = statement.getResultSet();
            do {
                if (!ret) {
                    if (updateCount != -1) {
                        updateCountTotal += updateCount;
                    }
                }
                ret = statement.getMoreResults();
                if (ret) {
                    updateCount = statement.getUpdateCount();
                    resultSet = statement.getResultSet();
                }
            } while (ret);

            if (log.isDebugEnabled()) {
                log.debug(sql + " : " + updateCountTotal + " rows affected");
            }
            conn = dataSource.getConnection();
            SQLWarning warning = conn.getWarnings();
            while (warning != null) {
                if (log.isDebugEnabled()) {
                    log.debug(warning + " sql warning");
                    warning = warning.getNextWarning();
                }
            }
            conn.clearWarnings();
        } catch (SQLException e) {
            throw new DashboardPortalException("Error occurred while executing : " + sql, e);
        } finally {
            closeDatabaseResources(conn, null, resultSet);
        }
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
        Connection connection = null;
        PreparedStatement preparedStatement = null;
        try {
            connection = dataSource.getConnection();
            preparedStatement = connection.prepareStatement(DataSourceConstants.SQL_INSERT_USAGE_OPERATION);
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
        } finally {
            closeDatabaseResources(connection, preparedStatement, null);
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
            connection = dataSource.getConnection();
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
            connection = dataSource.getConnection();
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
            connection = dataSource.getConnection();
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
            connection = dataSource.getConnection();
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
            connection = dataSource.getConnection();
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
            connection = dataSource.getConnection();
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
            connection = dataSource.getConnection();
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
        try {
            connection = dataSource.getConnection();
            preparedStatement = connection.prepareStatement(DataSourceConstants.SQL_CHECK_DEFECTIVE_DASHBOARD);
            preparedStatement.setInt(1, tenantId);
            preparedStatement.setString(2, dashboardId);
            preparedStatement.setString(3, String.valueOf(DataSourceConstants.GADGET_STATES.DELETED));
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

    /*
    * Update the user_notification table
    *
    * @param user_id Id of the user for whom the notification belongs to
    * @param notification_id Id of the notification
    * @throws DashboardPortalException
    * */
    public void updateSeenAfterUserSeeingTheNotification(int notificationId, int tenantId, String userId) throws DashboardPortalException {
        Connection connection = null;
        PreparedStatement preparedStatement = null;
        try {
            connection = dataSource.getConnection();
            preparedStatement = connection.prepareStatement(DataSourceConstants.SQL_UPDATE_USERS_NOTIFICATION);
            preparedStatement.setBoolean(1,true);
            preparedStatement.setString(2, userId);
            preparedStatement.setInt(3, notificationId);
            preparedStatement.setInt(4,tenantId);
            preparedStatement.executeUpdate();
            if (!connection.getAutoCommit()) {
                connection.commit();
            }
        } catch (SQLException se) {
            log.error("Cannot update the seen info ", se);
        } finally {
            closeDatabaseResources(connection, preparedStatement, null);
        }
    }

    /*
    * insert the notification details to the database
    *
    * @param notificationId Id of the notification
    * @param title The title of the received notification
    * @param message The message of the notification
    * @param directUrl The directurl of the notification that should be directed
    * @throws DashboardPortalException
    * */

    public void insertIntoNotification ( String notificationId, String title, String message, String directUrl) throws DashboardPortalException{
        Connection connection = null;
        PreparedStatement preparedStatement = null;
        try {
            connection = dataSource.getConnection();
            preparedStatement = connection.prepareStatement(DataSourceConstants.SQL_INSERT_INTO_NOTIFICATION);
            preparedStatement.setString(1,notificationId);
            preparedStatement.setString(2, title);
            preparedStatement.setString(3, message);
            preparedStatement.setString(4,directUrl);
            preparedStatement.executeUpdate();
            if (!connection.getAutoCommit()) {
                connection.commit();
            }

        } catch (SQLException se) {
            log.error("Cannot insert notification datails info ", se);
        } finally {
            closeDatabaseResources(connection, preparedStatement, null);
        }
    }

    /*
    * insert  User_notification datails
    *
    * @param notificationId
    * @param userId
    * @throws DashboardPortalException
    * */

    public void insertIntoUserNotification(String notificationId, String userList )throws DashboardPortalException{
        Connection connection = null;
        PreparedStatement preparedStatement = null;
        String[] usersList = userList.split(",");
        try {
            for (String user : usersList){
                connection = dataSource.getConnection();
                preparedStatement = connection.prepareStatement(DataSourceConstants.SQL_INSERT_INTO_USER_NOTIFICATION);
                preparedStatement.setString(1, notificationId);
                preparedStatement.setString(2,user);
                preparedStatement.setBoolean(3, false);
                preparedStatement.executeUpdate();
                if (!connection.getAutoCommit()) {
                    connection.commit();
                }
            }

        } catch (SQLException se){
            log.error("Cannot insert user- notification details" + se);
        }finally {
            closeDatabaseResources(connection, preparedStatement, null);
        }
    }

    /*
    * insert  Role_notification datails
    *
    * @param notificationId
    * @param Role
    * @throws DashboardPortalException
    * */

    public void insertIntoRoleNotification(String notificationId, String roleList )throws DashboardPortalException{
        Connection connection = null;
        PreparedStatement preparedStatement = null;
        String[] rolesList = roleList.split(",");
        try {
            for (String role : rolesList){
                connection = dataSource.getConnection();
                preparedStatement = connection.prepareStatement(DataSourceConstants.SQL_INSERT_INTO_ROLE_NOTIFICATION);
                preparedStatement.setString(1, notificationId);
                preparedStatement.setString(2, role);
                preparedStatement.executeUpdate();
                if (!connection.getAutoCommit()) {
                    connection.commit();
                }
            }

        } catch (SQLException se){
            log.error("Cannot insert role- notification details" + se);
        } finally {
            closeDatabaseResources(connection, preparedStatement, null);
        }
    }

    /*
    * get notificationIds for a particular user
    * @param userId
    * @return notificationIds
    * throws DashboardPortalException
    * **/
    public List<String> getNotificationsForUsername(String userName) throws DashboardPortalException {
        List<String> notificationsList = new ArrayList<String>();
        Connection connection = null;
        PreparedStatement preparedStatement = null;
        ResultSet resultSet=null;
        try{
            connection = dataSource.getConnection();
            preparedStatement = connection.prepareStatement(DataSourceConstants.SQL_GET_NOTIFICATIONS_FOR_USER_NAME);
            preparedStatement.setString(1, userName);
            resultSet = preparedStatement.executeQuery();
            if (!connection.getAutoCommit()) {
                connection.commit();
            }
            while (resultSet.next()) {
                notificationsList.add(resultSet.getString("NOTIFICATION_ID"));
            }

        } catch (SQLException se){
            log.error("Cannot get the notifications for the particular user name" + userName + se);
        } finally {
            closeDatabaseResources(connection,preparedStatement, resultSet);
        }
        return  notificationsList;
    }

    /*
    * get notificationIds for a particular role
    * @param role
    * @return notificationIds
    * throws DashboardPortalException
    * **/
    public List<String> getNotificationsForRole(String roleName) throws DashboardPortalException {
        List<String> notificationsList = new ArrayList<String>();
        Connection connection = null;
        PreparedStatement preparedStatement = null;
        ResultSet resultSet = null;
        try{
            connection = dataSource.getConnection();
            preparedStatement = connection.prepareStatement(DataSourceConstants.SQL_GET_NOTIFICATIONS_FOR_ROLE);
            preparedStatement.setString(1, roleName);
            resultSet = preparedStatement.executeQuery();
            if (!connection.getAutoCommit()) {
                connection.commit();
            }

            while (resultSet.next()) {
                notificationsList.add(resultSet.getString("NOTIFICATION_ID"));
            }

        } catch (SQLException se){
            log.error("Cannot get the notifications for the particular role" + roleName + se);
        } finally {
            closeDatabaseResources(connection,preparedStatement, resultSet);
        }

        return notificationsList;
    }



    /*
    * get the notification detail for a particular notificationId, and tenantId
    *
    * @param notificationId
    * @return title, message, directUrl
    * throws DashboardPortalException
    */

    public String[] getNotificationDetails(String notificationId) throws DashboardPortalException {
        String[] notificationDetail = new String[3];
        Connection connection = null;
        PreparedStatement preparedStatement = null;
        ResultSet resultSet=null;
        try{
            connection = dataSource.getConnection();
            preparedStatement = connection.prepareStatement(DataSourceConstants.SQL_GET_NOTIFICATION_DETAILS);
            preparedStatement.setString(1, notificationId);
            resultSet = preparedStatement.executeQuery();
            if (!connection.getAutoCommit()) {
                connection.commit();
            }

            resultSet.next();
            notificationDetail[0]=(resultSet.getString("TITLE"));
            notificationDetail[1]=(resultSet.getString("MESSAGE"));
            notificationDetail[2]=(resultSet.getString("DIRECT_URL"));

        } catch (SQLException se){
            log.error("Cannot get the notifications details for the particular notificationId"  + se);
        } finally {
            closeDatabaseResources(connection,preparedStatement, resultSet);
        }
        return  notificationDetail;
    }

    /*
    * get unread notification count of a particular user
    *
    * @param username
    * @return count  of the notification
    * throws dashboardPortalException
    * */

    public int getNotificationCount(String userName) throws DashboardPortalException{
        Connection connection = null;
        PreparedStatement preparedStatement = null;
        ResultSet resultSet = null;
        int count =0;
        try{
            connection= dataSource.getConnection();
            preparedStatement = connection.prepareStatement(DataSourceConstants.SQL_GET_NOTIFICATION_COUNT);
            preparedStatement.setString(1,userName);
            resultSet = preparedStatement.executeQuery();
            if (!connection.getAutoCommit()) {
                connection.commit();
            }
            resultSet.next();
            count= resultSet.getInt(1);


        } catch (SQLException se){
            log.error("Cannot get notification count for the user " + userName+ se);
        } finally {
            closeDatabaseResources(connection, preparedStatement, resultSet);
        }

        return count;
    }

    /**
     * To get the details of the defective usage data
     *
     * @param tenantId    Id of the tenant which dashboard belongs to
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
            connection = dataSource.getConnection();
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
    private static void closeDatabaseResources(Connection connection, Statement preparedStatement,
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
