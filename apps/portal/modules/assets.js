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
 *
 * This is the file that handles operations relates to assets
 */

/**
 * To save an uploaded asset
 * @param {String} type Type of the asset
 * @param {Object} fileRequest File object from request
 * @returns {String} message Detailed message on what happened during asset upload
 */
var addAsset = function (type, id, fileRequest, storeType) {
    var log = new Log();
    var storeManager = require("/js/store-manager.js");
    var constants = require("/modules/constants.js");
    var urlDomain = urlDomain ? urlDomain : superDomain;
    var tempAssetPath = '/store/' + urlDomain + '/' + storeType + '/temp-' + type + '/';
    var ZipFile = Packages.java.util.zip.ZipFile;
    var zipExtension = ".zip";
    var process = require('process');
    var zipFile = process.getProperty('carbon.home') + '/repository/deployment/server/jaggeryapps/portal' + tempAssetPath;
    var assetPath = '/store/' + urlDomain + '/' + storeType + '/' + type + '/';
    var configurationFileName = type + ".json";
    var config = require('/configs/designer.json');
    var bytesToMB = 1048576;
    var fileSizeLimit = type === "gadget" ? config.assets.gadget.fileSizeLimit : config.assets.layout.fileSizeLimit;
    var fileUtils = require("/modules/file-utils.js");

    // Before copying the file to temporary location, check whether the given file exist and
    // the file size and whether it is a zip file
    if (fileRequest === null) {
        return 'fileNotFound';
    } else if (fileRequest.getLength() / bytesToMB > fileSizeLimit) {
        return 'MaxFileLimitExceeded';
    }

    // If it passes all the initial validations remove the zip file extensions to avoid the zip file being deployed
    // before other validations
    fileUtils.createDirs(tempAssetPath);
    fileUtils.createDirs(assetPath);
    var fileName = fileRequest.getName().replace(zipExtension, "");
    var tempDirectory = new File(tempAssetPath);
    var gadget = null;

    if (!tempDirectory.isExists()) {
        tempDirectory.mkdir();
    }
    try {
        gadget = new File(tempAssetPath + fileName);
        gadget.open('w');
        gadget.write(fileRequest.getStream());
    } catch (e) {
        log.error("Cannot upload the zip file to temporary location");
        return 'fileNotFound';
    } finally {
        if (gadget !== null) {
            gadget.close();
        }
    }

    try {
        // Extract the zip file and check whether there is a configuration file
        var zip = new ZipFile(zipFile + fileName);
        var fileInZip = zip.entries();

        for (var entries = fileInZip; entries.hasMoreElements();) {
            var entry = entries.nextElement();
            if ((entry.getName().toLowerCase() + "").indexOf(configurationFileName) > -1) {
                var assetDirectory = new File(assetPath);
                var files = assetDirectory.listFiles();
                fileName = (storeType === constants.FILE_STORE) ? fileName : id;
                if (storeType === constants.FILE_STORE) {
                    // Check whether is there is another asset with same id
                    for (var index = 0; index < files.length; index++) {
                        if (files[index].getName() === fileName) {
                            tempDirectory.del();
                            return 'idAlreadyExists';
                        }
                    }
                }
                tempDirectory.del();
                // If there is a configuration file and no other assets with same id, deploy the asset
                return storeManager.addAsset(type, fileName, fileRequest, storeType) ? "success" : "errorInUpload";
            }
        }
        // If configuration file is missing indicate the error
        tempDirectory.del();
        return 'confgurationFileMissing';
    } catch (e) {
        log.error('Error occurred while extracting the zip file.', e);
    }
};