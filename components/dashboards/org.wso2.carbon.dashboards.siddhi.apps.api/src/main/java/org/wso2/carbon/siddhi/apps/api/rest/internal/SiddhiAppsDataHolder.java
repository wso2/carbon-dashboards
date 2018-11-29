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

package org.wso2.carbon.siddhi.apps.api.rest.internal;

import org.wso2.carbon.analytics.idp.client.core.api.AnalyticsHttpClientBuilderService;
import org.wso2.carbon.analytics.permissions.PermissionProvider;
import org.wso2.carbon.config.provider.ConfigProvider;
import org.wso2.carbon.siddhi.apps.api.rest.config.DeploymentConfigs;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Data holder for siddhi apps api
 */
public class SiddhiAppsDataHolder {
    private static SiddhiAppsDataHolder instance = new SiddhiAppsDataHolder();
    private  PermissionProvider permissionProvider;
    private ConfigProvider configProvider;
    private AnalyticsHttpClientBuilderService clientBuilderService;
    private DeploymentConfigs datasearchConfigs;
    private Map<String, List<String>> workerSiddhiApps = new HashMap<>();

    private SiddhiAppsDataHolder(){
    }

    public AnalyticsHttpClientBuilderService getClientBuilderService() {
        return clientBuilderService;
    }

    public void setClientBuilderService(AnalyticsHttpClientBuilderService clientBuilderService) {
        this.clientBuilderService = clientBuilderService;
    }

    /**
     * Returns instance of SiddhiAppsDataHolder Class
     *
     * @return Instance of SiddhiAppsDataHolder
     */
    public static SiddhiAppsDataHolder getInstance() {
        return instance;
    }

    /**
     * Returns instance of Config Provider
     *
     * @return Instance of ConfigProvider
     */
    public ConfigProvider getConfigProvider() {
        return this.configProvider;
    }

    /**
     * Sets instance of config provider
     *
     * @param configProvider instance of config provider
     */
    public void setConfigProvider(ConfigProvider configProvider) {
        this.configProvider = configProvider;
    }

    /**
     * Returns permission provider
     *
     * @return permissionProvider
     */
    public  PermissionProvider getPermissionProvider() {
        return permissionProvider;
    }

    /**
     * Sets permission provider
     *
     * @param permissionProvider permission provider
     */
    public  void setPermissionProvider(PermissionProvider permissionProvider) {
        this.permissionProvider = permissionProvider;
    }

    /**
     * Returns deployment configs
     *
     * @return deployment configs
     */
    public DeploymentConfigs getDatasearchConfigs() {
        return datasearchConfigs;
    }

    /**
     * Sets datasearch deployment configs
     *
     * @param datasearchConfigs dataseach configs
     */
    public void setDatasearchConfigs(DeploymentConfigs datasearchConfigs) {
        this.datasearchConfigs = datasearchConfigs;
    }

    /**
     * Returns map of workers and siddhi apps
     *
     * @return workerSiddhiApps
     */
    public Map<String, List<String>> getWorkerSiddhiApps() {
        return workerSiddhiApps;
    }

    /**
     * Sets worker siddhi apps map
     *
     * @param workerSiddhiApps map of worker, siddhi apps
     */
    public void setWorkerSiddhiApps(Map<String, List<String>> workerSiddhiApps) {
        this.workerSiddhiApps = workerSiddhiApps;
    }
}
