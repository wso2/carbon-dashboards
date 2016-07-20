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
var usr = require('/modules/user.js');
var constants = require('/modules/constants.js');

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
 * Get the user registry path for dashboard.
 * @param {String} id                       Id of the dashboard
 * @param {String} username                 Username of the user
 * @return {String}                         Path to user
 * */
var registryUserPath = function (id, username) {
    var path = '/_system/config/ues/' + username + '/dashboards';
    return id ? path + '/' + id : path;
};

/**
 * Get location where to store an OAuth application credentials
 * @param id
 * @returns string path
 */
var registryOAuthApplicationPath = function (id) {
    var path = '/_system/config/ues/application';
    return id ? path + '/' + id : path;
};

/**
 * If an OAuth application already has been created get application credentials
 * @param applicationId   resource location in the registry
 * @param callBack
 */
var getOAuthApplication = function (applicationId, callBack) {
    var registry = getRegistry();
    var path = registryOAuthApplicationPath(applicationId);
    if (registry.exists(path)) {
        callBack(JSON.parse(registry.content(path)));
    } else {
        callBack(null);
    }
};

/**
 * Create an OAuth application against portal app
 * @param applicationId          resource location in the registry
 * @param clientCredentials      OAuth application credentials
 * @returns {boolean}            check whether  OAuth application's credentials are stored in registry
 */
var createOAuthApplication = function (applicationId, clientCredentials) {
    var server = new carbon.server.Server();
    var registry = getRegistry();
    var userManager = new carbon.user.UserManager(server);
    var path = registryOAuthApplicationPath(applicationId);
    try {
        registry.put(path, {
            content: JSON.stringify(clientCredentials),
            mediaType: 'application/json'
        });
        userManager.denyRole('internal/everyone', path, 'read');
        return true;
    } catch (exception) {
        throw "Error occurred while creating an OAuth application, " + exception;
    }
};

/**
 * Finds a dashboard by its ID.
 * @param {String} id                       ID of the dashboard
 * @param {Boolean} originalDashboardOnly   Original dashboard only
 * @return {Object} Dashboard object
 */
var getAsset = function (id, originalDashboardOnly) {
    originalDashboardOnly = originalDashboardOnly || false;
    var registry = getRegistry();
    var usr = require('/modules/user.js');
    var user = usr.current();
    var path = registryPath(id);
    var originalDB;
    var isCustom = false;
    if (user) {
        var originalDBPath = registryPath(id);
        if (registry.exists(originalDBPath)) {
            originalDB = getConvertedDashboardContent(registry, originalDBPath);
        }
        if (!originalDashboardOnly) {
            var userDBPath = registryUserPath(id, user.username);
            if (registry.exists(userDBPath)) {
                path = userDBPath;
                isCustom = true;
            }
        }
    }
    var contentDashboardJSON = getConvertedDashboardContent(registry, path);
    var dashboard = contentDashboardJSON;
    if (dashboard) {
        if(!(contentDashboardJSON.permissions).hasOwnProperty("owners")){
            contentDashboardJSON.permissions.owners = contentDashboardJSON.permissions.editors;
        }
        var dashboard = contentDashboardJSON;
        dashboard.isUserCustom = isCustom;
        dashboard.isEditorEnable = false;
        if (!originalDashboardOnly && originalDB) {
            var carbon = require('carbon');
            var server = new carbon.server.Server();
            var um = new carbon.user.UserManager(server, user.tenantId);
            user.roles = um.getRoleListOfUser(user.username);
            for (var i = 0; i < user.roles.length; i++) {
                for (var j = 0; j < originalDB.permissions.editors.length; j++) {
                    if (user.roles[i] == originalDB.permissions.editors[j]) {
                        dashboard.isEditorEnable = true;
                        break;
                    }
                }
            }
        }
        var banner = getBanner(id, (user ? user.username : null));
        dashboard.banner = {
            globalBannerExists: banner.globalBannerExists,
            customBannerExists: banner.customBannerExists
        };
    }
    return dashboard;
};

/**
 * To get the shared dashboard
 * @param id ID of the dashboard
 */
