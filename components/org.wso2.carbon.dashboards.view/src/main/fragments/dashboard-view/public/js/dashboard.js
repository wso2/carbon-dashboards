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
(function () {
    "use strict";
    var gridLayer = $(".grid-stack");
    var dashboard = dashboardMetadata.dashboard;
    var metadata = dashboardMetadata.metadata;
    
    /**
     * Initialize the dashboard viewer.
     * */
    var init = function () {
        renderBlocks(dashboard);
        renderWidgets(dashboard);

        $('.grid-stack').gridstack({
            width: 12,
            cellHeight: 50,
            verticalMargin: 30,
            disableResize: false,
            disableDrag: false
        }).on('dragstop', function (e, ui) {
            updateLayout();
            saveDashboard();
        }).on('resizestart', function (e, ui) {
            // hide the component content on start resizing the component
            var container = $(ui.element).find('.ues-component');
            if (container) {
                container.find('.dashboards-component-body').hide();
            }
        }).on('resizestop', function (e, ui) {
            // re-render component on stop resizing the component
            var container = $(ui.element).find('.ues-component');
            if (container) {
                var gsItem = container.closest('.grid-stack-item');
                var node = gsItem.data('_gridstack_node');
                var blockId = gsItem.attr('data-id');
                renderWidget(blockId);
                container.find('.dashboards-component-body').show();
            }
            updateLayout();
            saveDashboard();
        });
    };

    /**
     * Render gadget blocks by reading the dashboard json.
     * @param dashboard {Object} dashboard json object
     * */
    var renderBlocks = function (dashboard) {
        var gridBoxes = "",
            i = "";
        for (i in dashboard.blocks) {
            if (dashboard.widgets[dashboard.blocks[i].id]) {
                gridBoxes += '<div class="grid-stack-item" data-id="' + dashboard.blocks[i].id + '" data-gs-x="'
                    + dashboard.blocks[i].x + '" data-gs-y="' + dashboard.blocks[i].y + '"'
                    + 'data-gs-width="' + dashboard.blocks[i].width + '" data-gs-height="' + dashboard.blocks[i].height
                    + '"><div class="grid-stack-item-content ues-component-box gadget-wrapper" id="'
                    + dashboard.blocks[i].id + '"><div style="width:100%;height:100%;background-color: white;"></div>'
                    + '</div></div>';
            }
        }
        gridLayer.html(gridBoxes);
    };

    /**
     * Render Widgets in to blocks by reading the dashboard json.
     * */
    var renderWidgets = function (dashboard) {
        var i = "";
        for (i in dashboard.blocks) {
            if (dashboard.widgets[dashboard.blocks[i].id]) {
                renderWidget(dashboard.blocks[i].id);
            }
        }
    };

    /**
     * Render Widget into a given block by reading the dashboard json.
     * */
    var renderWidget = function (blockId) {
        widget.renderer.render(dashboard.widgets[blockId].id,
            "grid-stack", blockId,
            dashboard.widgets[blockId].url,
            false);
    };

    /**
     * Update the layout after modification.
     * 
     */
    var updateLayout = function () {
        // extract the layout from the designer and save it
        var res = _.map($('.grid-stack .grid-stack-item:visible'), function (el) {
            el = $(el);
            var node = el.data('_gridstack_node');
            if (node) {
                return {
                    id: el.attr('data-id'),
                    x: node.x,
                    y: node.y,
                    width: node.width,
                    height: node.height,
                    banner: el.attr('data-banner') == 'true'
                };
            }
        });

        var serializedGrid = [];
        for (var i = 0; i < res.length; i++) {
            if (res[i]) {
                serializedGrid.push(res[i]);
            }
        }
        dashboard.blocks = serializedGrid;
    };

    /**
     * Saves the dashboard content.
     *
     */
    var saveDashboard = function () {
        var method = 'PUT';
        var url = DASHBOARD_METADATA_UPDATE_URL;
        dashboard.url = dashboard.id;
        $.ajax({
            url: url,
            method: method,
            data: JSON.stringify(metaDataPayloadGeneration()),
            async: false,
            contentType: "application/json; charset=UTF-8"
        });

        //TODO: Implement notification message to display ajax call success/failure 
    };

    /**
     * generate the core payload to invoke rest apis
     * @returns metadata payload
     */
    var metaDataPayloadGeneration = function () {
        var metaDataPayload = {};
        if (!metadata) {
            metaDataPayload.url = dashboard.id;
            metaDataPayload.name = dashboard.name;
            metaDataPayload.version = dashboard.version;
            metaDataPayload.description = dashboard.description;
            metaDataPayload.isShared = dashboard.isShared;
            //TODO: Need to finalize with a parentID for original dashboards . Currently put -1 as parentID ,if it is not personalized
            metaDataPayload.parentId = "-1";
        } else {
            metaDataPayload = metadata;
            metaDataPayload.parentId = metadata.id;
        }
        //TODO: Need to update the hardcoded values with logged in user
        metaDataPayload.owner = "admin";
        metaDataPayload.lastUpdatedBy = "admin";
        metaDataPayload.lastUpdatedTime = new Date().getTime();
        metaDataPayload.content = JSON.stringify(dashboard);
        return metaDataPayload;
    };

    init();
}());