(function () {
    var prefix = ues.utils.relativePrefix();

    var domain = ues.global.urlDomain || ues.global.userDomain;

    ues.plugins.uris['es'] = function (uri) {
        return prefix + 'store/' + (domain ? domain + '/' : '') + 'es/' + uri;
    };
}());