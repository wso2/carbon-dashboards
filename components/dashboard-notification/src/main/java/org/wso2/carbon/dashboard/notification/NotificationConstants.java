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
package org.wso2.carbon.dashboard.notification;

public class NotificationConstants {
    private NotificationConstants() {
    }

    static final String PERMISSION = "/permission/admin/manage/portal/login";
    static final String ADD_NOTIFICATION_PERMISSION = "/permission/admin/manage/portal/notification/add";
    static final String VALIDATION_ERROR = "User cannot be validated";
    static final String COLON = ":";
    static final String AT = "@";
    static final String NOTIFICATION_ID = "NOTIFICATION_ID";
    static final String MAX_TIME = "maxTime";
    static final String USERS_COUNT = "USERS_COUNT";
    static final String READ_COUNT = "READ_COUNT";
    public static final String INTERVAL = "interval";
    public static final String NOTIFICATION_API_CONFIG = "notificationApi";
    public static final String PERCENTAGE_OF_READ_COUNT = "percentageOfReadCount";
    public static final String PORTAL_NOTIFICATION_BACKUP_TASK = "PORTAL_NOTIFICATION_BACKUP_TASK";
    public static final String PORTAL_NOTIFICATION_TASK= "PORTAL_NOTIFICATION_TASK";
    public static final String PORTAL_CONFIG_NAME = "portal.json";
}
