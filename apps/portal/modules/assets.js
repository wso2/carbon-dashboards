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
var addAsset = function (type, fileRequest) {
    var tempAssetPath = '/store/' + userDomain + '/fs/temp-' + type + '/';
    var ZipFile = Packages.java.util.zip.ZipFile;
    var process = require('process');
    var zipFile = process.getProperty('carbon.home') + '/repository/deployment/server/jaggeryapps/portal' + tempAssetPath;
    var assetPath = '/store/' + userDomain + '/fs/' + type + '/';
    var configurationFileName = type + ".json";

    var fileName = fileRequest.getName().replace(".zip", "");
    var tempDirectory = new File(tempAssetPath);

    if (!tempDirectory.isExists()) {
        tempDirectory.mkdir();
    }

    var gadget = new File(tempAssetPath + fileName);
    gadget.open('w');
    gadget.write(fileRequest.getStream());
    gadget.close();

    try {
        // Extract the zip file and check whether there is a configuration file
        var zip = new ZipFile(zipFile + fileName);
        var fileInZip = zip.entries();

        for (var entries = fileInZip; entries.hasMoreElements();) {
            var entry = entries.nextElement();
            if (String(entry.getName().toLowerCase()) === configurationFileName) {
                var gadgetDirectory = new File(assetPath);
                var files = gadgetDirectory.listFiles();

                // Check whether is there is another asset with same id
                for (var index = 0; index < files.length; index++) {
                    if (files[index].getName() === fileName) {
                        tempDirectory.del();
                        return 'idAlreadyExists';
                    }
                }
                // If there is a configuration file and no other assets with same id, deploy the gadget
                var assetDir = new File(assetPath + fileRequest.getName());
                assetDir.open('w');
                assetDir.write(fileRequest.getStream());
                assetDir.close();
                tempDirectory.del();
                return 'success';
            }
        }
        // If configuration file is missing indicate the error
        tempDirectory.del();
        return 'confgurationFileMissing';
    } catch (e) {
        log.error('Error occurred while extracting the zip file.', e);
    }
};