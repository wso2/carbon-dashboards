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

var carbon = require('carbon');

/**
 * Get registry reference.
 * @return {Object} registry object
 */
var getRegistry = function () {
    var server = new carbon.server.Server();
    return new carbon.registry.Registry(server, {
        system: true
    });
};

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
 * @return {Object} Dashboard object
 */
var getAsset = function (id) {
    var registry = getRegistry();
    var path = registryPath(id);
    var content = registry.content(path);
    return JSON.parse(content);
};

/**
 * Find a particular page within a dashboard
 * @param {Object} dashboard Dashboard object
 * @param {String} id Page id
 * @return {Object} Page object
 */
var findPage = function (dashboard, id) {
    var i;
    var page;
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
 * To check whether the given component exist within the page
 * @param id
 * @param page
 * @returns {boolean} true if the component exist, otherwise false
 */
var isComponentExists = function (id, page) {
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
                    return true;
                }
            }
        }
    }
    return false;
};