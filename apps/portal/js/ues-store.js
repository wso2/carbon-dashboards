/**
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * -------------------------------------------------------------------------
 * This will auto deploy all available dashboards in the extensions/dashboards
 */
(function () {
    var domain = ues.global.urlDomain || ues.global.userDomain;
    var assetsUrl = ues.utils.relativePrefix() + 'apis/assets';
    var store = (ues.store = {});
    var SUPERTENANT_DOMAIN = "carbon.super";

    store.getStoreList = function (cb) {
        $.ajax({
            url: assetsUrl + '/storeList',
            method: "GET",
            contentType: "application/json",
            async: false,
            success: function (data) {
                cb(false, data);
            },
            error: function (data) {
                cb(true, data);
            }
        });
    };

    store.asset = function (type, id, cb) {
        $.ajax({
            url: assetsUrl + '/publicAssets/' + id + '?' + (domain ? 'domain=' + domain + '&' : '') + 'type=' + type,
            method: "GET",
            contentType: "application/json",
            async: false,
            success: function (data) {
                cb(false, data);
            },
            error: function (data) {
                cb(true, data);
            }
        });
    };

    store.sharedAsset = function (type, id, cb) {
        $.ajax({
            url: assetsUrl + '/publicAssets/' + id + '?' + (domain ? 'domain=' + SUPERTENANT_DOMAIN + '&' : '') + 'type=' + type + '&shared=true',
            method: "GET",
            contentType: "application/json",
            async: false,
            success: function (data) {
                cb(false, data);
            },
            error: function (data) {
                cb(true, data);
            }
        });
    };

    store.assets = function (type, paging, cb, storeType) {
        var query = 'type=' + type;
        query += domain ? '&domain=' + domain : '';
        if (paging) {
            query += paging.query ? '&query=' + paging.query : '';
            query += '&start=' + paging.start + '&count=' + paging.count;
        }
        if (storeType) {
            query += '&storeType=' + storeType;
        }
        $.get(assetsUrl + '?' + query, function (data) {
            cb(false, data);
        }, 'json');
    };

    store.downloadAsset = function (type, id, storeType, cb) {
        var query = 'type=' + type + "&storeType=" + storeType;
        query += domain ? '&domain=' + domain : '';
        $.ajax({
            url: assetsUrl + '/download/' + id + '?' + query,
            method: 'GET',
            contentType: "application/json",
            dataType: "json",
            async: false,
            success: function (data) {
                cb(false, data);
            },
            error: function (data) {
                cb(true, data);
            }
        });
    };

    store.deleteAsset = function (type, id, storeType, cb) {
        $.ajax({
            url: assetsUrl + '/' + id + '?' + (domain ? 'domain=' + domain + '&' : '') + 'type=' + type + '&storeType='
            + storeType,
            method: "DELETE",
            contentType: "application/json",
            async: false,
            success: function (data) {
                cb(false, data);
            },
            error: function (data) {
                cb(true, data);
            }
        });
    };
}());