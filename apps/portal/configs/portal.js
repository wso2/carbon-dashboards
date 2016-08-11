var config;
(function () {
    config = function () {
        var log = new Log();
        var pinch = require('/modules/pinch.min.js').pinch;
        var config = require('/modules/config.js').getConfigFile();
        var process = require('process');
        var localIP = process.getProperty('server.host');
        var httpPort = process.getProperty('http.port');
        var httpsPort = process.getProperty('https.port');
        var carbonLocalIP = process.getProperty('carbon.local.ip');

        pinch(config, /^/, function (path, key, value) {
            if ((typeof value === 'string') && value.indexOf('%https.host%') > -1) {
                return value.replace('%https.host%', 'https://' + localIP + ':' + httpsPort);
            } else if ((typeof value === 'string') && value.indexOf('%http.host%') > -1) {
                return value.replace('%http.host%', 'http://' + localIP + ':' + httpPort);
            } else if ((typeof value === 'string') && value.indexOf('%https.carbon.local.ip%') > -1) {
                return value.replace('%https.carbon.local.ip%', 'https://' + carbonLocalIP + ':' + httpsPort);
            }
            else if ((typeof value === 'string') && value.indexOf('%http.carbon.local.ip%') > -1) {
                return value.replace('%http.carbon.local.ip%', 'http://' + carbonLocalIP + ':' + httpPort);
            }
            return  value;
        });
        return config;
    };
})();