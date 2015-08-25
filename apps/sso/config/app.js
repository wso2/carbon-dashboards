var configs = require('/config/sso.js').config();

var server = require('/modules/server.js');
server.init(configs);

var user = require('/modules/user.js');
user.init(configs);

var event = require('event');


var STORE_CONFIG_PATH = '/_system/config/sso/configs/sso.json';

var server = require('/modules/server.js');
server.init(configs);

var user = require('/modules/user.js');
user.init(configs);

var log = new Log();

event.on('tenantCreate', function (tenantId) {
    var carbon = require('carbon'),
        system = server.systemRegistry(tenantId);
    system.put(STORE_CONFIG_PATH, {
        content: JSON.stringify({
            "permissions": configs.permissions
        }),
        mediaType: 'application/json'
    });
});

event.on('tenantLoad', function (tenantId) {
    var carbon = require('carbon'),
        config = server.configs(tenantId),
        reg = server.systemRegistry(tenantId),
        um = server.userManager(tenantId);

    //check whether tenantCreate has been called
    if (!reg.exists(STORE_CONFIG_PATH)) {
    }
    event.emit('tenantCreate', tenantId);

    config[user.USER_OPTIONS] = {
        "permissions": configs.permissions
    };
});
