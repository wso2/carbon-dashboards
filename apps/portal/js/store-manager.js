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
var getAsset;
var getAssets;
var addAsset;
var deleteAsset;
var getDashboardsFromRegistry;
var getListOfStore;
var downloadAsset;

(function () {
    var log = new Log();

    var carbon = require('carbon');
    var utils = require('/modules/utils.js');
    var moduleDashboards = require('/modules/dashboards.js');
    var config = require('/modules/config.js').getConfigFile();
    var constants = require('/modules/constants.js');

    /**
     * Default Store.
     * @const
     * */
    var DEFAULT_STORE_TYPE = 'fs';
    /**
     * Legacy store type.
     * @const
     * */
    var LEGACY_STORE_TYPE = 'store';
    /**
     * Store extension location.
     * @const
     * */
    var STORE_EXTENSIONS_LOCATION = '/extensions/stores/';
    /**
     * Default thumbnail location.
     * @const
     * */
    var DEFAULT_THUMBNAIL = 'local://images/gadgetIcon.png';

    /**
     * Get the registry path.
     * @param id {Number}
     * @return {String}
     * @private
     * */
    var registryPath = function (id) {
        var path = '/_system/config/ues/dashboards';
        return id ? path + '/' + id : path;
    };

    /**
     * Get the store extension script.
     * @param storeType {String}
     * @return {String}
     * @private
     * */
    var storeExtension = function (storeType) {
        return STORE_EXTENSIONS_LOCATION + storeType + '/index.js';
    };

    /**
     * Get dashboards from registry.
     * @param start {Number}
     * @param count {Number}
     * @param registry {String}
     * @return {Object}
     * */
    getDashboardsFromRegistry = function (start, count, registry) {
        if (!registry) {
            var server = new carbon.server.Server();
            registry = new carbon.registry.Registry(server, {
                system: true
            });
        }
        return registry.content(registryPath(), {
            start: start,
            count: count
        });
    };

    /**
     * Find dashboards.
     * @param ctx {Object}
     * @param type {String}
     * @param query {String}
     * @param start {Number}
     * @param count {Number}
     * @return {Object}
     * @private
     * */
    var findDashboards = function (ctx, type, query, start, count) {
        var databaseUtils = require('/modules/database-utils.js');
        if (!ctx.username) {
            return [];
        }
        var server = new carbon.server.Server();
        var registry = new carbon.registry.Registry(server, {
            system: true
        });
        var um = new carbon.user.UserManager(server, ctx.tenantId);
        var userRoles = um.getRoleListOfUser(ctx.username);

        var dashboards = getDashboardsFromRegistry(start, count, registry);
        var superTenantDashboards = null;
        var superTenantRegistry = null;

        if (ctx.tenantId !== carbon.server.superTenant.tenantId) {
            utils.startTenantFlow(carbon.server.superTenant.tenantId);
            superTenantRegistry = new carbon.registry.Registry(server, {
                system: true,
                tenantId: carbon.server.superTenant.tenantId
            });
            superTenantDashboards = getDashboardsFromRegistry(start, count, superTenantRegistry);
            utils.endTenantFlow();
        }

        if (!dashboards && !superTenantDashboards) {
            return [];
        }

        var userDashboards = [];
        var allDashboards = [];

        if (dashboards) {
            dashboards.forEach(function (dashboard) {
                var contentDashboardJSON = moduleDashboards.getConvertedDashboardContent(registry, dashboard);
                if (dashboard == registryPath(contentDashboardJSON.id)) {

                    if (!(contentDashboardJSON.permissions).hasOwnProperty("owners")) {
                        contentDashboardJSON.permissions.owners = contentDashboardJSON.permissions.editors;
                    }
                    allDashboards.push(contentDashboardJSON);
                }
            });
        }
        if (superTenantDashboards) {
            utils.startTenantFlow(carbon.server.superTenant.tenantId);
            superTenantDashboards.forEach(function (dashboard) {
                var parsedDashboards = moduleDashboards.getConvertedDashboardContent(superTenantRegistry, dashboard);
                if (parsedDashboards.shareDashboard) {
                    if (!(parsedDashboards.permissions).hasOwnProperty("owners")) {
                        parsedDashboards.permissions.owners = parsedDashboards.permissions.editors;
                    }
                    allDashboards.push(parsedDashboards);
                }
            });
            utils.endTenantFlow();
        }
        if (allDashboards) {
            allDashboards.forEach(function (dashboard) {
                var permissions = dashboard.permissions;
                var isViewer = utils.allowed(userRoles, permissions.viewers);
                var isEditor = utils.allowed(userRoles, permissions.editors);
                var isOwner = utils.allowed(userRoles, permissions.owners);
                var data = {
                    id: dashboard.id,
                    title: dashboard.title,
                    description: dashboard.description,
                    pagesAvailable: dashboard.hideAllMenuItems ? false : utils.getUserAllowedViews(dashboard, userRoles),
                    editable: !(dashboard.shareDashboard && ctx.tenantId !== carbon.server.superTenant.tenantId),
                    shared: (dashboard.shareDashboard && ctx.tenantId !== carbon.server.superTenant.tenantId),
                    sharedAcrossTenants: (dashboard.shareDashboard && ctx.tenantId === carbon.server.superTenant.tenantId),
                    defective: databaseUtils.checkDefectiveDashboard(dashboard.id, (!isEditor && !isOwner && isViewer)),
                    owner: true
                };
                if (isOwner && !data.shared) {
                    userDashboards.push(data);
                    return;
                }
                if (isEditor && !data.shared) {
                    data.owner = false;
                    userDashboards.push(data);
                    return;
                }
                if (isViewer || data.shared) {
                    data.editable = false;
                    data.owner = false;
                    userDashboards.push(data);
                }
            });
        }
        return userDashboards;
    };

    /**
     * To provide backward compatibility for gadgets
     * @param url
     * @param storeType
     * @returns corrected url
     * @private
     */
    var fixLegacyURL = function (url, storeType) {
        if (url) {
            var index = url.indexOf('://');
            var currentStore = url.substring(0, index);
            if (currentStore === LEGACY_STORE_TYPE) {
                return url.replace(LEGACY_STORE_TYPE, DEFAULT_STORE_TYPE);
            }
        } else {
            log.error('url is not defined in asset.json file');
        }
        return storeType.concat('://' + url);
    };

    /**
     * Get the list of stores from the designer config.
     * @return types {Object}
     * */
    getListOfStore = function () {
        if (!config.store.types || config.store.types.length <= 0) {
            return null;
        }
        return config.store.types;
    };

    /**
     * Find an asset based on the type and asset id
     * @param type
     * @param id
     * @param isShared
     * @returns {*}
     */
    getAsset = function (type, id, isShared) {
        var ctx = utils.currentContext();
        var server = new carbon.server.Server();
        var storeTypes = config.store.types;
        var um;
        var userRoles;
        var asset;

        if (!isShared || !user || user.domain === String(carbon.server.superTenant.domain)) {
            if (user) {
                um = new carbon.user.UserManager(server, ctx.tenantId);
                userRoles = um.getRoleListOfUser(ctx.username);
            } else {
                userRoles = [constants.ANONYMOUS_ROLE];
            }
        }
        for (var i = 0; i < storeTypes.length; i++) {
            var specificStore = require(storeExtension(storeTypes[i]));
            asset = specificStore.getAsset(type, id);
            if (asset) {
                var allowedRoles = asset.allowedRoles;
                if (userRoles && allowedRoles && !utils.allowed(userRoles, allowedRoles)) {
                    return {};
                }
                break;
            }
        }
        return asset;
    };

    /**
     * Fetch assets from all the plugged in stores and aggregate
     * @param type
     * @param query
     * @param start
     * @param count
     * @returns {Array}
     */
    getAssets = function (type, query, start, count, storeType) {
        var ctx = utils.currentContext();
        if (type === 'dashboard') {
            return findDashboards(ctx, type, query, start, count);
        }
        var server = new carbon.server.Server();
        var um = new carbon.user.UserManager(server, ctx.tenantId);
        var userRoles = um.getRoleListOfUser(ctx.username);
        var allAssets = [];
        var storeTypes = config.store.types;
        for (var i = 0; i < storeTypes.length; i++) {
            if ((storeType && storeTypes[i] === storeType) || !storeType) {
                try {
                    var specificStore = require(storeExtension(storeTypes[i]));
                    var assets = specificStore.getAssets(type, query);
                    var isDownloadable = specificStore.isDownloadable();
                    var isDeletable = specificStore.isDeletable();
                    if (assets) {
                        for (var j = 0; j < assets.length; j++) {
                            var allowedRoles = assets[j].allowedRoles;
                            if (allowedRoles && !utils.allowed(userRoles, allowedRoles)) {
                                assets.splice(j, 1);
                            } else {
                                if (assets[j].thumbnail) {
                                    assets[j].thumbnail = fixLegacyURL(assets[j].thumbnail, storeTypes[i]);
                                } else {
                                    log.warn('Thumbnail url is missing in ' + assets[j].title);
                                    assets[j].thumbnail = DEFAULT_THUMBNAIL;
                                }
                                if (type === constants.GADGET_TYPE && assets[j].data && assets[j].data.url) {
                                    assets[j].data.url = fixLegacyURL(assets[j].data.url, storeTypes[i]);
                                } else if (type === constants.LAYOUT_TYPE && assets[j].url) {
                                    assets[j].url = fixLegacyURL(assets[j].url, storeTypes[i]);
                                } else {
                                    log.warn('Url is not defined for ' + assets[j].title);
                                }
                                assets[j].isDownloadable = isDownloadable;
                                assets[j].isDeletable = isDeletable;
                                assets[j].storeType = storeTypes[i];
                            }
                        }
                        allAssets = assets.concat(allAssets);
                    }
                } catch (error) {
                    log.error("Error in loading the store type " + storeTypes[i]);
                }
            }
        }
        var end = start + count;
        end = end > allAssets.length || end < 0 ? allAssets.length : end;
        allAssets = allAssets.slice(start, end);
        return allAssets;
    };

    /**
     * To add a asset to a relevant store
     * @param {String} type Type of the asset to be added
     * @param {String} id Id of the asset to be added
     * @param {File} assertFile File which contains the asset
     * @param {String} storeType Store type to add the asset
     * @returns {*}
     */
    addAsset = function (type, id, assertFile, storeType) {
        var storeTypes = config.store.types;
        var storeTypesLength = config.store.types.length;
        var databaseUtils = require('/modules/database-utils.js');

        for (var i = 0; i < storeTypesLength; i++) {
            if (storeType === storeTypes[i]) {
                var specificStore = require(storeExtension(storeTypes[i]));
                if (type === 'gadget') {
                    databaseUtils.updateGadgetState(id, {newState: 'ACTIVE'});
                }
                return specificStore.addAsset(type, id, assertFile);
            }
        }
    };

    /**
     * To delete a asset
     * @param {String} type Type of the asset to be deleted
     * @param {String} id ID of the asset
     * @param {String} storeType Store type asset belongs to
     */
    deleteAsset = function (type, id, storeType) {
        var storeTypes = config.store.types;
        var storeTypesLength = config.store.types.length;
        for (var i = 0; i < storeTypesLength; i++) {
            if (storeType === storeTypes[i]) {
                var specificStore = require(storeExtension(storeTypes[i]));
                return specificStore.deleteAsset(type, id);
            }
        }
    };

    /**
     * Get the download path for asset.
     * @param type {String} asset type
     * @param id {String} asset ID
     * @param storeType {String} store type which asset belongs to
     * @return {String}
     * */
    downloadAsset = function (type, id, storeType) {
        var storeTypes = config.store.types;
        var storeTypesLength = storeTypes.length;
        for (var i = 0; i < storeTypesLength; i++) {
            if (storeType === storeTypes[i]) {
                var store = require(storeExtension(storeType));
                return store.getAssetFilePath(type, id);
            }
        }
        return null;
    }
}());