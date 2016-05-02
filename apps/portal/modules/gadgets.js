/*
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var log = new Log();
var carbon = require('carbon');
var utils = require('/modules/utils.js');

/**
 * Get registry reference.
 * @return {Object} registry object
 */
var getRegistry = function () {
    log.info("Feature 5008 : Inside getRegistry");
    var server = new carbon.server.Server();
    return new carbon.registry.Registry(server, {
        system: true
    });
};

//TODO: what happen when the context is changed or mapped via reverse proxy
/**
 * Get the registry path for the id.
 * @param {String} id                       Id of the dashboard
 * @return {String}                         Registry Path to dashboard
 * */
var registryPath = function (id) {
    var path = '/_system/config/ues/dashboards';
    return id ? path + '/' + id : path;
};

/**
 * Finds a dashboard by its ID.
 * @param {String} id                       ID of the dashboard
 * @param {Boolean} originalDashboardOnly   Original dashboard only
 * @return {Object} Dashboard object
 */
var getAsset = function (id) {
    log.info("Feature 5008 Start of getAsset : " + id);
    var registry = getRegistry();

    var path = registryPath(id);
    var originalDB;

    var originalDBPath = registryPath(id);
    if (registry.exists(originalDBPath)) {
        originalDB = JSON.parse(registry.content(originalDBPath));
        log.info("Feature 5008 : originalDB exists");
    }

    var content = registry.content(path);
    var dashboard = JSON.parse(content);
    if (dashboard) {
        dashboard.isUserCustom = false;
        dashboard.isEditorEnable = false;

        var banner = getBanner(id, null);
        dashboard.banner = {
            globalBannerExists: banner.globalBannerExists,
            customBannerExists: banner.customBannerExists
        };
    }

    log.info("Feature 5008 End of getAsset");
    return dashboard;
};

/**
 * Find a particular page within a dashboard
 * @param {Object} dashboard Dashboard object
 * @param {String} id Page id
 * @return {Object} Page object
 */
var findPage = function (dashboard, id) {
    var i;
    var page;;
    var pages = dashboard.pages;
    var length = pages.length;
    for (i = 0; i < length; i++) {
        page = pages[i];
        if (page.id === id) {
            return page;
        }
    }
};

/**
 * Find a given component in the current page
 * @param {Number} id
 * @returns {Object}
 * @private
 */
var findComponent = function (id, page) {
    var i;
    var length;
    var area;
    var component;
    var components;
    var content = page.content.default;
    for (area in content) {
        if (content.hasOwnProperty(area)) {
            components = content[area];
            length = components.length;
            for (i = 0; i < length; i++) {
                component = components[i];
                if (component.id === id) {
                    return component;
                }
            }
        }
    }
};

/**
 * Path to customizations directory in registry.
 * @return {String} Path to the customization registry
 */
var registryCustomizationsPath = function () {
    return '/_system/config/ues/customizations';
};

/**
 * Get saved registry path for a banner.
 * @param   {String} dashboardId ID of the dashboard
 * @param   {String} username    Current user's username
 * @returns {String} Path to the banner
 */
var registryBannerPath = function (dashboardId, username) {
    return registryCustomizationsPath() + '/' + dashboardId + (username ? '/' + username : '')
        + '/banner';
};

/**
 * Get banner details (banner type and the registry path).
 * @param   {String} dashboardId ID of the dashboard
 * @param   {String} username    Username
 * @returns {Object} Banner details
 */
var getBanner = function (dashboardId, username) {
    var registry = getRegistry();
    var path;
    var result = {globalBannerExists: false, customBannerExists: false, path: null};
    // check to see whether the custom banner exists
    path = registryBannerPath(dashboardId, username);
    if (registry.exists(path)) {
        var resource = registry.get(path);
        if (!resource.content || new String(resource.content).length == 0) {
            return result;
        }
        result.customBannerExists = true;
        result.path = path;
    }
    // check to see if there is any global banner
    path = registryBannerPath(dashboardId, null);
    if (registry.exists(path)) {
        result.globalBannerExists = true;
        result.path = result.path || path;
    }
    return result;
};

