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
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.wso2.carbon.context.PrivilegedCarbonContext;
import org.wso2.carbon.dashboard.portal.core.DashboardPortalException;
import org.wso2.carbon.dashboard.portal.core.PortalConstants;
import org.wso2.carbon.dashboard.portal.core.internal.ServiceHolder;
import org.wso2.carbon.ndatasource.common.DataSourceException;
import org.wso2.carbon.ndatasource.core.DataSourceService;
import org.wso2.carbon.utils.CarbonUtils;
import org.wso2.carbon.utils.multitenancy.MultitenantConstants;

import javax.sql.DataSource;
import java.io.*;
import java.sql.*;
import java.util.StringTokenizer;

/**
 * To initialize the Database and create the relevant tables
 */
class DataBaseInitializer {
    private static DataBaseInitializer instance;
    private static final Log log = LogFactory.getLog(DataBaseInitializer.class);
    private static DataSource dataSource;
    private static Statement statement;
    private static String delimiter = ";";

    /**
     * To maintain a single ative instance
     *
     * @return currently active instance of the DatabaseInitializer
     * @throws DashboardPortalException
     */
    static DataBaseInitializer getInstance() throws DashboardPortalException {
        if (instance == null) {
            synchronized (DataBaseInitializer.class) {
                if (instance == null) {
                    instance = new DataBaseInitializer();
                }
            }
        }
        return instance;
    }

    private DataBaseInitializer() throws DashboardPortalException {
        String configLocation =
                CarbonUtils.getCarbonConfigDirPath() + File.separator + PortalConstants.PORTAL_CONFIG_LOCATION;
        JSONParser jsonParser = new JSONParser();

        DataSourceService service = ServiceHolder.getDataSourceService();
        if (service != null) {
            try {
                JSONObject portalConfig = (JSONObject) jsonParser.parse(new FileReader(configLocation));
                JSONObject dataSourceConfig = (JSONObject) portalConfig.
                        get(PortalConstants.DATASOURCE_CONFIG_PROPERTY);
                String dataSourceName = dataSourceConfig.get(PortalConstants.DATASOURCE_NAME_PROPERTY).toString();
                PrivilegedCarbonContext.startTenantFlow();
                PrivilegedCarbonContext.getThreadLocalCarbonContext()
                        .setTenantDomain(MultitenantConstants.SUPER_TENANT_DOMAIN_NAME, true);

                dataSource = (DataSource) service.getDataSource(dataSourceName).getDSObject();
                createUsageDatabase();
            } catch (DataSourceException e) {
                throw new DashboardPortalException("Error in getting the datasource", e);
            } catch (IOException e) {
                throw new DashboardPortalException("Error in reading the configuration file portal.json", e);
            } catch (ParseException e) {
                throw new DashboardPortalException("Error in parsing the configuration file portal.json", e);
            } finally {
                PrivilegedCarbonContext.endTenantFlow();
            }
        } else {
            throw new DashboardPortalException("Data source service is null, cannot execute queries", null);
        }
    }

    /**
     * To get the databasetype used by the user
     *
     * @param conn Connection of the datasource
     * @return type of the database
     * @throws DashboardPortalException
     */
    private String getDatabaseType(Connection conn) throws DashboardPortalException {
        String type = null;
        try {
            if (conn != null && (!conn.isClosed())) {
                DatabaseMetaData metaData = conn.getMetaData();
                String databaseProductName = metaData.getDatabaseProductName();
                if (databaseProductName.matches("(?i).*mysql.*")) {
                    type = "mysql";
                } else if (databaseProductName.matches("(?i).*oracle.*")) {
                    type = "oracle";
                } else if (databaseProductName.matches("(?i).*microsoft.*")) {
                    type = "mssql";
                } else if (databaseProductName.matches("(?i).*h2.*")) {
                    type = "h2";
                } else {
                    String msg = "Unsupported database: " + databaseProductName +
                            ". Database will not be created automatically by the WSO2 Dashboard Server. " +
                            "Please create the database using appropriate database scripts for " +
                            "the database.";
                    throw new DashboardPortalException(msg, null);
                }
            }
        } catch (SQLException e) {
            throw new DashboardPortalException("Failed to create tables for dashboards database.", e);
        }
        return type;
    }

