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

    /**
     * Initialize the dashboard viewer.
     * */
    var init = function () {
        renderBlocks(dashboard);

        $('.grid-stack').gridstack({
            width: 12,
            cellHeight: 50,
            verticalMargin: 30,
            disableResize: false,
            disableDrag: false
        });
        //$('.nano').nanoScroller();
    };

    /**
     * Render gadget blocks by reading the dashboard json.
     * @param dashboard {Object} dashboard json object
     * */
    var renderBlocks = function (dashboard) {
        var gridBoxes = "",
            i = "";
        for (i in dashboard.blocks) {
            gridBoxes += '<div class="grid-stack-item" data-id="' + dashboard.blocks[i].id + '" data-gs-x="'
                + dashboard.blocks[i].x + '" data-gs-y="' + dashboard.blocks[i].y + '"'
                + 'data-gs-width="' + dashboard.blocks[i].width + '" data-gs-height="' + dashboard.blocks[i].height + '">'
                + '<div class="grid-stack-item-content ues-component-box gadget-wrapper" id="' + dashboard.blocks[i].id + '">'
                + '<div style="width:100%;height:100%;background-color: white;"></div>'
                + '</div>'
                + '</div>';
        }

        gridLayer.html(gridBoxes);
    };

    init();
}());