var getSharedDashboard = function (id) {
    var carbon = require('carbon');
    var server = new carbon.server.Server();
    utils.startTenantFlow(carbon.server.superTenant.tenantId);
    var superTenantRegistry = new carbon.registry.Registry(server, {
        system: true,
        tenantId: carbon.server.superTenant.tenantId
    });
    var content = superTenantRegistry.content(registryPath(id));
    utils.endTenantFlow();

    var dashboard = JSON.parse(content);
    if (dashboard && dashboard.shareDashboard) {
        return dashboard;
    }
};

/**
 * Find dashboards available in the registry.
 * @param {Object} paging                      Paging query.
 * @return {Object} dashboardz                 Array containing dashboards.
 * */
var getAssets = function (paging) {
    var registry = getRegistry();
    var dashboards = registry.content(registryPath(), paging);
    var dashboardz = [];
    dashboards.forEach(function (dashboard) {
        dashboardz.push(getConvertedDashboardContent(registry, dashboard));
    });
    return dashboardz;
};

/**
 * Create dashboard with given dashboard id and the content.
 * @param {Object} dashboard                    Dashboard object to be saved.
 * @return {null}
 * */
var create = function (dashboard) {
    var server = new carbon.server.Server();
    var registry = getRegistry();
    var userManager = new carbon.user.UserManager(server);
    var path = registryPath(dashboard.id);
    if (registry.exists(path)) {
        throw 'a dashboard exists with the same id ' + dashboard.id;
    }
    registry.put(path, {
        content: JSON.stringify(dashboard),
        mediaType: 'application/json'
    });
    usr.createRoles(dashboard.id);
    userManager.denyRole('internal/everyone', path, 'read');
};

/**
 * Update an existing dashboard with given data.
 * @param {Object} dashboard                    Dashboard object to be updated.
 * @return {null}
 * */
var update = function (dashboard) {
    var registry = getRegistry();
    var usr = require('/modules/user.js');
    var user = usr.current();
    if (!user) {
        throw 'User is not logged in ';
    }
    var path = registryUserPath(dashboard.id, user.username);
    if (!registry.exists(path) && !dashboard.isUserCustom) {
        path = registryPath(dashboard.id);
        if (!registry.exists(path)) {
            throw 'a dashboard cannot be found with the id ' + dashboard.id;
        }
    }
    registry.put(path, {
        content: JSON.stringify(dashboard),
        mediaType: 'application/json'
    });
};

/**
 * Copy a dashboard to an user path.
 * @param {Object} dashboard                    Dashboard object to be copied.
 * @return {null}
 * */
var copy = function (dashboard) {
    var registry = getRegistry();
    var usr = require('/modules/user.js');
    var user = usr.current();
    if (!user) {
        throw 'User is not logged in ';
    }
    var path = registryUserPath(dashboard.id, user.username);
    if (!registry.exists(path)) {
        registry.put(path, {
            content: JSON.stringify(dashboard),
            mediaType: 'application/json'
        });
    }
};

/**
 * Remove the dashboard which copied to a user path.
 * @param {String} id                           Id of the dashboard.
 * @return {null}
 * */
var reset = function (id) {
    var registry = getRegistry();
    var usr = require('/modules/user.js');
    var user = usr.current();
    if (!user) {
        throw 'User is not logged in ';
    }
    var path = registryUserPath(id, user.username);
    if (registry.exists(path)) {
        registry.remove(path);
    }
    deleteBanner(id, user.username);
};

/**
 * Remove an existing dashboard from registry.
 * @param {String} id                          Id of the dashboard.
 * @return {null}
 * */
var remove = function (id) {
    var registry = getRegistry();
    var path = registryPath(id);
    if (registry.exists(path)) {
        registry.remove(path);
    }
    usr.removeRoles(id);
};

/**
 * Check if user has permission for the dashboard.
 * @param {Object} dashboard                   Dashboard Object.
 * @param {Object} permission                  Array of available permission for dashboard.
 * @return {Boolean}                           True if user has permission false if user doesn't.
 * */
