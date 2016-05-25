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
var getConfig, getProviderSchema,getProviderData;
$(function () {
    var conf;
    var schema;
    var providerData;
    getConfig = function () {
        $.ajax({
            url: gadgetLocation + '/conf.json',
            method: "GET",
            contentType: "application/json",
            async: false,
            success: function (data) {
                conf = JSON.parse(data);
            }
        });
        return conf;
    };

    getProviderSchema = function (providerConfig) {
        $.ajax({
            url: gadgetLocation + '/js/provider-api.js?action=getSchema',
            method: "POST",
            data: JSON.stringify(providerConfig),
            contentType: "application/json",
            async: false,
            success: function (data) {
                schema = data;
            }
        });
        return schema;
    }

    getProviderData = function (providerConfig) {
        $.ajax({
            url: gadgetLocation + '/js/provider-api.js?action=getData',
            method: "POST",
            data: JSON.stringify(providerConfig),
            contentType: "application/json",
            async: false,
            success: function (data) {
                return providerData = data;
            }
        });
    }
});
