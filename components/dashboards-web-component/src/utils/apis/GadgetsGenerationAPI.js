/*
 *  Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
 */

import React from 'react';
import axios from 'axios';
// Auth Utils
import AuthManager from '../../auth/utils/AuthManager';

/**
 * App context.
 */
const appContext = window.contextPath;

/**
 * Gadgets generation wizard API
 */
class GadgetsGenerationAPI {
    /**
     * This method will return the AXIOS http client.
     * @returns httpClient
     */
    getHTTPClient() {
        let httpClient = axios.create({
            baseURL: appContext + '/apis',
            timeout: 300000,
            headers: { "Authorization": "Bearer " + AuthManager.getUser().SDID },
        });
        httpClient.defaults.headers.post['Content-Type'] = 'application/json';
        return httpClient;
    }

    /**
     * Validates given widget name
     * @param widgetName
     */
    validateWidgetName(widgetName) {
        return this.getHTTPClient().post(`/widgets/${widgetName}/validate`);
    }

    /**
     * Gets a list of available data providers
     */
    getProvidersList() {
        return this.getHTTPClient().get('/data-provider/list');
    }

    /**
     * Gets config for the given provider name
     * @param providerName
     */
    getProviderConfiguration(providerName) {
        return this.getHTTPClient().get(`/data-provider/${providerName}/config`);
    }

    /**
     * Validates the provider with the given configuration, and returns metadata of the provider when valid
     * @param providerName
     * @param providerConfig
     */
    getProviderMetadata(providerName, providerConfig) {
        return this.getHTTPClient().post(`/data-provider/${providerName}/validate`, providerConfig);
    }

    /**
     * Saves the gadget, with the given config
     * @param gadgetConfig
     */
    addGadgetConfiguration(gadgetConfig) {
        return this.getHTTPClient().post('/widgets', gadgetConfig);
    }
}

export default GadgetsGenerationAPI;
