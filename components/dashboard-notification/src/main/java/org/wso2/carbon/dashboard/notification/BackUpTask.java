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

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.wso2.carbon.dashboard.portal.core.DashboardPortalException;
import org.wso2.carbon.dashboard.portal.core.datasource.DSDataSourceManager;
import org.wso2.carbon.ntask.core.Task;

import java.sql.SQLException;
import java.util.Map;

public class BackUpTask implements Task {
    private static Log log = LogFactory.getLog(BackUpTask.class);
    private DSDataSourceManager dsDataSourceManager = DSDataSourceManager.getInstance();
    private NotificationBackup notificationBackup = new NotificationBackup();

    public BackUpTask() throws DashboardPortalException {
    }

    private void scanNotificationTenantDomainTable() {
        try {
            //TODO GET ALL TENANT DOMAINS
            String tenantDomain = "carbon.super";
            JSONArray notifications = dsDataSourceManager.getUsersCountInformationFromNotificationTenantDomain(tenantDomain);
            float percentageOfReadCountConfig = BackupConfiguration.getInstance().getPercentageOfReadCount();
            for (Object notification : notifications) {
                JSONObject notifcn = (JSONObject) notification;
                float percentageOfReadCount = Integer.parseInt(notifcn.get(NotificationConstants.READ_COUNT).toString()) / Integer.parseInt((notifcn.get(NotificationConstants.USERS_COUNT)).toString()) * 100;
                if (percentageOfReadCount >= percentageOfReadCountConfig) {
                    String[] notifcnDetails;
                    notifcnDetails = dsDataSourceManager.getNotificationDetails(notifcn.get(NotificationConstants.NOTIFICATION_ID).toString(), tenantDomain);
                    notificationBackup.addNotificationToBackup(notifcn.get(NotificationConstants.NOTIFICATION_ID).toString(), notifcnDetails);
                    dsDataSourceManager.removeNotifcnFromNotificationTenantDomain(notifcn.get(NotificationConstants.NOTIFICATION_ID).toString(), tenantDomain);
                }
            }
        } catch (SQLException e) {
            log.error(e);
        } catch (DashboardPortalException e) {
            e.printStackTrace();
        }
    }


    @Override
    public void setProperties(Map<String, String> map) {

    }

    @Override
    public void init() {
        scanNotificationTenantDomainTable();
    }

    @Override
    public void execute() {

    }
}
