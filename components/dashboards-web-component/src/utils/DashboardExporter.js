/*
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import DashboardAPI from './apis/DashboardAPI';

export default class DashboardExporter {
    /**
     * Exports the specified dashboard as a JSON.
     * @param {string} dashboardName name of the dashboard
     * @param {string} dashboardURL url of the dashboard
     */
    static exportDashboard(dashboardName, dashboardURL) {
        DashboardAPI.exportDashboardByID(dashboardURL)
            .then((response) => {
                const url = window.URL.createObjectURL(
                    new Blob([JSON.stringify(response.data, undefined, 2)]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', dashboardName + '.json');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch((e) => {
                // TODO: Show a proper error message to the user
                console.error(`Exporting dashboard '${dashboardName}' with URL '${dashboardURL}' failed.`, e);
            });
    }
}
