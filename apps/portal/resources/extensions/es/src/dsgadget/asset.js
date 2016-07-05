/**
 *  Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */

asset.manager = function (ctx) {
    /**
     * Name of the asset.
     * @const
     * @private
     */
    var ASSET_NAME = 'dsgadget';

    /**
     * Root directory for the gadget extension.
     * @const
     * @private
     */
    var GADGET_EXT_PATH = "/extensions/assets/" + ASSET_NAME;
    var COMMENT = 'User comment';

    var utils = require(GADGET_EXT_PATH + '/utils.js');
    var portalConfigs = require(GADGET_EXT_PATH + "/configs/portal.json");
    var es = require("store").server;
    var notifier = require('store').notificationManager;
    var storeConstants = require('store').storeConstants;
    var carbon = require('carbon');

    var registry = es.systemRegistry(ctx.tenantId);
    var social = carbon.server.osgiService('org.wso2.carbon.social.core.service.SocialActivityService');
    var HttpPost = org.apache.http.client.methods.HttpPost;
    var HttpDelete = org.apache.http.client.methods.HttpDelete;
    var FileInputStream = Packages.java.io.FileInputStream;
    var MultipartEntityBuilder = Packages.org.apache.http.entity.mime.MultipartEntityBuilder;
    var HttpMultipartMode = Packages.org.apache.http.entity.mime.HttpMultipartMode;
    var ContentType = Packages.org.apache.http.entity.ContentType;
    var HttpClientBuilder = Packages.org.apache.http.impl.client.HttpClientBuilder;
    var MultitenantUtils = Packages.org.wso2.carbon.utils.multitenancy.MultitenantUtils;
    var ResponseHandler = Packages.org.apache.http.impl.client.BasicResponseHandler;
    var builder = MultipartEntityBuilder.create();
    var domain = MultitenantUtils.getTenantDomain(session.get("LOGGED_IN_USER"));

    /**
     * Post the gadget archive to the associated dashboard server.
     * @param {String} gadgetId Gadget ID
     * @returns {boolean} Status
     * @private
     */
    var uploadGadgetToDS = function (assetId, gadgetId, version) {
        if (portalConfigs.url.length > 0) {
            var zipFileName = utils.getPublisherDir() + GADGET_EXT_PATH + '/' + utils.gadgetsDirectoryLabel + '/' + assetId + utils.gadgetExtension;
            var post = null;
            var client;
            var response;
            var inputStream;
            var responseBody;

            // If authenticate passes, send gadget to DS side with relevant parameters
            responseBody = loginToDS();
            if (responseBody) {
                post = new HttpPost(portalConfigs.url + '/t/' + domain + utils.assetsAPI);
                inputStream = new FileInputStream(zipFileName);
                builder = MultipartEntityBuilder.create();
                builder.setMode(HttpMultipartMode.BROWSER_COMPATIBLE);
                builder.addBinaryBody("selected-file", inputStream, ContentType.create("application/zip"), gadgetId);
                builder.addTextBody("id", gadgetId);
                builder.addTextBody("version", version);
                builder.addTextBody("storeType", portalConfigs.storeType);
                builder.addTextBody("type", portalConfigs.type);
                post.setEntity(builder.build());
                post.addHeader("cookie", "JSESSIONID=" + parse(String(responseBody)).sessionId);
                client = HttpClientBuilder.create().build();
                response = client.execute(post);
                if (response.getStatusLine().getStatusCode() !== utils.HTTP_SUCCESS_CODE) {
                    return false;
                }
                return true;
            }
        }
        return true;
    };

    var loginToDS = function () {
        if (portalConfigs.url.length > 0) {
            // Authenticate the user for DS side
            var builder = MultipartEntityBuilder.create();
            var client = HttpClientBuilder.create().build();
            var response;
            var post = new HttpPost(portalConfigs.url + '/apis/login');

            builder.addTextBody("username", portalConfigs.username);
            builder.addTextBody("password", portalConfigs.password);
            post.setEntity(builder.build());
            response = client.execute(post);

            // If authentication fails, return
            if (response.getStatusLine().getStatusCode() !== utils.HTTP_SUCCESS_CODE) {
                return false;
            } else {
                return new ResponseHandler().handleResponse(response);
            }
        }
        return false;
    };


    /**
     * Remove the gadget archive from the associated dashboard server.
     * @param {String} gadgetId Gadget ID
     * @returns {boolean} Status
     * @private
     */
    var removeGadgetFromDS = function (gadgetId, version) {
        if (portalConfigs.url.length > 0) {
            var client;
            var response;
            var del;
            var responseBody = loginToDS();
            if (responseBody) {
                del = new HttpDelete(portalConfigs.url + '/t/' + domain + utils.assetsAPI + '/' + gadgetId +
                    portalConfigs.delimiter + version + '?storeType=' + portalConfigs.storeType + '&type=' + portalConfigs.type);
                del.addHeader("cookie", "JSESSIONID=" + parse(String(responseBody)).sessionId);
                client = HttpClientBuilder.create().build();
                response = client.execute(del);
                if (response.getStatusLine().getStatusCode() !== utils.HTTP_SUCCESS_CODE) {
                    return false;
                }
                return true;
            }
            return false;
        }
        return true;
    };

    /**
     * Delete gadget from the ES directory structure.
     * @param {String} assetId Asset ID
     * @return {null}
     * @private
     */
    var deleteGadget = function (assetId) {
        var gadget = new File(GADGET_EXT_PATH + '/' + utils.gadgetsDirectoryLabel + '/' + assetId + utils.gadgetExtension);
        if (gadget.isExists()) {
            gadget.del();
        }
    };

    /**
     * Save gadget in the ES directory structure.
     * @param {String} assetId Asset ID
     * @returns {boolean} Status
     * @private
     */
    var saveGadget = function (assetId) {
        var gadgetFile = request.getFile(utils.gadgetZipFileNameInRegistry);
        var gadgetsMainDirectory = new File(GADGET_EXT_PATH + '/' + utils.gadgetsDirectoryLabel);
        var gadget = null;

        if (!gadgetFile) {
            return;
        } else if (gadgetFile.getLength() / utils.BYTES_TO_MB > portalConfigs.gadgetFileSizeLimit) {
            log.error("Max gadget size limit exceeded.");
            return;
        }
        if (!gadgetsMainDirectory.isExists()) {
            gadgetsMainDirectory.mkdir();
        }
        // Build the gadget archive file name. Extension of the gadget archive is set to .gdt as .zip files
        // will be automatically deployed.
        deleteGadget(assetId);

        try {
            // Save the gadget
            var gadget = new File(GADGET_EXT_PATH + '/' + utils.gadgetsDirectoryLabel + '/' + assetId + utils.gadgetExtension);
            gadget.open('w');
            gadget.write(gadgetFile.getStream());
            return true;
        } catch (e) {
            log.error("Error saving DS gadgets")
        } finally {
            if (gadget !== null) {
                gadget.close();
            }

        }
    };

    /**
     * Build gadget json file and repack the gadget before deploying.
     * @param options
     * @return {Boolean} Status
     */
    var buildGadgetJson = function (options) {
        var assetId = options.id;
        var zipFile = new File(GADGET_EXT_PATH + '/' + utils.gadgetsDirectoryLabel + '/' + assetId + utils.gadgetExtension);
        var gadgetJSONFile = null;
        var res = {
            id: options.attributes.overview_id,
            title: options.attributes.overview_name,
            type: options.attributes.overview_type,
            category: options.attributes.overview_gadgetcategory,
            thumbnail: options.attributes.overview_thumbnailurl,
            description: options.attributes.overview_description,
            version: options.attributes.overview_version,
            data: {
                url: options.attributes.overview_gadgetxmlurl
            }
        };

        if (options.attributes.hasOwnProperty('settings_Key')) {
            res.settings = {};
            if (typeof options.attributes.settings_Key == 'object') {
                for (var i = 0; i < options.attributes.settings_Key.length; i++) {
                    res.settings[options.attributes.settings_Key[i]] = options.attributes.settings_Value[i];
                }
            } else {
                res.settings[options.attributes.settings_Key] = options.attributes.settings_Value;
            }
        }

        if (options.attributes.hasOwnProperty('styles_Key')) {
            res.styles = {};
            if (typeof options.attributes.styles_Key == 'object') {
                for (var i = 0; i < options.attributes.styles_Key.length; i++) {
                    res.styles[options.attributes.styles_Key[i]] = options.attributes.styles_Value[i];
                }
            } else {
                res.styles[options.attributes.styles_Key] = options.attributes.styles_Value;
            }
        }

        if (options.attributes.hasOwnProperty('options_Key')) {
            res.options = {};
            if (typeof options.attributes.options_Key == 'object') {
                for (var i = 0; i < options.attributes.options_Key.length; i++) {
                    res.options[options.attributes.options_Key[i]] = {
                        type: options.attributes.options_Type[i]
                    };
                }
            } else {
                res.options[options.attributes.options_Key] = {
                    type: options.attributes.options_Type
                };
            }
        }

        if (options.attributes.hasOwnProperty('notifiers_Event')) {
            res.notify = {};
            if (typeof options.attributes.notifiers_Event == 'object') {
                for (var i = 0; i < options.attributes.notifiers_Event.length; i++) {
                    res.notify[options.attributes.notifiers_Event[i]] = {
                        type: options.attributes.notifiers_DataType[i],
                        description: options.attributes.notifiers_Description[i]
                    };
                }
            } else {
                res.notify[options.attributes.notifiers_Event] = {
                    type: options.attributes.notifiers_DataType,
                    description: options.attributes.notifiers_Description
                };
            }
        }

        if (options.attributes.hasOwnProperty('listeners_Event')) {
            res.listen = {};
            if (typeof options.attributes.listeners_Event == 'object') {
                for (var i = 0; i < options.attributes.listeners_Event.length; i++) {
                    res.listen[options.attributes.listeners_Event[i]] = {
                        type: options.attributes.listeners_DataType[i],
                        description: options.attributes.listeners_Description[i]
                    };
                }
            } else {
                res.listen[options.attributes.listeners_Event] = {
                    type: options.attributes.listeners_DataType,
                    description: options.attributes.listeners_Description
                };
            }
        }
        res.id = res.id + portalConfigs.delimiter + res.version;
        if (res.thumbnail && res.thumbnail.indexOf(utils.gadgetDSDirectory + options.attributes.overview_id) === 0) {
            res.thumbnail = res.thumbnail.replace(utils.gadgetDSDirectory + options.attributes.overview_id,
                utils.gadgetDSDirectory + res.id);
        }
        if (res.data.url && res.data.url.indexOf(utils.gadgetDSDirectory + options.attributes.overview_id) === 0) {
            res.data.url = res.data.url.replace(utils.gadgetDSDirectory + options.attributes.overview_id,
                utils.gadgetDSDirectory + res.id);
        }
        // If zip file exists
        if (zipFile.isExists()) {
            zipFile.unZip(GADGET_EXT_PATH + '/' + utils.gadgetsDirectoryLabel + '/' + utils.gadgetTempDirectoryLabel + '/' + assetId);
            try {
                gadgetJSONFile = new File(GADGET_EXT_PATH + '/' + utils.gadgetsDirectoryLabel + '/' + utils.gadgetTempDirectoryLabel
                    + '/' + assetId + "/gadget.json");
                gadgetJSONFile.open("w");
                gadgetJSONFile.write(res);
            } catch (e) {
                log.error("Unable to update gadget json file." + e.getMessage());
                throw e;
            } finally {
                if (gadgetJSONFile !== null) {
                    gadgetJSONFile.close();
                }
            }
            zipFile.del();
            var unZippedGadgetFile = new File(GADGET_EXT_PATH + '/' + utils.gadgetsDirectoryLabel + '/' +
                utils.gadgetTempDirectoryLabel + '/' + assetId);
            unZippedGadgetFile.zip(GADGET_EXT_PATH + '/' + utils.gadgetsDirectoryLabel + '/' + assetId + utils.gadgetExtension);

            // If thumbnail exists, save it separately
            if (res.thumbnail) {
                var thumbnailURL = res.thumbnail.replace(utils.gadgetDSDirectory + res.id, "");
                var thumbnail = new File(GADGET_EXT_PATH + '/' + utils.gadgetsDirectoryLabel + '/' +
                    utils.gadgetTempDirectoryLabel + '/' + assetId + thumbnailURL);
                if (thumbnail.isExists()) {
                    thumbnail.saveAs(GADGET_EXT_PATH + '/' + utils.gadgetsDirectoryLabel + '/' + res.id + '_' +
                        utils.thumbnailFileName);
                }
            }
            unZippedGadgetFile.del();
            return res;
        }
    };

    return {
        create: function (options) {
            var ref = require('utils').time;
            //Check if the options object has a createdtime attribute and populate it
            if ((options.attributes) && ctx.rxtManager.getRxtField(ctx.assetType, 'overview_createdtime')) {
                options.attributes.overview_createdtime = ref.getCurrentTime();
            }
            this._super.create.call(this, options);
            var asset = this.get(options.id); //TODO avoid get: expensive operation
            var assetPath = asset.path;
            var user = ctx.username;
            var userRoles = ctx.userManager.getRoleListOfUser(user);
            try {
                social.warmUpRatingCache(ctx.assetType + ':' + options.id);
            } catch (e) {
                log.warn("Unable to publish the asset: " + ctx.assetType + ":" + options.id + " to social cache. " +
                    "This may affect on sort by popularity function.");
            }
            //Check whether the user has admin role
            var endpoint = storeConstants.PRIVATE_ROLE_ENDPOINT + user;
            for (var role in userRoles) {
                if (userRoles.hasOwnProperty(role) && userRoles[role] == storeConstants.ADMIN_ROLE) {
                    endpoint = storeConstants.ADMIN_ROLE_ENDPOINT;
                }
            }
            var provider = ctx.username;
            if (options.attributes.overview_provider) {
                provider = options.attributes.overview_provider;
            }
            provider = provider.replace(':', '@');
            //Subscribe the asset author for LC update event and asset update event
            if (this.rxtManager.isNotificationsEnabled(this.type)) {
                notifier.subscribeToEvent(provider, assetPath, endpoint, storeConstants.LC_STATE_CHANGE);
                notifier.subscribeToEvent(provider, assetPath, endpoint, storeConstants.ASSET_UPDATE);
            }
        },
        update: function (options) {
            saveGadget(options.id);
            if (buildGadgetJson(options)) {
                // To save thumbnail in ES side
                var thumbnail = new File(GADGET_EXT_PATH + '/' + utils.gadgetsDirectoryLabel + '/' +
                    options.attributes.overview_id + portalConfigs.delimiter + options.attributes.overview_version + '_'
                    + utils.thumbnailFileName);
                if (options.attributes.overview_thumbnailurl && thumbnail.isExists) {
                    try {
                        options.attributes.gadget_thumbnail = utils.thumbnailFileName;
                        var resource = {};
                        resource.content = thumbnail.getStream();
                        resource.name = utils.thumbnailFileName;
                        var pathSuffix = ASSET_NAME + "/" + options.id + "/" + utils.thumbnailFileName;
                        var path = utils.RESOURCES_REGISTRY + pathSuffix;
                        registry.put(path, resource);
                    } finally {
                        thumbnail.close();
                        thumbnail.del();
                    }
                }
                if (!uploadGadgetToDS(options.id, options.attributes.overview_id, options.attributes.overview_version)) {
                    log.error('Failed to upload the gadget to Dashboard Server.');
                }
            } else {
                log.error('Failed to build the gadget.json from the metadata.');
            }
            this._super.update.call(this, options);
            var asset = this.get(options.id);
            // trigger notification on asset update
            notifier.notifyEvent(storeConstants.ASSET_UPDATE_EVENT, asset.type, asset.name, null, asset.path, ctx.tenantId);
        },
        remove: function (id) {
            var asset = this.get(id);
            if (!removeGadgetFromDS(asset.attributes.overview_id, asset.attributes.overview_version)) {
                log.error('Failed to remove the gadget from the Dashboard Server.');
            }
            deleteGadget(id);
            this._super.remove.call(this, id);
            // trigger notification on asset update
            notifier.notifyEvent(storeConstants.ASSET_UPDATE_EVENT, asset.type, asset.name, null, asset.path, ctx.tenantId);
        },
        invokeLcAction: function (asset, action, lcName, userArgs) {
            var zipFile = registry.get(utils.RESOURCES_REGISTRY + ASSET_NAME + "/" + asset.id + "/" + utils.gadgetZipFileNameInRegistry);
            var success;

            if (zipFile) {
                var gadgetZipFile = new File(GADGET_EXT_PATH + '/' + utils.gadgetsDirectoryLabel + '/' + asset.id + utils.gadgetExtension);
                if (!gadgetZipFile.isExists()) {
                    try {
                        gadgetZipFile.open("w");
                        gadgetZipFile.write(zipFile.content);
                    } finally {
                        if (!gadgetZipFile) {
                            gadgetZipFile.close();
                        }
                    }
                    if (buildGadgetJson(asset)) {
                        if (!uploadGadgetToDS(asset.id, asset.attributes.overview_id, asset.attributes.overview_version)) {
                            log.error('Failed to upload the gadget to Dashboard Server.');
                        }
                    } else {
                        log.error('Failed to build the gadget.json from the metadata.');
                    }
                }
            }
            if (lcName) {
                success = this._super.invokeLcAction.call(this, asset, action, lcName, userArgs);
            } else {
                success = this._super.invokeLcAction.call(this, asset, action);
            }
            //trigger notification on LC state change
            notifier.notifyEvent(storeConstants.LC_STATE_CHANGE_EVENT, asset.type, asset.name, COMMENT, asset.path, ctx.tenantId);
            return success;
        }
    }
};

