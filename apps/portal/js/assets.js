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
    var DEFAULT_STORE_TYPE = "fs";

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
    var editAssetConfirmHbs = Handlebars.compile($("#ds-edit-assets-confirm-hbs").html());
    var gadgetUsageConfimrHbs = Handlebars.compile($("#ds-gadget-usage-confirm-hbs").html());
    var editGadgetUsageConfirmHbs = Handlebars.compile($("#ds-gadget-usage-edit-confirm-hbs").html());
    var assetsEmptyHbs = Handlebars.compile($("#ds-assets-empty-hbs").html());
    var assetsDeleteErrorHbs = Handlebars.compile($("#ds-asset-delete-error-hbs").html());
    var DATABASE_API = ues.utils.tenantPrefix() + 'apis/database';
    var editGadgetUrl = ues.utils.tenantPrefix() + 'create-gadget';
    Handlebars.registerPartial('ds-asset-thumbnail-hbs', assetThumbnailHbs);
    /**
     * Load the list of assets available.
     * @private
     * */
    var listAssets = function (store) {
        isStillLoading = true;

        if (!hasMore) {
            isStillLoading = false;
            return;
        }

        var artifactStore = !store ? DEFAULT_STORE_TYPE : store;

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
        }, artifactStore);
    };

    /**
     * Get the list of stores available.
     * @return null
     * @private
     * */
    var getListOfStores = function () {
        ues.store.getStoreList(function (error, data) {
            if (!error && data) {
                var length = data.length;
                if (length > 1) {
                    for (var i = 0; i < length; i++) {
                        addStoreToList(data[i]);
                    }
                    $('#selectStore').show();
                }
                else {
                    $('#selectStore').replaceWith('<label id="storeLabel" class="control-label">' + data[0] + '</label>');
                }
                $('#storeSelector').show();
            } else {
                $('#storeSelector').hide();
            }
        });
    };

    /**
     * Add the store to the store list.
     * @param store {string}
     * @return null
     * @private
     * */
    var addStoreToList = function (store) {
        $('#selectStore').append('<option value="' + store + '">' + store.toUpperCase() + '</option>');
    };

    /**
     * Edit gadget
     * @param type {String}
     * @param id {String}
     * @param store {String}
     * */
    var editAsset = function (id) {
        var addParam = '?id=' + id + '&editable=true';
        url = editGadgetUrl + addParam;
        window.open(url);
    };

    /**
     * Download Assets as a ZIP.
     * @param type {String}
     * @param id {String}
     * @param store {String}
     * @private
     * */
    var downloadAsset = function (type, id, store) {
        ues.store.downloadAsset(type, id, store, function (error, data) {
            if (!error && data) {
                window.location = data;
            }
        });
    };

    /**
     * Clear existing gadgets in the DOM
     * @return null
     * @private
     * */
    var clearExistingGadgets = function () {
        $('#ds-assets-portal').find('.ds-assets').empty();
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
     * To get the gadget usage information for a particular gadget id
     * @param gadgetId Id of the gadget
     */
    var getGadgetUsageInfo = function (gadgetId) {
        var gadgetUsageData;
        $.ajax({
            url: DATABASE_API + '/' + gadgetId + '?task=usage',
            method: "GET",
            async: false,
            contentType: 'application/json',
            success: function (data) {
                gadgetUsageData = JSON.parse(data);
            }
        });
        return gadgetUsageData;
    };

    /**
     * To update the gadget state information in database
     * @param gadgetId Id of the gadget
     */
    var updateGadgetStateInfo = function (gadgetId) {
        var isSuccess = false;
        $.ajax({
            url: DATABASE_API + '/' + gadgetId + '?task=stateupdate',
            method: "POST",
            async: false,
            data: JSON.stringify({newState: "DELETED"}),
            contentType: 'application/json',
            success: function () {
                isSuccess = true;
            },
            error: function () {
                isSuccess = false;
            }
        });
        return isSuccess;
    };

    /**
     * To delete the asset with the given id
     * @param {String} id Id of the asset to be deleted
     * @private
     */
    var deleteAsset = function (id) {
        if (assetType !== 'gadget' || updateGadgetStateInfo(id)) {
            ues.store.deleteAsset(assetType, id, DEFAULT_STORE_TYPE, function (err, data) {
                if (err) {
                    $('#' + id).html(assetsDeleteErrorHbs(findAsset(id)));
                } else {
                    location.reload();
                }
            });
        } else {
            $('#' + id).html(assetsDeleteErrorHbs(findAsset(id)));
        }
    };

    /**
     * To manipulate the gadget usage info to create a warning message to user
     * @param usage Usage info of a particular gadget in dashboards
     * @returns {string} Warning message to be sent to user based on the usages of the gadget
     */
    var manipulateGadgetUsageInfo = function (usage) {
        var message = 'This gadget is used in ';
        var endMessage = " dashboard(s). This action on this gadget will affect the functionality of those dashboard(s)";
        var count = 0;
        for (var index = 0; index < usage.length && count < 2; index++) {
            if (usage[index].indexOf("$") > -1) {
                usage[index] = usage[index].substr(0, usage[index].indexOf("$"));
                usage[index] = "personalized version of " + usage[index];
                if (message.indexOf(usage[index]) > -1) {
                    usage[index] = "";
                    count--;
                }
            }
            if (index !== usage.length - 1) {
                count++;
                if (count === 2) {
                    message += usage[index] + "..." + endMessage;
                } else {
                    message += usage[index] + ','
                }
            } else {
                message += usage[index] + endMessage;
            }
        }
        return message;
    };

    /**
     * Initialize the UI functionality such as binding events.
     * @private
     * */
    var initUI = function () {
        var portal = $('#ds-assets-portal');
        var selectStore = $('#selectStore');

        getListOfStores();

        selectStore.selectpicker({
            style: 'btn-default',
            size: 4
        });

        selectStore.selectpicker('val', DEFAULT_STORE_TYPE);

        selectStore.on('change', function (e) {
            var optionSelected = $("option:selected", this);
            var store = optionSelected.val();
            hasMore = true;
            nextStart = 0;
            clearExistingGadgets();
            listAssets(store);
        });

        portal.on('click', '.ds-assets .ds-asset-trash-handle', function (e) {
            var gadgetUsageInfo;
            e.preventDefault();
            var assetElement = $(this).closest('.ds-asset');
            var id = assetElement.data('id');
            var asset = findAsset(id);
            if (assetType === 'gadget') {
                gadgetUsageInfo = getGadgetUsageInfo(id);
            }
            if (!gadgetUsageInfo || gadgetUsageInfo.dashboards.length === 0) {
                assetElement.html(assetConfirmHbs(asset));
            } else {
                gadgetUsageInfo = manipulateGadgetUsageInfo(gadgetUsageInfo.dashboards);
                var data = {title: asset.title};
                data.message = gadgetUsageInfo;
                assetElement.html(gadgetUsageConfimrHbs(data));
            }
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

        portal.on('click', '.ds-assets .ds-asset-download-handle', function (e) {
            var assetElement = $(this).closest('.ds-asset');
            var id = assetElement.data('id');
            var store = $('#selectStore').selectpicker('val');
            if (typeof(store) !== "string") {
                store = $("#storeLabel").text();
            }
            downloadAsset(assetType, id, store);
        });

        portal.on('click', '.ds-assets .ds-asset-edit-handle', function (e) {
            var gadgetUsageInfo;
            e.preventDefault();
            var assetElement = $(this).closest('.ds-asset');
            var id = assetElement.data('id');
            var asset = findAsset(id);
            if (assetType === 'gadget') {
                gadgetUsageInfo = getGadgetUsageInfo(id);
            }
            if (!gadgetUsageInfo || gadgetUsageInfo.dashboards.length === 0) {
                assetElement.html(editAssetConfirmHbs(asset));
            } else {
                gadgetUsageInfo = manipulateGadgetUsageInfo(gadgetUsageInfo.dashboards);
                var data = {title: asset.title};
                data.message = gadgetUsageInfo;
                assetElement.html(editGadgetUsageConfirmHbs(data));
            }
        });

        portal.on('click', '.ds-assets .ds-asset-edit-confirm', function (e) {
            e.preventDefault();
            var assetElement = $(this).closest('.ds-asset');
            var id = assetElement.data('id');
            editAsset(id);
        });

        portal.on('click', '.ds-assets .ds-asset-edit-cancel', function (e) {
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