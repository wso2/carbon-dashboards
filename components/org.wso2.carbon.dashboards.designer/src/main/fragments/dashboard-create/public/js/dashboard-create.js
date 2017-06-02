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

(function () {
    var Constants = {
        HTTP_POST: 'POST',
        APPLICATION_JSON: 'application/json',
        DASHBOARD_API_URL: '../designer/apis/dashboards'
    };

    /**
     * Build dashboard payload object to be saved.
     * @returns {{}}
     */
    var buildDashboardPayload = function () {
        var id = $("#dashboard-id").val();
        var name = $("#dashboard-title").val();
        var description = $("#dashboard-description").val();
        return {
            id: id,
            name: name,
            version: 1,
            description: description,
            isShared: true,
            parentId: 0,
            owner: 'admin',
            lastUpdatedBy: 'admin',
            lastUpdatedTime: new Date().getTime(),
            content: JSON.stringify({
                url: id,
                name: name,
                version: 1,
                description: description,
                pages: {
                    'page0': {
                        layout: [],
                        pages: {}
                    }
                }
            })
        };
    };

    /**
     * Handles the create dashboard button click event.
     */
    $('#btn-create-dashboard').on('click', function () {
        var dashboard = buildDashboardPayload();
        $.ajax({
            url: Constants.DASHBOARD_API_URL,
            method: Constants.HTTP_POST,
            data: JSON.stringify(dashboard),
            async: false,
            contentType: Constants.APPLICATION_JSON,
            //TODO Need to remove alerts and use proper notification mechanism. i18n should be used to get messages.
            success: function () {
                alert("Dashboard is created successfully !");
                window.location.href = dashboard.url;
            },
            error: function () {
                alert("Error in creating dashboard !");
            }
        });
    });

    /**
     * Handles the lost focus event of the name of the dashboard text field. On this event the URL will be automatically
     * generated using the dashboard name.
     */
    $('#dashboard-title').on('blur', function () {
        $('#dashboard-id').val($('#dashboard-title').val()
            .split(' ')
            .join('-')
            .toLowerCase());
    });
})();