asset.server = function (ctx) {
    return {
        onUserLoggedIn: function () {
        },
        endpoints: {
            apis: [{
                url: 'gadgets',
                path: 'gadgets.jag'
            }]
        }
    };
};

asset.configure = function () {
    return {
        table: {
            gadget: {
                fields: {
                    gadgetarchive: {
                        type: 'file'
                    },
                    thumbnail: {
                        type: 'file',
                        hidden: true
                    }
                }
            },
            overview: {
                fields: {
                    createdtime: {
                        hidden: true
                    }
                }
            }
        },
        meta: {
            lifecycle: {
                name: 'SampleLifeCycle2',
                commentRequired: false,
                defaultLifecycleEnabled: true,
                defaultAction: 'Promote',
                deletableStates: ['Unpublished'],
                publishedStates: ['Published'],
                lifecycleEnabled: true
            },
            ui: {
                icon: 'fw fw-web-app'
            },
            notifications: {
                enabled: true
            },
            thumbnail: 'gadget_thumbnail',
            nameAttribute: 'overview_name',
            versionAttribute: 'overview_version',
            providerAttribute: 'overview_provider',
            timestamp: 'overview_createdtime',
            grouping: {
                groupingEnabled: false,
                groupingAttributes: ['overview_name']
            },
            permissions: {
                configureRegistryPermissions: function (ctx) {
                }
            }
        }
    };
};