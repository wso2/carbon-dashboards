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

package org.wso2.carbon.dashboard.notification.internal;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.simple.JSONObject;
import org.json.simple.parser.ParseException;
import org.wso2.carbon.dashboard.notification.NotificationConstants;
import org.wso2.carbon.dashboard.notification.NotificationManagementException;
import org.wso2.carbon.dashboard.portal.core.PortalUtils;

import java.io.IOException;

public class BackupConfiguration {
    private static BackupConfiguration instance;
    private static Log log = LogFactory.getLog(BackupConfiguration.class);
    private static int interval;
    private static float percentageOfReadCount;

    private static int DEFAULT_INTERVAL = 1800000;
    private static int DEFAULT_PERCENTAGE = 100;

    public static BackupConfiguration getInstance() throws NotificationManagementException{
        if (instance == null) {
            synchronized (BackupConfiguration.class) {
                if (instance == null) {
                    instance = new BackupConfiguration();
                }
            }
        }
        return instance;
    }

    private BackupConfiguration() throws NotificationManagementException {
        this.interval = DEFAULT_INTERVAL;
        this.percentageOfReadCount = DEFAULT_PERCENTAGE;
        try {
            JSONObject backUpConfig = PortalUtils.getConfiguration(NotificationConstants.NOTIFICATION_API_CONFIG);
            this.interval = Integer.parseInt(backUpConfig.get(NotificationConstants.INTERVAL).toString());
            this.percentageOfReadCount = Float.parseFloat(backUpConfig.get(NotificationConstants.PERCENTAGE_OF_READ_COUNT).toString());
        } catch (ParseException e) {
            log.error(e);
        } catch (IOException e) {
            log.error(e);
        }
    }

    public float getPercentageOfReadCount() {
        return percentageOfReadCount;
    }

    public int getInterval() {
        return interval;
    }
}
