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
     * Dashboard anonymous view mode
     * @const
     */
    var DASHBOARD_ANON_VIEW = 'anon';
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
     * Anonymous view role
     * @const
     */
    var ANONYMOUS_ROLE = 'anonymous';
    
    var page;
    var selectedViewId;
    /**
     * Pre-compiling Handlebar templates
     */
    var componentToolbarHbs = Handlebars.compile($('#ues-component-actions-hbs').html());
    var gadgetSettingsViewHbs = Handlebars.compile($('#ues-gadget-setting-hbs').html());
    var menuListHbs = Handlebars.compile($("#ues-menu-list-hbs").html());
    var viewOptionHbs = Handlebars.compile($("#view-option-hbs").html());

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
            var component = ues.dashboards.findComponent(id, page);
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

            //check whether the view is an anonymous view
            var viewRoles = page.views.content[ues.global.dbType].roles;

            var isAnonView = false;
            if (ues.global.dbType === DASHBOARD_ANON_VIEW) {
                if (!viewRoles) {
                    isAnonView = true;
                }
            }
            if (viewRoles !== undefined && (viewRoles.length > 0 && viewRoles[0].toLowerCase() === ANONYMOUS_ROLE)) {
                isAnonView = true;
            }

            toolbarButtons.default.configurations = toolbarButtons.default.configurations && userPrefsExists && !isAnonView;
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

    /**
     * Returns the list of allowed views for the current user
     * @param page Current page
     * @returns {Array} List of allowe roles
     */
    var getUserAllowedViews = function (page) {
        $('#ds-allowed-view-list').empty();
        var allowedViews = [];
        var views = Object.keys(JSON.parse(JSON.stringify(page.views.content)));
        for (var i = 0; i < views.length; i++) {
            var viewRoles = page.views.content[views[i]].roles;
            if (isAllowedView(viewRoles)) {
                allowedViews.push(views[i]);
                var tempViewName = page.views.content[views[i]].name;
                var viewOption = {
                    viewName: tempViewName,
                    viewId : getViewId(tempViewName.trim())
                };
                $('#ds-allowed-view-list').append(viewOptionHbs(viewOption));
            }
        }
        return allowedViews;
    };

    //event handler for selecting views from the dropdown list in the page
    $(document).on('change', '#ds-allowed-view-list', function (event) {
        event.preventDefault();
        var selectedView = $('#ds-allowed-view-list option:selected').text().trim();
        var previousSelectedView = selectedViewId || ues.global.dbType;
        selectedViewId = getViewId(selectedView);
        ues.global.dbType = selectedViewId;
        destroyPage(page, previousSelectedView);
        renderViewContent(selectedViewId);
    });

    /**
     * Destroys all areas in a given page.
     * @param {Object} page     The page object
     * @param {String} pageType Type of the page
     * @param {function} done   Callback function
     * @return {null}
     * @private
     */
    var destroyPage = function (page, pageType, done) {
        var area;
        pageType = pageType || DEFAULT_DASHBOARD_VIEW;
        var content = page.content[pageType];
        var tasks = [];
        for (area in content) {
            if (content.hasOwnProperty(area)) {
                tasks.push((function (area) {
                    return function (done) {
                        destroyArea(area, function (err) {
                            done(err);
                        });
                    };
                }(content[area])));
            }
        }
        async.parallel(tasks, function (err, results) {
            $('.gadgets-grid').empty();
            if (!done) {
                return;
            }

            done(err);
        });
    };

    /**
     * Destroys a given list of components of an area.
     * @param {Object[]} components Components to be removed
     * @param {function} done       Callback function
     * @return {null}
     * @private
     */
    var destroyArea = function (components, done) {
        var i;
        var length = components.length;
        var tasks = [];
        for (i = 0; i < length; i++) {
            tasks.push((function (component) {
                return function (done) {
                    destroyComponent(component, function (err) {
                        done(err);
                    });
                };
            }(components[i])));
        }
        async.parallel(tasks, function (err, results) {
            done(err);
        });
    };

    /**
     * Destroys the given component.
     * @param {Object} component    Component to be destroyed
     * @param {function} done       Callback function
     * @return {null}
     * @private
     */
    var destroyComponent = function (component, done) {
        ues.components.destroy(component, function (err) {
            if (err) {
                return err;
            }
            done(err);
        });
    };

    /**
     * Returns view id when the view name is given
     * @param viewName View name
     * @returns {String} View id
     */
    var getViewId = function (viewName) {
        var views = Object.keys(JSON.parse(JSON.stringify(page.views.content)));
        for (var i = 0; i < views.length; i++) {
            if (page.views.content[views[i]].name) {
                if (page.views.content[views[i]].name === viewName) {
                    return views[i];
                }
            }
        }
        return null;
    };

    /**
     * Check whether a view is allowed for the current user
     * according to his/her list of roles
     * @param viewRoles Allowed roles list for the view
     * @returns {boolean} View is allowed or not
     */
    var isAllowedView = function (viewRoles) {
        for (var i = 0; i < userRolesList.length; i++) {
            var tempUserRole = userRolesList[i];
            for (var j = 0; j < viewRoles.length; j++) {
                if (viewRoles[j] === tempUserRole) {
                    return true;
                }
            }
        }
        return false;
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
     * Render the view content
     * @param viewId View id
     */
    var renderViewContent = function (viewId) {
        $("#ds-allowed-view-list > option").each(function() {
            if ($(this).val() === viewId) {
                $('#ds-allowed-view-list').val(viewId);
            }
        });
        ues.dashboards.render($('.gadgets-grid'), ues.global.dashboard, ues.global.page, viewId, function () {
            // render component toolbar for each components
            $('.ues-component-box .ues-component').each(function () {
                var component = ues.dashboards.findComponent($(this).attr('id'),page);
                renderComponentToolbar(component);
            });
            $('.grid-stack').gridstack({
                width: 12,
                cellHeight: 50,
                verticalMargin: 30,
                disableResize: true,
                disableDrag: true
            });
        });
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
        var allowedViews = getUserAllowedViews(page);
        var renderingView;

        if (embeddableView) {
            renderingView = embeddableView;
        } else {
            if (allowedViews.length > 0) {
                if (currentView) {
                    for (var view in allowedViews) {
                        if (allowedViews[view] === currentView) {
                            renderingView = allowedViews[view];
                        }
                    }
                } else {
                    renderingView = allowedViews[0];
                }
            }
        }
        //if there is more than one view, enable dropdown list
        if (allowedViews.length > 1) {
            $('#list-user-views').removeClass("hide");
            $('#list-user-views').removeClass("show");
        }
        ues.global.dbType = renderingView;
        renderViewContent(renderingView);
        $('.nano').nanoScroller();
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
