/*
 *   Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *   WSO2 Inc. licenses this file to you under the Apache License,
 *   Version 2.0 (the "License"); you may not use this file except
 *   in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing,
 *   software distributed under the License is distributed on an
 *   "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *   KIND, either express or implied.  See the License for the
 *   specific language governing permissions and limitations
 *   under the License.
 *
 */

package org.wso2.carbon.siddhi.apps.api.rest.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

/**
 * Read worker node list, username, password from deployment.yaml and hold them for later use
 */
public class ConfigReader {
    private static final Logger log = LoggerFactory.getLogger(ConfigReader.class);
    private static final String ADMIN = "admin";
    private static final String USER_NAME = "username";
    private static final String PASSWORD = "password";
    private static final String WORKER_NODES = "workerNodes";
    private static final String COMPONENT_NAMESPACE = "wso2.dashboard.datasearch";
    private  Map<String, Object> configs = readConfigs();

    /**
     * Read all the configs under given namespace from deployment.yaml of related runtime
     *
     */
    private  static Map<String, Object> readConfigs() {
        try {
            return (Map<String, Object>) DataHolder.getInstance()
                    .getConfigProvider().getConfigurationObject(COMPONENT_NAMESPACE);
        } catch (Exception e) {
            log.error("Failed to read deplyment.yaml file", e);
        }
        return new HashMap<>();
    }

    public String getUserName() {
        Object username = configs.get(USER_NAME);
        return username != null ? username.toString() : ADMIN;
    }

    public String getPassword() {
        Object password = configs.get(PASSWORD);
        return password != null ? password.toString() : ADMIN;
    }

    public ArrayList getWorkerList() {
        return ((ArrayList) configs.get(WORKER_NODES));
    }
}
