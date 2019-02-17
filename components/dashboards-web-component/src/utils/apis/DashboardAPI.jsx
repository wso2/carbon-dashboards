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

const baseURL = `${window.location.origin}${window.contextPath}/apis/dashboards`;

/**
 * Dashboard API.
 */
export default class DashboardAPI {

    constructor(originComponent) {
        this.originComponent = originComponent;
    }

    /**
     * Returns a HTTP client for the dashboard API.
     * @returns {AxiosInstance} a HTTP client for the dashboard API
     */
    static getHTTPClient() {
        const httpClient = Axios.create({
            baseURL,
            timeout: 2000,
            headers: { Authorization: 'Bearer ' + AuthManager.getUser().SDID }
        });
        httpClient.defaults.headers.post['Content-Type'] = 'application/json';
        httpClient.interceptors.response.use(
            response => response,
            (error) => {
                if (error.response.status === HttpStatus.UNAUTHORIZED) {
                    AuthManager.discardSession();
                    window.handleSessionInvalid();
                }
                return Promise.reject(error);
            },
        );

        return httpClient;
    }

    /**
     * This method will create a dashboard with given dashboard json.
     * @param dashboard
     * @returns {*}
     */
    createDashboard(dashboard) {
        return DashboardAPI.getHTTPClient().post('', dashboard);
    }

    /**
     * This method will return a list of dashboards meta data.
     */
    static getDashboardList() {
        return DashboardAPI.getHTTPClient().get();
    }

    /**
     * This method will return the dashboard with given ID.
     * @param dashboardId
     */
    getDashboardByID(dashboardId) {
        switch (this.originComponent) {
            case 'designer': {
                DashboardAPI.getHTTPClient().defaults.headers.common['X-Dashboard-Origin-Component'] = 'designer';
                break;
            }
            case 'settings': {
                DashboardAPI.getHTTPClient().defaults.headers.common['X-Dashboard-Origin-Component'] = 'settings';
                break;
            }
        }
        return DashboardAPI.getHTTPClient().get(dashboardId);
    }

    /**
     * This method will update the dashboard with given ID.
     * @param dashboardId
     * @param dashboard
     */
    updateDashboardByID(dashboardId, dashboard) {
        return DashboardAPI.getHTTPClient().put(dashboardId, dashboard);
    }

    /**
     * Deletes the dashboard identified by the given ID.
     * @param {string} dashboardId ID of the dashboard to be deleted
     * @returns {AxiosPromise} HTTP response promise
     */
    static deleteDashboardByID(dashboardId) {
        return DashboardAPI.getHTTPClient().delete(dashboardId);
    }

    /**
     * Get roles associated for a particular dashboard.
     *
     * @param {string} dashboardId Dashboard ID
     * @returns {{}} Roles
     */
    static getDashboardRoles(dashboardId) {
        return DashboardAPI.getHTTPClient().get(`${dashboardId}/roles`);
    }

    /**
     * Update dashboard roles.
     *
     * @param {string} dashboardId Dashboard ID
     * @param {{}} roles Roles
     * @returns {Promise} Promise
     */
    static updateDashboardRoles(dashboardId, roles) {
        return DashboardAPI.getHTTPClient().post(`${dashboardId}/roles`, roles);
    }

    /**
     * Get report congifs for pdf
     *
     * @param {string} dashboardId Dashboard ID
     * @param {{}} roles Roles
     * @returns {Promise} Promise
     */
    static getDashboardReportPdfConfigs() {
        return DashboardAPI.getHTTPClient().get('/report-config');
    }

    /**
     * Exports the specified dashboard as a JSON.
     *
     * @param {string} dashboardId Dashboard ID
     * @returns {Promise} Promise
     */
    static exportDashboardByID(dashboardId) {
        return DashboardAPI.getHTTPClient().get(`${dashboardId}/export`);
    }
}
