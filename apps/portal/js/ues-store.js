(function () {

    var domain = ues.global.urlDomain || ues.global.userDomain;

    var assetsUrl = ues.utils.relativePrefix() + 'apis/assets';

    var store = (ues.store = {});

    store.asset = function (type, id, cb) {
        $.get(assetsUrl + '/' + id + '?' + (domain ? 'domain=' + domain + '&' : '') + 'type=' + type, function (data) {
            cb(false, data);
        }, 'json');
    };

    store.assets = function (type, paging, cb) {
        $.get(assetsUrl + '?' + (domain ? 'domain=' + domain + '&' : '') + 'start=' + paging.start + '&count=' + paging.count + '&type=' + type, function (data) {
            cb(false, data);
        }, 'json');
    };
}());