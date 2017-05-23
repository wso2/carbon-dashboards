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
    var dashboard = dashboardMetadata.dashboard;
    var metadata = dashboardMetadata.metadata;
    var blockCount = 0;
    var page;

    /**
     * Initialize the dashboard viewer.
     * */
    var init = function () {
        page = getPage();
        generateWidgetInfoJSON();
        renderBlocks();
    };

    /**
     * generate widgetInfo json object using retrieved data.
     * @param widgetList
     */
    var generateWidgetInfoJSON = function () {
        for (var i = 0; i < page.layout.length; i++) {
            if (page.layout[i].widget) {
                portal.dashboards.widgets[page.layout[i].widget.info.id] = page.layout[i].widget;
            }
        }
    };

    /**
     * Get the page details from the dashboard.json file.
     * @param dashboard dashboard object
     * @returns {*}
     */
    var getPage = function () {
        // TODO: Get 'pageName' from the URL. At the moment since multiple pages are not supported this stays undefined.
        var pageName;
        if (!pageName) {
            for (var name in dashboard.pages) {
                if (dashboard.pages.hasOwnProperty(name)) {
                    pageName = name;
                    break;
                }
            }
        }

        if (!pageName) {
            // TODO: Send error - No pages found.
            return;
        }

        // The pageName expects the value as /page0/page1/page2. Since  the multiple pages are not supported yet
        // following logic returns the root level page i.e. page0.
        var names = pageName.split('/');
        var page;
        for (var i = 0; i < names.length; i++) {
            if (names[i].length > 0) {
                page =  dashboard.pages[names[i]];
                break;
            }
        }
        if (!page) {
            // TODO: Send error - 404 Page not found
            return;
        }
        return page;
    }

    /**
     * Render gadget blocks by reading the dashboard json.
     * @param dashboard {Object} dashboard json object
     * */
    var renderBlocks = function () {
        for (var i = 0; i < page.layout.length; i++) {
            if (page.layout[i].id) {
                UUFClient.renderFragment(Constants.WIDGET_CONTAINER_FRAGMENT_NAME, page.layout[i],
                    "gridContent", Constants.APPEND_MODE, {
                        onSuccess: function () {
                            onBlocksRendered();
                        },
                        onFailure: function () {
                            onBlocksRendered();
                        }
                    });
            } else {
                blockCount++;
            }
        }
    };

    /**
     * Handles the block rendered event.
     */
    var onBlocksRendered = function () {
        blockCount++;
        if (blockCount === page.layout.length) {
            initGridstack();
            renderWidgets();
        }
    };

    /**
     * Initialize the dashboard viewer.
     * */
    var initGridstack = function () {
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
                var container = $(ui.element).find('.dashboards-component');
                if (container) {
                    var gsItem = container.closest('.grid-stack-item');
                    var node = gsItem.data('_gridstack_node');
                    var blockId = gsItem.attr('data-id');
                    var gsHeight = node ? node.height : parseInt(gsItem.attr('data-gs-height'));
                    var height = (gsHeight * 150) + ((gsHeight - 1) * 30);
                    container.closest('.dashboard-component-box').attr('data-height', height);
                    container.find('.dashboards-component-body').show();

                    // get the block by blockId
                    for (var i = 0; i < page.layout.length; i++) {
                        if (page.layout[i].id === blockId) {
                            renderWidgetByBlock(page.layout[i]);
                            break;
                        }
                    }
                    container.find('.dashboards-component-body').show();
                }
                updateLayout();
                saveDashboard();
            }
        );

        $('.gadgets-grid').on('click', '.dashboard-component-box .dashboards-userpref-handle', function () {
            var that = $(this);
            var template = that.closest('.dashboards-component').find('#template-container');
            $(template).find('.user-pref').slideToggle();
        });
    };

    /**
     * Render Widgets in to blocks by reading the dashboard json.
     * */
    var renderWidgets = function () {
        for (var i = 0; i < page.layout.length; i++) {
            if (page.layout[i].widget) {
                renderWidgetByBlock(page.layout[i]);
            }
        }
    };

    /**
     * Render Widget into a given block by reading the dashboard json.
     * */
    var renderWidgetByBlock = function (block) {
        var isUserPrefEnabled = block.widget.userpref && block.widget.userpref.enable;
        widget.renderer.render(block.id, block.widget.url, isUserPrefEnabled, false);
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
                    height: node.height
                };
            }
        });

        var serializedGrid = [];
        for (var i = 0; i < res.length; i++) {
            if (res[i]) {
                // Built layout information doesn't contain the widget data, hence copying from the page object.
                for (var j = 0; j < page.layout.length; j++) {
                    if (page.layout[j].id === res[i].id) {
                        res[i].widget = page.layout[j].widget;
                    }
                }
                serializedGrid.push(res[i]);
            }
        }
        page.layout = serializedGrid;
    };

    /**
     * Saves the dashboard content.
     *
     */
    var saveDashboard = function () {
        dashboard.url = dashboard.id;
        $.ajax({
            url: Constants.DASHBOARD_METADATA_UPDATE_URL,
            method: Constants.HTTP_PUT,
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

    /**
     * Wire Widgets by going through the available widget configs.
     * */
    var wireWidgets = function () {
        var layouts = page.layout;
        var i;
        for (i in layouts) {
            if (layouts.hasOwnProperty(i) && layouts[i].widget && layouts[i].widget.pubsub
                && layouts[i].widget.pubsub.isSubscriber) {
                var widgetID = layouts[i].widget.info.id;
                var topics = layouts[i].widget.pubsub.subscribesTo;
                var topic;
                for (topic in topics) {
                    if (topics.hasOwnProperty(topic)) {
                        pubsub.subscribe(topics[topic], portal.dashboards.subscribers[widgetID]._callback,
                            layouts[i].id);
                    }
                }
            }
        }
    };


    function publishToTopics (msg, instanceID) {
        var i;
        for (i in page.layout) {
            if (page.layout.hasOwnProperty(i) && page.layout[i].widget && page.layout[i].widget.pubsub &&
                page.layout[i].widget.pubsub.isPublisher && (instanceID === page.layout[i].id)) {
                pubsub.publish(msg, page.layout[i].widget.pubsub.topic);
            }
        }
    }

    /**
     * Update dashboard configuration and render widgets
     * */
    var updateDashboard = function () {
        saveDashboard();
        renderWidgets();
    };

    /*
    * Create orderedWidgets object in the load order.
    * obj { 0  [], 1: []}
    */
    var orderedWidgets;
    var orderWidgets = function () {
        for (var i = 0; i < page.layout.length; i++) {
            if (page.layout[i].widget) {
                var weight = page.layout[i].widget.info.order || 0;
                if (orderedWidgets.hasOwnProperty(weight)) {
                    orderedWidgets.weight.push(page.layout[i].widget);
                } else {
                    orderedWidgets.weight = [page.layout[i].widget];
                }
            }
        }
    };

    init();
    setTimeout(function(){ wireWidgets(); }, 5000);

    portal.dashboards.functions.view = {
        update: updateDashboard,
        publishToTopics:publishToTopics
    };
}());