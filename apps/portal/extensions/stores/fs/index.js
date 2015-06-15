var findOne, find, create, update, remove;
(function () {
    var log = new Log();

    var dir = '/store/';

    var utils = require('/modules/utils.js');

    var assetsDir = function (ctx, type) {
        var carbon = require('carbon');
        var config = require('/configs/designer.json');
        var domain = config.shareStore ? carbon.server.superTenant.domain : ctx.domain;
        return dir + domain + '/' + type + '/';
    };

    var allowed = function (roles, allowed) {
        var hasRole = function (role, roles) {
            var i;
            var length = roles.length;
            for (i = 0; i < length; i++) {
                if (roles[i] == role) {
                    return true;
                }
            }
            return false;
        };
        var i;
        var length = allowed.length;
        for (i = 0; i < length; i++) {
            if (hasRole(allowed[i], roles)) {
                return true;
            }
        }
        return false;
    };

    var registryPath = function (id) {
        var path = '/_system/config/ues/dashboards';
        return id ? path + '/' + id : path;
    };

    var findDashboards = function (ctx, type, query, start, count) {
        if (!ctx.username) {
            return [];
        }

        var carbon = require('carbon');
        var server = new carbon.server.Server();
        var registry = new carbon.registry.Registry(server, {
            system: true
        });
        var um = new carbon.user.UserManager(server);
        var userRoles = um.getRoleListOfUser(ctx.username);

        var dashboards = registry.content(registryPath(), {
            start: start,
            count: count
        });
        if (!dashboards) {
            return [];
        }
        var allDashboards = [];
        dashboards.forEach(function (dashboard) {
            allDashboards.push(JSON.parse(registry.content(dashboard)));
        });

        var userDashboards = [];
        allDashboards.forEach(function (dashboard) {
            var permissions = dashboard.permissions;
            if (allowed(userRoles, permissions.editors)) {
                userDashboards.push({
                    id: dashboard.id,
                    title: dashboard.title,
                    description: dashboard.description,
                    editable: true
                });
                return;
            }
            if (allowed(userRoles, permissions.viewers)) {
                userDashboards.push({
                    id: dashboard.id,
                    title: dashboard.title,
                    description: dashboard.description,
                    editable: false
                });
            }
        });
        return userDashboards;
    };

    findOne = function (type, id) {
        var ctx = utils.currentContext();
        var parent = assetsDir(ctx, type);
        var file = new File(parent + id);
        if (!file.isExists()) {
            return null;
        }
        file = new File(file.getPath() + '/' + type + '.json');
        if (!file.isExists()) {
            return null;
        }
        file.open('r');
        var asset = JSON.parse(file.readAll());
        file.close();
        return asset;
    };

    find = function (type, query, start, count) {
        var ctx = utils.currentContext();
        if (type === 'dashboard') {
            return findDashboards(ctx, type, query, start, count);
        }
        var parent = new File(assetsDir(ctx, type));
        var assetz = parent.listFiles();
        var assets = [];
        query = query ? new RegExp(query, 'i') : null;
        assetz.forEach(function (file) {
            if (!file.isDirectory()) {
                return;
            }
            file = new File(file.getPath() + '/' + type + '.json');
            file.open('r');
            var asset = JSON.parse(file.readAll());
            if (!query) {
                assets.push(asset);
                file.close();
                return;
            }
            var title = asset.title || '';
            var description = asset.description || '';
            if (!query.test(title) && !query.test(description)) {
                file.close();
                return;
            }
            assets.push(asset);
            file.close();
        });
        var end = start + count;
        end = end > assets.length ? assets.length : end;
        assets = assets.slice(start, end);
        return assets;
    };

    /*create = function (type, asset) {
     var user = currentContext();
     var parent = new File(assetsDir(user, type));
     var file = new File(asset.id, parent);
     file.mkdir();
     file = new File(type + '.json', file);
     file.open('w');
     file.write(JSON.stringify(asset));
     file.close();
     };*/

    update = function (asset) {

    };

    remove = function (id) {

    };
}());