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
 *
 */

import Axios from 'axios';
import AuthManager from '../../auth/utils/AuthManager';
import { HttpStatus } from '../Constants';

export default class WidgetAPI {
    /**
     * Returns an axios HTTP client
     * @private
     * @returns {AxiosInstance} axios instance
     */
    static getHTTPClient() {
        const httpClient = Axios.create({
            baseURL: `${window.location.origin}${window.contextPath}/apis/widgets`,
            timeout: 2000,
            headers: { Authorization: 'Bearer ' + AuthManager.getUser().SDID },
        });
        httpClient.interceptors.response.use(response => response, (error) => {
            if (error.response.status === HttpStatus.UNAUTHORIZED) {
                AuthManager.discardSession();
                window.handleSessionInvalid();
            }
            return Promise.reject(error);
        });

        return httpClient;
    }

    /**
     * Returns all widgets.
     * @returns {AxiosPromise} a promise
     */
    static getWidgets() {
        return WidgetAPI.getHTTPClient().get();
    }

    /**
     * This method will get a list of widgets available in the server.
     * @deprecated
     * @returns {*}
     */
    getWidgetsInfo() {
        return WidgetAPI.getHTTPClient().get();
    }
}
