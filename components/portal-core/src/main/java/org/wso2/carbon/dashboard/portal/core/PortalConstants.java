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
package org.wso2.carbon.dashboard.portal.core;

import java.io.File;

public class PortalConstants {
    private PortalConstants() {
        //Avoid Instantiation
    }

    public static final String PORTAL_LOCATION = "jaggeryapps" + File.separator + "portal";
    public static final String STORE = "/portal/store/";
    public static final String TEMP = "/portal/temp/";
    public static final String TASK_TYPE = "PORTAL_APP_TASK";
    public static final String PORTAL_CONFIG_NAME = "portal.json";
    public static final String PORTAL_CONFIG_LOCATION = "dashboards" + File.separator + PORTAL_CONFIG_NAME;
    public static final String PORTAL_HOUSE_KEEPING_TASK = "PORTAL_HOUSE_KEEPING_TASK";
    public static final String HOUSE_KEEPING_CONFIG_PROPERTY = "houseKeeping";
    public static final String HOUSE_KEEPING_INTERVAL_CONFIG_PROPERTY = "interval";
    public static final String HOUSE_KEEPTING_MAX_FILE_LIFE_TIME_CONFIG_PROPERTY = "maxTempFileLifeTime";
    public static final String HOUSE_KEEPING_LOCATION = "location";
    public static final String DATASOURCE_CONFIG_PROPERTY = "dataSource";
    public static final String DATASOURCE_NAME_PROPERTY = "name";
    public static final String DB_SCRIPTS_LOCATION = "/dbscripts/dashboards/";
    public static final String PORTAL_NOTIFICATION_BACKUP_TASK = "PORTAL_NOTIFICATION_BACKUP_TASK";
}