var allowed = function (dashboard, permission) {
    var usr = require('/modules/user.js');
    var user = usr.current();
    var permissions = dashboard.permissions;
    if (permission.edit) {
        return utils.allowed(user.roles, permissions.editors);
    }
    if (permission.view) {
        return utils.allowed(user.roles, permissions.viewers);
    }
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
 * Find a particular view within a particular page
 * @param {Object} page Page
 * @param {String} viewId View id
 * @returns {*}
 */
var findView = function (page, viewId) {
    if (page) {
        var view = page.content;
        if (view && view[viewId]) {
            return view[viewId];
        }
    }
};

/**
 * Find a given component in the current page
 * @param {Number} id
 * @param {Object} view
 * @returns {Object}
 * @private
 */
var findComponent = function (id, view) {
    var i;
    var length;
    var conatiner;
    var component;
    var components;
    for (conatiner in view) {
        if (view.hasOwnProperty(conatiner)) {
            components = view[conatiner];
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
 * Save banner in the registry.
 * @param {String} dashboardId   ID of the dashboard
 * @param {String} username      Username
 * @param {String} filename      Name of the file
 * @param {String} mime mime     Type of the file
 * @param {Object} stream        Bytestream of the file
 * @return {null}
 */
var saveBanner = function (dashboardId, username, filename, mime, stream) {
    var uuid = require('uuid');
    var registry = getRegistry();
    var path = registryBannerPath(dashboardId, username);
    var resource = {
        content: stream,
        uuid: uuid.generate(),
        mediaType: mime,
        name: filename,
        properties: {}
    };
    registry.put(path, resource);
};

/**
 * Delete dashboard banner (if the username is empty, then the default banner will be removed, otherwise the custom
 * banner for the user will be removed).
 * @param {String} dashboardId   ID of the dashboard
 * @param {String} username      Username
 * @return {null}
 */
var deleteBanner = function (dashboardId, username) {
    getRegistry().remove(registryBannerPath(dashboardId, username));
};

/**
 * Render banner.
 * @param {String} dashboardId ID of the dashboard
 * @param {String} username    Username
 * @return {null}
 */
var renderBanner = function (dashboardId, username) {
    var registry = getRegistry();
    var FILE_NOT_FOUND_ERROR = 'requested file cannot be found';
    var banner = getBanner(dashboardId, username);
    if (!banner) {
        response.sendError(404, FILE_NOT_FOUND_ERROR);
        return;
    }
    var r = registry.get(banner.path);
    if (r == null || r.content == null) {
        response.sendError(404, FILE_NOT_FOUND_ERROR);
        return;
    }
    response.contentType = r.mediaType;
    print(r.content);
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

/**
 * Get the registry content and convert a previous dashboard json into a new version
 * @param registry Registry object
 * @param dashboard Dashboard name
 */
var getConvertedDashboardContent = function (registry, dashboard) {
    var dashboardJsonVersion = constants.DASHBOARD_VERSION;
    var dashboardContent = JSON.parse(registry.content(dashboard));
    if (dashboardContent) {
        if (!dashboardContent.version || dashboardContent.version !== dashboardJsonVersion) {
            dashboardContent.version = dashboardJsonVersion;
            dashboardContent.pages.forEach(function (page) {
                if (page.layout.content.loggedIn) {
                    page.views.content.default = page.layout.content.loggedIn;
                    page.views.content.default.name = constants.DEFAULT_VIEW_NAME;
                    page.views.content.default.roles = [constants.INTERNAL_EVERYONE_ROLE];
                    delete page.layout.content.loggedIn;
                }
                if (page.layout.content.anon) {
                    page.views.content.anon.name = constants.ANONYMOUS_VIEW_NAME;
                    page.views.content.anon.roles = [constants.ANONYMOUS_ROLE];
                    delete page.layout.content.anon;
                }
            });
            var path = registryPath(dashboardContent.id);
            registry.put(path, {
                content: JSON.stringify(dashboardContent),
                mediaType: 'application/json'
            });
        }
    }
    return dashboardContent;
};
