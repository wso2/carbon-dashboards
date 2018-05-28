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

import html2canvas from 'html2canvas';
import AuthManager from '../auth/utils/AuthManager';

export default class DashboardThumbnail {
    /**
     * Returns local storage key for the thumbnail of the specified dashboard.
     * @private
     * @param {string} dashboardId dashboard ID
     * @returns {string} local storage key for the thumbnail
     */
    static getDashboardThumbnailKey(dashboardId) {
        const user = AuthManager.getUser();
        return `_dashboard-thumbnail:${(user ? user.username : '_PUBLIC')}:${dashboardId}`;
    }

    /**
     * Saves the thumbnail for the specified dashboard into the local storage for the current user.
     * @param {string} dashboardId dashboard ID
     * @param {string} dashboardContainerId ID of the container element which dashboard is rendered
     */
    static saveDashboardThumbnail(dashboardId, dashboardContainerId) {
        const dashboardThumbnailKey = DashboardThumbnail.getDashboardThumbnailKey(dashboardId);
        if (localStorage.getItem(dashboardThumbnailKey)) {
            return;
        }

        html2canvas(document.getElementById(dashboardContainerId))
            .then(canvas => localStorage.setItem(dashboardThumbnailKey, canvas.toDataURL()));
    }

    /**
     * Returns thumbnail of the specified dashboard for the current user.
     * @param {string} dashboardId dashboard ID
     * @returns {string} thumbnail image URL
     */
    static getDashboardThumbnail(dashboardId) {
        const thumbnail = localStorage.getItem(DashboardThumbnail.getDashboardThumbnailKey(dashboardId));
        // TODO 18/05/26 Add a default thumbnail for dashboards
        return thumbnail || 'https://snag.gy/NFycsj.jpg';
    }

    /**
     * Deletes dashboard thumbnails of the current user.
     */
    static deleteDashboardThumbnails() {
        const keyPrefix = DashboardThumbnail.getDashboardThumbnailKey('');
        Object.keys(localStorage).forEach((key) => {
            if (key.lastIndexOf(keyPrefix, 0) === 0) {
                localStorage.removeItem(key);
            }
        });
    }
}
