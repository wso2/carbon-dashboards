var log = new Log();

var carbon = require('carbon');
var utils = require('/modules/utils.js');

//TODO: what happen when the context is changed or mapped via reverse proxy
var registryPath = function (id) {
    var path = '/_system/config/ues/dashboards';
    return id ? path + '/' + id : path;
};

var registryUserPath = function (id, username) {
    var path = '/_system/config/ues/'+ username + '/dashboards';
    return id ? path + '/' + id : path;
};


var findOne = function (id) {
    var server = new carbon.server.Server();
    var registry = new carbon.registry.Registry(server, {
        system: true
    });
    var usr = require('/modules/user.js');
    var user = usr.current();
    if(!user){
        return;
        //throw 'User is not logged in ';
    }
    var isCustom = false;
    var path = registryUserPath(id, user.username);
    if (!registry.exists(path)) {
        path = registryPath(id);
    }else{
        isCustom = true;
    }
    var content = registry.content(path);
    var dashboard = JSON.parse(content)
    if(dashboard){
        dashboard.isUserCustom = isCustom;
    }
    return dashboard;
};

var find = function (paging) {
    var server = new carbon.server.Server();
    var registry = new carbon.registry.Registry(server, {
        system: true
    });
    var dashboards = registry.content(registryPath(), paging);
    var dashboardz = [];
    dashboards.forEach(function (dashboard) {
        dashboardz.push(JSON.parse(registry.content(dashboard)));
    });
    return dashboardz;
};

var create = function (dashboard) {
    var server = new carbon.server.Server();
    var registry = new carbon.registry.Registry(server, {
        system: true
    });
    var path = registryPath(dashboard.id);
    if (registry.exists(path)) {
        throw 'a dashboard exists with the same id ' + dashboard.id;
    }
    registry.put(path, {
        content: JSON.stringify(dashboard),
        mediaType: 'application/json'
    });
};

var update = function (dashboard) {
    var server = new carbon.server.Server();
    var registry = new carbon.registry.Registry(server, {
        system: true
    });

    var path = registryUserPath(dashboard.id, user.username);
    if (!registry.exists(path)) {
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
    var server = new carbon.server.Server();
    var registry = new carbon.registry.Registry(server, {
        system: true
    });
    var usr = require('/modules/user.js');
    var user = usr.current();
    if(!user){
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
    var server = new carbon.server.Server();
    var registry = new carbon.registry.Registry(server, {
        system: true
    });
    var usr = require('/modules/user.js');
    var user = usr.current();
    if(!user){
        throw 'User is not logged in ';
    }
    var path = registryUserPath(id, user.username);
    if (registry.exists(path)) {
        registry.remove(path);
    }

};

var remove = function (id) {
    var server = new carbon.server.Server();
    var registry = new carbon.registry.Registry(server, {
        system: true
    });
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