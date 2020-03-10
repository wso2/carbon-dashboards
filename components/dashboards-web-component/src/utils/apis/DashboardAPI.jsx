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

const baseURL = `${window.location.origin}${window.contextPath}/apis/dashboards`;

/**
 * Dashboard API.
 */
export default class DashboardAPI {

    constructor(originComponent) {
        this.originComponent = originComponent;
    }

    /**
     * This method will return the AXIOS http client.
     * @returns httpClient
     */
    getHTTPClient() {
        let httpClient = Axios.create({
            baseURL: baseURL,
            timeout: 300000,
            headers: {"Authorization": "Bearer " + AuthManager.getUser().SDID}
        });
        httpClient.defaults.headers.post['Content-Type'] = 'application/json';
        httpClient.interceptors.response.use(function (response) {
            return response;
        }, function (error) {
            if (401 === error.response.status) {
                AuthManager.discardSession();
                window.handleSessionInvalid();
            }
            return Promise.reject(error);
        });

        return httpClient;
    }

    /**
     * This method will create a dashboard with given dashboard json.
     * @param dashboard
     * @returns {*}
     */
    createDashboard(dashboard) {
        return this.getHTTPClient().post("", dashboard)
    }

    /**
     * This method will return a list of dashboards meta data.
     */
    getDashboardList() {
        return this.getHTTPClient().get();
    }

    /**
     * This method will return the dashboard with given ID.
     * @param dashboardId
     */
    getDashboardByID(dashboardId) {
        switch (this.originComponent) {
            case "designer": {
                this.getHTTPClient().defaults.headers.common['X-Dashboard-Origin-Component'] = "designer";
                break;
            }
            case "settings": {
                this.getHTTPClient().defaults.headers.common['X-Dashboard-Origin-Component'] = "settings";
                break;
            }
            default: {
                delete this.getHTTPClient().defaults.headers.common['X-Dashboard-Origin-Component'];
            }
        }
        return this.getHTTPClient().get(dashboardId);
    }

    /**
     * This method will update the dashboard with given ID.
     * @param dashboardId
     * @param dashboard
     */
    updateDashboardByID(dashboardId, dashboard) {
        return this.getHTTPClient().put(dashboardId, dashboard);
    }

    /**
     * This method will delete the dashboard with given ID
     * @param dashboardId
     * @returns {boolean}
     */
    deleteDashboardByID(dashboardId) {
        return this.getHTTPClient().delete(dashboardId);
    }

    /**
     * Check if the user has creator permissions.
     *
     * @param {string} username Username
     */
    hasCreatorPermission(username) {
        return new DashboardAPI()
            .getHTTPClient()
            .get(`roles/${username}/iscreator`);
    }

    /**
     * Check if the user has widget creator permissions.
     *
     * @param {string} username Username
     */
    hasWidgetCreatorPermission(username) {
        return new DashboardAPI()
            .getHTTPClient()
            .get(`roles/${username}/iswidgetcreator`);
    }

    /**
     * Get roles associated for a particular dashboard.
     *
     * @param {string} dashboardId Dashboard ID
     * @returns {{}} Roles
     */
    static getDashboardRoles(dashboardId) {
        return new DashboardAPI()
            .getHTTPClient()
            .get(`${dashboardId}/roles`);
    }

    /**
     * Update dashboard roles.
     *
     * @param {string} dashboardId Dashboard ID
     * @param {{}} roles Roles
     * @returns {Promise} Promise
     */
    static updateDashboardRoles(dashboardId, roles) {
        return new DashboardAPI()
            .getHTTPClient()
            .post(`${dashboardId}/roles`, roles);
    }

    /**
     * Get report congifs for pdf
     *
     * @param {string} dashboardId Dashboard ID
     * @param {{}} roles Roles
     * @returns {Promise} Promise
     */
    static getDashboardReportPdfConfigs() {
        return new DashboardAPI()
            .getHTTPClient()
            .get(`/report-config`);
    }

    /**
     * Exports the specified dashboard as a JSON.
     *
     * @param {string} dashboardId Dashboard ID
     * @returns {Promise} Promise
     */
    static exportDashboardByID(dashboardId) {
        return new DashboardAPI()
            .getHTTPClient()
            .get(`${dashboardId}/export?permissions=true`);
    }
}
