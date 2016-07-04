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

var gadgetExtension = '.gdt';
var gadgetsDirectoryLabel = "gadgets";
var gadgetTempDirectoryLabel = 'temp';
var gadgetDSDirectory = 'gadget/';
var gadgetZipFileNameInRegistry = 'gadget_gadgetarchive';
var assetsAPI = '/apis/assets';
var thumbnailFileName = 'thumbnail';
var HTTP_SUCCESS_CODE = 200;
var BYTES_TO_MB = 1048576;
var RESOURCES_REGISTRY = '/_system/governance/store/asset_resources/';

/**
 * Get absolute path to the publisher directory.
 * @returns {string} Directory path
 * @private
 */
var getPublisherDir = function () {
    var process = require('process');
    return process.getProperty('carbon.home') + '/repository/deployment/server/jaggeryapps' + context;
};