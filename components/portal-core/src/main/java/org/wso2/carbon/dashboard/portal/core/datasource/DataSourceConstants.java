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
package org.wso2.carbon.dashboard.portal.core.datasource;

/**
 * This class has all the constants related to the data source queries
 */
class DataSourceConstants {
    private DataSourceConstants() {
        // To avoid initialization
    }

    static final String SQL_INSERT_USAGE_OPERATION = "INSERT INTO GADGET_USAGE(TENANT_ID, DASHBOARD_ID, "
            + "GADGET_ID, GADGET_STATE, USAGE_DATA) VALUES (?,?,?,?,?)";
    static final String SQL_SELECT_USAGE_OPERATION =
            "SELECT USAGE_DATA FROM GADGET_USAGE WHERE TENANT_ID = ? " + "AND DASHBOARD_ID = ? AND GADGET_ID = ?";
    static final String SQL_UPDATE_USAGE_OPERATION = "UPDATE GADGET_USAGE SET GADGET_STATE = ?, USAGE_DATA = ? "
            + "WHERE TENANT_ID = ? AND DASHBOARD_ID = ? AND GADGET_ID = ?";
    static final String SQL_GET_DASHBOARD_USING_GADGET_OPERATION =
            "SELECT DASHBOARD_ID FROM GADGET_USAGE WHERE TENANT_ID = ? " + "AND GADGET_ID = ?";
    static final String SQL_DELETE_GADGET_USAGE_OPERATION = "DELETE FROM GADGET_USAGE WHERE TENANT_ID = ?" +
            " AND DASHBOARD_ID = ? AND GADGET_ID = ?";
    static final String SQL_UPDATE_GADGET_STATE_OPERATION = "UPDATE GADGET_USAGE SET GADGET_STATE = ? WHERE "
            + "TENANT_ID = ? AND GADGET_ID = ?";
    static final String SQL_DELETE_DASHBOARD_OPERATION = "DELETE FROM GADGET_USAGE WHERE TENANT_ID = ?" +
            " AND DASHBOARD_ID = ?";
    static final String SQL_DELETE_ALL_DASHBOARD_OPERATION = "DELETE FROM GADGET_USAGE WHERE TENANT_ID = ?" +
            " AND DASHBOARD_ID LIKE ?";
    static final String SQL_CHECK_DASHBOARD_OPERATION = "SELECT GADGET_ID FROM GADGET_USAGE WHERE TENANT_ID = ?" +
            " AND DASHBOARD_ID = ?";
    static final String SQL_CHECK_DEFECTIVE_DASHBOARD = "SELECT USAGE_DATA FROM GADGET_USAGE WHERE TENANT_ID = ? "
            + "AND DASHBOARD_ID = ? AND GADGET_STATE = ?";
    static final String MSSQL_PRODUCT_NAME = "Microsoft SQL Server";
    static final String MSSQL_SCRIPT_NAME = "mssql";
    static final String ORACLE_SCRIPT_NAME = "oracle";
    static final String SQL_EXTENSION = ".sql";
    static final String GADGET_USAGE_TABLE_NAME = "GADGET_USAGE";
    static enum GADGET_STATES{ACTIVE, DELETED};
}
