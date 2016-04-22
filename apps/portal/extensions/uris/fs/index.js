(function () {
    var prefix = ues.utils.relativePrefix();

    var domain = ues.global.urlDomain || ues.global.userDomain;

    ues.plugins.uris['store'] = function (uri) {
        return prefix + 'store/' + (domain ? domain + '/' : '') + uri;
    };
}());