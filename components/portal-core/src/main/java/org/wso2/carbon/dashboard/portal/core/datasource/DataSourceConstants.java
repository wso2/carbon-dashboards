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
}
