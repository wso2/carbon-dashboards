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

import java.util.ArrayList;

public class UserCache {
    private long loggedInTimestamp;
    private long updatedTimesstamp;
    private String uuid;
    private ArrayList<String> userNotificationIdBackup;

    public void setLoggedInTimestamp(long timestamp) {
        this.loggedInTimestamp = timestamp;
    }

    public void setUpdatedTimesstamp(long timesstamp) {
        this.updatedTimesstamp = timesstamp;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public void setUserNotificationIdBackup(ArrayList userNotificationIdBackup) {
        this.userNotificationIdBackup = userNotificationIdBackup;
    }

    public long getLoggedInTimestamp() {
        return loggedInTimestamp;
    }

    public long getUpdatedTimesstamp() {
        return updatedTimesstamp;
    }

    public String getUuid() {
        return uuid;
    }

    public ArrayList<String> getUserNotificationIdBackup() {
        return userNotificationIdBackup;
    }
}

