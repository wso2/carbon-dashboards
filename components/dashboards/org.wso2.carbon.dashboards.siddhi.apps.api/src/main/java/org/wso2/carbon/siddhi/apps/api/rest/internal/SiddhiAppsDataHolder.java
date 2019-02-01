/*
 *   Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import org.wso2.carbon.siddhi.apps.api.rest.bean.SiddhiStoreElement;

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
    private Map<String, List<SiddhiStoreElement>> siddhiAppMap = new HashMap<>();
    private String username;
    private String password;
    private List<String> workerList;

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
     * Returns username for worker
     *
     * @return username
     */
    public String getUsername() {
        return username;
    }

    /**
     * Sets username of  worker
     *
     * @param username
     */
    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * Returns password of worker
     *
     * @return password
     */
    public String getPassword() {
        return password;
    }

    /**
     * Sets password of worker
     * @param password
     */
    public void setPassword(String password) {
        this.password = password;
    }

    /**
     * Returns list of worker urls
     *
     * @return workerlist
     */
    public List<String> getWorkerList() {
        return workerList;
    }

    /**
     * Sets worker list
     *
     * @param workerList
     */
    public void setWorkerList(List<String> workerList) {
        this.workerList = workerList;
    }

    /**
     * Returns siddhiAppMap
     *
     * @return siddhiAppMap
     */
    public Map<String, List<SiddhiStoreElement>> getSiddhiAppMap() {
        return siddhiAppMap;
    }

    /**
     * Sets siddhiAppMap
     *
     * @param siddhiAppMap
     */
    public void setSiddhiAppMap(Map<String, List<SiddhiStoreElement>> siddhiAppMap) {
        this.siddhiAppMap = siddhiAppMap;
    }
}
