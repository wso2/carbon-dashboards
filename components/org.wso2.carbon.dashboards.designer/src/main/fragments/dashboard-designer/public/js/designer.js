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
    "use strict";
    var dashboard = dashboardMetadata.dashboard;
    var metadata = dashboardMetadata.metadata;
    var widgetInfo = {};
    var layoutInfo = {};
    var blockCount = 0;
    var content = "";
    var page;

    /**
     * Initialize the dashboard viewer.
     * */
    var init = function () {
        page = getPage();
        initGadgetList();
        initLayoutList();
        if (page) {
            if (page.layout && page.layout.length > 0) {
                renderBlocks(renderBlockCallback);
                initPublishers();
            } else {
                initGridstack();
            }
        } else {
            // TODO: Show add page options in the UI
        }
    };

    /**
     * Get the page details from the dashboard.json file.
     * @returns {*}
     */
    var getPage = function () {
        var pageName; // todo: try to get this from the url
        if (!pageName) {
            for (var name in dashboard.pages) {
                if (dashboard.pages.hasOwnProperty(name)) {
                    pageName = name;
                    break;
                }
            }
        }

        if (!pageName) {
            // todo: no pages in the dashboard
            return;
        }

        var names = pageName.split('/');
        var page;
        for (var i = 0; i < names.length; i++) {
            if (names[i].length > 0) {
                if (!page) {
                    page = dashboard.pages[names[i]];
                } else {
                    // todo: check the pages sub property as well
                }
            }
        }
        if (!page) {
            // todo: send error 404 not found
            return;
        }
        return page;
    }

    /**
     * Remove existing layout and widgets from the dashboard configuation.
     * */
    var destroyDashboard = function () {
        var html = '<div class="grid-stack" id="grid-stack"></div>';
        page.layout = [];
        $('.grid-stack').data('gridstack').destroy(true);
        $('.gadgets-grid').html(html);
    }

    /**
     * Apply provided layout to the dashboard
     * */
    var applyLayout = function (layout) {
        page.layout = layout.blocks;
        blockCount = 0;
        saveDashboard();
        initGadgetList();
        renderBlocks(renderDynamicBlockCallback);
    }

    /**
     * Render gadget blocks by reading the dashboard json.
     * @param dashboard {Object} dashboard json object
     * */
    var renderBlocks = function (callback) {
        for (var i = 0; i < page.layout.length; i++) {
            UUFClient.renderFragment(Constants.WIDGET_CONTAINER_FRAGMENT_NAME, page.layout[i], "gridContent",
                Constants.APPEND_MODE, callback);
        }
    };

    /**
     * Populate dashboardMetadata.publishers by reading the widget configs.
     * */
    var initPublishers = function () {
        dashboardMetadata.publishers = [];
        for (var i = 0; i < page.layout.length; i++) {
            if (page.layout[i].widget) {
                var widget = page.layout[i].widget;
                if (widget.pubsub && widget.pubsub.isPublisher) {
                    dashboardMetadata.publishers.push(widget.pubsub.topic);
                }
            }
        }
    };

    /**
     * This is the callback which is triggered after generating the widgetList.
     * @type {{onSuccess: gadgetListCallback.onSuccess, onFailure: gadgetListCallback.onFailure}}
     */
    var widgetListCallback = {
        onSuccess: function () {
        },
        onFailure: function (message, e) {
        }
    };

    /**
     * This is the callback which is triggered after rendering blocks.
     * @type {{onSuccess: renderBlockCallback.onSuccess, onFailure: renderBlockCallback.onFailure}}
     */
    var renderBlockCallback = {
        onSuccess: function () {
            blockCount++;
            if (blockCount === page.layout.length) {
                initGridstack();
                renderWidgets(dashboard);
            }
        },
        onFailure: function () {
            blockCount++;
            if (blockCount === page.layout.length) {
                initGridstack();
                renderWidgets(dashboard);
            }
        }
    };

    /**
     * This is the callback which is triggered after dynamic rendering of blocks.
     * This will concatanate provided html content and append to the grid-stack before initializing.
     * @type {{onSuccess: renderDynamicBlockCallback.onSuccess, onFailure: renderDynamicBlockCallback.onFailure}}
     */
    var renderDynamicBlockCallback = {
        onSuccess: function (data) {
            content += data;
            blockCount++;
            if (blockCount === page.layout.length) {
                $('.grid-stack').append(content);
                initGridstack();
            }
        },
        onFailure: function () {
            blockCount++;
            if (blockCount === page.layout.length) {
                initGridstack();
            }
        }
    };

    /**
     * This method will initialize the widget component box's events and widget list's events.
     */
    var initGridstack = function () {
        $('.grid-stack').gridstack({
            width: 12,
            cellHeight: 50,
            verticalMargin: 30,
            disableResize: false,
            disableDrag: false
        }).on('dragstop', function () {
            updateLayout();
            saveDashboard();
        }).on('resizestart', function (e, ui) {
            // hide the component content on start resizing the component
            var container = $(ui.element).find('.dashboards-component');
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

                for (var i = 0; i < page.layout.length; i++) {
                    if (page.layout[i].id === blockId) {
                        renderWidgetByBlock(page.layout[i]);
                    }
                }
                container.find('.dashboards-component-body').show();
            }
            updateLayout();
            saveDashboard();
        });

        $('.gadgets-grid').on('click', '.dashboard-component-box .dashboards-trash-handle', function () {
            var that = $(this);
            var componentBox = that.closest('.dashboard-component-box');
            $('.grid-stack').data('gridstack').remove_widget(componentBox.parent());
            removeWidgetFromDashboardJSON(componentBox.attr("id"));
            updateLayout();
            saveDashboard();
            initGadgetList();
        });

        $('.gadgets-grid').on('click', '.dashboard-component-box .dashboards-config-handle', function (e) {
            e.preventDefault();
            $('#widget-config-subscriber').hide();
            $("#widget-config-publisher").hide();
            $("#widget-config-alert").hide();
            var id = $(this).closest(".dashboard-component-box").attr('id');
            var isPublisher = $(this).closest(".dashboard-component-box").data('publisher');
            var isSubscriber = $(this).closest(".dashboard-component-box").data('subscriber');
            var isPubsub = isPublisher || isSubscriber;
            var widgetConfig;

            for (i = 0; i < page.layout.length; i++) {
                if (page.layout[i].id === id) {
                    widgetConfig = page.layout[i].widget;
                }
            }

            $("#widget-order-val").val(widgetConfig.info.order || 0);

            if (isPubsub) {
                if (isSubscriber) {
                    var j;
                    var publishers = dashboardMetadata.publishers;
                    var subscribedTopics = widgetConfig.pubsub.subscribesTo;

                    if (publishers.length > 0) {
                        $('#widget-config-subscriber').show();
                        $('#widget-conf-content').empty();

                        for (j in publishers) {
                            if (publishers.hasOwnProperty(j)) {
                                $('<input>').attr({
                                   'type': 'checkbox',
                                   'checked': subscribedTopics.indexOf(publishers[j]) != -1,
                                   'value': publishers[j],
                                   'data-id': id
                               }).addClass("topic-checkbox").appendTo($('#widget-conf-content')).after(publishers[j] + '<br>');
                            }
                        }

                    } else {
                        //TODO Use i18n for the msg once available through UUFClient
                        $('#widget-config-alert').html("No topics to subscribe!").show();
                    }
                } else {
                    $("#widget-config-publisher").show();
                    $('#publish-topic').val(widgetConfig.pubsub.topic);
                }
            }

            $('#widget-config-save').data('id', id);
            $.sidebar_toggle("show", "#right-sidebar", ".page-content-wrapper");
        });

        initializeWidgetConfigSidebar();
    };

    /**
     * Initialize the listeners for the widget configuration sidebar
     */
    var initializeWidgetConfigSidebar = function () {
        $('#right-sidebar').on('change', '.topic-checkbox', function (e) {
            for (var i = 0; i < page.layout.length; i++) {
                if (page.layout[i].id === $(this).data('id')) {
                    widget = page.layout[i].widget;
                    if (this.checked) {
                        widget.pubsub.subscribesTo.push($(this).val());
                        pubsub.subscribe($(this).val(), portal.dashboards.subscribers[widget.info.id]._callback,
                            page.layout[i].id);
                    } else {
                        var index = widget.pubsub.subscribesTo.indexOf($(this).val());
                        if (index > -1) {
                            widget.pubsub.subscribesTo.splice(index, 1);
                            //TODO pubsub.unsubcribe
                        }

                    }
                    saveDashboard();
                }
            }
        }).on('click', '#widget-config-save', function (e) {
            var order = $("#widget-order-val").val();
            var widget;
            for (var i = 0; i < page.layout.length; i++) {
                if (page.layout[i].id === $('#widget-config-save').data('id')) {
                    widget = page.layout[i].widget;
                }
            }
            if (widget) {
                if ((!isNan(order)) && order >= 0 && (order % 1 === 0)) {
                    widget.info.order = $("#widget-order-val").val();
                }
                if (widget.pubsub.isPublisher && (widget.pubsub.topic !== $('#publish-topic').val())) {
                    //TODO Use i18n for the confirm text message, once available through UUFClient.
                    noty({
                        text : 'Changing topic might affect existing subscribers, Do you want to continue?',
                        buttons : [{
                        addClass : 'btn',
                        text : 'Cancel',
                        'layout' : 'center',
                        onClick : function($noty) {
                            $noty.close();
                        }
                        }, {
                        addClass : 'btn btn-warning',
                        text : 'Yes',
                        onClick : function($noty) {
                            widget.pubsub.topic = $('#publish-topic').val();
                            saveDashboard();
                            initPublishers();
                        }}]
                    });
                }
                saveDashboard();
            }
        });
    };

    /**
     * Initialized adding block function.
     * @return {null}
     */
    var initAddBlock = function () {

        var dummySizeChanged = function () {
            var dummy = $('.dashboards-dummy-gadget');
            var unitSize = parseInt(dummy.data('unit-size'));

            dummy.css({
                width: unitSize * parseInt($('#block-width').val()),
                height: unitSize * parseInt($('#block-height').val())
            });
        };

        // redraw the grid when changing the width/height values
        $('#block-height, #block-width')
            .on('change', dummySizeChanged)
            .on('keyup', dummySizeChanged)
            .on('blur', dummySizeChanged);

        // add block handler
        $('#add-block-btn').on('click', function () {

            var width = $('#block-width').val() || 0;
            var height = $('#block-height').val() || 0;
            var id = generateBlockGUID();
            var pubsub = { isPublisher: false, isSubscriber: false };

            if (width === 0 || height === 0) {
                return;
            }
            var data = {};
            data.height = height;
            data.id = id;
            data.width = width;
            data.x = 0;
            data.y = 0;
            data.widget = {};
            data.widget.pubsub = pubsub;
            UUFClient.renderFragment(Constants.WIDGET_CONTAINER_FRAGMENT_NAME, data, {
                onSuccess: function (data) {
                    $('.grid-stack').data('gridstack').add_widget(data, 0, 0, width, height);
                    updateLayout();
                    saveDashboard();
                },
                onFailure: function (message, e) {
                    //TODO : Add notification to inform the user
                }
            });
        });
        var dummyGadget = $('.dashboards-dummy-gadget');
        var blockWidth = $('#block-width');
        var blockHeight = $('#block-height');
        dummyGadget.resizable({
            grid: 18,
            containment: '.dashboards-block-container',
            resize: function () {
                var height = $(this).height() / 18;
                var width = $(this).width() / 18;
                blockWidth.val(width);
                blockHeight.val(height);
            }
        });
        blockWidth.val(dummyGadget.width() / 18);
        blockHeight.val(dummyGadget.height() / 18);
    };

    /**
     * Generate GUID.
     * @returns {String}
     */
    var generateBlockGUID = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
    };

    /**
     * update dashboard json Object by adding newly added widget.
     * @param blockID
     * @param widgetID
     */
    var addWidgetToDashboardJSON = function (blockID, widgetID) {
        for (var i = 0; i < page.layout.length; i++) {
            if (page.layout[i].id === blockID) {
                page.layout[i].widget = widgetInfo[widgetID];
                page.layout[i].widget.url = Constants.FRAGMENT_URL + widgetID;
            }
        }
    };

    /**
     * update dashboard json Object by removing newly deleted widget.
     * @param blockID
     */
    var removeWidgetFromDashboardJSON = function (blockID) {
        for (var i = 0; i < page.layout.length; i++) {
            if (page.layout[i].id === blockID && page.layout[i].widget && page.layout[i].widget.info.id) {
                updateWidgetList(page.layout[i].widget.info.id, null, "remove")
                delete page.layout[i].widget;
            }
        }
    };

    /**
     * retrieve the gadget list by invoking the available api.
     */
    var initGadgetList = function () {
        $('#widgetList').find('.dashboards-thumbnail').remove();
        $.ajax({
            url: Constants.WIDGET_METAINFO_GET_URL,
            method: Constants.HTTP_GET,
            async: true,
            success: function (widgetList) {
                generateWidgetInfoJSON(widgetList[0]);
                portal.dashboards.widgets = widgetInfo;
                var widgetJSONLength = widgetList[0].length;
                for (var i = 0; i < widgetJSONLength; i++) {
                    UUFClient.renderFragment(Constants.WIDGET_LIST_CONTAINER_FRAGMENT_NAME,
                        widgetList[0][i].info, "left-panel", Constants.APPEND_MODE, widgetListCallback);
                }
            }
        });
    };

    /**
     * retrieve the layout list by invoking the available api.
     */
    var initLayoutList = function () {
        $.ajax({
            url: Constants.LAYOUT_METAINFO_GET_URL,
            method: Constants.HTTP_GET,
            async: true,
            success: function (layoutList) {
                generateLayoutInfoJSON(layoutList[0]);
                var layoutJSONLength = layoutList[0].length;
                for (var i = 0; i < layoutJSONLength; i++) {
                    UUFClient.renderFragment(Constants.LAYOUT_LIST_CONTAINER_FRAGMENT_NAME, layoutList[0][i],
                        "layout-list", Constants.APPEND_MODE, widgetListCallback);
                }
            }
        });
    };

    /**
     * generate widgetInfo json object using retrieved data.
     * @param widgetList
     */
    var generateWidgetInfoJSON = function (widgetList) {
        var widgetListLength = widgetList.length;
        for (var i = 0; i < widgetListLength; i++) {
            widgetInfo[widgetList[i].info.id] = widgetList[i];
        }
    };

    /**
     * generate layoutInfo json object using retrieved data.
     * @param layoutList
     */
    var generateLayoutInfoJSON = function (layoutList) {
        var layoutListLength = layoutList.length;
        for (var i = 0; i < layoutListLength; i++) {
            portal.dashboards.layouts[layoutList[i].id] = layoutList[i];
            layoutInfo[layoutList[i].id] = layoutList[i];
        }
    };

    /**
     * Render Widgets in to blocks by reading the dashboard json.
     * */
    var renderWidgets = function (dashboard) {
        for (var i = 0; i < page.layout.length; i++) {
            if (page.layout[i].widget) {
                renderWidgetByBlock(page.layout[i]);
            }
        }
    };

    /**
     * Wire Widgets by going through the available widget configs..
     * */
    var wireWidgets = function () {
        var layouts = page.layouts;
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

    /**
     * Render Widget into a given block by reading the dashboard json.
     * */
    var renderWidgetByBlock = function (block) {
        //pub/sub is the only configurale parameter at the moment, update this when introducing new parameters.
        if (block.widget) {
            widget.renderer.render(block.id, block.widget.url, false);
        }
    };

    /**
     * Render Widget into a given block by reading the dashboard json.
     * */
    var renderWidgetByURL = function (blockId, widgetURL, widgetId) {
        //pub/sub is the only configurable parameter at the moment, update this when introducing new parameters.
        widget.renderer.render(blockId, widgetURL, false);
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
     * Updates the widgetList global object based on the action.
     * @param id
     * @param widget
     * @param action
     *
     */
    var updateWidgetList = function (id, widget, action) {
        if (action === "add") {
            portal.dashboards.widgetList[id] = widget;
        } else {
            delete portal.dashboards.widgetList[id];
        }
    }

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
            contentType: Constants.APPLICATION_JSON
        });
        //TODO: Implement notification message to display ajax call success/failure
    };

    /**
     * generate the metadata payload to invoke rest apis.
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
     * globally exposed function to enable widget drag
     * Set the data.transfer widgetID
     */
    function widgetDrag(e) {
        e.dataTransfer.setData("widgetID", e.target.id);
    }

    /**
     * globally exposed function to enable widget drop
     * Save and update the dashboard using the new widget
     */
    function widgetDrop(e) {
        e.preventDefault();
        var widgetID = e.dataTransfer.getData("widgetID");
        var blockID = e.currentTarget.id;
        renderWidgetByURL(blockID, Constants.FRAGMENT_URL + widgetID, widgetID);
        addWidgetToDashboardJSON(blockID, widgetID);
        updateWidgetList(widgetID, portal.dashboards.widgets[widgetID], "add")
        updateLayout();
        saveDashboard();
        initGadgetList();
    }

    /**
     * globally exposed function to enable widget drop
     */
    function widgetAllowDrop(e) {
        e.preventDefault();
    }

    function publishToTopics (msg, instanceID) {
        var i;
        for (i in page.layout) {
            if (page.layout.hasOwnProperty(i) && page.layout[i].widget && page.layout[i].widget.pubsub &&
                page.layout[i].widget.pubsub.isPublisher && (instanceID === page.layout[i].id)) {
                pubsub.publish(msg, page.layout[i].widget.pubsub.topic);
            }
        }
    }

    init();
    initAddBlock();
    //TODO make this a callback
    setTimeout(function(){ wireWidgets(); }, 5000);

    portal.dashboards.functions.designer = {
        renderBlocks: renderBlocks,
        destroyDashboard: destroyDashboard,
        applyLayout: applyLayout,
        widgetDrag:widgetDrag,
        widgetDrop:widgetDrop,
        widgetAllowDrop:widgetAllowDrop,
        publishToTopics:publishToTopics
    };

}());
