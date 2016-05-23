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
    var conf;
    var schema;
    var providerData;
    var init = function () {
        var CHART_CONF = 'chart-conf';
        var GADGET_NAME = 'gadget-name';
        $.ajax({
            url: '/portal/store/carbon.super/fs/gadget/my_gadget/conf.json',
            method: "GET",
            contentType: "application/json",
            async: false,
            success: function (data) {
                conf = JSON.parse(data);
                console.log(JSON.stringify(conf));
                console.log(conf[CHART_CONF][GADGET_NAME]);
                $.ajax({
                    url: '/portal/store/carbon.super/fs/gadget/' + conf[CHART_CONF][GADGET_NAME] + '/gadget-controller.jag?action=getSchema',
                    method: "POST",
                    data: JSON.stringify(conf),
                    contentType: "application/json",
                    async: false,
                    success: function (data) {
                        console.log(JSON.stringify(data));
                        schema = data;
                    }
                });
                $.ajax({
                    url: '/portal/store/carbon.super/fs/gadget/'  + conf[CHART_CONF][GADGET_NAME] +'/gadget-controller.jag?action=getData',
                    method: "POST",
                    data: JSON.stringify(conf),
                    contentType: "application/json",
                    async: false,
                    success: function (data) {
                        providerData = data;
                    }
                });
            }
        });

        draw('#canvas', conf[CHART_CONF], schema, providerData);
    }
    init();
});
