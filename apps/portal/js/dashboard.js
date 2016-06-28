/*
 * Copyright (c) 2015, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
    /**
     * Gadget default view mode.
     * @const
     */
    var DASHBOARD_DEFAULT_VIEW = 'default';
    /**
     * Gadget full screen mode.
     * @const
     */
    var DASHBOARD_FULL_SCEEN_VIEW = 'full';
    /**
     * Gadget settings view mode.
     * @const
     */
    var DASHBOARD_SETTINGS_VIEW = 'settings';
    /**
     * Gadget container prefix.
     * @const
     */
    var CONTAINER_PREFIX = 'gadget-';
    
    /**
     * RPC service name for gadget button callback.
     * @const
     */
    var RPC_GADGET_BUTTON_CALLBACK = "RPC_GADGET_BUTTON_CALLBACK";

    /**
     * Anonymous dashboard view mode.
     * @const
     */
    var ANONYMOUS_DASHBOARD_VIEW = 'anon';

    var dashboardsApi = ues.utils.tenantPrefix() + 'apis/dashboards';
    
    var page;
    /**
     * Pre-compiling Handlebar templates
     */
    var componentToolbarHbs = Handlebars.compile($('#ues-component-actions-hbs').html());
    var gadgetSettingsViewHbs = Handlebars.compile($('#ues-gadget-setting-hbs').html());
    var menuListHbs = Handlebars.compile($("#ues-menu-list-hbs").html());
    /**
     * Initializes the component toolbar.
     * @return {null}
     * @private
     */
    var initComponentToolbar = function () {
        var viewer = $('.ues-components-grid');

        // gadget title bar custom button function handler
        viewer.on('click', '.ues-custom-action', function (e) {
            var fid = $(this).closest('.ues-component-box').find('iframe').attr('id');
            var action = $(this).attr('data-action');
            gadgets.rpc.call(fid, RPC_GADGET_BUTTON_CALLBACK, null, action);
        });

        //gadget titlebar click function handler
/*        viewer.on('click', '.ues-component-heading', function (e) {
            console.log('ues-component-heading clicked');
            if( $(this).hasClass('edit') ){
                //TODO disable edit options from the dashboard view
                $(this).removeClass('edit');
                $(this).find('.ues-component-full-handle').show();
                $(this).find('.ues-component-delete-handle').hide();


            } else {
                //TODO enable edit options in the dashboard view
                $(this).addClass('edit');
                //change maxmize iclass to delete
                $(this).find('.ues-component-full-handle').hide();
                $(this).find('.ues-component-delete-handle').show();

                //debugger;
                //
            }
        });*/

        // gadget maximization handler
        viewer.on('click', '.ues-component-full-handle', function (e) {
            var id = $(this).closest('.ues-component').attr('id');
            var component = ues.dashboards.findComponent(id, page);
            var componentBox = $(this).closest('.ues-component-box');
            var gsContainer = $('.grid-stack');
            var gsBlock = componentBox.parent();
            if (component.fullViewPoped) {
                // render normal view
                $('.ues-component-box').show();
                $('.sidebar-wrapper').show();
                // restore the original height and remove the temporary attribute
                gsContainer.height(gsContainer.attr('data-orig-height')).removeAttr('data-orig-height');
                gsBlock.removeClass('ues-component-fullview');
                renderMaxView(component, DASHBOARD_DEFAULT_VIEW);
                // modify the tooltip message and the maximize icon
                $(this)
                    .attr('title', $(this).data('maximize-title'))
                    .find('i.fw')
                    .removeClass('fw-contract')
                    .addClass('fw-expand');
                component.fullViewPoped = false;
            } else {
                // render max view
                $('.ues-component-box:not([id="' + componentBox.attr('id') + '"])').hide();
                $('.sidebar-wrapper').hide();
                // backup the origin height and render the max view
                gsContainer.attr('data-orig-height', gsContainer.height()).height('auto');
                gsBlock.addClass('ues-component-fullview');
                renderMaxView(component, DASHBOARD_FULL_SCEEN_VIEW);
                // modify the tooltip message and the maximize icon
                $(this)
                    .attr('title', $(this).data('minimize-title'))
                    .find('i.fw')
                    .removeClass('fw-expand')
                    .addClass('fw-contract');
                component.fullViewPoped = true;
            }
            $('.nano').nanoScroller();
        });

        // gadget settings handler
        viewer.on('click', '.ues-component-settings-handle', function (event) {
            event.preventDefault();
            var id = $(this).closest('.ues-component').attr('id');
            var component = ues.dashboards.findComponent(id,page);
            var componentContainer = $('#' + CONTAINER_PREFIX + id);
            // toggle the component settings view if exists
            if (component.hasCustomUserPrefView) {
                switchComponentView(component, (component.viewOption == DASHBOARD_SETTINGS_VIEW ?
                    DASHBOARD_DEFAULT_VIEW : DASHBOARD_SETTINGS_VIEW));
                return;
            }
            if (componentContainer.hasClass('ues-userprep-visible')) {
                componentContainer.removeClass('ues-userprep-visible');
                updateComponentProperties(componentContainer.find('.ues-sandbox'), component);
                return;
            }
            componentContainer.html(gadgetSettingsViewHbs(component.content)).addClass('ues-userprep-visible');
        });
    };

    /**
     * Switch component view mode
     * @param {Object} component
     * @param {String} view
     * @returns {null}
     * @private
     */
    var switchComponentView = function (component, view) {
        component.viewOption = view;
        ues.components.update(component, function (err, block) {
            if (err) {
                throw err;
            }
        });
    };

    /**
     * Render maximized view for a gadget
     * @param {Object} component
     * @param {String} view
     * @returns {null}
     * @private
     */
    var renderMaxView = function (component, view) {
        component.viewOption = view;
        ues.components.update(component, function (err, block) {
            if (err) {
                throw err;
            }
        });
    };
    /**
     * Renders the component toolbar of a given component.
     * @param {Object} component Component object
     * @returns {null}
     * @private
     */
    var renderComponentToolbar = function (component) {
        if (component) {
            // Check whether any user preferences are exists
            var userPrefsExists = false;
            for (var key in component.content.options) {
                if (component.content.options[key].type.toUpperCase() != 'HIDDEN') {
                    userPrefsExists = true;
                    break;
                }
            }

            // Validate and build the toolbar button options to be passed to the handlebar template
            var toolbarButtons = component.content.toolbarButtons || {};
            toolbarButtons.custom = toolbarButtons.custom || [];
            toolbarButtons.default = toolbarButtons.default || {};
            if (!toolbarButtons.default.hasOwnProperty('maximize')) {
                toolbarButtons.default.maximize = true;
            }
            if (!toolbarButtons.default.hasOwnProperty('configurations')) {
                toolbarButtons.default.configurations = true;
            }

            toolbarButtons.default.configurations = toolbarButtons.default.configurations  && userPrefsExists && (ues.global.dbType !== 'anon');
            for (var i = 0; i < toolbarButtons.custom.length; i++) {
                toolbarButtons.custom[i].iconTypeCSS = (toolbarButtons.custom[i].iconType.toLowerCase() == 'css');
                toolbarButtons.custom[i].iconTypeImage = (toolbarButtons.custom[i].iconType.toLowerCase() == 'image');
            }

            var buttonCount = toolbarButtons.custom.length;
            if (toolbarButtons.default.maximize) {
                buttonCount++;
            }
            if (toolbarButtons.default.configurations) {
                buttonCount++;
            }
            toolbarButtons.isDropdownView = buttonCount > 3;

            var componentBox = $('#' + component.id);
            // Set the width of the gadget heading
            var buttonUnitWidth = 41;
            var headingWidth = 'calc(100% - ' + ((buttonCount > 3 ? 1 : buttonCount) * buttonUnitWidth + 25)  + 'px)';
            componentBox.find('.gadget-title').css('width', headingWidth);
            // Render the gadget template
            componentBox.find('.ues-component-actions').html(componentToolbarHbs(toolbarButtons));
        }
    };

    //compile handlebar for the menu list
    var updateMenuList = function() {
        //menulist for big res
        $('#ues-pages').html(menuListHbs({
            menu: ues.global.dashboard.menu,
            isAnonView: isAnonView,
            user: user,
            isHiddenMenu: ues.global.dashboard.hideAllMenuItems,
            queryString: queryString
        }));
        //menulist for small res
        $('#ues-pages-col').html(menuListHbs({
            menu: ues.global.dashboard.menu,
            isAnonView: isAnonView,
            user: user,
            isHiddenMenu: ues.global.dashboard.hideAllMenuItems,
            queryString: queryString
        }));
    };

    /**
     * This is the initial call from the dashboard.js.
     * @return {null}
     * @private
     */
    var initDashboard = function () {
        var allPages = ues.global.dashboard.pages;
        if (allPages.length > 0) {
            page = (ues.global.page ? ues.global.page : allPages[0]);
        }
        for (var i = 0; i < allPages.length; i++) {
            if (ues.global.page == allPages[i].id) {
                page = allPages[i];
            }
        }
        ues.dashboards.render($('.gadgets-grid'), ues.global.dashboard, ues.global.page, ues.global.dbType, function () {
            // render component toolbar for each components
            $('.ues-component-box .ues-component').each(function () {
                var component = ues.dashboards.findComponent($(this).attr('id'),page);
                renderComponentToolbar(component);
            });
            $('.grid-stack').gridstack({
                width: 12,
                cellHeight: 50,
                verticalMargin: 30,
                disableResize: false,
                disableDrag: false,
            }).on('dragstop', function (e, ui) {
                updateLayout();
            }).on('resizestart', function (e, ui) {
                // hide the component content on start resizing the component
                var container = $(ui.element).find('.ues-component');
                if (container) {
                    container.find('.ues-component-body').hide();
                }
            }).on('resizestop', function (e, ui) {
                // re-render component on stop resizing the component
                var container = $(ui.element).find('.ues-component');
                if (container) {
                    var gsItem = container.closest('.grid-stack-item');
                    var node = gsItem.data('_gridstack_node');
                    var gsHeight = node ? node.height : parseInt(gsItem.attr('data-gs-height'));
                    var height = (gsHeight * 150) + ((gsHeight - 1) * 30);
                    container.closest('.ues-component-box').attr('data-height', height);
                    container.find('.ues-component-body').show();
                    if (container.attr('id')) {
                        updateComponent(container.attr('id'));
                    }
                }

                updateLayout();

            });
        });
        $('.nano').nanoScroller();
    };

    /**
     * Update the layout after modification.
     * @return {null}
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
        for (i = 0; i < res.length; i++) {
            if (res[i]) {
                serializedGrid.push(res[i]);
            }
        }

        var json = {blocks: serializedGrid};
        var id;
        var i;
        var length;
        // find the current page index
        for (i = 0,length = ues.global.dashboard.pages.length; i < length; i++) {
            if (ues.global.dashboard.pages[i].id === page.id) {
                id = i;
            }
        }
        if (typeof id === 'undefined') {
            throw 'Specified page : ' + page.id + ' cannot be found';
        }
        if (pageType === ANONYMOUS_DASHBOARD_VIEW) {
            ues.global.dashboard.pages[id].layout.content.anon = json;
        } else {
            ues.global.dashboard.pages[id].layout.content.loggedIn = json;
        }
        saveDashboard();
    };

    /**
     * Saves the dashboard content.
     * @return {null}
     * @private
     */
    var saveDashboard = function () {
        var method = 'PUT';
        var url = dashboardsApi + '/' + dashboard.id;
        var isRedirect = false;
        $.ajax({
            url: url,
            method: method,
            data: JSON.stringify(dashboard),
            async: false,
            contentType: 'application/json'
        }).success(function (data) {
            //generateMessage("Dashboard saved successfully", null, null, "success", "topCenter", 2000, null);
            console.log("Dashboard saved successfully.");
            if (isRedirect) {
                isRedirect = false;
                window.location = dashboardsUrl + '/' + dashboard.id + "?editor=true";
            }
        }).error(function (xhr, status, err) {
            if (xhr.status === 403) {
                window.location.reload();
                return;
            }
            //("Error saving the dashboard", null, null, "error", "topCenter", 2000, null);
            console.log("Error saving the dashboard.");
        });
    };

    /**
     * Triggers update hook of a given component.
     * @param {String} id   Component ID
     * @return {null}
     * @private
     */
    var updateComponent = function (id) {
        ues.components.update(findComponent(id), function (err) {
            if (err) {
                throw err;
            }
        });
    };

    /**
     * Find a given component in the current page.
     * @param {String} id   The component ID
     * @return {Object}
     * @private
     */
    var findComponent = function (id) {
        var i;
        var length;
        var area;
        var component;
        var components;
        pageType = pageType ? pageType : DEFAULT_DASHBOARD_VIEW;
        var content = page.content[pageType];
        for (area in content) {
            if (content.hasOwnProperty(area)) {
                components = content[area];
                length = components.length;
                for (i = 0; i < length; i++) {
                    component = components[i];
                    if (component.id === id) {
                        return component;
                    }
                }
            }
        }
    };

    initDashboard();
    updateMenuList();
    initComponentToolbar();
});

/**
 * We make this true so that the dashboard.jag files inline ues.dashboards.render method is not triggered.
 * @type {boolean}
 */
ues.global.renderFromExtension = true;
