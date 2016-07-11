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
var api = {};
(function (api) {
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

    var utils = require(GADGET_EXT_PATH + '/modules/utils.js').api;
    var constants = require(GADGET_EXT_PATH + '/modules/constants.js').constants;
    var portalConfigs = require(GADGET_EXT_PATH + "/configs/portal.json");
    var carbon = require('carbon');
    var app = require('rxt').app;
    var registryOperator = require(constants.REGISTRY_OPERATOR).registryOperator();

    var MAIN_GADGET_DIRECTORY_PATH = GADGET_EXT_PATH + '/' + constants.GADGETS_DIRECTORY_LABEL;
    var TEMP_GADGET_DIRECTORY_PATH = MAIN_GADGET_DIRECTORY_PATH + '/' + constants.GADGET_TEMP_DIRECTORY_LABEL;
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
     * To make a authorization request to DS
     * @private
     * @returns response of request
     */
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
            if (response.getStatusLine().getStatusCode() !== constants.HTTP_SUCCESS_CODE) {
                return false;
            } else {
                return new ResponseHandler().handleResponse(response);
            }
        }
        return false;
    };

    /**
     * To add a gadget zip in file location
     * @param id Asset id
     * @param tenantId Tenant ID
     * @private
     * @returns {boolean} true if the zip file created in the file system
     */
    var addGadgetZip = function (id, tenantId) {
        var compoundKey = ASSET_NAME + '/' + id + '/' + constants.GADGET_ZIP_FILE_IN_REGISTRY;
        var gadgetFile = registryOperator.getFile(compoundKey, tenantId);
        var gadgetsMainDirectory = new File(MAIN_GADGET_DIRECTORY_PATH);
        var gadget = new File(MAIN_GADGET_DIRECTORY_PATH + '/' + id + constants.GADGET_EXTENSION);

        if (!gadgetFile) {
            return;
        }
        if (!gadgetsMainDirectory.isExists()) {
            gadgetsMainDirectory.mkdir();
        }
        if (!gadget.isExists()) {
            try {
                if (gadgetFile.content) {
                    gadget.open('w');
                    gadget.write(gadgetFile.content);
                    return true;
                } else {
                    return false;
                }
            } catch (e) {
                log.error("Cannot write the zip file");
            } finally {
                gadget.close();
            }
        } else {
            return true;
        }

    };

    /**
     * Update the zip file with newly updated gadget.json
     * @param res Value for the gadget.json to be updated
     * @private
     * @returns {*}
     */
    var updateZipFile = function (res) {
        var assetId = res.es_id;
        var gadgetJSONFile = null;
        var zipFile = new File(MAIN_GADGET_DIRECTORY_PATH + '/' + assetId + constants.GADGET_EXTENSION);
        // If zip file exists
        if (zipFile.isExists()) {
            zipFile.unZip(TEMP_GADGET_DIRECTORY_PATH + '/' + assetId);
            try {
                gadgetJSONFile = new File(TEMP_GADGET_DIRECTORY_PATH + '/' + assetId + '/' + constants.GADGET_CONFIGURATION_FILE);
                gadgetJSONFile.open("w");
                gadgetJSONFile.write(res);
                zipFile.del();
                var unZippedGadgetFile = new File(TEMP_GADGET_DIRECTORY_PATH + '/' + assetId);
                unZippedGadgetFile.zip(MAIN_GADGET_DIRECTORY_PATH + '/' + assetId + constants.GADGET_EXTENSION);
                unZippedGadgetFile.del();
                return res;
            } catch (e) {
                log.error("Unable to update gadget json file.");
            } finally {
                if (gadgetJSONFile) {
                    gadgetJSONFile.close();
                }
            }
        }
    };

    /**
     * Get absolute path to the publisher directory.
     * @returns {string} Directory path
     */
    api.getPublisherDir = function () {
        var process = require('process');
        return process.getProperty(constants.CARBON_HOME) + '/repository/deployment/server/jaggeryapps' + app.getContext();
    };

    /**
     * Post the gadget archive to the associated dashboard server.
     * @param {String} assetId Asset ID of ES side
     * @param {String} gadgetId Gadget ID of DS side
     * @param {String} version version of the gadget
     * @returns {boolean} Status
     */
    api.uploadGadgetToDS = function (assetId, gadgetId, version) {
        if (portalConfigs.url.length > 0) {
            var zipFileName = utils.getPublisherDir() + MAIN_GADGET_DIRECTORY_PATH + '/' + assetId + constants.GADGET_EXTENSION;
            var post = null;
            var client;
            var response;
            var inputStream;
            var responseBody;

            // If authenticate passes, send gadget to DS side with relevant parameters
            responseBody = loginToDS();
            if (responseBody) {
                post = new HttpPost(portalConfigs.url + '/t/' + domain + constants.ASSETS_API);
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
                if (response.getStatusLine().getStatusCode() !== constants.HTTP_SUCCESS_CODE) {
                    return false;
                }
                return true;
            }
        }
        return true;
    };

    /**
     * Remove the gadget archive from the associated dashboard server.
     * @param {String} gadgetId Gadget ID of DS side
     * @param {String} version Version of the gadget
     * @returns {boolean} Status
     */
    api.removeGadgetFromDS = function (gadgetId, version) {
        if (portalConfigs.url.length > 0) {
            var client;
            var response;
            var del;
            var responseBody = loginToDS();
            if (responseBody) {
                del = new HttpDelete(portalConfigs.url + '/t/' + domain + constants.ASSETS_API + '/' + gadgetId +
                    portalConfigs.delimiter + version + '?storeType=' + portalConfigs.storeType + '&type=' + portalConfigs.type);
                del.addHeader("cookie", "JSESSIONID=" + parse(String(responseBody)).sessionId);
                client = HttpClientBuilder.create().build();
                response = client.execute(del);
                if (response.getStatusLine().getStatusCode() !== constants.HTTP_SUCCESS_CODE) {
                    return false;
                }
                return true;
            }
            return false;
        }
        return true;
    };

    /**
     * Build gadget json file and repack the gadget before deploying.
     * @param options Values entered in form
     * @param tenantId Tenant ID of the user
     * @return {Boolean} Status
     */
    api.buildGadgetJson = function (options, tenantId) {
        var res = {
            es_id: options.id,
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

        if (res.thumbnail && res.thumbnail.indexOf(constants.GADGET_DS_DIRECTORY + options.attributes.overview_id) === 0) {
            res.thumbnail = res.thumbnail.replace(constants.GADGET_DS_DIRECTORY + options.attributes.overview_id,
                constants.GADGET_DS_DIRECTORY + res.id);
        }
        if (res.data.url && res.data.url.indexOf(constants.GADGET_DS_DIRECTORY + options.attributes.overview_id) === 0) {
            res.data.url = res.data.url.replace(constants.GADGET_DS_DIRECTORY + options.attributes.overview_id,
                constants.GADGET_DS_DIRECTORY + res.id);
        }
        return addGadgetZip(options.id, tenantId) ? updateZipFile(res) : false;
    };

    /**
     * To add thumbnail to ES registry
     * @param {Object} asset
     * @param {String} tenantId
     * @returns {boolean} true if the thumbnail moved to registry
     */
    api.addThumbnail = function (asset, tenantId) {
        var gadget = null;
        if (addGadgetZip(asset.id, tenantId)) {
            try {
                // Save the thumbnail for particular gadget in registry
                gadget = new File(MAIN_GADGET_DIRECTORY_PATH + '/' + asset.id + constants.GADGET_EXTENSION);
                gadget.unZip(TEMP_GADGET_DIRECTORY_PATH + '/' + asset.id);
                if (asset.attributes.overview_thumbnailurl) {
                    var thumbnailURL = asset.attributes.overview_thumbnailurl.replace(constants.GADGET_DS_DIRECTORY + asset.attributes.overview_id, "");
                    var thumbnail = new File(TEMP_GADGET_DIRECTORY_PATH + '/' + asset.id + thumbnailURL);
                    var unZippedFile = new File(TEMP_GADGET_DIRECTORY_PATH + '/' + asset.id);
                    if (thumbnail.isExists()) {
                        try {
                            thumbnailObject = {
                                "file": thumbnail,
                                "type": ASSET_NAME,
                                "assetId": asset.id,
                                "fieldName": constants.THUMBNAIL_FILE_NAME
                            };
                            registryOperator.addFile(thumbnailObject);
                            return true;
                        } finally {
                            if (thumbnail) {
                                thumbnail.close();
                                thumbnail.del();
                            }
                            if (unZippedFile) {
                                unZippedFile.del();
                            }
                        }
                    }
                }
            } catch (e) {
                log.error("Error saving DS gadgets");
                throw e;
            } finally {
                if (gadget) {
                    gadget.close();
                }
            }
        }
    };

    /**
     * Delete the gadget zip from ES file system, if the relevant gadget zip exists
     * @param {String} id of the asset to be deleted
     */
    api.deleteGadget = function (id) {
        var gadgetZip = new File(MAIN_GADGET_DIRECTORY_PATH + '/' + id + constants.GADGET_EXTENSION);

        if (gadgetZip.isExists()) {
            gadgetZip.del();
        }
    }
}(api));