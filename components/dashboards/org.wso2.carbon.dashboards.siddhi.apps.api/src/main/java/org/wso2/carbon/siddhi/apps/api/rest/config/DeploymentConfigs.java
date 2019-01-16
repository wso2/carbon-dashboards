/*
 *  Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
package org.wso2.carbon.siddhi.apps.api.rest.config;

import org.wso2.carbon.config.annotation.Configuration;
import org.wso2.carbon.config.annotation.Element;

import java.util.List;

/**
 * Configuration bean class for dashboard datasearch configurations.
 */
@Configuration(namespace = "wso2.dashboard.datasearch", description = "Dashboard Datasearch Configurations")
public class DeploymentConfigs {
    @Element(description = "Admin Username across cluster")
    private WorkerAccessCredentials workerAccessCredentials = new WorkerAccessCredentials();

    @Element(description = "List of workers")
    private List<String> workerList;

    @Element(description = "List of viewer roles")
    private List<String> roleIdList;

    public DeploymentConfigs() {
    }

    public void setWorkerAccessCredentials(WorkerAccessCredentials workerAccessCredentials) {
        this.workerAccessCredentials = workerAccessCredentials;
    }


    public String getUsername() {
        return workerAccessCredentials.getWorkerUsername();
    }

    public String getPassword() {
        return workerAccessCredentials.getPassword();
    }

    public void setUsername(String username) {
        workerAccessCredentials.setUsername(username);
    }

    public void setPassword(String password) {
        workerAccessCredentials.setPassword(password);
    }

    public List<String> getWorkerList() {
        return workerList;
    }

    public List<String> getRoleIdList() {
        return roleIdList;
    }

    public void setRoleIdList(List<String> roleIdList) {
        this.roleIdList = roleIdList;
    }

    public void setWorkerList(List<String> workerList) {
        this.workerList = workerList;
    }

}
