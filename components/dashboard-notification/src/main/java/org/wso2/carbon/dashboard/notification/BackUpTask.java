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

import org.apache.catalina.*;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.wso2.carbon.dashboard.notification.internal.BackupConfiguration;
import org.wso2.carbon.dashboard.portal.core.DashboardPortalException;
import org.wso2.carbon.dashboard.portal.core.datasource.DSDataSourceManager;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class BackUpTask {
    private static Log log = LogFactory.getLog(BackUpTask.class);
    private DSDataSourceManager dsDataSourceManager;

    public BackUpTask() throws DashboardPortalException, LifecycleException {
    }

    /**
     * Task of scanning the database to delete the notification from NotificationTenantDomain table
     */
    private void scanNotificationTenantDomainTable() {
        try {
            //TODO GET ALL TENANT DOMAINS AND DO THE FUNCTION IN LOOP
            String tenantDomain = "carbon.super";
            dsDataSourceManager = DSDataSourceManager.getInstance();
            JSONArray notifications = dsDataSourceManager.getUsersCountInformationFromNotificationTenantDomain(tenantDomain);
            log.info(notifications);
            float percentageOfReadCountConfig = BackupConfiguration.getInstance().getPercentageOfReadCount();
            for (Object notification : notifications) {
                JSONObject notifcn = (JSONObject) notification;
                float percentageOfReadCount = Integer.parseInt(notifcn.get(NotificationConstants.READ_COUNT).toString()) / Integer.parseInt((notifcn.get(NotificationConstants.USERS_COUNT)).toString()) * 100;
                if (percentageOfReadCount >= percentageOfReadCountConfig) {
                    if (!checkForNotificationIdInUsercacheBackup(notifcn.get(NotificationConstants.NOTIFICATION_ID).toString())) {
                        dsDataSourceManager.removeNotifcnFromNotificationTenantDomain(notifcn.get(NotificationConstants.NOTIFICATION_ID).toString(), tenantDomain);
                    }
                }
            }
        } catch (SQLException e) {
            log.error(e);
        } catch (NotificationManagementException e) {
            log.error(e);
        } catch (DashboardPortalException e) {
            log.error(e);
        }
    }

    /**
     * Before deleting the notifications from the database, check whether the notification is in user cache of any users
     * @param notificationId
     * @return
     */
    public boolean checkForNotificationIdInUsercacheBackup(String notificationId) {
        ConcurrentHashMap<String, UserCache> userHash = NotificationManagementServiceImpl.getUserHash();
        log.info(userHash);
        log.info(userHash.size());
        for (Map.Entry<String, UserCache> entry : userHash.entrySet()) {
            System.out.println(entry.getKey() + "/" + entry.getValue().getUserNotificationIdBackup());
            ArrayList<String> notificationIdsInUsercache = entry.getValue().getUserNotificationIdBackup();
            for (int i = 0; i < notificationIdsInUsercache.size(); i++) {
                if (notificationId.equals(notificationIdsInUsercache.get(i))) {
                    return true;
                }
            }
        }
        return false;
    }
}
