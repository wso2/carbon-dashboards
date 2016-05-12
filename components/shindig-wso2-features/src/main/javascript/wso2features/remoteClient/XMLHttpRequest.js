/*
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

wso2.gadgets.XMLHttpRequest  = (function () {
    var module = this;
    var END_POINT = "/portal/apis/XMLHTTPClient";
    var HTTP_GET = "GET";
    var HTTP_POST = "POST";
    var HTTP_PUT = "PUT";
    var HTTP_DELETE = "DELETE";
    var APPLICATION_JSON = "application/json";

    module.get = function (url, successCallback, errorCallback, contentType, acceptType) {
        var payload = null;
        execute(HTTP_GET, url, payload, successCallback, errorCallback, contentType, acceptType);
    };
    module.post = function (url, payload, successCallback, errorCallback, contentType, acceptType) {
        execute(HTTP_POST, url, payload, successCallback, errorCallback, contentType, acceptType);
    };
    module.put = function (url, payload, successCallback, errorCallback, contentType, acceptType) {
        execute(HTTP_PUT, url, payload, successCallback, errorCallback, contentType, acceptType);
    };
    module.delete = function (url, successCallback, errorCallback, contentType, acceptType) {
        var payload = null;
        execute(HTTP_DELETE, url, payload, successCallback, errorCallback, contentType, acceptType);
    };

    function execute (method, url, payload, successCallback, errorCallback, contentType, acceptType) {
        if(contentType == undefined){
            contentType = APPLICATION_JSON;
        }
        if(acceptType == undefined){
            acceptType = APPLICATION_JSON;
        }
        var data = {
            url: END_POINT,
            type: HTTP_POST,
            contentType: contentType,
            accept: acceptType,
            success: successCallback,
            error: errorCallback
        };
        var paramValue = {};
        paramValue.actionMethod = method;
        paramValue.actionUrl = url;
        paramValue.actionPayload = payload;
        data.data = JSON.stringify(paramValue);
        $.ajax(data);
    };
    return {
        get: module.get,
        post: module.post,
        put: module.put,
        delete: module.delete
    };
})();
