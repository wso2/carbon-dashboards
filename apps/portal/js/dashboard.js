/*
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

    /**
     * Http status code for not found
     * @type {number}
     * @const
     */
    var NOT_FOUND_ERROR_CODE = 404;

    /**
     * Http status code for un authorized
     * @type {number}
     * @const
     */
    var UNAUTHORIZED_ERROR_CODE = 401;

    var dashboardsApi = ues.utils.tenantPrefix() + 'apis/dashboards';

    /**
     * url for restore dashboard page
     * @const
     */
    var dashboardsApiRestore = ues.utils.tenantPrefix() + 'apis/dashboards/restore';

    /**
     * url for update theme properties
     * @const
     */
    var themeApi = ues.utils.tenantPrefix() + 'apis/theme';
    var page;
    var dashboardTheme = {};
    var selectedViewId;
    /**
     * Pre-compiling Handlebar templates
     */
    var componentToolbarHbs = Handlebars.compile($('#ues-component-actions-hbs').html());
    var gadgetSettingsViewHbs = Handlebars.compile($('#ues-gadget-setting-hbs').html());
    var menuListHbs = Handlebars.compile($("#ues-menu-list-hbs").html());
    var viewOptionHbs = Handlebars.compile($("#view-option-hbs").html());
    var dsErrorHbs = Handlebars.compile($("#ds-error-hbs").html());

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
            e.preventDefault();
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
            ues.components.destroy(component, function (err) {
                if (err) {
                    throw err;
                }
            });
            componentContainer.html(gadgetSettingsViewHbs(component.content)).addClass('ues-userprep-visible');
        });

        // event handler for trash button
        viewer.on('click', '.ues-component-box .ues-trash-handle', function () {
            if (isPersonalizeEnabled) {
                var that = $(this);
                var confirmDeleteBlockHbs = Handlebars.compile($('#ds-modal-confirm-delete-block-hbs').html());
                var hasComponent = false;
                var hasHidden = hasHiddenGadget(that.closest('.ues-component-box'));
                if (that.closest('.ues-component-box').find('.ues-component').attr('id')) {
                    hasComponent = true;
                }
                if (!hasComponent) {
                    hasComponent = hasHidden;
                }
                showHtmlModal(confirmDeleteBlockHbs({hasComponent: hasComponent}), function () {
                    var designerModal = $('#dashboardViewModal');
                    designerModal.find('#btn-delete').on('click', function () {
                        var action = designerModal.find('.modal-body input[name="delete-option"]:checked').val();
                        var componentBox = that.closest('.ues-component-box');
                        var componentBoxId = componentBox.attr('id');
                        var id = componentBox.find('.ues-component').attr('id');

                        if (id) {
                            removeComponent(findComponent(id), function (err) {
                                if (err) {
                                    generateMessage(err, null, null, "error", 'topCenter', 2000, null);
                                    throw err;
                                } else {
                                    updateLayout();
                                    updateRefreshBtn(ues.global.page);
                                }
                                $("#" + ues.global.page).show();
                            });
                        } else {
                            if (hasHidden) {
                                var pageLength = ues.global.dashboard.pages.length;
                                if (ds.database.updateUsageData(ues.global.dashboard, hasHidden[0].content.id, page.id, pageType, false)) {
                                    for (var i = 0; i < pageLength; i++) {
                                        if (ues.global.dashboard.pages[i].id === page.id) {
                                            ues.global.dashboard.pages[i].content[pageType][componentBoxId] = [];
                                            break;
                                        }
                                    }
                                    updateLayout();
                                    updateRefreshBtn(ues.global.page);
                                    componentBox.html("");
                                } else {
                                    generateMessage('Error updating database', null, null, "error", 'topCenter', 2000, null);
                                }
                            }
                        }

                        designerModal.modal('hide');
                    });
                });
            }
        });
    };

    /**
     * Generate Noty Messages as to the content given parameters.
     * @param {String} text     The message
     * @param {function} ok     The OK function
     * @param {function} cancel The Cancel function
     * @param {String} type     Type of the message
     * @param {String} layout   The layout
     * @param {Number} timeout  Timeout
     * @return {Object}
     * @private
     * */
    var generateMessage = function (text, ok, cancel, type, layout, timeout, close) {
        var properties = {};
        properties.text = text;
        if (ok || cancel) {
            properties.buttons = [
                {
                    addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) {
                    $noty.close();
                    if (ok) {
                        ok();
                    }
                }
                },
                {
                    addClass: 'btn btn-danger', text: 'Cancel', onClick: function ($noty) {
                    $noty.close();
                    if (cancel) {
                        cancel();
                    }
                }
                }
            ];
        }

        if (timeout) {
            properties.timeout = timeout;
        }

        if (close) {
            properties.closeWith = close;
        }

        properties.layout = layout;
        properties.theme = 'wso2';
        properties.type = type;
        properties.dismissQueue = true;
        properties.killer = true;
        properties.maxVisible = 1;
        properties.animation = {
            open: {height: 'toggle'},
            close: {height: 'toggle'},
            easing: 'swing',
            speed: 500
        };

        return noty(properties);
    };

    /**
     * To check whether a box has a hidden gadget that is not visible due to authorization or missing file problem
     * @param componentBox
     * @returns {*|boolean}
     */
    var hasHiddenGadget = function (componentBox) {
        pageType = pageType ? pageType : DEFAULT_DASHBOARD_VIEW;
        for (var i = 0; i < ues.global.dashboard.pages.length; i++) {
            if (ues.global.dashboard.pages[i].id === page.id) {
                var component = ues.global.dashboard.pages[i].content[pageType][componentBox.attr('id')];
                return (component && component.length > 0) ? component : null;
            }
        }
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
        if (component && !isPersonalizeEnabled) {
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
            var headingWidth = 'calc(100% - ' + ((buttonCount > 3 ? 1 : buttonCount) * buttonUnitWidth + 25) + 'px)';
            componentBox.find('.gadget-title').css('width', headingWidth);
            // Render the gadget template
            componentBox.find('.ues-component-actions').html(componentToolbarHbs(toolbarButtons));
        }
    };

    /**
     * Returns the list of allowed views for the current user
     * @param page Current page
     * @param isMenuRendering to check whether the user allowed views is required for the menu rendering
     * @returns {Array} List of allowe roles
     */
    var getUserAllowedViews = function (page, isMenuRendering) {
        if (!isMenuRendering) {
            $('#ds-allowed-view-list').empty();
        }
        var allowedViews = [];
        var views = Object.keys(page.views.content);
        for (var i = 0; i < views.length; i++) {
            var viewRoles = page.views.content[views[i]].roles;
            if ((ues.global.dashboard.shareDashboard && !isUserFromSuperDomain) || isAllowedView(viewRoles)) {
                allowedViews.push(views[i]);
                var tempViewName = page.views.content[views[i]].name;
                var viewOption = {
                    viewName: tempViewName,
                    viewId: getViewId(tempViewName.trim())
                };
                if (!isMenuRendering) {
                    $('#ds-allowed-view-list').append(viewOptionHbs(viewOption));
                }
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
        destroyPage(page, previousSelectedView, function (err) {
            if (err) {
                throw err;
            }
            isPersonalizeEnabled ? renderViewContentInEditMode(selectedViewId) : renderViewContentInViewMode(selectedViewId);
            changeMousePointerToMove();
        });
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
            if (hasComponents($("#" + components[i].id).closest(".ues-component-box"))) {
                tasks.push((function (component) {
                    return function (done) {
                        destroyComponent(component, function (err) {
                            done(err);
                        });
                    };
                }(components[i])));
            }
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
        var views = Object.keys(page.views.content);
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
                if (isEditor || viewRoles[j] === tempUserRole) {
                    return true;
                }
            }
        }
        return false;
    };

    //compile handlebar for the menu list
    var updateMenuList = function () {
        //menulist for big res
        $('#ues-pages').html(menuListHbs({
            menu: ues.global.dashboard.menu,
            isAnonView: isAnonView,
            user: user,
            isHiddenMenu: ues.global.dashboard.hideAllMenuItems,
            queryString: queryString,
            currentView: page.id,
            allowedViews: isAnonView ? getAnonViewPages() : getUserAllowedPages()
        }));
        //menulist for small res
        $('#ues-pages-col').html(menuListHbs({
            menu: ues.global.dashboard.menu,
            isAnonView: isAnonView,
            user: user,
            isHiddenMenu: ues.global.dashboard.hideAllMenuItems,
            queryString: queryString,
            currentView: page.id,
            allowedViews: isAnonView ? getAnonViewPages() : getUserAllowedPages()
        }));
    };

    /**
     * To get the user allowed pages based on views
     * @returns {Array} array of pages that is permitted by user to view
     */
    var getUserAllowedPages = function () {
        var pageIds = [];
        var pages = ues.global.dashboard.pages;

        for (var i = 0; i < pages.length; i++) {
            var allowedViews = getUserAllowedViews(pages[i], true);
            if (allowedViews.length > 0) {
                pageIds.push(pages[i].id);
            }
        }
        return pageIds;
    };

    /**
     * To get the pages that has atleast one anonview
     * @returns {Array} array of pages that is permitted for an anon user to view
     */
    var getAnonViewPages = function () {
        var pages = ues.global.dashboard.pages;
        var pids = [];

        for (var j = 0; j < pages.length; j++) {
            var views = Object.keys(pages[j].views.content);
            for (var i = 0; i < views.length; i++) {
                var viewRoles = pages[j].views.content[views[i]].roles;
                if (viewRoles.indexOf(ANONYMOUS_ROLE) > -1) {
                    pids.push(pages[j].id);
                    i = views.length;
                }
            }
        }
        return pids;
    };

    /**
     * To show the errors that happen in the gadget rendering
     * @param err Status code for the particular error
     * @param element UI element to show error
     */
    var showGadgetError = function (element, err) {
        element.addClass('gadget-error');
        element.find('.ues-trash-handle').remove();
        element.find('.ues-component-title').html(i18n_data['error'] + '!');
        
        if (err === UNAUTHORIZED_ERROR_CODE) {
            element.find('.ues-component-body').html(dsErrorHbs({
                errorTitle: (err + " " + i18n_data['unauthorized']),
                error: i18n_data['no.permission.to.view.gadget']
            }));
        } else if (err === NOT_FOUND_ERROR_CODE) {
            element.find('.ues-component-body').html(dsErrorHbs({
                errorTitle: (err + " " + i18n_data['gadget.not.found']),
                error: i18n_data['gadget.missing']
            }));
        }
    };

    /**
     * Render the view content
     * @param viewId View id
     */
    var renderViewContentInViewMode = function (viewId) {
        $("#ds-allowed-view-list > option").each(function () {
            if ($(this).val() === viewId) {
                $('#ds-allowed-view-list').val(viewId);
            }
        });
        var currentPage = ues.dashboards.findPage(ues.global.dashboard, ues.global.page);
        var layout = $(currentPage.views.content[viewId]);
        $('.gadgets-grid').html(ues.dashboards.getGridstackLayout(layout[0]));
        $('.grid-stack').gridstack({
            width: 12,
            cellHeight: 50,
            verticalMargin: 30,
            disableResize: true,
            disableDrag: true
        });
        ues.dashboards.render($('.gadgets-grid'), ues.global.dashboard, ues.global.page, viewId, function (err) {
            // render component toolbar for each components
            $('.ues-component-box .ues-component').each(function () {
                var component = ues.dashboards.findComponent($(this).attr('id'), page);
                renderComponentToolbar(component);
                if (!component && err) {
                    showGadgetError($(this), err);
                    err = null;
                }
            });
        });
        if (ues.global.dashboard.banner.globalBannerExists || ues.global.dashboard.banner.customBannerExists) {
            $('.grid-stack-item[data-banner=true]')
                .css("background-image", "url(" + ues.utils.tenantPrefix() + 'banners/' + ues.global.dashboard.id + ")");
        }
    };

    /**
     * Render the view content in Edit mode
     * @param viewId View id
     */
    var renderViewContentInEditMode = function (viewId) {
        $("#ds-allowed-view-list > option").each(function () {
            if ($(this).val() === viewId) {
                $('#ds-allowed-view-list').val(viewId);
            }
        });
        var currentPage = ues.dashboards.findPage(ues.global.dashboard, ues.global.page);
        var layout = $(currentPage.views.content[viewId]);
        $('.gadgets-grid').html(ues.dashboards.getGridstackLayout(layout[0]));
        $('.grid-stack').gridstack({
            width: 12,
            cellHeight: 50,
            verticalMargin: 30,
            disableResize: false,
            disableDrag: false
        }).on('dragstop', function (e, ui) {
            updateLayout();
            updateRefreshBtn(ues.global.page);
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
            updateRefreshBtn(ues.global.page);
        });
        ues.dashboards.render($('.gadgets-grid'), ues.global.dashboard, ues.global.page, ues.global.dbType, function (err) {
            // render component toolbar for each components
            $('.ues-component-box .ues-component').each(function () {
                var component = ues.dashboards.findComponent($(this).attr('id'), page);
                renderComponentToolbar(component);
                if (!component && err) {
                    showGadgetError($(this), err);
                    err = null;
                }
            });
        });
        if (ues.global.dashboard.banner.globalBannerExists || ues.global.dashboard.banner.customBannerExists) {
            $('.grid-stack-item[data-banner=true]')
                .css("background-image", "url(" + ues.utils.tenantPrefix() + 'banners/' + ues.global.dashboard.id + ")");
        }
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
                    if (allowedViews.indexOf(currentView) > -1) {
                        renderingView = currentView;
                    } else {
                        renderingView = allowedViews[0];
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
        isPersonalizeEnabled ? renderViewContentInEditMode(renderingView) : renderViewContentInViewMode(renderingView);
        $('.nano').nanoScroller();
        $('#download-pdf-panel').on('click', function () {
            if ($("#pdf-size-panel").hasClass("in")) {
                $(this).find("span.caret").addClass("open-caret");
            } else {
                $(this).find("span.caret").removeClass("open-caret");
            }
        });
    };

    /**
     * Check whether the container has any components
     * @param {Object} container
     * @returns {boolean}
     * @private
     */
    var hasComponents = function (container) {
        return (container.find('.ues-component .ues-component-body div').length > 0);
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
        pageType = getViewId(getSelectedViewName());
        var id;
        var i;
        // find the current page index
        for (i = 0; i < ues.global.dashboard.pages.length; i++) {
            if (ues.global.dashboard.pages[i].id === page.id) {
                id = i;
            }
        }
        if (typeof id === 'undefined') {
            throw 'Specified page : ' + page.id + ' cannot be found';
        }
        ues.global.dashboard.pages[id].views.content[pageType].blocks = serializedGrid;
        ues.global.dashboard.pages[id].edited = true;
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
        });
    };

    /**
     * update the dashboard theme with given theme.
     * @return {null}
     * @private
     */
    var updateThemeProperties = function () {
        var method = 'PUT';
        var url = themeApi + '/' + dashboard.id;
        var isRedirect = false;
        $.ajax({
            url: url,
            method: method,
            data: JSON.stringify(dashboardTheme),
            async: false,
            contentType: 'application/json'
        }).success(function (data) {
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
        pageType = ues.global.dbType ? ues.global.dbType : DEFAULT_DASHBOARD_VIEW;
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

    /**
     * Show HTML modal.
     * @param {String} content      HTML content
     * @param {function} beforeShow Function to be invoked just before showing the modal
     * @return {null}
     * @private
     */
    var showHtmlModal = function (content, beforeShow) {
        var modalElement = $('#dashboardViewModal');
        modalElement.find('.modal-content').html(content);
        if (beforeShow && typeof beforeShow === 'function') {
            beforeShow();
        }

        modalElement.modal();
    };

    /**
     * Removes and destroys the given component from the page.
     * @param {Object} component    The component to be removed
     * @param {function} done       Callback function
     * @return {null}
     * @private
     */
    var removeComponent = function (component, done) {
        pageType = pageType ? pageType : DEFAULT_DASHBOARD_VIEW;
        if (ds.database.updateUsageData(ues.global.dashboard, component.content.id, page, pageType)) {
            destroyComponent(component, function (err) {
                if (err) {
                    return done(err);
                }
                var container = $('#' + component.id);
                var area = container.closest('.ues-component-box').attr('id');
                var content = page.content[pageType];
                area = content[area];
                var index = area.indexOf(component);
                area.splice(index, 1);
                container.remove();
                var compId = $('.ues-component-properties').data('component');
                if (compId !== component.id) {
                    return done();
                }
                $('.ues-component-properties .ues-component-properties-container').empty();
                done();
            });
        } else {
            done('Error updating the database.');
        }
    };

    /**
     * Get Gridstack object.
     * @return {Object}
     * @private
     */
    var getGridstack = function () {
        return $('.grid-stack').data('gridstack');
    };

    /**
     * restore the selected edited page using original page
     * @param pageID selected page
     */
    var restoreDashboard = function (pageID) {
        var method = 'PUT';
        var url = dashboardsApiRestore + '/' + dashboard.id + '/' + pageID;
        var isRedirect = false;
        $.ajax({
            url: url,
            method: method,
            data: JSON.stringify(dashboard),
            async: false,
            contentType: 'application/json'
        }).success(function (data) {
            dashboard = data;
            ues.global.dashboard = data;
            saveDashboard();
            $("#" + pageID).hide();
            refreshCurrentView();
        });
    };

    /**
     * re-render the current view of the page
     */
    var refreshCurrentView = function () {
        var selectedView = $('#ds-allowed-view-list option:selected').text().trim();
        selectedViewId = getViewId(selectedView);
        ues.global.dbType = selectedViewId;
        destroyPage(page, selectedViewId, function (err) {
            if (err) {
                throw err;
            }
            isPersonalizeEnabled ? renderViewContentInEditMode(selectedViewId) : renderViewContentInViewMode(selectedViewId);
            changeMousePointerToMove();
        });
    };

    /**
     * To change the mouse pointer on gadget-heading to move pointer when the editing mode is enabled
     */
    var changeMousePointerToMove = function () {
        if (isPersonalizeEnabled) {
            $(".gadget-heading").css("cursor", "move");
        }
    };

    /**
     * Return the current selected view name
     * @returns {String} View name
     */
    var getSelectedViewName = function () {
        return $('#ds-allowed-view-list :selected').text().trim();
    };

    /**
     * register click event for refresh buttons
     */
    var registerRefreshBtnHandler = function () {
        $("li > span[class='refreshBtn']").click(function () {
            var confirmRevertBlockHbs = Handlebars.compile($('#ds-modal-confirm-revert-block-hbs').html());
            var pageID = $(this)[0].id;
            showHtmlModal(confirmRevertBlockHbs(), function () {
                var designerModal = $('#dashboardViewModal');
                designerModal.find('#btn-revert').on('click', function () {
                    restoreDashboard(pageID);
                    designerModal.modal('hide');
                });
            });
        });
    };

    /**
     * update all refresh button visibility according to edit attribute
     */
    var updateRefreshBtnVisibility = function () {
        for (var page = 0; page < ues.global.dashboard.pages.length; page++) {
            if (ues.global.dashboard.pages[page].edited === true && isPersonalizeEnabled) {
                updateRefreshBtn(ues.global.dashboard.pages[page].id);
            }
        }
    };

    /**
     * update refresh button with given ID
     */
    var updateRefreshBtn = function (pageID) {
        $("#" + pageID).css('display', 'inline');
        $("#" + pageID).show();
    };

    initDashboard();
    updateMenuList();
    updateRefreshBtnVisibility();
    registerRefreshBtnHandler();
    initComponentToolbar();
});

/**
 * We make this true so that the dashboard.jag files inline ues.dashboards.render method is not triggered.
 * @type {boolean}
 */
ues.global.renderFromExtension = true;