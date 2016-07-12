/*
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
 */

$(function () {
    var assets = [];
    var isStillLoading = false;
    var nextStart = 0;
    var hasMore = true;
    /**
     * Store type
     * @const
     */
    var STORE_TYPE = "fs";

    /**
     * gadget count.
     * @const
     */
    var ASSET_COUNT = 10;
    var assetType = (window.location.pathname.indexOf("/gadget") > -1) ? "gadget" : "layout";

    // Pre-compiling handlebar templates
    var assetsListHbs = Handlebars.compile($("#ds-assets-list-hbs").html());
    var assetThumbnailHbs = Handlebars.compile($("#ds-asset-thumbnail-hbs").html());
    var assetConfirmHbs = Handlebars.compile($("#ds-asset-confirm-hbs").html());
    var assetsEmptyHbs = Handlebars.compile($("#ds-assets-empty-hbs").html());
    var assetsDeleteErrorHbs = Handlebars.compile($("#ds-asset-delete-error-hbs").html());
    Handlebars.registerPartial('ds-asset-thumbnail-hbs', assetThumbnailHbs);


    /**
     * Load the list of assets available.
     * @private
     * */
    var listAssets = function () {
        isStillLoading = true;

        if (!hasMore) {
            isStillLoading = false;
            return;
        }
        ues.store.assets(assetType, {
            start: nextStart,
            count: ASSET_COUNT
        }, function (err, data) {
            var assetsEl = $('#ds-assets-portal').find('.ds-assets');
            hasMore = data.length;
            if (!hasMore && nextStart === 0) {
                assetsEl.append(assetsEmptyHbs());
                return;
            }
            nextStart += ASSET_COUNT;
            assets = assets.concat(data);
            assetsEl.append(assetsListHbs(data));
            var win = $(window);
            var doc = $(document);
            isStillLoading = false;
            if (doc.height() > win.height()) {
                return;
            }
            listAssets();
        }, STORE_TYPE);
    };

    /**
     * Find the gadget using gadget id.
     * @param {String} id ID of the asset of interest
     * @return {object} Asset requested
     * @private
     * */
    var findAsset = function (id) {
        for (var index = 0; index < assets.length; index++) {
            var asset = assets[index];
            if (asset.id === id) {
                return asset;
            }
        }
    };

    /**
     * To delete the asset with the given id
     * @param {String} id Id of the asset to be deleted
     * @private
     */
    var deleteAsset = function (id) {
        ues.store.deleteAsset(assetType, id, STORE_TYPE, function (err, data) {
            if (err) {
                $('#'+id).html(assetsDeleteErrorHbs(findAsset(id)));
            } else {
                location.reload();
            }
        });
    };

    /**
     * Initialize the UI functionality such as binding events.
     * @private
     * */
    var initUI = function () {
        var portal = $('#ds-assets-portal');
        portal.on('click', '.ds-assets .ds-asset-trash-handle', function (e) {
            e.preventDefault();
            var assetElement = $(this).closest('.ds-asset');
            var id = assetElement.data('id');
            var asset = findAsset(id);
            assetElement.html(assetConfirmHbs(asset));
        });

        portal.on('click', '.ds-assets .ds-asset-trash-confirm', function (e) {
            e.preventDefault();
            deleteAsset($(this).closest('.ds-asset').data('id'));
        });

        portal.on('click', '.ds-assets .ds-asset-trash-cancel', function (e) {
            e.preventDefault();
            var assetElement = $(this).closest('.ds-asset');
            var id = assetElement.data('id');
            var asset = findAsset(id);
            assetElement.html(assetThumbnailHbs(asset));
        });

        portal.on('click', '.ds-assets .close', function (e) {
            e.preventDefault();
            var assetElement = $(this).closest('.ds-asset');
            var id = assetElement.data('id');
            var asset = findAsset(id);
            assetElement.html(assetThumbnailHbs(asset));
        });

        $(window).scroll(function () {
            var win = $(window);
            var doc = $(document);
            if (win.scrollTop() + win.height() < doc.height() - 100) {
                return;
            }
            if (!isStillLoading) {
                listAssets();
            }
        });
    };

    initUI();
    listAssets();
});