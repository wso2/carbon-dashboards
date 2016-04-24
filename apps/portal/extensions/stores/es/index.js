var findOne, find,update, remove;
var utils = require('/modules/utils.js');

(function () {
    var log = new Log();

    var dir = '/store/';

    var utils = require('/modules/utils.js');

    var assetsDir = function (ctx, storeType, type) {
        var carbon = require('carbon');
        var config = require('/configs/designer.json');
        var domain = config.shareStore ? carbon.server.superTenant.domain : ctx.domain;
        return dir + domain + '/' + storeType + '/' + type + '/';
    };

    findOne = function (storeType,type, id) {
        var ctx = utils.currentContext();
        var parent = assetsDir(ctx, storeType, type);
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

    find = function (storeType,type, query, start, count) {
        var ctx = utils.currentContext();
        var parent = new File(assetsDir(ctx, storeType, type));
        var assetz = parent.listFiles();
        var assets = [];
        query = query ? new RegExp(query, 'i') : null;
        assetz.forEach(function (file) {
            if (!file.isDirectory()) {
                return;
            }
            file = new File(file.getPath() + '/' + type + '.json');
            if (file.isExists()) {
                file.open('r');
                var asset = JSON.parse(file.readAll());
                if (!query) {
                    assets.push(asset);
                    file.close();
                    return;
                }
                var title = asset.title || '';
                if (!query.test(title)) {
                    file.close();
                    return;
                }
                assets.push(asset);
                file.close();
            }
        });

        var end = start + count;
        end = end > assets.length ? assets.length : end;
        assets = assets.slice(start, end);
        return assets;
    };

    update = function (asset) {

    };

    remove = function (id) {

    };
}());