    /**
     * Checks that a string buffer ends up with a given string. It may sound
     * trivial with the existing
     * JDK API but the various implementation among JDKs can make those
     * methods extremely resource intensive
     * and perform poorly due to massive memory allocation and copying. See
     *
     * @param buffer the buffer to perform the check on
     * @param suffix the suffix
     * @return <code>true</code> if the character sequence represented by the
     * argument is a suffix of the character sequence represented by
     * the StringBuffer object; <code>false</code> otherwise. Note that the
     * result will be <code>true</code> if the argument is the
     * empty string.
     */
    private boolean checkStringBufferEndsWith(StringBuffer buffer, String suffix) {
        if (suffix.length() > buffer.length()) {
            return false;
        }
        // this loop is done on purpose to avoid memory allocation performance
        // problems on various JDKs
        // StringBuffer.lastIndexOf() was introduced in jdk 1.4 and
        // implementation is ok though does allocation/copying
        // StringBuffer.toString().endsWith() does massive memory
        // allocation/copying on JDK 1.5
        // See http://issues.apache.org/bugzilla/show_bug.cgi?id=37169
        int endIndex = suffix.length() - 1;
        int bufferIndex = buffer.length() - 1;
        while (endIndex >= 0) {
            if (buffer.charAt(bufferIndex) != suffix.charAt(endIndex)) {
                return false;
            }
            bufferIndex--;
            endIndex--;
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
            conn.setAutoCommit(false);
            statement = conn.createStatement();
            executeSQLScript();
            conn.commit();

            if (log.isDebugEnabled()) {
                log.debug("Gadget usage table is created successfully.");
            }
        } catch (SQLException e) {
            String msg = "Failed to create database tables for Identity meta-data store. " + e.getMessage();
            throw new DashboardPortalException(msg, e);
        } finally {
            if (statement != null) {
                try {
                    statement.close();
                } catch (SQLException e) {
                    log.error("Failed to close statement.", e);
                }
            }
            if (conn != null) {
                try {
                    conn.close();
                } catch (SQLException e) {
                    log.error("Failed to close database connection.", e);
                }
            }

        }
    }

    /**
     * To execute the table creation script depending on the datasource user using
     *
     * @throws DashboardPortalException
     */
    private void executeSQLScript() throws DashboardPortalException {
        String databaseType;
        try {
            databaseType = getDatabaseType(getDBConnection());
        } catch (DashboardPortalException e) {
            throw new DashboardPortalException("Error occurred while getting database type", e);
        }
        boolean keepFormat = false;
        if ("oracle".equals(databaseType)) {
            delimiter = "/";
        } else if ("db2".equals(databaseType)) {
            delimiter = "/";
        } else if ("openedge".equals(databaseType)) {
            delimiter = "/";
            keepFormat = true;
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
                if (!keepFormat) {
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
                }
                sql.append(keepFormat ? "\n" : " ").append(line);

                // SQL defines "--" as a comment to EOL
                // and in Oracle it may contain a hint
                // so we cannot just remove it, instead we must end it
                if (!keepFormat && line.contains("--")) {
                    sql.append("\n");
                }
                if ((checkStringBufferEndsWith(sql, delimiter))) {
                    executeSQL(sql.substring(0, sql.length() - delimiter.length()));
                    sql.replace(0, sql.length(), "");
                }
            }
            // Catch any statements not followed by ;
            if (sql.length() > 0) {
                executeSQL(sql.toString());
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

    private String getDbScriptLocation(String databaseType) {
        String scriptName = databaseType + ".sql";
        if (log.isDebugEnabled()) {
            log.debug("Loading database script from :" + scriptName);
        }
        String carbonHome = System.getProperty("carbon.home");
        return carbonHome + PortalConstants.DB_SCRIPTS_LOCATION + scriptName;
    }

    /**
     * executes given sql
     *
     * @param sql Sql query to be executed
     * @throws DashboardPortalException
     */
    private void executeSQL(String sql) throws DashboardPortalException {
        // Check and ignore empty statements
        if ("".equals(sql.trim())) {
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
            if (e.getSQLState().equals("X0Y32") || e.getSQLState().equals("42710")) {
                // eliminating the table already exception for the derby and DB2 database types
                if (log.isDebugEnabled()) {
                    log.info("Table Already Exists. Hence, skipping table creation");
                }
            } else {
                throw new DashboardPortalException("Error occurred while executing : " + sql, e);
            }
        } finally {
            if (resultSet != null) {
                try {
                    resultSet.close();
                } catch (SQLException e) {
                    log.error("Error occurred while closing result set.", e);
                }
            }
            if (conn != null) {
                try {
                    conn.close();
                } catch (SQLException e) {
                    log.error("Error occurred while closing sql connection.", e);
                }
            }
        }
    }

    /**
     * Returns an database connection for the Dashboards Data source
     *
     * @return Database connection
     * @throws DashboardPortalException Exception to be thrown when we cannot connect to the DB source
     */
    Connection getDBConnection() throws DashboardPortalException {
        try {
            Connection dbConnection = dataSource.getConnection();
            dbConnection.setAutoCommit(false);
            dbConnection.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED);
            return dbConnection;
        } catch (SQLException e) {
            throw new DashboardPortalException("Error connecting to the database", e);
        }
    }
}
