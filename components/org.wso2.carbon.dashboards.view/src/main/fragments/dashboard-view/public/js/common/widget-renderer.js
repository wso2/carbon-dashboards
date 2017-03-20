/**
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
var widget = widget || {};
widget.renderer = {};
(function () {
    'use strict';

    var getWidgetBlock = function (widgetID, widget) {
        return '<div id="' + widgetID + '" class="ues-component gadget">'
            + '<div class="gadget-heading ues-component-heading">'
            + '<h1 class="gadget-title ues-component-title truncate">:::</h1>'
            + '<div class="gadget-actions ues-component-actions">'
            + '<div class="btn-group">'
            + '<button type="button" class="btn btn-default dashboards-trash-handle" data-toggle="modal"'
            + 'data-target="#modalDelete" title="remove">'
            + '<i class="icon fw fw-delete"></i>'
            + '</button></div></div></div>'
            + '<div class="gadget-body dashboards-component-body">'
            + widget.html
            + '</div></div>';
    };

    /**
     * Register new operation to widget task bar.
     * @param callback {object} function to be called on click event of the operation.
     * @param imgUrl {string} class for wso2 font which to use as the operation icon.
     * */
    function registerTaskBarOperation(imgUrl, callback) {
        //TODO: Implement this functionality
    }

    /**
     * Set the widget name into the task bar.
     * */
    function setWidgetName(widgetID, name) {
        $("#" + widgetID).find("h1.gadget-title").text(name);
    }

    /**
     * Render widget into the layout.
     * @param layoutContainerId {string} id of the parent layout
     * @param gridContainerId {string} id of the container that widget should be attached in to.
     * @param url {string} widget URL which to load the widget from
     * @param async {boolean} whether async false or true
     * @return {object} object with message and the error existence
     * */
    function renderWidget(widgetID, layoutContainerId, gridContainerId, url, async) {
        $.ajax({
            url: url,
            type: "GET",
            async: async,
            success: function (data) {
                $("#" + layoutContainerId).find("#" + gridContainerId).html(getWidgetBlock(widgetID, data));
                return {
                    error: false,
                    message: "Success"
                };
            },
            error: function (error) {
                return {
                    error: true,
                    message: error.message
                };
            }
        });
    }

    widget.renderer = {
        render: renderWidget,
        registerOperation: registerTaskBarOperation,
        setWidgetName: setWidgetName
    };
}());