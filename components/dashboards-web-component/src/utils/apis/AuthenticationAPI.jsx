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
import Qs from 'qs';

// TODO: Get following configurations from the deployment.yaml at the backend.
/**
 * Constants.
 * @type {{}}
 */
const constants = {
    basePath: window.location.origin,
    grantTypePassword: 'password',
    appContext: window.contextPath.substr(1),
    authorizationHeader: 'Basic YWRtaW46YWRtaW4=',
};

/**
 * Authentication API client.
 */
export default class AuthenticationAPI {
    /**
     * Get HTTP client.
     *
     * @return {AxiosInstance} Axios client
     */
    static getHttpClient() {
        const client = Axios.create({
            baseURL: constants.basePath,
            timeout: 2000,
        });
        client.defaults.headers.post['Content-Type'] = 'application/json';
        return client;
    }

    /**
     * Login user.
     *
     * @param {string} username Username
     * @param {string} password Password
     * @param {boolean} rememberMe Remember me flag
     * @return {AxiosPromise} Axios promise
     */
    static login(username, password, rememberMe = false) {
        return AuthenticationAPI
            .getHttpClient()
            .post(`/login/${constants.appContext}`, Qs.stringify({
                username,
                password,
                grantType: constants.grantTypePassword,
                rememberMe,
            }), {
                headers: {
                    Authorization: constants.authorizationHeader,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
    }

    /**
     * Logout user.
     *
     * @return {AxiosPromise} Axios promise
     */
    static logout() {
        return AuthenticationAPI
            .getHttpClient()
            .post(`/logout/${constants.appContext}`, null, {
                headers: {
                    Authorization: constants.authorizationHeader,
                },
            });
    }
}
