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

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import java.util.*;

@XmlRootElement(name = "notification")
public class Notification {
    private String notificationId;
    private String title;
    private String message;
    private String directUrl;
    private List<String> users;
    private List<String> roles;

    @XmlElement(name = "notificationId", required = true)
    public void setNotificationId(String notificationId) {
        this.notificationId = notificationId;
    }

    @XmlElement(name = "title", required = true)
    public void setTitle(String title) {
        this.title = title;
    }

    @XmlElement(name = "message", required = true)
    public void setMessage(String message) {
        this.message = message;
    }

    @XmlElement(name = "directUrl", required = true)
    public void setDirectUrl(String directUrl) {
        this.directUrl = directUrl;
    }

    @XmlElement(name = "users", required = false)
    public void setUsers(List<String> users) {
        this.users = users;
    }

    @XmlElement(name = "roles", required = false)
    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public List<String> getRoles() {
        return roles;
    }

    public List<String> getUsers() {
        return users;
    }

    public String getNotificationId() {
        return notificationId;
    }

    public String getTitle() {
        return title;
    }

    public String getMessage() {
        return message;
    }

    public String getDirectUrl() {
        return directUrl;
    }
}
