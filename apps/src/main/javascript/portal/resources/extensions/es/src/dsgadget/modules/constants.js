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
 */

var constants = {};
(function (constants) {
    constants.GADGET_EXTENSION = '.gdt';
    constants.GADGETS_DIRECTORY_LABEL = "gadgets";
    constants.GADGET_TEMP_DIRECTORY_LABEL = 'temp';
    constants.GADGET_DS_DIRECTORY = 'gadget/';
    constants.GADGET_ZIP_FILE_IN_REGISTRY = 'gadget_gadgetarchive';
    constants.ASSETS_API = '/apis/assets';
    constants.THUMBNAIL_FILE_NAME = 'thumbnail';
    constants.HTTP_SUCCESS_CODE = 200;
    constants.HTTP_METHOD_NOT_ALLOWED = 405;
    constants.HTTP_INTERNAL_ERROR = 500;
    constants.BYTES_TO_MB = 1048576;
    constants.RESOURCES_REGISTRY = '/_system/governance/store/asset_resources/';
    constants.GADGET_CONFIGURATION_FILE = 'gadget.json';
    constants.REGISTRY_OPERATOR = '/modules/registry/registry.operator.js';
    constants.INITIAL_LIFECYCLE_STATE = 'Initial';
    constants.PUBLISHED_LIFECYCLE_STATE = 'Published';
    constants.UNPUBLISHED_LIFECYCLE_STATE = 'Unpublished';
    constants.CARBON_HOME = 'carbon.home';
}(constants));