/**
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

var createDashboard = function () {
    var payloadDashboard = {};
    var dashboardContent = {};
    payloadDashboard.url = $("#dashboard-id").val();
    payloadDashboard.name = $("#dashboard-title").val();
    payloadDashboard.version = $("#dashboard-version").val();
    payloadDashboard.description = $("#dashboard-description").val();
    payloadDashboard.isShared = "true";
    payloadDashboard.parentId = "0";
    payloadDashboard.owner = "admin";
    payloadDashboard.lastUpdatedBy = "admin";
    payloadDashboard.lastUpdatedTime = new Date().getTime();
    dashboardContent.url = payloadDashboard.url;
    dashboardContent.name = payloadDashboard.name;
    dashboardContent.version = payloadDashboard.version;
    dashboardContent.description = payloadDashboard.description;
    dashboardContent.blocks = [{"height": 3, "id": "a", "width": 3, "x": 0, "y": 0}];
    payloadDashboard.content = JSON.stringify(dashboardContent);
    var method = "POST";
    var url = "../view/apis/dashboard/add";
    $.ajax({
        url: url,
        method: method,
        data: JSON.stringify(payloadDashboard),
        async: false,
        contentType: "application/json",
        //TODO Need to remove alerts and use proper notification mechanism
        success: function () {
            alert("Dashboard is created successfully !");
            window.location.href = payloadDashboard.url;
        },
        error: function () {
            alert("Error in creating dashboard !");
        }
    });
};