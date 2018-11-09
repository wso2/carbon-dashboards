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
import org.wso2.carbon.analytics.permissions.PermissionProvider;
import org.wso2.carbon.analytics.permissions.bean.Permission;
import org.wso2.carbon.analytics.permissions.bean.Role;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
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
    private static final String ROLES = "roles";
    private static final String VIEWER = "viewer";
    private static final String ID = "id";
    private static final String NAME = "name";

    private static final Permission viewPermission = new Permission("DASH", "DASH.siddhiApp.viewer");

    private static Map<String, Object> configs = readConfigs();
    static {
        registerRoles();
    }

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
        if (configs != null && configs.get(WORKER_NODES) != null) {
            return ((ArrayList) configs.get(WORKER_NODES));
        }
        return null;
    }

    /*
     * Add roles to the database and grant permissions to roles
     * defined in deployment.yaml
     */
    private static void registerRoles() {
        if (configs == null) {
            log.error("Failed to find permission configs for wso2.dashboard.datasearch in dashboard deployment.yaml");
        } else {
            Map roles = (Map) configs.get(ROLES);
            if (roles != null) {
                List<Map<String, List>> viewers = (List<Map<String, List>>) roles.get(VIEWER);

                PermissionProvider permissionProvider = DataHolder.getInstance().getPermissionProvider();

                if (!permissionProvider.isPermissionExists(viewPermission)) {
                    permissionProvider.addPermission(viewPermission);
                }

                for (Map viewer : viewers) {
                    String name = viewer.get(NAME).toString();
                    if (!permissionProvider.hasPermission(name, viewPermission)) {
                        Role role = new Role(viewer.get(ID).toString(), viewer.get(NAME).toString());
                        permissionProvider.grantPermission(viewPermission, role);
                    }
                }
            }
        }
    }
}
