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
var widget = widget || {};
widget.renderer = {};
(function () {
    'use strict';

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
     * @param gridContainerId {string} id of the container that widget should be attached in to.
     * @param url {string} widget URL which to load the widget from
     * @param async {boolean} whether async false or true
     * @return {object} object with message and the error existence
     * */
    function renderWidget(gridContainerId, url, isUserprefEnabled, async) {
        var widgetName = url.split(".")[url.split(".").length - 1];
        $.ajax({
            url: url,
            type: Constants.HTTP_GET,
            async: async,
            success: function (data) {
                var callback = $.extend(true, {}, renderWidgetCallback);
                var values = url.split("/");
                callback.widgetId = values[values.length - 1];
                UUFClient.renderFragment(Constants.WIDGET_BOX_FRAGMENT_NAME, {
                    widgetID: getGadgetUUID(url, widgetName),
                    widgetContent: data.html,
                    widgetTitle: widgetName,
                    gridID: gridContainerId,
                    isUserprefEnabled: isUserprefEnabled
                }, callback);

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

    /**
     * Go through portal.dashboards.blocks multi-dimension array and call renderwidet. 
     */
    function renderOrderedWidgetSet(i) {
        portal.dashboards.dimension = i;
        portal.dashboards.renderedBlockCount = 0;
        var blocks = portal.dashboards.blocks;

        if (blocks[i] && Array.isArray(blocks[i])) {
            portal.dashboards.blockLength = blocks[i].length;

            for (var j = 0; j < blocks[i].length; j++) {
                var block = blocks[i][j];
                var isUserPrefEnabled = block.widget.userpref && block.widget.userpref.enable;
                renderWidget(block.id, block.widget.url, isUserPrefEnabled, false);
            }
        } else {
            if (portal.dashboards.blocks.length > i) {
                renderOrderedWidgetSet(++i);
            }
        }
    }

    /**
     * Generate GUID using widget name.
     * @returns {String}
     *
     */
    var getGadgetUUID = function (url, widgetName) {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return widgetName + s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
    };

    /**
     * This is the callback which is triggered after rendering widget.
     * @type {{onSuccess: renderWidgetCallback.onSuccess, onFailure: renderWidgetCallback.onFailure}}
     */
    var renderWidgetCallback = {
        widgetId: '',
        onSuccess: function (data) {
            ++ portal.dashboards.renderedBlockCount;
            var gadgetContainer = $(data)[0];
            var id = "widget_" + $(gadgetContainer).data('grid-id');

            $("#grid-stack").find("#" + $(gadgetContainer).data('grid-id')).html(gadgetContainer);

            if ((portal.dashboards.renderedBlockCount === portal.dashboards.blockLength) &&
                portal.dashboards.blocks.length >= portal.dashboards.dimension) {
                renderOrderedWidgetSet(++ portal.dashboards.dimension);
            }

            if (this.widgetId && typeof portal.dashboards.widgets[this.widgetId].actions.render === 'function') {
                var bodyElement = $("#grid-stack").find("#" + $(gadgetContainer).data('grid-id')).find(".gadget-body");
                var body = bodyElement.html();
                bodyElement.html($('<div>').attr('id', id).html(body));
                portal.dashboards.widgets[this.widgetId].actions.render(id);
            }

            if (this.widgetId && typeof portal.dashboards.widgets[this.widgetId].actions.bind === 'function') {
                portal.dashboards.widgets[this.widgetId].actions.bind($(gadgetContainer).data('grid-id'));
            }
        },
        onFailure: function (message, e) {
        }
    };

    widget.renderer = {
        render: renderWidget,
        registerOperation: registerTaskBarOperation,
        setWidgetName: setWidgetName,
        renderOrderedWidgetSet: renderOrderedWidgetSet
    };
}());