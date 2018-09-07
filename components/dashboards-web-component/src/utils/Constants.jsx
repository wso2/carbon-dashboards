/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

/**
 * HTTP status codes.
 */
const HttpStatus = {
    UNKNOWN: -1,
    OK: 200,
    CREATED: 201,
    CONFLICT: 409,
    FORBIDDEN: 403,
    NOTFOUND: 404,
    UNAUTHORIZED: 401,
    SERVE_ERROR: 500,
};

/**
 * Media types.
 */
const MediaType = {
    APPLICATION_WWW_FORM_URLENCODED: 'application/x-www-form-urlencoded',
    APPLICATION_JSON: 'application/json',
};

/**
 * Events.
 * @type {{DASHBOARD_VIEWER_THEME_CHANGE: string, DASHBOARD_VIEWER_WIDGET_LOADED: string,
 *     DASHBOARD_DESIGNER_WIDGET_RESIZE: string, DASHBOARD_DESIGNER_WIDGET_CONFIG_UPDATE: string,
 *     DASHBOARD_DESIGNER_LAST_WIDGET_DELETED: string}}
 */
const Event = {
    DASHBOARD_VIEWER_THEME_CHANGE: 'dashboard-viewer-theme-change',
    DASHBOARD_VIEWER_WIDGET_LOADED: 'dashboard-viewer-widget-loaded',
    DASHBOARD_DESIGNER_WIDGET_RESIZE: 'dashboard-designer-widget-resize',
    DASHBOARD_DESIGNER_WIDGET_CONFIG_UPDATE: 'dashboard-designer-widget-config-update',
    DASHBOARD_DESIGNER_LAST_WIDGET_DELETED: 'dashboard-designer-last-widget-deleted',
};

export { HttpStatus, MediaType, Event };
