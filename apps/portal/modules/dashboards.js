var log = new Log();

var carbon = require('carbon');
var utils = require('/modules/utils.js');

/**
 * get registry reference
 */
var getRegistry = function () {
    var server = new carbon.server.Server();
    return new carbon.registry.Registry(server, {
        system: true
    });
};

//TODO: what happen when the context is changed or mapped via reverse proxy
var registryPath = function (id) {
    var path = '/_system/config/ues/dashboards';
    return id ? path + '/' + id : path;
};

var registryUserPath = function (id, username) {
    var path = '/_system/config/ues/' + username + '/dashboards';
    return id ? path + '/' + id : path;
};

var findOne = function (id) {
    var registry = getRegistry();
    var usr = require('/modules/user.js');
    var user = usr.current();
    var path = registryPath(id);
    var originalDB;
    var isCustom = false;
    if (user) {
        var userDBPath = registryUserPath(id, user.username);
        var originalDBPath = registryPath(id);

        if(registry.exists(originalDBPath)){
            originalDB = JSON.parse(registry.content(originalDBPath));
        }

        if (registry.exists(userDBPath)) {
            path = userDBPath;
            isCustom = true;
        }
    }
    var content = registry.content(path);
    var dashboard = JSON.parse(content);
    if (dashboard) {
        dashboard.isUserCustom = isCustom;
        dashboard.isEditorEnable = false;

        if(originalDB){
            var carbon = require('carbon');
            var server = new carbon.server.Server();
            var um = new carbon.user.UserManager(server, user.tenantId);
            user.roles = um.getRoleListOfUser(user.username);

            for(var i = 0; i<user.roles.length; i++){
                for(var j=0; j<originalDB.permissions.editors.length; j++){
                    if(user.roles[i] == originalDB.permissions.editors[j]){
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

var find = function (paging) {
    var registry = getRegistry();
    var dashboards = registry.content(registryPath(), paging);
    var dashboardz = [];
    dashboards.forEach(function (dashboard) {
        dashboardz.push(JSON.parse(registry.content(dashboard)));
    });
    return dashboardz;
};

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
    userManager.denyRole('internal/everyone', path, 'read');
};

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

var remove = function (id) {
    var registry = getRegistry();
    var path = registryPath(id);
    if (registry.exists(path)) {
        registry.remove(path);
    }
};

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
 * Save banner in the registry
 * @param {String} dashboardId   ID of the dashboard
 * @param {String} username      Username
 * @param {String} filename      Name of the file
 * @param {String} mime mime     Type of the file
 * @param {Object} stream        Bytestream of the file
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
 * Delete dashboard banner (if the username is empty, then the default banner will be removed,
 * otherwise the custom banner for the user will be removed)
 * @param {String} dashboardId   ID of the dashboard
 * @param {String} username      Username
 */
var deleteBanner = function (dashboardId, username) {
    getRegistry().remove(registryBannerPath(dashboardId, username));
};

/**
 * Render banner
 * @param {String} dashboardId ID of the dashboard
 * @param {String} username    Username
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
    return;
};

/**
 * Path to customizations directory in registry
 * @returns {String}
 */
var registryCustomizationsPath = function () {
    return '/_system/config/ues/customizations';
};

/**
 * Get saved registry path for a banner
 * @param   {String} dashboardId ID of the dashboard
 * @param   {String} username    Current user's username
 * @returns {String}
 */
var registryBannerPath = function (dashboardId, username) {
    return registryCustomizationsPath() + '/' + dashboardId + (username ? '/' + username : '')
        + '/banner';
};

/**
 * Get banner details (banner type and the registry path)
 * @param   {String} dashboardId ID of the dashboard
 * @param   {String} username    Username
 * @returns {Object}
 */
var getBanner = function (dashboardId, username) {
    var registry = getRegistry();
    var path;
    var result = { globalBannerExists: false, customBannerExists: false, path: null };

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


