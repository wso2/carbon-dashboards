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

import org.wso2.carbon.analytics.idp.client.core.api.AnalyticsHttpClientBuilderService;
import org.wso2.carbon.config.provider.ConfigProvider;

/**
 * Data holder for config provider implementations
 */
public class DataHolder {
    private static DataHolder instance = new DataHolder();
    private ConfigProvider configProvider;
    private AnalyticsHttpClientBuilderService clientBuilderService;

    private DataHolder(){
    }

    public AnalyticsHttpClientBuilderService getClientBuilderService() {
        return clientBuilderService;
    }

    public void setClientBuilderService(AnalyticsHttpClientBuilderService clientBuilderService) {
        this.clientBuilderService = clientBuilderService;
    }

    /**
     * Returns instance of DataHolder Class
     *
     * @return Instance of DataHolder
     */
    public static DataHolder getInstance(){
        return instance;
    }

    /**
     * Returns instance of Config Provider
     *
     * @return Instance of ConfigProvider
     */
    public ConfigProvider getConfigProvider(){
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
}
