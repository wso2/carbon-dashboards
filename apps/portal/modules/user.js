var current;
var login;
var logout;
var authorized;
var roles;
var searchRoles;
var maxRolesLimit;

(function () {
    var log = new Log();
    var editorRole = "editor";
    var viewerRole = "viewer";
    var ownerRole = "owner";
    var carbon = require('carbon');
    var server = new carbon.server.Server();

    current = function () {
        var user = session.get('user');
        if (!user) {
            return null;
        }
        user.domain = String(user.domain);
        return user;
    };

    login = function (username, password) {
        try {
            if (!server.authenticate(username, password)) {
                return false;
            }
        } catch (e) {
            log.error("Error when authenticating the user", e);
            return false;
        }

        var user = carbon.server.tenantUser(username);
        var utils = require('/modules/utils.js');
        var um = new carbon.user.UserManager(server, user.tenantId);
        user.roles = um.getRoleListOfUser(user.username);
        try {
            utils.handlers('login', user);
        } catch (e) {
            log.error(e);
            return false;
        }
        session.put('user', user);
        return true;
    };

    logout = function () {
        var utils = require('/modules/utils.js');
        var user = current();
        try {
            utils.handlers('logout', user);
        } catch (e) {
            log.error(e);
            return;
        }
        session.remove('user');
    };

    authorized = function (perm, action) {
        return true;
    };

    roles = function () {
        var user = session.get('user');
        var um = new carbon.user.UserManager(server, user.tenantId);
        return um.allRoles();
    };

    searchRoles = function (filter, maxItems) {
        var user = session.get('user');
        var um = new carbon.user.UserManager(server, user.tenantId);
        return um.searchRoles(filter, maxItems, true, true, true);
    };

    maxRolesLimit = function () {
        var user = session.get('user');
        var um = new carbon.user.UserManager(server, user.tenantId);
        var map = um.getMaxLimit('MaxRoleNameListLength');
        return map.get("PRIMARY");
    };

    createRoles = function (id) {
        var user = session.get('user');
        var userManager = new carbon.user.UserManager(server, user.tenantId);
        try {
            var users = [user.username];
            if (!userManager.roleExists("Internal/" + id + "-" + editorRole)) {
                userManager.addRole("Internal/" + id + "-" + editorRole, users, null);
            }
            if (!userManager.roleExists("Internal/" + id + "-" + viewerRole)) {
                userManager.addRole("Internal/" + id + "-" + viewerRole, users, null);
            }
            if (!userManager.roleExists("Internal/" + id + "-" + ownerRole)) {
                userManager.addRole("Internal/" + id + "-" + ownerRole, users, null);
            }
        } catch (e) {
            log.error(e);
        }
    };

    removeRoles = function (id) {
        var user = session.get('user');
        var userManager = new carbon.user.UserManager(server, user.tenantId);
        try {
            if (userManager.roleExists("Internal/" + id + "-" + editorRole)) {
                userManager.removeRole("Internal/" + id + "-" + editorRole);
            }
            if (userManager.roleExists("Internal/" + id + "-" + viewerRole)) {
                userManager.removeRole("Internal/" + id + "-" + viewerRole);
            }
            if (userManager.roleExists("Internal/" + id + "-" + ownerRole)) {
                userManager.removeRole("Internal/" + id + "-" + ownerRole);
            }
        } catch (e) {
            log.error(e);
        }
    };
}());
