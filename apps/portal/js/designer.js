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
    var dashboard;
    var page;
    var pageType;
    var visibleViewCount = 12;
    var activeComponent;
    var breadcrumbs = [];
    var storeCache = {
        gadget: [],
        widget: [],
        layout: []
    };
    var nonCategoryKeyWord = "null";
    var designerScrollTop = 0;
    var dashboardsApi = ues.utils.tenantPrefix() + 'apis/dashboards';
    var dashboardsUrl = ues.utils.tenantPrefix() + 'dashboards';
    var resolveURI = ues.dashboards.resolveURI;
    var findPage = ues.dashboards.findPage;
    var lang = navigator.languages ?
        navigator.languages[0] : (navigator.language || navigator.userLanguage || navigator.browserLanguage);
    var gadgetIds;
    var VIEW_ID_PREFIX = 'view';
    var VIEW_NAME_PREFIX = 'View';
    var roleAddAction = 'add';
    var roleRemoveAction = 'remove';
    var DATABASE_API = ues.utils.tenantPrefix() + 'apis/database';
    var HEIGHT = 'height';
    var OVERFLOW_Y = 'overflow-y';
    var SCROLL = 'scroll';
    var HIDDEN = 'hidden';

    /**
     * Role for all logged in users
     * @const
     */
    var INTERNAL_EVERYONE_ROLE = 'Internal/everyone';

    /**
     * Role for anonymous (not logged in) users
     * @const
     */
    var ANONYMOUS_ROLE = 'anonymous';

    /**
     * Default view name
     * @const
     */
    var DEFAULT_VIEW_NAME = 'Default View';
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

    //Variable to distinguish between creating a new view using a new layout and changing the layout of a current view
    var isNewView = false;

    //Keep list of views that are currently displayed
    var visibleViews = [];

    //Check whether user is in view creation pane, not in a particular page view
    var isInViewCreationView = false;

    /**
     * Number of assets to be loaded.
     * @const
     */
    var COMPONENTS_PAGE_SIZE = -1;

    /**
     * Default dashboard view mode.
     * @const
     */
    var DEFAULT_DASHBOARD_VIEW = 'default';

    /**
     * Anonymous dashboard view mode.
     * @const
     */
    var ANONYMOUS_DASHBOARD_VIEW = 'anon';

    /**
     * Gadget full view mode.
     * @const
     */
    var FULL_COMPONENT_VIEW = 'full';

    /**
     * Gadget default view mode.
     * @const
     */
    var DEFAULT_COMPONENT_VIEW = 'default';
    /**
     * Hidden flag
     * @const
     * */
    var HIDDEN = "HIDDEN";

    /**
     * RPC service name for gadget callback.
     * @const
     */
    var RPC_GADGET_BUTTON_CALLBACK = "RPC_GADGET_BUTTON_CALLBACK";

    /**
     * Show HTML modal.
     * @param {String} content      HTML content
     * @param {function} beforeShow Function to be invoked just before showing the modal
     * @return {null}
     * @private
     */
    var showHtmlModal = function (content, beforeShow) {
        var modalElement = $('#designerModal');
        modalElement.find('.modal-content').html(content);
        if (beforeShow && typeof beforeShow === 'function') {
            beforeShow();
        }

        modalElement.modal();
    };

    /**
     * Show confirm message with yes/no buttons.
     * @param {String} title    Title of the confirmation box
     * @param {String} message  HTML content
     * @param {function} ok     Callback function for yes button
     * @return {null}
     * @private
     */
    var showConfirm = function (title, message, ok) {
        var content = modalConfirmHbs({title: title, message: message});
        showHtmlModal(content, function () {
            var modalElement = $('#designerModal');
            modalElement.find('#ues-modal-confirm-yes').on('click', function () {
                if (ok && typeof ok === 'function') {
                    if (ok()) {
                        modalElement.modal('hide');
                    }
                }
            });
        });
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
     * Show the information message with ok button.
     * @param {String} title Title of the information box
     * @param {String} message HTML content
     * @return {null}
     * @private
     * */
    var showInformation = function (title, message) {
        var content = modalInfoHbs({title: title, message: message});
        showHtmlModal(content, null);
    };

    /**
     * Precompiling Handlebar templates
     */
    var layoutsListHbs = Handlebars.compile($("#ues-layouts-list-hbs").html());

    var designerHeadingHbs = Handlebars.compile($('#ues-designer-heading-hbs').html());

    var componentsListHbs = Handlebars.compile($("#ues-components-list-hbs").html());

    var noComponentsHbs = Handlebars.compile($("#ues-no-components-hbs").html());

    var componentToolbarHbs = Handlebars.compile($("#ues-component-toolbar-hbs").html());

    var pageOptionsHbs = Handlebars.compile($("#ues-page-properties-hbs").html());

    var gadgetComponentPropertiesHbs = Handlebars.compile($("#ues-component-properties-hbs").html());

    var viewComponentPropertiesHbs = Handlebars.compile($("#ues-component-view-properties-hbs").html());
    var newViewHbs = Handlebars.compile($('#add-new-view-hbs').html());
    var pagesListHbs = Handlebars.compile($("#ues-pages-list-hbs").html());
    var menuListHbs = Handlebars.compile($("#ues-menu-list-hbs").html());
    var bannerHbs = Handlebars.compile($('#ues-dashboard-banner-hbs').html());
    var componentBoxContentHbs = Handlebars.compile($('#ues-component-box-content-hbs').html());
    var noPagesHbs = Handlebars.compile($('#ues-no-pages-hbs').html());
    var modalConfirmHbs = Handlebars.compile($('#ues-modal-confirm-hbs').html());
    var modalInfoHbs = Handlebars.compile($('#ues-modal-info-hbs').html());
    var newBlockHbs = Handlebars.compile($("#ues-new-block-hbs").html());
    var viewCreationOptions = Handlebars.compile($('#view-layout-selection-hbs').html());
    var viewCopyingOptions = Handlebars.compile($('#copying-view-options-hbs').html());
    var permissionMenuHbs = Handlebars.compile($("#permission-menu-hbs").html());
    var viewListingHbs = Handlebars.compile($('#view-listing-hbs').html());
    var viewRoleHbs = Handlebars.compile($("#ues-view-role-hbs").html());
    var dsErrorHbs = Handlebars.compile($("#ds-error-hbs").html());
    var gadgetAddHbs = Handlebars.compile($("#ds-add-gadget-hbs").html());
    Handlebars.registerPartial('ds-add-gadget-hbs', gadgetAddHbs);

    /**
     * Generate unique gadget ID.
     * @param {String} gadgetName Name of the gadget
     * @return {String} Unique gadget ID
     * @private
     */
    var generateGadgetId = function (gadgetName) {
        if (!gadgetIds) {
            // If gadget Ids list is not defined, then need to read all the gadgets and re-populate the index list.
            gadgetIds = {};
            $('.ues-component').each(function () {
                var id = $(this).attr('id');
                if (id) {
                    var parts = id.split('-');
                    var currentGadgetIndex = parseInt(parts.pop());
                    var gadgetName = parts.join('-');
                    if (!gadgetIds[gadgetName]) {
                        gadgetIds[gadgetName] = 0;
                    }
                    gadgetIds[gadgetName] = Math.max(gadgetIds[gadgetName], currentGadgetIndex + 1);
                }
            });
        }
        if (!gadgetIds[gadgetName]) {
            gadgetIds[gadgetName] = 0;
        }
        return gadgetName + '-' + (gadgetIds[gadgetName]++);
    };

    /**
     * Initialize the nano scroller.
     * @return {null}
     * @private
     * */
    var initNanoScroller = function () {
        $(".nano").nanoScroller();
    };

    /**
     * Update component properties panel and save.
     * @param {Object} sandbox JQuery wrapped sandbox HTML element
     * @return {null}
     * @private
     */
    var updateComponentProperties = function (sandbox) {
        var notifiers = {};
        var options = {};
        var settings = {};
        var styles = {};
        var id = sandbox.data('component');

        saveOptions(sandbox, options);
        saveSettings(sandbox, settings);
        saveStyles(sandbox, styles, id);
        saveNotifiers(sandbox, notifiers);

        saveComponentProperties(id, {
            options: options,
            settings: settings,
            styles: styles,
            notifiers: notifiers
        });
    };

    /**
     * Renders the component properties panel.
     * @param {Object} component Component object
     * @return {null}
     * @private
     */
    var renderComponentProperties = function (component) {
        var ctx = buildPropertiesContext(component, page);
        var propertiesContainer = $('#gadget-configuration');
        dashboard.defaultPriority = propertiesContainer.find('#priorityPicker').attr("value");
        $('#ds-properties-container #view-configuration').empty();
        propertiesContainer.empty();
        propertiesContainer
            .html(gadgetComponentPropertiesHbs(ctx))
            .on('change', 'input[type=checkbox], input[type=range], select, textarea', function () {
                var isCheckbox = false;
                //if a checkbox got changed, disable it before updating properties
                if (this.type === "checkbox") {
                    isCheckbox = true;
                    this.disabled = true;
                }
                updateComponentProperties($(this).closest('.ues-component-properties'));
                //enable back the checkbox, after updating its properties
                if (isCheckbox) {
                    this.disabled = false;
                }
            })
            .on('keypress', 'input[type=text], select, textarea', function (e) {
                if (e.which === 13) {
                    updateComponentProperties($(this).closest('.ues-component-properties'));
                    e.preventDefault();
                    return;
                }
            });

        propertiesContainer
            .find('.ues-localized-title')
            .on("keypress", function (e) {
                return sanitizeOnKeyPress(this, e, /[^a-z0-9-\s]/gim);
            })
            .on('change', function (e) {
                if ($.trim($(this).val()) == '') {
                    $(this).val('');
                }
            });

        propertiesContainer
            .find('#priorityPicker')
            .on('change', function () {
                propertiesContainer.find('#priorityValue').text(this.value);
            });
    };

    /**
     * Render maximized view of a gadget.
     * @param {Object} component The component to be rendered
     * @param {String} view      Component view mode
     * @return {null}
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
     * Find an asset of the given type from the store cache.
     * @param {String} type The cache type
     * @param {String} id   Asset ID
     * @return {Object}
     * @private
     */
    var findStoreCache = function (type, id) {
        var i;
        var item;
        var items = storeCache[type];
        var length = items.length;
        for (i = 0; i < length; i++) {
            item = items[i];
            if (item.id === id) {
                return clone(item);
            }
        }
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

    /**
     * Save component properties.
     * @param {String} id   The component ID
     * @param {Object} data Component properties data
     * @return {null}
     * @private
     */
    var saveComponentProperties = function (id, data) {
        var o;
        var opt;
        var block = findComponent(id);
        var content = block.content;

        //save options
        var options = content.options;
        var opts = data.options;
        for (opt in opts) {
            if (opts.hasOwnProperty(opt)) {
                o = options[opt] || (options[opt] = {});
                o.value = opts[opt];
            }
        }

        //save settings
        content.settings = data.settings;

        //save styles
        content.styles = data.styles;

        //save wiring
        var event;
        var listener;
        var notifiers = data.notifiers;
        var listen = content.listen;
        for (event in notifiers) {
            if (notifiers.hasOwnProperty(event)) {
                listener = listen[event];
                listener.on = notifiers[event];
            }
        }

        ues.dashboards.rewire(page, pageType);
        updateComponent(id);
        saveDashboard();
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
        if (ds.database.updateUsageData(dashboard, component.content.id, page.id, pageType)) {
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
            done("Error updating the record in database");
        }
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
     * Destroys a given list of components of an area.
     * @param {Object[]} components Components to be removed
     * @param {function} done       Callback function
     * @return {null}
     * @private
     */
    var destroyArea = function (components, done, isSwitch) {
        var i;
        var length = components.length;
        var tasks = [];
        pageType = pageType || DEFAULT_DASHBOARD_VIEW;

        for (i = 0; i < length; i++) {
            if (hasComponents($("#" + components[i].id).closest(".ues-component-box"))) {
                if (isSwitch || ds.database.updateUsageData(dashboard, components[i].content.id, page.id, pageType, false)) {
                    tasks.push((function (component) {
                        return function (done) {
                            destroyComponent(component, function (err) {
                                done(err);
                            });
                        };
                    }(components[i])));
                } else {
                    done("Error updating usage data");
                    return;
                }
            } else if (!isSwitch && components[i].id) {
                if (!ds.database.updateUsageData(dashboard, components[i].content.id, page.id, pageType, false)) {
                    done("Error updating usage data");
                    return;
                }
            }
        }

        async.parallel(tasks, function (err, results) {
            done(err);
        });
    };

    /**
     * Destroys all areas in a given page.
     * @param {Object} page     The page object
     * @param {String} pageType Type of the page
     * @param {function} done   Callback function
     * @param {Boolean} isSwitch to check whether it is just a switch or actual delete
     * @return {null}
     * @private
     */
    var destroyPage = function (page, pageType, done, isSwitch) {
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
                        }, isSwitch);
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
     * Remove and destroys a given page.
     * @param {String} pid      Page ID
     * @param {type}            Type of the page
     * @param {function} done   Callback function
     * @return {null}
     * @private
     */
    var removePage = function (pid, type, done) {
        var pageToBeDeleted = findPage(dashboard, pid);
        var pages = dashboard.pages;
        var clonedPages = clone(pages);
        var index = pages.indexOf(pageToBeDeleted);
        var isError = false;
        pages.splice(index, 1);
        if (page.id !== pid) {
            return done(false);
        }
        var views = Object.keys(pageToBeDeleted.content);
        for (var i = 0; i < views.length; i++) {
            updateUsageForViews(pageToBeDeleted, views[i], function (err) {
                if (err) {
                    generateMessage(err, null, null, "error", "topCenter", 2000, null);
                    dashboard.pages = clonedPages;
                    isError = true;
                    i = views.length;
                }
            });
        }
        if (!isError) {
            destroyPage(pageToBeDeleted, type, done);
        }
    };

    /**
     * When deleting the dashboard, update the usages of different respective gadgets
     * @param page Page
     * @param pageType view of the page
     */
    var updateUsageForViews = function (page, pageType, done) {
        var i;
        var length;
        var area;
        var component;
        var components;
        var gadgetIds = [];
        var content = page.content[pageType];
        for (area in content) {
            if (content.hasOwnProperty(area)) {
                components = content[area];
                length = components.length;
                for (i = 0; i < length; i++) {
                    component = components[i];
                    var gadgetId = component.content.id;
                    if (gadgetIds.indexOf(gadgetId) < 0) {
                        if (ds.database.updateUsageDataInMultipleViews(dashboard, gadgetId)) {
                            gadgetIds.push(gadgetId);
                        } else {
                            done("Error updating database");
                            return;
                        }
                    }

                }
            }
        }
        done();
    };

    /**
     * Pops up the dashboard preview page.
     * @param {Object} page     The page object
     * @return {null}
     * @private
     */
    var previewDashboard = function (page) {
        var addingParam = ues.global.type.toString().localeCompare(ANONYMOUS_DASHBOARD_VIEW) == 0 ?
            '?isAnonView=true' : '';
        addingParam = addingParam + ((addingParam === '') ? '?preview=true' : '&preview=true');
        addingParam = addingParam + '&currentView=' + getViewId(getSelectedView());
        var pageURL = dashboard.landing !== page.id ? page.id : '';
        var url = dashboardsUrl + '/' + dashboard.id + '/' + pageURL + addingParam;
        window.open(url, '_blank');
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
            generateMessage("Dashboard saved successfully", null, null, "success", "topCenter", 2000, null);
            if (isRedirect) {
                isRedirect = false;
                window.location = dashboardsUrl + '/' + dashboard.id + "?editor=true";
            }
        }).error(function (xhr, status, err) {
            if (xhr.status === 403) {
                window.location.reload();
                return;
            }
            generateMessage("Error saving the dashboard", null, null, "error", "topCenter", 2000, null);
        });
    };

    /**
     * Returns the list of allowed views for the current user
     * @param views to be checked
     * @returns {Array} List of allowed views
     */
    var getUserAllowedViews = function (views) {
        if (isViewer) {
            var allowedViews = [];
            for (var i = 0; i < views.length; i++) {
                var viewRoles = page.views.content[views[i]].roles;
                if (isAllowedView(viewRoles)) {
                    allowedViews.push(views[i]);
                }
            }
            return allowedViews;
        } else {
            return views;
        }
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

    /**
     * Initializes the component toolbar.
     * @return {null}
     * @private
     */
    var initComponentToolbar = function () {
        var designer = $('.gadgets-grid');
        //event handler for custom button/function
        designer.on('click', '.ues-custom-action', function (e) {
            var fid = $(this).closest('.ues-component-box').find('iframe').attr('id');
            var action = $(this).attr('data-action');
            gadgets.rpc.call(fid, RPC_GADGET_BUTTON_CALLBACK, null, action);
        });
        // event handler for maximize button
        designer.on('click', '.ues-component-box .ues-component-full-handle', function () {
            var id = $(this).closest('.ues-component').attr('id');
            var component = findComponent(id);
            var componentContainer = $(this).closest('.ues-component-box');
            var gsBlock = componentContainer.parent();
            var componentContainerId = componentContainer.attr('id');
            var componentBody = componentContainer.find('.ues-component-body');
            var gsContainer = $('.grid-stack');
            var trashButton = componentContainer.find('.ues-component-actions .ues-trash-handle');
            if (component.fullViewPoped) {
                // rendering normal view
                getGridstack().enable();
                // restore the size of the gridstack
                gsContainer.height(gsContainer.attr('data-orig-height')).removeAttr('data-orig-height');
                trashButton.show();
                $('.grid-stack-item').show();
                // restore the previous data-height value and remove the backup value
                componentContainer
                    .attr('data-height', componentContainer.attr('data-original-height'))
                    .removeAttr('data-original-height');
                //minimize logic
                gsBlock
                    .removeClass('ues-component-fullview')
                    .css('height', '')
                    .on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function () {
                        componentBody.show();
                        designer.scrollTop(designerScrollTop);
                        renderMaxView(component, DEFAULT_COMPONENT_VIEW);
                        component.fullViewPoped = false;
                    });
                $(this)
                    .attr('title', $(this).data('maximize-title'))
                    .find('i.fw')
                    .removeClass('fw-contract')
                    .addClass('fw-expand');
                componentBody.hide();
            } else {
                // rendering full view
                var pageEl = $('.page-content');
                // backup the scroll position
                designerScrollTop = designer.scrollTop();
                getGridstack().disable();
                // backup the size of gridstack and reset element size
                gsContainer.attr('data-orig-height', gsContainer.height()).height('auto');
                trashButton.hide();
                $('.grid-stack-item:not([data-id=' + componentContainerId + '])').hide();
                // replace the data-height value with new container height (and backup previous one)
                componentContainer
                    .attr('data-original-height', componentContainer.attr('data-height'))
                    .attr('data-height', pageEl.height() - 120);
                //maximize logic
                gsBlock
                    .addClass('ues-component-fullview')
                    .css('height', pageEl.height() - 120)
                    .on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function () {
                        componentBody.show();
                        renderMaxView(component, FULL_COMPONENT_VIEW);
                        component.fullViewPoped = true;
                    });
                $(this)
                    .attr('title', $(this).data('minimize-title'))
                    .find('i.fw')
                    .removeClass('fw-expand')
                    .addClass('fw-contract');

                componentBody.hide();
            }
            initNanoScroller();
        });

        // event handler for properties button
        designer.on('click', '.ues-component-box .ues-component-properties-handle', function () {
            var id = $(this).closest('.ues-component').attr('id');
            renderComponentProperties(findComponent(id));
        });

        // event handler for clicking on a view name to copy the content
        designer.on('click', '#page-views-menu > li > a', function (event) {
            event.preventDefault();
            visibleViews = [];
            var selectedViewId = getViewId($(event.target).text());
            $(event.target).text(selectedViewId);
            var clonedPage = clone(page);
            var viewOptions = getNewViewOptions(page.content);
            var newViewId = viewOptions.id;
            var newViewName = viewOptions.name;
            var layout = page.views.content[selectedViewId];
            page.views.content[newViewId] = {
                blocks: layout.blocks,
                name: newViewName,
                roles: layout.roles
            };
            page.content[newViewId] = JSON.parse(JSON.stringify(page.content[selectedViewId]));
            updateUsageForViews(page, pageType, function (err) {
                if (err) {
                    generateMessage(err, null, null, 'error', 'topCenter', 2000, null);
                    page = clonedPage;
                } else {
                    saveDashboard();
                    pageType = newViewId;
                    $('button[data-target=#left-sidebar]').click();
                    $('.gadgets-grid').empty();
                    renderView('', newViewId);
                }
            });
        });

        //event handler for clicking on view properties button
        $('#designer-view-mode').on('click', '.ues-view-component-properties-handle', function (event) {
            event.preventDefault();
            var currentPageType = pageType;
            var tempName = $(this).closest('.view-heading').text().trim();
            var ctx = {
                name: tempName
            };
            var viewId = getViewId(tempName);

            //if user have click on another view's properties button (not on current view's properties button),
            //we render the new view
            if (currentPageType !== viewId) {
                $('.fw-right-arrow').click();
                renderView(currentPageType, viewId);
                $('li[data-view-mode="' + viewId + '"] .ues-view-component-properties-handle').click();
            }

            if ($('#right-sidebar').hasClass('toggled')) {
                $('#right-sidebar').removeClass('toggled');
            }

            $('#view-configuration').empty();
            $('#ds-properties-container #gadget-configuration').empty();

            //event handler for changing view name
            $('#view-configuration').html(viewComponentPropertiesHbs(ctx)).on('keypress', function (event) {
                if (event.keyCode === 13 || event.which === 13) {
                    var newViewName = $(this).find('.ds-view-title').val().trim();
                    var currentViewName = getSelectedView();
                    var viewId = getViewId(currentViewName);
                    page.views.content[viewId].name = newViewName;
                    saveDashboard();
                    renderView(viewId, viewId);
                }
            });

            //Add view roles to the properties tab
            //var viewRoleHbs = Handlebars.compile($("#ues-view-role-hbs").html());
            var role;
            var viewRolesList = page.views.content[viewId].roles;
            var selectedViewRoles = '';
            for (var i = 0; i < viewRolesList.length; i++) {
                role = viewRolesList[i];
                selectedViewRoles += viewRoleHbs(role);
            }

            //list all the dashboard roles to the dropdown
            $('#view-configuration').find('.ues-view-roles').append(selectedViewRoles);
            var viewerSearchQuery = '';
            var maxLimit = 10;
            var relativePrefix = ues.utils.relativePrefix();
            var maxLimitApi = relativePrefix + 'apis/roles/maxLimit';
            var rolesApi = relativePrefix + 'apis/roles';
            var searchRolesApi = relativePrefix + 'apis/roles/search';
            var userApi = relativePrefix + 'apis/user';
            var user;

            $.ajax({
                url: userApi,
                type: "GET",
                dataType: "json",
                async: false
            }).success(function (data) {
                if (data) {
                    user = data;
                }
            }).error(function () {
                generateMessage("Error getting user data", null, null, "error", "topCenter", 2000, null);
            });

            $.ajax({
                url: maxLimitApi,
                type: "GET",
                async: false,
                dataType: "json"
            }).success(function (data) {
                maxLimit = data;
            }).error(function () {
                generateMessage("Error calling max roles limit", null, null, "error", "topCenter", 2000, null);
            });

            /**
             * Filter view roles for the dashboard by removing default owner, editor and viewer roles of other dashboard
             * @param role View role
             * @returns {boolean} Is a valid role for the dashboard or not
             */
            var isValidRoleForDashboard = function (role) {
                if (role !== ANONYMOUS_ROLE && role !== INTERNAL_EVERYONE_ROLE && role.substring(0, 8) === 'Internal') {
                    var dashboardId = dashboard.id;
                    if (!((role.substring(9, role.indexOf('-owner')) === dashboardId) ||
                        (role.substring(9, role.indexOf('-editor')) === dashboardId) ||
                        (role.substring(9, role.indexOf('-viewer')) === dashboardId))) {
                        return false;
                    }
                }
                return true;
            };

            // Create the view roles list in view properties pane
            var viewerRoles = new Bloodhound({
                name: 'roles',
                limit: 10,
                prefetch: {
                    url: rolesApi,
                    filter: function (roles) {
                        roles.push(ANONYMOUS_ROLE);
                        return $.map(roles, function (role) {
                            if (isValidRoleForDashboard(role)) {
                                return {name: role};
                            }
                        });
                    },
                    ttl: 60
                },
                sufficient: 10,
                remote: {
                    url: searchRolesApi + '?maxLimit=' + maxLimit + '&query=' + viewerSearchQuery,
                    filter: function (searchRoles) {
                        return $.map(searchRoles, function (searchRole) {
                            if (isValidRoleForDashboard(searchRole)) {
                                return {name: searchRole};
                            }
                        });
                    },
                    prepare: function (query, settings) {
                        viewerSearchQuery = query;
                        var currentURL = settings.url;
                        settings.url = currentURL + query;
                        return settings;
                    },
                    ttl: 60
                },
                datumTokenizer: function (d) {
                    return d.name.split(/[\s\/.]+/) || [];
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace
            });
            viewerRoles.initialize();

            //event handler for selecting a new view role
            $('#ds-view-roles').typeahead({
                hint: true,
                highlight: true,
                minLength: 0
            }, {
                name: 'roles',
                displayKey: 'name',
                limit: 10,
                source: viewerRoles.ttAdapter(),
                templates: {
                    empty: [
                        '<div class="empty-message">',
                        'No Result Available',
                        '</div>'
                    ].join('\n'),
                    suggestion: permissionMenuHbs
                }
            }).on('typeahead:selected', function (e, role, roles) {
                addNewViewRole($(this), role.name, viewId);
            }).on('typeahead:autocomplete', function (e, role) {
                addNewViewRole($(this), role.name, viewId);
            });

            $('#right-sidebar').toggleClass("toggled");
            if ($('#right-sidebar').hasClass('toggled')) {
                $('#right-sidebar').removeClass('toggled');
                return;
            }
            event.stopPropagation();
        });

        /**
         * Add new roles for the view
         * @param element Role container
         * @param role New role
         * @param viewId View id
         */
        var addNewViewRole = function (element, role, viewId) {
            var viewRolesList = page.views.content[viewId].roles;
            var removingComponents = getRestrictedGadgets(role, pageType, roleAddAction);
            var removingComponentsLength = removingComponents.length;

            /**
             * Add role to the view and save the dashboard content
             * @param viewId View id
             * @param role New role
             */
            var addRoleToView = function (viewId, role) {
                page.views.content[viewId].roles.push(role);
                saveDashboard();
                $('#view-configuration').find('.ues-view-roles').append(viewRoleHbs(role));
                loadGadgetsWithViewRoles(viewId);
            };

            if (!isExistingPermission(viewRolesList, role)) {
                if (role === ANONYMOUS_ROLE) {
                    if (dashboard.shareDashboard) {
                        showInformation(i18n_data["cannot.delete.internal.everyone.role.for.share.dashboard"]);
                        return;
                    }
                    /*
                     Before allowing addition of anon view check
                     1. If it is not a landing page, check whether landing page has atelast one anon view
                     2. If it is a landing page, and if there are more than 1 page, check whether there is atleast one
                     view for internal/everyone role
                     */
                    if (dashboard.landing) {
                        if (page.id !== dashboard.landing) {
                            var landingPage = getPage(dashboard.landing);
                            if (!isRoleExist(landingPage, ANONYMOUS_ROLE)) {
                                showInformation(i18n_data["cannot.add"] + " " + ANONYMOUS_ROLE + " " + i18n_data["role"],
                                    i18n_data["landing.page.minimal"] + " " + ANONYMOUS_ROLE + " " + i18n_data['role']);
                                return;
                            }
                        } else {
                            if (dashboard.pages.length > 1) {
                                if (!isRoleExist(page, INTERNAL_EVERYONE_ROLE, viewId)) {
                                    showInformation(i18n_data["cannot.add"] + " " + ANONYMOUS_ROLE + " " + i18n_data["role"],
                                        i18n_data["landing.page.minimal"] + " " + INTERNAL_EVERYONE_ROLE + " " +
                                        i18n_data['role']);
                                    return;
                                }
                            }
                        }
                    }
                    showConfirm(i18n_data["add.anonymous.role"], i18n_data["add.anonymous.role.message"], function () {
                        var isError = false;
                        if (removingComponentsLength > 0) {
                            removeGadgets(removingComponents, removingComponentsLength, function (err) {
                                if (err) {
                                    generateMessage(err, null, null, "error", "topCenter", 2000, null);
                                    isError = true;
                                }
                            });
                        }
                        if (!isError) {
                            dashboard.isanon = true;
                            page.views.content[viewId].roles = [];
                            $('#view-configuration').find('.ues-view-roles').empty();
                            addRoleToView(viewId, role);
                        }
                        return true;
                    });

                } else if (isAnonRoleExists(viewId)) {
                    var pages = dashboard.pages;
                    var isAnonViewExists = false;

                    /*
                     Before removing the anon view from landing page, check whether any other views contains the anon view,
                     if any of the other pages contains anon view
                     */
                    for (var pageIndex = 0; pageIndex < pages.length; pageIndex++) {
                        if (pages[pageIndex].id !== dashboard.landing && isRoleExist(pages[pageIndex], ANONYMOUS_ROLE)) {
                            isAnonViewExists = true;
                            break;
                        }
                    }
                    if (dashboard.landing === page.id && dashboard.pages.length > 1 && isAnonViewExists) {
                        if (!isRoleExist(page, ANONYMOUS_ROLE, viewId)) {
                            showInformation(i18n_data['cannot.remove'] + " " + ANONYMOUS_ROLE + " " + i18n_data['role'],
                                i18n_data['other.pages.contains.views'] + " " + ANONYMOUS_ROLE + " " + i18n_data['role']);
                            return;
                        }
                    }
                    showConfirm(i18n_data["add.new.role.removing.anonymous"],
                        i18n_data["add.new.role.removing.anonymous.message"], function () {
                            var isError = false;
                            if (removingComponentsLength > 0) {
                                removeGadgets(removingComponents, removingComponentsLength, function (err) {
                                    if (err) {
                                        generateMessage(err, null, null, "error", "topCenter", 2000, null);
                                        isError = true;
                                    }
                                });
                            }
                            if (!isError) {
                                viewRolesList.splice(viewRolesList.indexOf(ANONYMOUS_ROLE), 1);
                                $('#view-configuration').find('.ues-view-roles').empty();
                                viewRolesList.push(role);
                                for (var i = 0; i < viewRolesList.length; i++) {
                                    var tempRole = viewRolesList[i];
                                    $('#view-configuration').find('.ues-view-roles').append(viewRoleHbs(tempRole));
                                }
                                loadGadgetsWithViewRoles(viewId);
                                dashboard.isanon = isAnonDashboard();
                                saveDashboard();

                            }
                            return true;
                        });

                } else if (removingComponentsLength > 0) {
                    showConfirm(i18n_data["add.new.role"], i18n_data["add.new.role.message"], function () {
                        var isError = false;
                        removeGadgets(removingComponents, removingComponentsLength, function (err) {
                            if (err) {
                                generateMessage(err, null, null, "error", topCenter, 2000, null);
                            }
                        });
                        if (!isError) {
                            addRoleToView(viewId, role);
                        }
                        return true;
                    })
                } else {
                    addRoleToView(viewId, role);
                }
            }
            element.typeahead('val', '');
        };

        /**
         * Returns a list of restricted gadgets with deletion of a role
         * @param role New role
         * @param viewId View id
         * @param action User action (Role addition or removal)
         * @returns {Array} Array of restricted gadgets
         */
        var getRestrictedGadgets = function (role, viewId, action) {
            var removingComponents = [];
            var content = page.content[pageType];
            var viewRoles = page.views.content[viewId].roles;
            for (var area in content) {
                if (content.hasOwnProperty(area)) {
                    var components = content[area];
                    var length = components.length;
                    for (var i = 0; i < length; i++) {
                        var component = components[i];
                        var gadgetRoles = component.content["allowedRoles"];
                        if (!gadgetRoles) {
                            gadgetRoles = [INTERNAL_EVERYONE_ROLE];
                        }
                        if (action === roleRemoveAction) {
                            if (!isGadgetValidAfterRoleRemoval(gadgetRoles, viewRoles, role)) {
                                removingComponents.push(component);
                            }
                        } else if (action === roleAddAction) {
                            if (!isGadgetValidAfterRoleAddition(gadgetRoles, viewRoles, role, viewId)) {
                                removingComponents.push(component);
                            }
                        }
                    }
                }
            }
            return removingComponents;
        };

        /**
         * Check for the validity of the gadget when removing a view role
         * @param gadgetRoles Gadget roles
         * @param viewRoles View roles
         * @param role Role to be removed
         * @returns {boolean} Is the gadget is valid or not
         */
        var isGadgetValidAfterRoleRemoval = function (gadgetRoles, viewRoles, role) {
            if (viewRoles.length === 1) {
                //if there is only one view role (internal/everyone or anonymous or any other logged in role)
                return false;
            } else {
                //if there are any other logged in view roles, we allow the gadgets with
                // all the view roles or internal/everyone role
                if (isViewRoleExistsInRolesList(gadgetRoles, INTERNAL_EVERYONE_ROLE)) {
                    return true;
                } else if (role !== INTERNAL_EVERYONE_ROLE && !isViewRoleExistsInRolesList(viewRoles,
                        INTERNAL_EVERYONE_ROLE)) {
                    for (var i = 0; i < viewRoles.length; i++) {
                        if (!isViewRoleExistsInRolesList(gadgetRoles, viewRoles[i]) && (viewRoles[i] !== role)) {
                            return false;
                        }
                    }
                    return true;
                }
            }
        };

        /**
         * Check for the validity of the gadget when adding a view role
         * @param gadgetRoles Gadget roles
         * @param viewRoles View roles
         * @param role Role to be added
         * @param viewId View id
         * @returns {boolean} Is the gadget is valid or not
         */
        var isGadgetValidAfterRoleAddition = function (gadgetRoles, viewRoles, role, viewId) {
            if (role === ANONYMOUS_ROLE) {
                //if new role is anonymous all the other roles will be removed from the view
                for (var i = 0; i < gadgetRoles.length; i++) {
                    if (gadgetRoles[i] === ANONYMOUS_ROLE) {
                        return true;
                    }
                }
                return false;
            } else if (isAnonRoleExists(viewId)) {
                //if there is anonymous role in the view, it will be removed while adding the new role
                if (isViewRoleExistsInRolesList(gadgetRoles, INTERNAL_EVERYONE_ROLE) ||
                    isViewRoleExistsInRolesList(gadgetRoles, role)) {
                    return true;
                }
            } else {
                //when we add a new role where there are one or more logged in roles, we allow the gadgets with
                // all the view roles or internal/everyone role
                if (role === INTERNAL_EVERYONE_ROLE || isViewRoleExistsInRolesList(viewRoles, INTERNAL_EVERYONE_ROLE)) {
                    //if internal/everyone role is there, we only allow gadgets with internal/everyone role
                    return isViewRoleExistsInRolesList(gadgetRoles, INTERNAL_EVERYONE_ROLE);
                } else {
                    //if internal/everyone role is not in the view roles, we allows gadgets with all
                    //the view roles including the new role or internal/everyone role
                    if (isViewRoleExistsInRolesList(gadgetRoles, INTERNAL_EVERYONE_ROLE)) {
                        return true;
                    } else if (isViewRoleExistsInRolesList(gadgetRoles, role)) {
                        for (var i = 0; i < viewRoles.length; i++) {
                            if (!isViewRoleExistsInRolesList(gadgetRoles, viewRoles[i])) {
                                return false;
                            }
                        }
                        return true;
                    }
                }
            }
        };

        /**
         * Checks whether a view role exists in a list of roles
         * @param gadgetRoles List of gadget roles
         * @param viewRole View role
         * @returns {boolean} Is exists or not
         */
        var isViewRoleExistsInRolesList = function (gadgetRoles, viewRole) {
            for (var i = 0; i < gadgetRoles.length; i++) {
                if (gadgetRoles[i] === viewRole) {
                    return true;
                }
            }
            return false;
        };

        //event handler for deleting the view
        $('#designer-view-mode').on('click', '.ues-trash-handle', function () {
            if ($('#right-sidebar').hasClass('toggled')) {
                $('#right-sidebar').removeClass('toggled');
            }
            var tempName = $(this).closest('.view-heading').text().trim();
            var viewId = getViewId(tempName);
            var currentView = getSelectedView();
            var currentViewId = getViewId(currentView);
            var isAllowed = false;
            var isAnonViewNeeded = false;
            var isInternalExists = false;
            var isAnonExists = false;

            if (pageType !== viewId) {
                pageType = viewId;
                renderView(currentViewId, viewId);
            }
            var views = Object.keys(page.content);
            if (views.length === 1) {
                showInformation(i18n_data["not.delete.view"], i18n_data["not.delete.view.message"]);
                return;
            }
            /**
             * When removing a view if it is a landing page, check for anon, internal everyone roles based on other
             * pages.
             *  -> Internal/everyone role is important
             *  -> If any of the other pages has view for anon role, then view with anon role is mandatory in landing page
             */
            if (dashboard.landing === page.id && dashboard.pages.length > 1) {
                if (page.views.content[viewId].roles.indexOf(ANONYMOUS_ROLE) > -1) {
                    var pages = dashboard.pages;
                    for (var i = 0; i < pages.length; i++) {
                        if (page.id !== pages[i].id) {
                            isAnonViewNeeded = isRoleExist(pages[i], ANONYMOUS_ROLE);
                            if (isAnonViewNeeded) {
                                break;
                            }
                        }
                    }
                }
                for (var i = 0; i < views.length; i++) {
                    if (views[i] !== viewId) {
                        var tempViewRoles = page.views.content[views[i]].roles;
                        if (tempViewRoles.indexOf(INTERNAL_EVERYONE_ROLE) > -1) {
                            isInternalExists = true;
                            if (!isAnonViewNeeded) {
                                isAllowed = true;
                                break;
                            }
                        } else if (tempViewRoles.indexOf(ANONYMOUS_ROLE) > -1) {
                            isAnonExists = true;
                        }

                        if (isAnonExists && isInternalExists && isAnonViewNeeded) {
                            isAllowed = true;
                        }
                    }
                }
                if (!isAllowed) {
                    if (!isAnonViewNeeded) {
                        showInformation(i18n_data['cannot.delete.view'], i18n_data['landing.page.minimal'] + " "
                            + INTERNAL_EVERYONE_ROLE);
                        return;
                    } else {
                        showInformation(i18n_data['cannot.delete.view'], i18n_data['landing.page.minimal'] + " "
                            + ANONYMOUS_ROLE + " ." + i18n_data['other.pages.contains.views'] + " " + ANONYMOUS_ROLE);
                        return;
                    }
                }
            }
            showConfirm(i18n_data["delete.view"], i18n_data["delete.view.message"], function () {
                var clonedPage = clone(page);
                delete page.views.content[viewId];
                delete page.content[viewId];
                destroyPage(clonedPage, pageType, function (err) {
                    if (err) {
                        generateMessage(err, null, null, "error", "topCenter", 2000, null);
                        page = clonedPage;
                        views = getUserAllowedViews(Object.keys(page.content));
                        renderView(viewId, views[0]);
                        pageType = views[0];

                    } else {
                        visibleViews = [];
                        dashboard.isanon = isAnonDashboard();
                        saveDashboard();
                        views = getUserAllowedViews(Object.keys(page.content));
                        renderView(viewId, views[0]);
                        pageType = views[0];
                    }
                });
                return true;
            });
        });

        //event handler for closing the view
        $('#designer-view-mode').on('click', '.ues-close-view', function (event) {
            event.preventDefault();
            if (visibleViews.length > 1) {
                var viewId = getViewId($(this).closest('.view-heading').text().trim());
                var currentViewId = getViewId(getSelectedView());
                for (var i = 0; i < visibleViews.length; i++) {
                    if (visibleViews[i] === viewId) {
                        visibleViews.splice(i, 1);
                    }
                }
                if (visibleViews.length > 0) {
                    pageType = visibleViews[0];
                } else {
                    visibleViews = [];
                }
                if ($('#right-sidebar').hasClass('toggled')) {
                    $('#right-sidebar').removeClass('toggled');
                }
                renderView(currentViewId, pageType);
                isInViewCreationView = false;
            } else {
                showInformation(i18n_data["not.close.view"], i18n_data["not.close.view.message"]);
            }
        });

        //event handler for clicking on a view name
        $('#designer-view-mode').on('click', '.ues-view-name', function () {
            $('.fw-right-arrow').click();
            if ($('#right-sidebar').hasClass('toggled')) {
                $('#right-sidebar').removeClass('toggled');
            }
            var currentPageType = pageType;
            var mode = getViewId($(this).text().trim());
            if (mode === DEFAULT_DASHBOARD_VIEW) {
                pageType = DEFAULT_DASHBOARD_VIEW;
                ues.global.type = DEFAULT_DASHBOARD_VIEW;
            } else if (mode === ANONYMOUS_DASHBOARD_VIEW) {
                pageType = ANONYMOUS_DASHBOARD_VIEW;
                ues.global.type = ANONYMOUS_DASHBOARD_VIEW;
                ues.global.anon = true;
            } else {
                pageType = mode;
                ues.global.type = mode;
            }
            renderView(currentPageType, pageType);
        });

        //event handler for removing a view role
        $('#view-configuration').on('click', '.remove-button', function (event) {
            event.preventDefault();
            var element = $(this).closest('.ds-view-role');
            var role = element.data('role');
            var viewRoles = page.views.content[pageType].roles;
            var removingComponents = getRestrictedGadgets(role, pageType, roleRemoveAction);
            var removingComponentsLength = removingComponents.length;

            /**
             * Remove role from the view
             */
            var removePermission = function () {
                viewRoles.splice(viewRoles.indexOf(role), 1);
                var removeElement = function () {
                    element.remove();
                };
                removeElement();
                dashboard.isanon = isAnonDashboard();
                saveDashboard();
            };

            //check whether there are gadgets in the view, which will be restricted after removing the new role
            if (viewRoles.length === 1) {
                showInformation(i18n_data["not.delete.role"], i18n_data["not.delete.role.message"]);
                return;
            } else if (dashboard.shareDashboard && role === INTERNAL_EVERYONE_ROLE) {
                showInformation(i18n_data["cannot.delete.internal.everyone.role.for.share.dashboard"]);
                return;
            } else if (page.id === dashboard.landing && role === INTERNAL_EVERYONE_ROLE && dashboard.pages.length > 1) {
                // If this view belongs to landing page and if there are more than 1 page and if only this view contains
                // Internal/everyone, cannot allow the user to remove it
                if (!isRoleExist(page, INTERNAL_EVERYONE_ROLE, pageType)) {
                    showInformation(i18n_data['cannot.remove'] + " " + i18n_data['role'] + " " + INTERNAL_EVERYONE_ROLE,
                        i18n_data['landing.page.minimal'] + " " + INTERNAL_EVERYONE_ROLE);
                    return;
                }
            }
            if (removingComponentsLength > 0) {
                showConfirm(i18n_data["remove.gadgets.with.role.addition"],
                    i18n_data["remove.gadgets.with.role.addition.message"], function () {
                        removeGadgets(removingComponents, removingComponentsLength, function (err) {
                            if (err) {
                                generateMessage(err, null, null, "error", "topCenter", 2000, null);
                            } else {
                                removePermission();
                            }
                        });
                        return true;
                    });
            } else {
                removePermission();
            }
            loadGadgetsWithViewRoles(pageType);
        });

        /**
         * Checks whether a role exists in a list of roles
         * @param rolesList Roles list
         * @param role Role
         * @returns {boolean} Is exists or not
         */
        var isExistingPermission = function (rolesList, role) {
            for (var i = 0; i < rolesList.length; i++) {
                if (rolesList[i] === role) {
                    return true;
                }
            }
            return false;
        };

        //event handler for adding a new view
        $('#add-view').on('click', function (event) {
            event.preventDefault();

            if (visibleViews.length === 0 || !dashboard.shareDashboard) {
                $('#designer-view-mode li').removeClass('active');
                if ($('#left-sidebar').hasClass('toggled')) {
                    $('.close-sidebar[data-target="#left-sidebar"]').click();
                }
                destroyPage(page, pageType, function (err) {
                    if (err) {
                        throw err;
                    }
                    $('.gadgets-grid').html(viewCreationOptions);
                    isInViewCreationView = true;
                }, true);
            } else {
                showInformation(i18n_data['cannot.create.view.for.share.dashboard']);
            }
        });

        //event handler for clicking on the toggle button to get more views
        $('#more-views').on('click', function (event) {
            event.preventDefault();
            $('#view-list').empty();
            var views = getUserAllowedViews(Object.keys(page.content));
            var isExist;
            for (var i = 0; i < views.length; i++) {
                isExist = false;
                for (var j = 0; j < visibleViews.length; j++) {
                    if (views[i] === visibleViews[j]) {
                        isExist = true;
                        break;
                    }
                }
                if (!isExist) {
                    var ctx = {
                        viewName: page.views.content[views[i]].name,
                        viewId: views[i]
                    };
                    $('#view-list').append(viewListingHbs(ctx));
                }
            }

            var input = $("#view-list");
            var pageContentHeight = parseInt($(".page-content").css(HEIGHT)) * .9;
            var dropDownheight = parseInt(input.css(HEIGHT));
            if (dropDownheight > pageContentHeight) {
                input.css(HEIGHT, pageContentHeight)
            }
            dropDownheight > pageContentHeight ? input.css(OVERFLOW_Y, SCROLL) : input.css(OVERFLOW_Y, HIDDEN)

            $('#view-list li').on('click', function (e) {
                e.stopPropagation();
                var viewId = getViewId(this.textContent.trim());
                var currentViewId = getViewId(getSelectedView());
                //if visible views length is 12, remove the last view before adding the selected view
                if (visibleViews.length === visibleViewCount) {
                    visibleViews.splice(visibleViews.length - 1, 1);
                }
                visibleViews.push(viewId);
                switchPage(getPageId(), currentViewId);
                $("#" + viewId).click();
            });
        });

        //event handler for selecting an option form copying an existing view or creating a new view
        $(document).on('click', '.gadgets-grid button', function (event) {
            event.preventDefault();
            if (this.value === "new-view") {
                isInViewCreationView = true;
                //if create a new view
                isNewView = true;
                $('.gadgets-grid').empty();
                $('.gadgets-grid').html(viewCreationOptions);
                if (!$('#left-sidebar').hasClass('toggled')) {
                    $('#btn-sidebar-dashboard-layout').click();
                }
                else {
                    $.sidebar_toggle('hide', '#left-sidebar', '.page-content-wrapper');
                }
            } else if (this.value === "copy-view") {
                isInViewCreationView = true;
                //if copy from an existing view
                $('#page-views-menu').empty();
                var views = getUserAllowedViews(Object.keys(page.views.content));

                for (var i = 0; i < views.length; i++) {
                    var temp = {
                        viewName: page.views.content[views[i]].name
                    };
                    $('#page-views-menu').append(viewCopyingOptions(temp));
                }
            }
        });

        // event handler for trash button
        designer.on('click', '.ues-component-box .ues-trash-handle', function () {
            var that = $(this);
            var componentBox = that.closest('.ues-component-box');
            var componentBoxId = componentBox.attr('id');
            var confirmDeleteBlockHbs = Handlebars.compile($('#ues-modal-confirm-delete-block-hbs').html());
            var hasComponent = false;
            var hasHidden = hasHiddenGadget(componentBox);
            if (that.closest('.ues-component-box').find('.ues-component').attr('id')) {
                hasComponent = true;
            }
            hasComponent = hasComponent ? hasComponent : hasHidden;

            showHtmlModal(confirmDeleteBlockHbs({hasComponent: hasComponent}), function () {
                var designerModal = $('#designerModal');
                designerModal.find('#btn-delete').on('click', function () {
                    if (componentBox.find('.ues-component').hasClass('active')) {
                        $('.fw-right-arrow').click();
                    }
                    var action = designerModal.find('.modal-body input[name="delete-option"]:checked').val();
                    var id = componentBox.find('.ues-component').attr('id');
                    var removeBlock = (action == 'block');
                    var isError = false;

                    if (id) {
                        removeComponent(findComponent(id), function (err) {
                            if (err) {
                                removeBlock = false;
                                generateMessage(err, null, null, "error", "topCenter", 2000, null);
                                isError = true;
                            } else {
                                saveDashboard();
                            }
                        });
                    }
                    else if (hasHidden) {
                        if (ds.database.updateUsageData(dashboard, hasHidden[0].content.id, page.id, pageType, false)) {
                            for (var i = 0; i < dashboard.pages.length; i++) {
                                if (dashboard.pages[i].id === page.id) {
                                    dashboard.pages[i].content[pageType][componentBoxId] = [];
                                    break;
                                }
                            }
                            saveDashboard();
                        } else {
                            isError = true;
                            removeBlock = false;
                            generateMessage('Error updating database', null, null, "error", 'topCenter', 2000, null);
                        }
                    }
                    if (removeBlock) {
                        getGridstack().remove_widget(componentBox.parent());
                        updateLayout();
                    } else if (!isError) {
                        componentBox.html(componentBoxContentHbs());
                    }
                    designerModal.modal('hide');
                });
            });
        });
    };

    /**
     * Checks whether the anonymous role exists in the view roles
     * @param viewId View id
     * @returns {boolean} Is anonymous role exists or not
     */
    var isAnonRoleExists = function (viewId) {
        var viewRoles = page.views.content[viewId].roles;
        return (viewRoles.length > 0 && viewRoles[0].toLowerCase() === ANONYMOUS_ROLE);
    };

    /**
     * Return the ID of the page.
     * @return {String}     ID of the page
     * @private
     */
    var getPageId = function () {
        return page.id;
    };
    /**
     * Renders the component toolbar of a given component.
     * @param {Object} component
     * @return {null}
     * @private
     */
    var renderComponentToolbar = function (component) {
        if (component) {
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

            for (var i = 0; i < toolbarButtons.custom.length; i++) {
                toolbarButtons.custom[i].iconTypeCSS = (toolbarButtons.custom[i].iconType.toLowerCase() == 'css');
                toolbarButtons.custom[i].iconTypeImage = (toolbarButtons.custom[i].iconType.toLowerCase() == 'image');
            }

            var buttonCount = toolbarButtons.custom.length + 3;
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
     * Updates the styles of a given store asset.
     * @param {Object} asset
     * @return {null}
     * @private
     */
    var updateStyles = function (asset) {
        var styles = asset.styles || (asset.styles = {
                title: true,
                borders: true
            });
        if (styles.title && typeof styles.title === 'boolean') {
            styles.title = asset.title;
        }
    };

    /**
     * Creates a component in the given container.
     * @param {Object} container
     * @param {Object} asset
     * @return {null}
     * @private
     */
    var createComponent = function (container, asset) {
        var id = generateGadgetId(asset.id);
        var area = container.attr('id');
        var isDatabaseUpdateSuccess = false;
        pageType = pageType ? pageType : DEFAULT_DASHBOARD_VIEW;

        if (ds.database.updateUsageData(dashboard, asset.id, page.id, pageType, true)) {
            var content = page.content[pageType];
            content = content[area] || (content[area] = []);
            updateStyles(asset);
            var component = {
                id: id,
                content: asset
            };
            content.push(component);
            ues.components.create(container, component, function (err, block) {
                if (err) {
                    throw err;
                }
                renderComponentToolbar(component);
                container.find('.ues-component-actions .ues-component-properties-handle').click();
                saveDashboard();
            });
        } else {
            generateMessage("Error updating database", null, null, "error", "topCenter", 2000, null);
        }
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
     * Builds up the component notifiers.
     * @param {Object[]} notifiers  List of events
     * @param {Object} current      Current component
     * @param {Object} component    Other component
     * @return {null}
     * @private
     */
    var componentNotifiers = function (notifiers, current, component) {
        if (current.id === component.id) {
            return;
        }
        var notify = component.content.notify;
        if (!notify) {
            return;
        }
        var event;
        var events;
        var data;
        for (event in notify) {
            if (notify.hasOwnProperty(event)) {
                data = notify[event];
                events = notifiers[data.type] || (notifiers[data.type] = []);
                events.push({
                    from: component.id,
                    event: event,
                    type: data.type,
                    content: component.content,
                    description: data.description
                });
            }
        }
    };

    /**
     * Builds up the area notifiers.
     * @param {Object[]} notifiers  List of events
     * @param {Object} component    The component
     * @param {Object[]} components All components
     * @return {null}
     * @private
     */
    var areaNotifiers = function (notifiers, component, components) {
        var i;
        var length = components.length;
        for (i = 0; i < length; i++) {
            componentNotifiers(notifiers, component, components[i]);
        }
    };

    /**
     * Builds up the page notifiers.
     * @param {Object} component    The component
     * @param {Object} page         The page
     * @returns {Array} Notifiers
     * @private
     */
    var pageNotifiers = function (component, page) {
        var area;
        var notifiers = {};
        pageType = pageType ? pageType : DEFAULT_DASHBOARD_VIEW;
        var content = page.content[pageType];
        for (area in content) {
            if (content.hasOwnProperty(area)) {
                areaNotifiers(notifiers, component, content[area]);
            }
        }
        return notifiers;
    };

    /**
     * Find matching notifiers for a given component.
     * @param {Object} component Component
     * @param {Object} page Page
     * @returns {Array} Notiifiers
     * @private
     */
    var findNotifiers = function (component, page) {
        var event, listener, notifiers;
        var listeners = [];
        var content = component.content;
        var listen = content.listen;
        if (!listen) {
            return listeners;
        }
        notifiers = pageNotifiers(component, page);
        for (event in listen) {
            if (listen.hasOwnProperty(event)) {
                listener = listen[event];
                listeners.push({
                    event: event,
                    title: listener.title,
                    description: listener.description,
                    notifiers: notifiers[listener.type] || []
                });
            }
        }
        return listeners;
    };

    /**
     * Find the wired notifier
     * @param from
     * @param event
     * @param notifiers
     * @returns {*}
     * @private
     */
    var wiredNotifier = function (from, event, notifiers) {
        var i, notifier;
        var length = notifiers.length;
        for (i = 0; i < length; i++) {
            notifier = notifiers[i];
            if (notifier.from === from && notifier.event === event) {
                return notifier;
            }
        }
    };

    /**
     * Wire an event
     * @param on
     * @param notifiers
     * @private
     */
    var wireEvent = function (on, notifiers) {
        var i, notifier;
        var length = on.length;
        for (i = 0; i < length; i++) {
            notifier = on[i];
            notifier = wiredNotifier(notifier.from, notifier.event, notifiers);
            if (!notifier) {
                continue;
            }
            notifier.wired = true;
        }
    };

    /**
     * Get all notifiers of a given event
     * @param event
     * @param notifiers
     * @returns {notifiers|*}
     * @private
     */
    var eventNotifiers = function (event, notifiers) {
        var i, events;
        var length = notifiers.length;
        for (i = 0; i < length; i++) {
            events = notifiers[i];
            if (events.event === event) {
                return events.notifiers;
            }
        }
    };

    /**
     * Wire events of a given component
     * @param {Object} component
     * @param {Object[]} notifiers
     * @returns {Object[]}
     * @private
     */
    var wireEvents = function (component, notifiers) {
        var listen = component.content.listen;
        if (!listen) {
            return notifiers;
        }
        var event, on;
        for (event in listen) {
            if (listen.hasOwnProperty(event)) {
                on = listen[event].on;
                if (!on) {
                    continue;
                }
                wireEvent(on, eventNotifiers(event, notifiers));
            }
        }
        return notifiers;
    };

    /**
     * Check whether options are available or not
     * @param optionKeys {Object}
     * @param options {Object}
     * @return isAvailable {boolean}
     * @private
     * */
    var isOptionAvailable = function (optionKeys, options) {
        var isAvailable = false;
        for (var i = 0; i < optionKeys.length; i++) {
            if (options[optionKeys[i]].type.toUpperCase() != HIDDEN) {
                isAvailable = true;
                break;
            }
        }
        return isAvailable;
    };

    /**
     * Build the hbs context for component properties panel
     * @param component
     * @param page
     * @returns {{id: (*|component.id), title: *, options: *, styles: (styles|*|buildPropertiesContext.styles), settings: *, listeners: *}}
     * @private
     */
    var buildPropertiesContext = function (component, page) {
        var notifiers = findNotifiers(component, page),
            content = component.content,
            optionsAvailable = isOptionAvailable(Object.keys(content.options), content.options),
            options = optionsAvailable ? content.options : {};
        return {
            id: component.id,
            title: content.title,
            options: options,
            styles: content.styles,
            settings: content.settings,
            listeners: wireEvents(component, notifiers)
        };
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
     * Check whether the crrent dashboard has a anonymous view or not
     * @returns {boolean} Has anonymous view or not
     */
    var isAnonDashboard = function () {
        if (dashboard.pages) {
            for (var i = 0; i < dashboard.pages.length; i++) {
                var views = Object.keys(dashboard.pages[i].views.content);
                for (var j = 0; j < views.length; j++) {
                    var viewRoles = dashboard.pages[i].views.content[views[j]].roles;
                    if (!viewRoles && (views[j] === ANONYMOUS_ROLE)) {
                        return true;
                    } else if (viewRoles.length === 1 && viewRoles[0] === ANONYMOUS_ROLE) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    /**
     * To check whether the given page is suitable to make as landing
     * @param page Page to made as landing
     * @returns {boolean} true if it is eligible for landing page
     */
    var isEligibleForLanding = function (page) {
        var pages = dashboard.pages;
        var viewsWithAnon = false;
        var isAnonExist = false;
        var isInternalExist = false;
        var views;
        var tempViewRoles;
        var k;

        if (pages.length === 1) {
            return true;
        }
        for (var i = 0; i < pages.length; i++) {
            if (pages[i].id !== page.id) {
                if (isRoleExist(pages[i], ANONYMOUS_ROLE)) {
                    viewsWithAnon = true;
                    break;
                }
            }
        }
        views = getUserAllowedViews(Object.keys(page.views.content));
        for (k = 0; k < views.length; k++) {
            tempViewRoles = page.views.content[views[k]].roles;
            if (tempViewRoles.indexOf(INTERNAL_EVERYONE_ROLE) > -1) {
                isInternalExist = true;
            }
            if (tempViewRoles.indexOf(ANONYMOUS_ROLE) > -1) {
                isAnonExist = true;
            }
            if (isInternalExist && isAnonExist) {
                return true;
            }
        }
        if (isInternalExist && !viewsWithAnon) {
            return true;
        }
    };

    /**
     * Check whether there are any pages which has given id.
     * @param {String} pageId
     * @return {boolean}
     * @private
     */
    var checkForPagesById = function (pageId) {
        var isPageAvailable = false;
        for (var availablePage = 0; availablePage < dashboard.pages.length; availablePage++) {
            if (dashboard.pages[availablePage].id == pageId) {
                isPageAvailable = true;
                break;
            }
        }

        return isPageAvailable;
    };

    /**
     * Check whether there are any page which has the given title.
     * @param {String} pageTitle
     * @return {boolean}
     * @private
     */
    var checkForPagesByTitle = function (pageTitle) {
        var isPageAvailable = false;
        for (var availablePage = 0; availablePage < dashboard.pages.length; availablePage++) {
            if (dashboard.pages[availablePage].title.toUpperCase() == pageTitle.toUpperCase()) {
                isPageAvailable = true;
                break;
            }
        }

        return isPageAvailable;
    };

    /**
     * Update page options.
     * @param {Object} e Event object
     * @return {Boolean}
     * @private
     */
    var updatePageProperties = function (e) {
        var titleError = $("#title-error");
        var idError = $("#id-error");
        var hasError = false;
        var id = $('input[name=id]', e);
        var title = $('input[name=title]', e);
        var idVal = $.trim(id.val());
        var titleVal = $.trim(title.val());

        // validate inputs
        hideInlineError(id, idError);
        hideInlineError(title, titleError);
        if (!idVal) {
            showInlineError(id, idError);
            hasError = true;
        }
        if (!titleVal) {
            showInlineError(title, titleError);
            hasError = true;
        }
        if (hasError) {
            return false;
        }
        var landing = $('input[name=landing]', e);
        var toggleView = $('#toggle-dashboard-view');
        var anon = $('input[name=anon]', e);
        var fn = {
            id: function () {
                if (checkForPagesById(idVal) && page.id != idVal) {
                    showInformation("URL Already Exists",
                        "A page with entered URL already exists. Please select a different URL");
                    id.val(page.id);
                } else {
                    var oldId = clone(page).id;
                    updateMenu(page.id, idVal, 'id');
                    //change subordinates with new ID
                    page.id = idVal;
                    if (landing.is(":checked")) {
                        dashboard.landing = idVal;
                    }
                    if (!updateGadgetUsageAfterPagePropertiesChange()) {
                        updateMenu(page.id, oldId, 'id');
                        //change subordinates with new ID
                        page.id = oldId;
                        if (landing.is(":checked")) {
                            dashboard.landing = oldId;
                        }
                    }
                }
            },
            title: function () {
                if (checkForPagesByTitle(titleVal) && page.title.toUpperCase() != titleVal.toUpperCase()) {
                    showInformation("Title Already Exists",
                        "A page with same title already exists. Please enter a different title");
                    title.val(page.title);
                    titleVal = page.title;
                } else {
                    updateMenu(page.id, titleVal, 'title');
                    page.title = titleVal;
                }
            },
            landing: function () {
                if (landing.is(':checked')) {
                    if (ishiddenPage(idVal)) {
                        landing.prop("checked", false);
                        showInformation("Cannot Select This Page As Landing",
                            "This page is hidden in the menu, please select a different page");
                    } else if (!isEligibleForLanding(page)) {
                        landing.prop("checked", false);
                        showInformation(i18n_data['cannot.select.as.landing'],
                            i18n_data['this.page.not.have.view'] + " " + INTERNAL_EVERYONE_ROLE + " " + i18n_data['role']
                            + " " + i18n_data['or'] + " " + ANONYMOUS_ROLE + " " + i18n_data['role']);
                    } else {
                        dashboard.landing = idVal;
                        var menuItem = getChild(dashboard.menu, idVal);
                        dashboard.menu.unshift(menuItem);
                        spliceOrDiscardChild(dashboard.menu, menuItem.id, 'perform');
                    }
                } else {
                    if (idVal === dashboard.landing) {
                        dashboard.landing = null;
                    }
                }
            }
        };

        if (typeof fn[e.context.name] === 'function') {
            fn[e.context.name]();
            saveDashboard();
        }
        return true;
    };

    /**
     * To update the gadget usage information after changing the page propertioes
     */
    var updateGadgetUsageAfterPagePropertiesChange = function () {
        var isSuccess = false;
        var method = 'PUT';
        var url = DATABASE_API + '/' + dashboard.id;
        var isRedirect = false;
        $.ajax({
            url: url,
            method: method,
            async: false,
            contentType: 'application/json',
            success: function () {
                isSuccess = true;
            },
            error: function () {
                isSuccess = false;
            }
        });
        return isSuccess;
    };

    /**
     * Check whether the given page is hidden within menu
     * @param {String} idVal
     * @return {boolean}
     * @private
     */
    var ishiddenPage = function (idVal) {
        var menu = dashboard.menu;
        var ret = false;
        getStateOfSubordinates(menu, idVal);

        function getStateOfSubordinates(menu, idVal) {
            for (var i = 0; i < menu.length; i++) {
                if (menu[i].id === idVal) {
                    ret = menu[i].ishidden;
                    return;
                }
                if (menu[i].subordinates.length > 0) {
                    getStateOfSubordinates(menu[i].subordinates, idVal);
                }
            }
        }

        return ret;
    };

    /**
     * Update menu item based on the given key
     * @param {String} id
     * @param {String} newvalue
     * @param {String} key
     * @return {null}
     * @private
     */
    var updateMenu = function (id, newValue, key) {
        var menu = dashboard.menu;
        updateSubordinates(menu, id, newValue);

        function updateSubordinates(menu, id, newValue) {
            for (var i = 0; i < menu.length; i++) {
                if (menu[i].id === id) {
                    menu[i][key] = newValue;
                    return;
                }
                if (menu[i].subordinates.length > 0) {
                    updateSubordinates(menu[i].subordinates, id, newValue);
                }
            }
        }
    };

    /**
     * Handles menu item drop event
     * @param {Object} event
     * @param {Object} ui
     * @return {null}
     * @private
     */
    var handleDropEvent = function (event, ui) {
        event.stopPropagation();
        //event.preventDefault();
        var draggable = ui.draggable;
        // dropping an anon page in to a non-anon container
        if (draggable.attr('data-anon') === 'true' && $(event.target).attr('data-anon') === 'false') {
            showInformation("Cannot drop anonymous page in to a non anonymous page container.");
            return;
        }

        var menu = ues.global.dashboard.menu;
        var parentId = $(event.target).attr('id');
        var childObj = getChild(menu, draggable.attr('id'));

        if (childObj != null || childObj != undefined) {
            if (parentId === 'ds-menu-root') {
                menu.push(childObj);
                spliceOrDiscardChild(dashboard.menu, childObj.id, 'perform');
                saveDashboard();
                updateMenuList();
            } else {
                findAndUpdateParent(menu, parentId);
            }
        }

        function findAndUpdateParent(menu, parentId) {
            for (var i = 0; i < menu.length; i++) {
                if (menu[i].id === parentId) {
                    menu[i].subordinates.push(childObj);
                    spliceOrDiscardChild(dashboard.menu, childObj.id, 'perform');
                    saveDashboard();
                    updateMenuList();
                    return;
                } else if (menu[i].subordinates.length > 0) {
                    findAndUpdateParent(menu[i].subordinates, parentId);
                }
            }
        }
    };

    /**
     * Return the child object
     * @param {Object} menu object
     * @param {String} id
     * @return {Object}
     * @private
     */
    var getChild = function (menu, id) {
        var arrayT = [];
        var childObj;

        findChild(menu, id);

        function findChild(menu, id) {
            for (var i = 0; i < menu.length; i++) {
                if (menu[i].id === id) {
                    //clone the object before decorating
                    childObj = JSON.parse(JSON.stringify(menu[i]));
                    menu[i].deletable = true;
                    return;
                } else if (menu[i].subordinates.length > 0) {
                    findChild(menu[i].subordinates, id);
                }
            }
        }

        return childObj;
    };

    /**
     * Clone JSON object.
     * @param {Object} o    Object to be cloned
     * @return {Object}
     * @private
     */
    var clone = function (o) {
        return JSON.parse(JSON.stringify(o));
    };

    /**
     * Splice the child object
     * @param {Object} menu object
     * @param {String} id
     * @return {Object}
     * @private
     */
    var spliceOrDiscardChild = function (menu, id, func) {
        findChild(menu, id, func);

        function findChild(menu, id, func) {
            for (var i = 0; i < menu.length; i++) {
                if (menu[i].id === id && menu[i].deletable) {
                    if (func === 'perform') {
                        menu.splice(i, 1);
                        return;
                    }
                    delete menu[i].deletable;
                    return;
                } else if (menu[i].subordinates.length > 0) {
                    findChild(menu[i].subordinates, id, func);
                }
            }
        }
    };


    /**
     * Sanitize the given event's key code.
     * @param {Object} element
     * @param {Object} event
     * @param {String} regEx
     * @return {boolean}
     * @private
     */
    var sanitizeOnKeyPress = function (element, event, regEx) {
        var code;
        if (event.keyCode) {
            code = event.keyCode;
        } else if (event.which) {
            code = event.which;
        }

        var character = String.fromCharCode(code);
        if (character.match(regEx) && code != 8 && code != 46) {
            return false;
        } else {
            return !($.trim($(element).val()) == '' && character.match(/[\s]/gim));
        }
    };

    /**
     * Save page options of the component.
     * @param {Object} sandbox  Sandbox element
     * @param {Object} options  Options object
     * @return {null}
     * @private
     */
    var saveOptions = function (sandbox, options) {
        $('.ues-options input', sandbox).each(function () {
            var el = $(this);
            var type = el.attr('type');
            var name = el.attr('name');
            if (type === 'text') {
                options[name] = el.val();
                return;
            }
            if (type === 'checkbox') {
                options[name] = el.is(':checked');
            }
            if (type === 'enum') {
                options[name] = el.val();
                return;
            }
        });
        $('.ues-options select', sandbox).each(function () {
            var el = $(this);
            options[el.attr('name')] = el.val();
        });
        $('.ues-options textarea', sandbox).each(function () {
            var el = $(this);
            options[el.attr('name')] = el.val();
        });
    };

    /**
     * Save settings of the component.
     * @param {Object} sandbox  Sandbox element
     * @param {Object} settings Settings object
     * @return {null}
     * @private
     */
    var saveSettings = function (sandbox, settings) {
        $('.ues-settings input', sandbox).each(function () {
            var el = $(this);
            var type = el.attr('type');
            var name = el.attr('name');
            if (type === 'text') {
                settings[name] = el.val();
                return;
            }
            if (type === 'checkbox') {
                settings[name] = el.is(':checked');
            }
            if (type === 'range') {
                settings[name] = el.val();
            }
        });
    };

    /**
     * Save styles of the component.
     * @param {Object} sandbox  Sandbox element
     * @param {Object} styles   Styles object
     * @return {null}
     * @private
     */
    var saveStyles = function (sandbox, styles, id) {
        $('.ues-styles input', sandbox).each(function () {
            var el = $(this);
            var type = el.attr('type');
            var name = el.attr('name');
            if (type === 'text' && name != 'title') {
                styles[name] = el.val();
                return;
            }
            if (type === 'checkbox') {
                styles[name] = el.is(':checked');
            }
        });
        styles.titlePosition = $('.ues-styles .ues-title-position', sandbox).val();
        var compLocale = findComponent(id).content.locale_titles || {};
        compLocale[lang] = $('.ues-styles .ues-localized-title', sandbox).val();
    };

    /**
     * Save notifiers of the component.
     * @param {Object} sandbox  Sandbox element
     * @param {Array} notifiers Notifiers object
     * @return {null}
     * @private
     */
    var saveNotifiers = function (sandbox, notifiers) {
        $('.ues-notifiers .notifier', sandbox).each(function () {
            var el = $(this);
            var from = el.data('from');
            var event = el.data('event');
            var listener = el.closest('.listener').data('event');
            var events = notifiers[listener] || (notifiers[listener] = []);
            if (!el.is(':checked')) {
                return;
            }
            events.push({
                from: from,
                event: event
            });
        });
    };

    /**
     * Holds the store paging history for infinite scroll
     * @type {{}}
     * @private
     */
    var pagingHistory = {};

    /**
     * Check whether given category is already existing or not.
     * @param {Object} categories   All the categories
     * @param {String} category     Category to be checked
     * @param {String} storeType    store type which this category belongs to
     * @return {Boolean}
     * @private
     */
    var checkForExistingCategory = function (categories, category, storeType) {
        return categories[storeType].categories[category] ? true : false;
    };

    /**
     * Check whether given category is already existing or not.
     * @param {Object} stores   All the stores
     * @param {String} storeType    Store type to be tested
     * @return {Boolean}
     * @private
     */
    var checkForExistingStoreType = function (stores, storeType) {
        return stores[storeType] ? true : false;
    };

    /**
     * Filter the component By Categories
     * @param {Object} data
     * @return {Object}
     * @private
     */
    var filterComponentByCategories = function (data) {
        var componentsWithStoreType = {};
        var categories = {};
        var stores = {};

        for (var i = 0; i < data.length; i++) {
            var category = data[i].category ? data[i].category : nonCategoryKeyWord;
            var storeType = data[i].storeType;
            if (checkForExistingStoreType(stores, storeType)) {
                if (checkForExistingCategory(categories, category, storeType)) {
                    componentsWithStoreType[storeType].category[category].components.push(data[i]);
                } else {
                    var newCategory = {
                        components: [],
                        categoryName: category
                    };
                    categories[storeType].categories[category] = category;
                    newCategory.components.push(data[i]);
                    componentsWithStoreType[storeType].category[category] = newCategory;
                }
            } else {
                var newCategory = {
                    components: [],
                    categoryName: category
                };
                var newStore = {
                    category: {},
                    storeType: storeType
                };
                categories[storeType] = {
                    categories: {}
                };
                stores[storeType] = storeType;
                categories[storeType].categories[category] = category;
                newCategory.components.push(data[i]);
                newStore.category[category] = newCategory;
                componentsWithStoreType[storeType] = newStore;
            }
        }
        return {
            componentsWithStoreType: componentsWithStoreType,
            stores: stores
        };
    };

    /**
     * Return the current selected view name
     * @returns {String} View name
     */
    var getSelectedView = function () {
        return $('#designer-view-mode .active a').text().trim();
    };

    /**
     * Sort the Filtered component to show the non categorized components first
     * @param {String} nonCategoryString
     * @param {Object} componentWithStore
     * @return {Object}
     * @private
     */
    var sortComponentsByCategory = function (nonCategoryString, componentWithStore) {
        var sortedList = {};
        for (var store in componentWithStore.stores) {
            var sortedCategory = {
                category: {},
                storeType: store.toUpperCase()
            };
            sortedCategory.category[nonCategoryString] = componentWithStore.componentsWithStoreType[store].category[nonCategoryString];
            sortedList[store] = sortedCategory;
            for (var category in componentWithStore.componentsWithStoreType[store].category) {
                if (category !== nonCategoryString) {
                    sortedList[store].category[category] = componentWithStore.componentsWithStoreType[store].category[category];
                }
            }
        }
        return sortedList;
    };

    /**
     * Loads given type of assets matching the query
     * @param {String} type
     * @param {String} query
     * @return {null}
     * @private
     */
    var searchGadgets = function (type, query) {
        var paging = pagingHistory[type] || (pagingHistory[type] = {
                start: 0,
                count: COMPONENTS_PAGE_SIZE
            });
        var buildPaging = function (paging, query) {
            if (paging.query === query) {
                return;
            }
            paging.end = false;
            paging.query = query;
            paging.start = 0;
            paging.count = COMPONENTS_PAGE_SIZE;
        };
        buildPaging(paging, query);
        if (paging.loading) {
            return;
        }
        if (paging.end) {
            return;
        }
        paging.loading = true;
        ues.store.assets(type, paging, function (err, data) {
            paging.loading = false;
            if (err) {
                return;
            }

            var assets = $('.ues-store-assets').find('.ues-thumbnails');
            var fresh = !paging.start;
            storeCache[type] = storeCache[type].concat(data);
            paging.start += COMPONENTS_PAGE_SIZE;
            paging.end = !data.length;
            var selectedViewName = getSelectedView();
            var viewId = getViewId(selectedViewName);
            data = filterGadgetsForViewRoles(data, type, viewId);
            if (!fresh) {
                assets.append(componentsListHbs({
                    type: type,
                    assets: data,
                    lang: lang
                }));
                initNanoScroller();
                return;
            }
            if (data.length) {

                assets.html(componentsListHbs({
                    type: type,
                    assets: sortComponentsByCategory(nonCategoryKeyWord, filterComponentByCategories(data)),
                    lang: lang
                }));
                initNanoScroller();
                return;
            }
            assets.html(noComponentsHbs());
        });
    };

    /**
     * Validate gadgets accrding to the dashboard designer roles
     * @param data Gadget list
     * @returns {Array} Fltered gadget array
     */
    var filterGadgetsForDesignerRoles = function (data, isAnonView) {
        if (!isAnonView) {
            var filteredGadgets = [];
            var gadgetRoles;
            for (var i = 0; i < data.length; i++) {
                gadgetRoles = data[i].allowedRoles;
                if (!gadgetRoles) {
                    gadgetRoles = [INTERNAL_EVERYONE_ROLE];
                }
                for (var j = 0; j < userRolesList.length; j++) {
                    if (isRoleExistInGadget(gadgetRoles, userRolesList[j])) {
                        filteredGadgets.push(data[i]);
                        break;
                    }
                }
            }
            return filteredGadgets;
        } else {
            return data;
        }
    };

    /**
     * Load gadgets according to the roles of the view
     * @param viewId View id
     */
    var loadGadgetsWithViewRoles = function (viewId) {
        var type = 'gadget';
        $('.ues-thumbnails').empty();
        var paging = pagingHistory[type] || (pagingHistory[type] = {
                start: 0,
                count: COMPONENTS_PAGE_SIZE
            });
        if (paging.loading) {
            return;
        }
        paging.loading = true;
        ues.store.assets(type, paging, function (err, data) {
            paging.loading = false;
            if (err) {
                return;
            }
            var assets = $('.ues-store-assets').find('.ues-thumbnails');
            if (data.length > 0 && paging.start >= 0) {
                storeCache[type] = storeCache[type].concat(data);
            }
            paging.start += COMPONENTS_PAGE_SIZE;
            paging.end = !data.length;
            data = filterGadgetsForViewRoles(storeCache[type], type, viewId);
            if (data.length) {
                assets.html(componentsListHbs({
                    type: type,
                    assets: sortComponentsByCategory(nonCategoryKeyWord, filterComponentByCategories(data)),
                    lang: lang
                }));
                initNanoScroller();
                return;
            }
            assets.html(noComponentsHbs());
        });
    };

    /**
     * Returns the array of permitted gadgets
     * @param gadgetStore Gadget list
     * @param type Asset type
     * @param viewId View id
     * @returns {Array} Array of valid gadgets
     */
    var filterGadgetsForViewRoles = function (gadgetStore, type, viewId) {
        var data = [];
        var viewRoles = page.views.content[viewId].roles;
        var viewRolesLength = viewRoles.length;
        var isAnonExist = false;
        var isLoggedInExist = false;
        var gadgetRoles;

        for (var r = 0; r < viewRolesLength; r++) {
            if (viewRoles[r] === ANONYMOUS_ROLE) {
                isAnonExist = true;
            } else if (viewRoles[r] === INTERNAL_EVERYONE_ROLE) {
                isLoggedInExist = true;
            }
        }

        for (var i = 0, storeArrayLength = gadgetStore.length; i < storeArrayLength; i++) {
            gadgetRoles = gadgetStore[i].allowedRoles;
            if (!gadgetRoles || gadgetRoles.length === 0) {
                gadgetRoles = [INTERNAL_EVERYONE_ROLE];
            }
            if (isLoggedInExist && isRoleExistInGadget(gadgetRoles, INTERNAL_EVERYONE_ROLE)) {
                //if the view has internal/everyone as a role, since it is the lowest level role for a loggedin user,
                //we allow only the gadgets with internal/everyone role
                data.push(gadgetStore[i]);
            } else if (isAnonExist && isRoleExistInGadget(gadgetRoles, ANONYMOUS_ROLE)) {
                //if the view has anonymous as a role, we allow only the gadgets with anonymous role
                data.push(gadgetStore[i]);
            } else {
                //if the view has one or more loggedin roles but not internal/everyone role, we allow
                //the gadgets that have all the view's roles in addition to all gadgets with internal/everyone role
                var isValid = false;
                for (var j = 0; j < viewRolesLength; j++) {
                    isValid = isRoleExistInGadget(gadgetRoles, viewRoles[j]);
                    if (!isValid) {
                        break;
                    }
                }
                if (isValid) {
                    data.push(gadgetStore[i]);
                } else if (!isAnonExist && isRoleExistInGadget(gadgetRoles, INTERNAL_EVERYONE_ROLE)) {
                    data.push(gadgetStore[i]);
                }
            }
        }
        //filtering gadgets according to the designer roles and return data
        return filterGadgetsForDesignerRoles(data, isAnonRoleExists(viewId));
    };

    /**
     * Check whether a role exists in a gadget
     * @param gadgetRoles List of gadget roles
     * @param viewRole Role
     * @returns {boolean} Is exista or not
     */
    var isRoleExistInGadget = function (gadgetRoles, viewRole) {
        for (var i = 0; i < gadgetRoles.length; i++) {
            if (gadgetRoles[i] === viewRole) {
                return true;
            }
        }
        return false;
    };

    /**
     * Initializes the components.
     * @return {null}
     * @private
     */
    var initComponents = function () {
        $('#sidebarNavGadgets .ues-thumbnails').on('mouseenter', '.ues-thumbnail', function () {
            $(this).draggable({
                cancel: false,
                appendTo: 'body',
                helper: 'clone'
            });
        }).on('mouseleave', '.ues-thumbnail', function () {
            $(this).draggable('destroy');
        });
    };

    /**
     * Load layouts for workspace.
     * @returns {null}
     * @private
     * */
    var loadLayouts = function () {
        ues.store.assets('layout', {
            start: 0,
            count: 20
        }, function (err, data) {
            storeCache.layout = data;
            $('#ues-page-layouts').html(layoutsListHbs(data));
            $('#ues-view-layouts').html(layoutsListHbs(data));
            initNanoScroller();
        });
    };

    /**
     * Initialize the layout for the workspace.
     * @returns {null}
     * @private
     * */
    var initLayoutWorkspace = function () {
        $('#ues-page-layouts').on('click', '.thumbnail', function (e) {
            if ($(this).data('id')) {
                e.preventDefault();
                var options = pageOptions();
                var landingPageId = dashboard.landing;

                /**
                 * When creating a new page check whether the landing page contains the view
                 * with internal/everyone, if not don`t allow the user to create a new page
                 */
                if (landingPageId) {
                    var pages = dashboard.pages;
                    var landingPage = getPage(landingPageId);
                    var isAllowed = isRoleExist(landingPage, INTERNAL_EVERYONE_ROLE);

                    if (!isAllowed) {
                        showInformation(i18n_data['cannot.create.new.page'], i18n_data['landing.page.minimal'] +
                            " " + INTERNAL_EVERYONE_ROLE + " " + i18n_data['role']);
                        return;
                    }
                }
                createPage(options, $(this).data('id'), function (err) {
                    $('.fw-right-arrow').click();
                    // reload pages list
                    updatePagesList();
                    // hide the sidebar;
                    $('#left-sidebar-sub .close-handle').click();
                    // open page options
                    $('#ues-dashboard-pages .ues-page-list-heading[data-id="' + options.id + '"]').click();

                });
            }
        });

        //event handler when user clicks on a layout from the layout pane
        $('#ues-view-layouts').on('click', '.thumbnail', function (event) {
            if ($(this).data('id')) {
                event.preventDefault();
                var layout = findStoreCache('layout', $(this).data('id'));
                if (isNewView) {
                    //if creating a new view
                    visibleViews = [];
                    var viewOptions = getNewViewOptions(page.content);
                    var newViewId = viewOptions.id;
                    var newViewName = viewOptions.name;
                    var viewRoles = [INTERNAL_EVERYONE_ROLE];
                    var selectedView = getSelectedView();
                    var currentViewId = getViewId(selectedView);
                    saveViewContent(currentViewId, newViewId, newViewName, viewRoles, layout);
                    isNewView = false;
                    // To close the popped up layouts
                    $('.fw-left-arrow').click();
                } else {
                    //if tries to change the layout of an existing view, after confiramtion destroy the page
                    showConfirm(i18n_data["add.new.layout"], i18n_data["add.new.layout.message"], function () {
                        var clonedPage = clone(page);
                        var selectedView = getSelectedView();
                        var viewId = getViewId(selectedView);
                        var viewName = page.views.content[viewId].name;
                        var viewRoles = page.views.content[viewId].roles;
                        delete page.views.content[pageType];
                        delete page.content[pageType];
                        destroyPage(clonedPage, pageType, function (err) {
                            if (err) {
                                generateMessage(err, null, null, "error", "topCenter", 2000, null);
                                page = clonedPage;
                                throw err;
                            } else {
                                if (!viewName) {
                                    viewName = viewId;
                                }
                                if (!viewRoles) {
                                    viewRoles = [INTERNAL_EVERYONE_ROLE];
                                }
                                saveViewContent(viewId, viewId, viewName, viewRoles, layout);
                            }
                            // To close the popped up layouts
                            $('.fw-left-arrow').click();
                        });
                        return true;
                    });
                }
            }
        });
        loadLayouts();
    };

    /**
     * Save the new view or changed view content in dashboard json file
     * @param currentViewId Currently selected view
     * @param viewId New or changed view
     * @param viewName View name
     * @param viewRoles View role
     * @param layout Selected layout content
     */
    var saveViewContent = function (currentViewId, viewId, viewName, viewRoles, layout) {
        $.ajax({
            url: resolveURI(layout.url),
            async: false,
            dataType: 'json'
        }).success(function (data) {
            page.views.content[viewId] = {
                blocks: data.blocks,
                name: viewName,
                roles: viewRoles
            };
        }).error(function (xhr, status, err) {
            generateMessage("Error creating the page view", null, null, "error", "topCenter", 2000, null);
        });

        var viewContent = {};
        page.content[viewId] = viewContent;
        saveDashboard();
        renderView(currentViewId, viewId);
    };

    /**
     * Returns a new view option
     * @returns {{id: string, name: string}}
     */
    var getNewViewOptions = function () {
        var pageContent = JSON.parse(JSON.stringify(page.content));
        var tempViewId = 0;
        var prefix = VIEW_ID_PREFIX;
        var titlePrefix = VIEW_NAME_PREFIX + ' ';
        var gettingNewId = true;
        while (gettingNewId) {
            try {
                Object.keys(pageContent[prefix + tempViewId]);
                tempViewId++;
            } catch (Exception) {
                gettingNewId = false;
            }
        }
        return {
            id: prefix + tempViewId,
            name: titlePrefix + tempViewId
        };
    };

    /**
     * Initializes the store.
     * @return {null}
     * @private
     */
    var initStore = function () {
        // initialize search options in gadgets sidebar
        $('.ues-store-assets .ues-search-box input[type=text]').on('keypress', function (event) {
            if (event.which !== 13) {
                return;
            }
            event.preventDefault();
            var query = $(this).val();
            searchGadgets('gadget', query);
        });

        $('.ues-store-assets .ues-search-box button').on('click', function () {
            var query = $(this).closest('.ues-search-box').find('input[type=text]').val();
            searchGadgets('gadget', query);
        });
    };

    /**
     * update hierarchical menu creation page.
     * @return {null}
     * @private
     */
    var updateMenuList = function () {
        var list = $("#sortable");
        var dropLocation = {
            subPage: false,
            parent: null,
            prev: null
        };
        $('#ues-pages').html(menuListHbs({
            menu: dashboard.menu,
            ishiddenMenu: dashboard.hideAllMenuItems
        }));
        if (dashboard.landing) {
            dropLocation.landing = dashboard.landing;
            $("#sortable").find("li").removeClass("disable-item");
            //Disable draggable state for landing page
            $($("#sortable").children('li')[0]).addClass("disable-item");
            //Disable menu hide option for landing page
            $($("#sortable").children('li')[0]).find('.hide-menu-item:first').hide();
        }
        $('.connect').sortable({
            connectWith: ".connect",
            appendTo: document.body,
            placeholder: "dd-placeholder",
            start: function (event, ui) {
                var element = $(ui.item);
                dropLocation.prev = element.prev();
            },
            sort: function (event, ui) {
                var placeHolderOffset = $(".dd-placeholder").offset();
                var element = $(ui.item).offset();
                if (element.left && (element.left - placeHolderOffset.left) > 10 && $(".dd-placeholder").parent().children('li').length >= 3) {
                    $(".dd-placeholder").css({
                        'margin-left': "30px"
                    });
                    dropLocation.subPage = true;
                    dropLocation.parent = $(".dd-placeholder").parent();
                    if ((element.top - placeHolderOffset.top) > 0) {
                        dropLocation.prev = $(".dd-placeholder").prev();
                        if (dropLocation.prev.hasClass('ui-sortable-helper')) {
                            dropLocation.prev = dropLocation.prev.prev();
                        }
                    } else {
                        dropLocation.prev = $(ui.item).prev();
                    }
                } else {
                    $(".dd-placeholder").css({
                        'margin-left': "0px"
                    });
                    dropLocation.subPage = false;
                    dropLocation.parent = null;
                }
            },
            beforeStop: function (event, ui) {
                if ($(ui.item).hasClass('disable-item') || $(".dd-placeholder").next("li").hasClass('disable-item')) {
                    $(this).sortable('cancel');
                }
            },
            stop: function (event, ui) {
                if (dropLocation.subPage) {
                    var dragItem = $(ui.item);
                    var ul = $("<ul class='dd-list connect'></ul>");
                    if ($(dropLocation.prev).children('ul').length <= 0) {
                        $(dropLocation.prev).append(ul);
                    }
                    $(dropLocation.prev).children('ul').append(dragItem);
                    dropLocation.prev = null;
                }
                if ($("#sortable").find("li").length === ues.global.dashboard.pages.length) {
                    ues.global.dashboard.menu = [];
                    serializeList($("#sortable"), ues.global.dashboard.menu);
                    saveDashboard();
                    updateMenuList();
                } else {
                    $(".connect").sortable("refresh");
                }
            }
        });
        $('#ds-menu-hide-all').change(function () {
            if ($(this).is(":checked")) {
                manipulateAllMenuItems(true);
                dashboard.hideAllMenuItems = true;
                saveDashboard();
                updateMenuList();
            } else {
                manipulateAllMenuItems(false);
                dashboard.hideAllMenuItems = false;
                saveDashboard();
                updateMenuList();
            }
        });
        $('.hide-menu-item').click(function () {
            manipulateMenuItem($(this).attr('id'));
        });
    };

    /**
     * Serialize the list by reading DOM element.
     *
     * @param ul {Object} list element
     * @param menu {Object} menu array
     * @private
     * */
    var serializeList = function (ul, menu) {
        var liElements = $(ul).children('li');
        if (liElements.length > 0) {
            for (var i = 0; i < liElements.length; i++) {
                var item = {
                    id: $.trim($(liElements[i]).attr("data-id")),
                    ishidden: false,
                    subordinates: [],
                    title: $.trim($(liElements[i]).children('div').text())
                };
                if ($(liElements[i]).children().length === 2) {
                    item.ishidden = $(liElements[i]).children('div').children('span').hasClass('hide-true');
                    serializeList($(liElements[i]).children('ul'), item.subordinates);
                    menu.push(item);
                } else {
                    item.ishidden = $(liElements[i]).children('div').children('span').hasClass('hide-true');
                    menu.push(item);
                }
            }
        } else {
            $(ul).remove();
        }
    };

    /**
     * Initialize the designer menu.
     * @return {null}
     * @private
     */
    var initDesignerMenu = function () {
        // menu functions
        $('.ues-context-menu')
            .on('click', '.ues-dashboard-preview', function () {
                // Preview the dashboard
                previewDashboard(page);
            })
            .on('click', '.ues-copy', function (event) {
                // reset the dashboard
                event.preventDefault();
                var that = $(this);
                showConfirm(i18n_data["reset.page"], i18n_data["reset.page.message"], function () {
                    window.open(that.attr('href'), "_self");
                });
            });

        // page header functions
        $('.page-header')
            .on('click', '.ues-switch-page-prev, .ues-switch-page-next, .ues-refresh-page', function () {
                // navigate/refresh pages
                var pid = $(this).attr('data-page-id');
                visibleViews = [];
                ues.global.isSwitchToNewPage = true;
                switchPage(pid, pageType);
                ues.global.isSwitchToNewPage = false;
            })
            .on('click', '.ues-delete-page', function () {

                // delete dashboard page
                var pid = $(this).attr('data-page-id');

                showConfirm(i18n_data["delete.page"], i18n_data["delete.page.message"], function () {
                    //check whether there are any subordinates
                    if (isRemovablePage(pid) && dashboard.pages.length !== 1) {
                        var clonedPages = clone(dashboard.pages);
                        removePage(pid, pageType, function (err) {
                            if (err) {
                                generateMessage(err, null, null, "error", "topCenter", 2000, null);
                                dashboard.pages = clonedPages;

                            } else {
                                var pages = dashboard.pages;
                                var childObj = getChild(dashboard.menu, pid);

                                // if the landing page was deleted, make the first page(in menu) to be the landing page
                                if (dashboard.menu.length) {
                                    if (pid === dashboard.landing) {
                                        //get next possible landing page from the menu
                                        var nextLandingpage = getNextLandingPage(pid, dashboard.menu);
                                        dashboard.landing = nextLandingpage;//dashboard.menu[0].id;
                                        generateMessage(i18n_data['landing.page.changed'] + " " + dashboard.landing, null,
                                            null, "success", "topCenter", 2000, null);
                                        var menuItem = getChild(dashboard.menu, nextLandingpage);
                                        dashboard.menu.unshift(menuItem);
                                        spliceOrDiscardChild(dashboard.menu, menuItem.id, 'perform');
                                    }
                                } else {
                                    dashboard.landing = null;
                                    // hide the sidebar if it is open
                                    if ($('#left-sidebar').hasClass('toggled')) {
                                        $('#btn-pages-sidebar').click();
                                    }
                                }

                                // save the dashboard
                                spliceOrDiscardChild(dashboard.menu, childObj.id, 'perform');
                                dashboard.isanon = isAnonDashboard();
                                saveDashboard();
                                visibleViews = [];
                                renderPage(dashboard.landing || dashboard.pages[0].id);
                            }
                        });
                        return true;
                    } else {
                        dashboard.pages.length !== 1 ? showInformation(i18n_data['cannot.remove.hidden.page'] + " " +
                            i18n_data['or'] + " " + i18n_data['other.pages.contains.views'] + " " +
                            INTERNAL_EVERYONE_ROLE + " " + i18n_data['role']) :
                            showInformation(i18n_data['cannot.delete.last.page']);
                        return false;
                    }
                });
            });

        // dashboard pages list functions
        var pagesMenu = $("#ues-dashboard-pages");
        // load page properties
        pagesMenu.on("click", '.ues-page-list-heading', function (e) {
            var pid = $(this).data('id');
            // do not re-render if the user clicks on the current page name
            if (pid != page.id) {
                ues.global.isSwitchToNewPage = true;
                visibleViews = [];
                switchPage(pid, pageType);
                ues.global.isSwitchToNewPage = false;
            }

            // render page properties
            pagesMenu.find('.ues-page-properties#pages' + pid).html(pageOptionsHbs({
                id: page.id,
                title: page.title,
                landing: (dashboard.landing == page.id),
                isUserCustom: dashboard.isUserCustom,
                fluidLayout: page.views.fluidLayout || false
            })).on('change', 'input', function (e) {
                e.stopImmediatePropagation();
                if (updatePageProperties($(this).closest('.ues-page-properties'))) {
                    switchPage(page.id, pageType);
                }
            });

            // bind event handlers for page properties input fields
            // sanitize the page title property
            $("#page-title").on("keypress", function (e) {
                return sanitizeOnKeyPress(this, e, /[^a-z0-9-\s]/gim);
            });

            // sanitize the page URL property
            $("#page-url").on("keypress", function (e) {
                return sanitizeOnKeyPress(this, e, /[^a-z0-9-\s]/gim);
            }).on("keyup", function (e) {
                var sanitizedInput = $(this).val().replace(/[^\w]/g, '-').toLowerCase();
                $(this).val(sanitizedInput);
            });
        });

        var pageSearchFunction = function (searchQuery) {
            var pages = dashboard.pages;
            var resultPages = [];
            if (searchQuery) {
                for (var i = 0; i < pages.length; i++) {
                    if (pages[i].title.toLowerCase().indexOf(searchQuery.toLowerCase()) >= 0) {
                        resultPages.push(pages[i]);
                    }
                }
                updatePagesList(page, resultPages, dashboard.landing);
            } else {
                updatePagesList();
            }
        };

        $('#sidebarNavPages .ues-search-box input[type=text]').on('keypress', function (e) {
            if (e.which !== 13) {
                return;
            }
            e.preventDefault();
            pageSearchFunction($(this).val());
        });

        $('#sidebarNavPages .ues-search-box button').on('click', function () {
            var query = $(this).closest('.ues-search-box').find('input[type=text]').val();
            pageSearchFunction(query);
        });
    };

    /**
     * Find and return the next possible landing page
     * @param {String} pid current landing page
     * @param {Object} menu
     * @return {String} pid- next landing page
     * @private
     */
    var getNextLandingPage = function (pid, menu) {
        var nextLandingpage = null;
        var pagesWithInternal = null;
        var viewsWithAnon = 0;

        if (menu.length === 2) {
            for (var i = 0; i < menu.length; i++) {
                if (menu[i].id !== pid && menu[i].ishidden === false) {
                    return menu[i].id;
                }
            }
        }

        // When getting next landing page, if there is a page that has views for anon and internal everyone, select
        // that as landing page, or if there are no anon views in other pages select the page with a view for
        // internal/everyone
        for (var i = 0; i < menu.length; i++) {
            if (menu[i].id !== pid && menu[i].ishidden === false && nextLandingpage == null) {
                var pages = dashboard.pages;
                var tempPage = getPage(menu[i].id);
                var isAnonExist = false;
                var isInternalExist = false;
                var views = Object.keys(tempPage.views.content);
                for (var k = 0; k < views.length; k++) {
                    var tempViewRoles = tempPage.views.content[views[k]].roles;
                    if (tempViewRoles.indexOf(INTERNAL_EVERYONE_ROLE) > -1) {
                        isInternalExist = true;
                        if (!pagesWithInternal) {
                            pagesWithInternal = menu[i].id;
                        }
                    }
                    if (tempViewRoles.indexOf(ANONYMOUS_ROLE) > -1) {
                        isAnonExist = true;
                        viewsWithAnon++;
                    }
                    if (isInternalExist && isAnonExist) {
                        nextLandingpage = menu[i].id;
                        return nextLandingpage;
                    }
                }
            }
        }
        if (viewsWithAnon === 0) {
            return pagesWithInternal;
        }
        return nextLandingpage;
    };

    /**
     * Check whether page is deletable based on subordinates
     * @param {String} page ID
     * @return {boolean}
     * @private
     */
    var isRemovablePage = function (pid) {
        var menuItem = getChild(dashboard.menu, pid);
        spliceOrDiscardChild(dashboard.menu, menuItem.id, 'discard');
        if ((pid === dashboard.landing && dashboard.hideAllMenuItems) || menuItem.subordinates.length > 0) {
            return false;
        } else if (dashboard.landing === pid && dashboard.pages.length > 2) {
            var pages = dashboard.pages;
            var viewsWithAnon = 0;
            var viewsWithInternal = 0;
            for (var j = 0; j < pages.length; j++) {
                if (pages[j].id !== pid) {
                    var isAnonExist = false;
                    var isInternalExist = false;
                    var views = Object.keys(pages[j].views.content);
                    for (var i = 0; i < views.length; i++) {
                        var tempViewRoles = pages[j].views.content[views[i]].roles;
                        if (tempViewRoles.indexOf(INTERNAL_EVERYONE_ROLE) > -1) {
                            isInternalExist = true;
                            viewsWithInternal++;
                        }
                        if (tempViewRoles.indexOf(ANONYMOUS_ROLE) > -1) {
                            isAnonExist = true;
                            viewsWithAnon++;
                        }
                        if (isInternalExist && isAnonExist) {
                            return true;
                        }
                    }
                }
                if (j === pages.length - 1) {
                    return ((viewsWithAnon === 0) && viewsWithInternal > 0);
                }
            }
        } else {
            return true;
        }
        return false;
    };

    /**
     * To remove the set of gadgets in designer mode.
     * @param removingComponents Gadgets to be removed
     * @param length Number of gadgets to be removed
     */
    var removeGadgets = function (removingComponents, length, done) {
        for (var i = 0; i < length; i++) {
            var removingComponent = $("#" + removingComponents[i].id);
            var componentBox = removingComponent.closest(".ues-component-box");

            if (removingComponent.length) {
                removeComponent(removingComponents[i], function (err) {
                    if (err) {
                        done(err);
                        i = length;
                        return;
                    }
                });
            } else {
                var components;
                var component;
                var area;
                pageType = pageType ? pageType : DEFAULT_DASHBOARD_VIEW;
                var content = page.content[pageType];
                var isComponentFound = false;

                for (area in content) {
                    if (content.hasOwnProperty(area)) {
                        components = content[area];
                        var componentLength = components.length;
                        for (var j = 0; j < componentLength; j++) {
                            component = components[j];
                            if (component.id === removingComponents[i].id) {
                                var isDatabaseUpdateSuccess = ds.database.updateUsageData(dashboard,
                                    component.content.id, page.id, pageType, false);
                                if (isDatabaseUpdateSuccess) {
                                    area = content[area];
                                    var index = area.indexOf(component);
                                    area.splice(index, 1);
                                    saveDashboard();
                                    componentBox = $('#' + area + ".ues-component-box");
                                    isComponentFound = true;
                                    break;
                                } else {
                                    done("Error when updating database");
                                    return;
                                }
                            }
                        }
                        if (isComponentFound) {
                            break;
                        }
                    }
                }
            }
            componentBox.html(componentBoxContentHbs());
        }
        if (done) {
            done();
        }
    };

    /**
     * To check whether a view with a particular role exist in the page
     * @param pageToBeChecked Page to checked for the role
     * @param role Role to be checked
     * @param viewId View Id to be skipped if any
     * @returns {boolean} true if a view with particular role exists, otherwise false
     */
    var isRoleExist = function (pageToBeChecked, role, viewId) {
        var views = Object.keys(pageToBeChecked.content);
        for (var i = 0; i < views.length; i++) {
            if (!viewId || viewId !== views[i]) {
                var tempViewRoles = pageToBeChecked.views.content[views[i]].roles;
                if (tempViewRoles.indexOf(role) > -1) {
                    return true;
                }
            }
        }
        return false;
    };

    /**
     * To get a page of specific id
     * @param id Specific ID
     * @returns page with the given id
     */
    var getPage = function (id) {
        var pages = dashboard.pages;
        for (var k = 0; k < pages.length; k++) {
            if (pages[k].id === id) {
                return pages[k];
            }
        }
    };

    /**
     * Register the "set_pref" rpc function. When user set the user preferences using
     * pref.set() method this will be executed.
     * @return {null}
     * @private
     */
    var registerRpc = function () {
        gadgets.rpc.register('set_pref', function (token, name, value) {

            //Store the gadget id in a variable
            var id = this.f.split("-")[2];

            var pages = dashboard.pages;
            var numberOfPages = pages.length;
            for (var i = 0; i < numberOfPages; i++) {
                var views = getUserAllowedViews(Object.keys(page.content));
                for (var v = 0; v < views.length; v++) {
                    var pageContent = pages[i].content[views[v]];
                    var zones = Object.keys(pageContent);
                    var numberOfZones = zones.length;
                    for (var j = 0; j < numberOfZones; j++) {
                        var zone = zones[j];
                        var gadgets = pageContent[zone];
                        var numberOfGadgets = gadgets.length;
                        for (var k = 0; k < numberOfGadgets; k++) {
                            var gadget = gadgets[k];
                            if (gadgets[k].id == id) {
                                var gadgetOption = gadget.content.options;
                                gadgetOption[name].value = value;
                            }
                        }
                    }
                }
            }

            saveDashboard();
        });
    };

    /**
     * Initialized adding block function.
     * @return {null}
     */
    var initAddBlock = function () {

        var dummySizeChanged = function () {
            var dummy = $('.ues-dummy-gadget');
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
        $('#ues-add-block-btn').on('click', function () {

            var width = $('#block-width').val() || 0;
            var height = $('#block-height').val() || 0;
            var id = guid();

            if (width == 0 || height == 0) {
                return;
            }

            getGridstack().add_widget($(newBlockHbs({id: id})), 0, 0, width, height);
            $('.ues-component-box#' + id).html(componentBoxContentHbs());

            updateLayout();
            listenLayout();
        });

        $('.ues-dummy-gadget').resizable({
            grid: 18,
            containment: '.ues-block-container',
            resize: function (e, ui) {
                var height = $(this).height() / 18;
                var width = $(this).width() / 18;
                $('#block-width').val(width);
                $('#block-height').val(height);
            }
        });
        $('#block-width').val($('.ues-dummy-gadget').width() / 18);
        $('#block-height').val($('.ues-dummy-gadget').height() / 18);
    };

    /**
     * Initializes the UI
     * @return {null}
     * @private
     */
    var initUI = function () {
        $('#view-list').closest('li').on('show.bs.dropdown', function () {
            updateCollapsedViewsDropdown();
        });

        /**
         * Window resize event handler.
         **/
        $(window).resize(function () {
            updateCollapsedViewsDropdown();
        });

        /**
         * Window load event handler.
         **/
        $(window).load(function () {
            updateCollapsedViewsDropdown();
        });

        registerRpc();
        initDesignerMenu();
        initLayoutWorkspace();
        initStore();
        initComponentToolbar();
        initComponents();
        initAddBlock();

        if (ues.global.dashboard.isEditorEnable && ues.global.dashboard.isUserCustom) {
            showInformation("Received Edit Permission", "You have given edit permission for this dashboard. Please " +
                "reset the dashboard to receive the permission.");
        }
    };

    /**
     * Initializes the layout listeners.
     * @return {null}
     * @private
     */
    var listenLayout = function () {
        $('.gadgets-grid').find('.grid-stack-item:not([data-banner=true]) .ues-component-box').droppable({
            hoverClass: 'ui-state-hover',
            drop: function (event, ui) {
                var id = ui.helper.data('id');
                var type = ui.helper.data('type');
                if (type && !hasHiddenGadget($(this)) && !hasComponents($(this))) {
                    createComponent($(this), findStoreCache(type, id));
                }
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
     * To check whether a box has a hidden gadget that is not visible due to authorization or missing file problem
     * @param componentBox
     * @returns {*|boolean}
     */
    var hasHiddenGadget = function (componentBox) {
        for (var i = 0; i < dashboard.pages.length; i++) {
            if (dashboard.pages[i].id === page.id) {
                var component = dashboard.pages[i].content[pageType][componentBox.attr('id')];
                return (component && component.length > 0) ? component : null;
            }
        }
    };

    /**
     * Update the page list as changes happened to the pages.
     * @param {Object} current
     * @param {Object} pages
     * @param {String} landing
     * @return {null}
     * @private
     * */
    var updatePagesList = function (current, pages, landing) {

        current = current || page;

        $('#ues-dashboard-pages').html(pagesListHbs({
            current: current,
            pages: updateDefectiveInformtaion(pages || dashboard.pages),
            home: landing || dashboard.landing
        }));

        $('#ues-dashboard-pages #pagesButton' + current.id).click();
    };

    /**
     * To update the defective information to pages
     * @param pages Pages object
     * @returns {Object} Pages object with defective information
     */
    var updateDefectiveInformtaion = function (pages) {
        var updatedPages = clone(pages);
        var defectivePages = getDefectivePages();
        for (var i = 0; i < updatedPages.length; i++) {
            updatedPages[i].isDefective = defectivePages.indexOf(updatedPages[i].id) > -1;
        }
        return updatedPages;
    };

    /**
     * To get the defective usage data for particular database
     * @returns Defective usage data
     */
    var getDefectiveUsageData = function () {
        var defectiveUsageData = [];
        var dashboardID = dashboard.id;
        if (dashboard.isUserCustom) {
            dashboardID = dashboardID + '$'
        }
        $.ajax({
            url: DATABASE_API + '/' + dashboardID + '?task=getDefectivePages',
            method: "GET",
            contentType: "application/json",
            async: false,
            success: function (data) {
                defectiveUsageData = JSON.parse(data);
            }
        });
        return defectiveUsageData;
    };

    /**
     * To get the defective pages of a dashboard
     * @returns {Array} Arry of defective pages
     */
    var getDefectivePages = function () {
        var defectiveUsageData = getDefectiveUsageData();
        var defectivePages = [];
        if (defectiveUsageData && defectiveUsageData.data.length > 0) {
            defectiveUsageData = defectiveUsageData.data;
            for (var i = 0; i < dashboard.pages.length; i++) {
                for (var index = 0; index < defectiveUsageData.length; index++) {
                    if (defectiveUsageData[index].indexOf(dashboard.pages[i].id) > -1) {
                        defectivePages.push(dashboard.pages[i].id);
                        break;
                    }
                }
            }
        }
        return defectivePages;
    };

    /**
     * creates a page with the given options
     * @param {Object} options  Page options
     * @param {String} lid      Layout ID
     * @param {function} done   Callback function
     * @return {null}
     * @private
     */
    var createPage = function (options, lid, done) {
        var layout = findStoreCache('layout', lid);
        $.get(resolveURI(layout.url), function (data) {
            var id = options.id;
            var ishidden = dashboard.hideAllMenuItems ? true : false;
            var page = {
                id: id,
                title: options.title,
                views: {
                    content: {
                        default: JSON.parse(data)
                    },
                    fluidLayout: false
                },
                content: {
                    default: {}
                }
            };
            dashboard.landing = dashboard.landing || null;
            dashboard.isanon = dashboard.isanon ? dashboard.isanon : false;
            dashboard.pages.push(page);

            var menu = {
                id: id,
                ishidden: ishidden,
                title: options.title,
                subordinates: []
            };

            if (!dashboard.menu) {
                dashboard.menu = [];
            }
            dashboard.menu.push(menu);
            page.views.content[DEFAULT_DASHBOARD_VIEW].name = DEFAULT_VIEW_NAME;
            page.views.content[DEFAULT_DASHBOARD_VIEW].roles = [INTERNAL_EVERYONE_ROLE];
            saveDashboard();
            visibleViews = [];
            if (ues.global.page) {
                currentPage(findPage(dashboard, ues.global.page.id));
                switchPage(id, pageType);
                pageType = DEFAULT_DASHBOARD_VIEW;
                done();
            } else {
                pageType = DEFAULT_DASHBOARD_VIEW;
                renderPage(id, done);
            }
        }, 'html');
        loadGadgetsWithViewRoles(DEFAULT_DASHBOARD_VIEW);
    };

    /**
     * Returns the current page
     * @param {Object} p    Page object
     * @returns {Object}
     * @private
     */
    var currentPage = function (p) {
        return page = (ues.global.page = p);
    };

    /**
     * Switches the given page
     * @param {String} pid      Page ID
     * @param {String} currentPageType Type of the page
     * @return {null}
     * @private
     */
    var switchPage = function (pid, currentPageType) {
        if (!page) {
            return renderPage(pid);
        }
        destroyPage(page, currentPageType, function (err) {
            $('.fw-right-arrow').click();
            if (err) {
                throw err;
            }
            renderPage(pid);
        }, true);
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
        pageType = getViewId(getSelectedView());
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
        saveDashboard();
    };

    /**
     * Generate GUID.
     * @returns {String}
     * @private
     */
    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
    }

    /**
     * Show page layouts selection pane.
     * @returns {null}
     * @private
     */
    var showCreatePage = function () {
        // if the left panel is closed, click on the pages button
        if (!$('#left-sidebar').hasClass('toggled')) {
            $('#btn-pages-sidebar').click()
        }

        // if the select layout is closed, click on the create page button
        if (!$('#left-sidebar-sub').hasClass('toggled')) {
            $('#left-sidebar button[rel=createPage]').click();
        }
    };

    /**
     * Render a view
     * @param currentView Currently selected view
     * @param newView View to be rendered
     */
    var renderView = function (currentView, newView) {
        if (isInViewCreationView) {
            var views = getUserAllowedViews(Object.keys(page.content));
            pageType = newView;
            if (views.length > 0 && views.length > visibleViewCount) {
                pageType = views[0];
            }
            renderPage(getPageId());
            isInViewCreationView = false;
        } else {
            var mode = newView;
            pageType = mode;
            ues.global.type = mode;
            switchPage(getPageId(), currentView);
            isInViewCreationView = false;
            loadGadgetsWithViewRoles(pageType);
            $('#designer-view-mode li').removeClass('active');
            $('#designer-view-mode li[data-view-mode=' + pageType + ']').addClass('active');
        }
    };

    /**
     * Renders the given page in the designer view.
     * @param {String} pid      Page ID
     * @param {function} done   Callback function
     * @return {null}
     * @private
     */
    var renderPage = function (pid, done) {
        $('#designer-view-mode').empty();
        gadgetIds = undefined;
        // if no pages found, display a message
        if (!dashboard.pages.length) {

            $('#ues-dashboard-preview-link').hide();

            $('.gadgets-grid')
                .html(noPagesHbs())
                .find('#btn-add-page-empty').on('click', function () {
                    showCreatePage();
                });

            $('.page-header .page-actions').hide();
            $('#btn-sidebar-layouts, #btn-sidebar-gadgets').hide();
            $('#btn-sidebar-menu').hide();
            $('#btn-sidebar-dashboard-layout').hide();

            showCreatePage();
            return;
        }
        //enable add view button only if there is a page
        $('#add-view').removeClass('hidden').show();
        $('#ues-dashboard-preview-link').show();
        $('.gadgets-grid').html('');
        $('.page-header .page-actions').show();
        $('#btn-sidebar-layouts, #btn-sidebar-gadgets').show();
        $('#btn-sidebar-menu').show();
        $('#btn-sidebar-dashboard-layout').show();

        currentPage(findPage(dashboard, pid));
        if (!page) {
            throw 'specified page : ' + pid + ' cannot be found';
        }
        var views = getUserAllowedViews(Object.keys(page.views.content));
        $('#more-views').addClass('hidden');
        if ((views.length > visibleViewCount) && (visibleViews.length === 0)) {
            visibleViews = views.slice(0, visibleViewCount);
        } else if (visibleViews.length === 0) {
            visibleViews = views;
        }
        if (views.length !== visibleViews.length) {
            $('#more-views').removeClass('hidden');
            $('#more-views').show();
        }

        if (visibleViews.length === 0) {
            $('#add-view').click();
        }
        //render all view tabs in the page
        for (var i = 0; i < visibleViews.length; i++) {
            try {
                var tempView = visibleViews[i];
                var viewTempName = page.views.content[tempView].name;
                $('#designer-view-mode').append(newViewHbs);
                $("#new-view-id").attr('data-view-mode', tempView);
                $("#view-name").html(viewTempName);
                $("#new-view-id").attr('id', 'nav-tab-' + tempView);
                $("#view-name").attr('id', tempView);
                if (i === 0) {
                    pageType = pageType || tempView;
                    if (visibleViews.indexOf(pageType) <= -1) {
                        pageType = tempView;
                    }
                }
            } catch (e) {
                throw e;
            }
        }

        pageType = pageType || DEFAULT_DASHBOARD_VIEW;
        $('#designer-view-mode li').removeClass('active');
        $('#designer-view-mode li[data-view-mode=' + pageType + ']').addClass('active');
        loadGadgetsWithViewRoles(pageType);
        // render page header
        var currentPageIndex = 0;
        for (; currentPageIndex < dashboard.pages.length && dashboard.pages[currentPageIndex].id != pid;
               currentPageIndex++);
        var hasPrevPage = currentPageIndex > 0;
        var hasNextPage = currentPageIndex < dashboard.pages.length - 1;

        $('.page-header').html(headerContent = designerHeadingHbs({
            id: page.id,
            title: page.title,
            pageNumber: currentPageIndex + 1,
            totalPages: dashboard.pages.length,
            prev: {
                available: hasPrevPage,
                id: (hasPrevPage ? dashboard.pages[currentPageIndex - 1].id : '')
            },
            next: {
                available: hasNextPage,
                id: (hasNextPage ? dashboard.pages[currentPageIndex + 1].id : '')
            }
        }));
        if (views.length > 0) {
            var layout = $(page.views.content[pageType]);
            $('.gadgets-grid').html(ues.dashboards.getGridstackLayout(layout[0]));
            $('.grid-stack').gridstack({
                width: 12,
                animate: true,
                cellHeight: 50,
                verticalMargin: 30,
                handle: '.ues-component-heading, .ues-component-heading .ues-component-title'
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
            ues.dashboards.render($('.gadgets-grid'), dashboard, pid, pageType, function (err) {
                $('.gadgets-grid').find('.ues-component').each(function () {
                    var id = $(this).attr('id');
                    renderComponentToolbar(findComponent(id));
                    if (!id) {
                        if (err === UNAUTHORIZED_ERROR_CODE) {
                            $(this).addClass('gadget-error');
                            $(this).find('.ues-component-title').html(i18n_data['error'] + '!');
                            $(this).find('.ues-component-body').html(dsErrorHbs({
                                errorTitle: (err + " " + i18n_data['unauthorized']),
                                error: i18n_data['no.permission.to.view.gadget']
                            }));
                            err = null;
                        } else if (err === NOT_FOUND_ERROR_CODE) {
                            $(this).addClass('gadget-error');
                            $(this).find('.ues-component-title').html(i18n_data['error'] + '!');
                            $(this).find('.ues-component-body').html(dsErrorHbs({
                                errorTitle: (err + " " + i18n_data['gadget.not.found']),
                                error: i18n_data['gadget.missing']
                            }));
                            err = null;
                        }
                    }
                });
                listenLayout();

                $('.gadgets-grid [data-banner=true] .ues-component-body').addClass('ues-banner-placeholder');
                if (!done) {
                    return;
                }
                done(err);
            }, true);
        }
        updatePagesList();
        updateMenuList();
        initBanner();
    };

    /**
     * Update the collapsed view drop down with views.
     *
     * @return null
     * @private
     * */
    var updateCollapsedViewsDropdown = function () {
        var collapsedViews = 'ul#view-list';
        var containerTop = $('.page-views-container.flex-container > .flex-item-middle').position().top;
        var hiddenElements = [];
        var listElements = [];
        $('.page-views-container.flex-container > .flex-item-middle > li').each(function () {
            if ($(this).position().top > containerTop) {
                hiddenElements.push($(this));
            }
        });

        $.each(hiddenElements, function (key, val) {
            listElements.push('<li class="overflowed-item">' +
                '<a href="#">' +
                '<span id="' + $(val).data('view-mode') + '">' + $(val).find('a').html() + '</span>' +
                '</a>' +
                '</li>');
        });
        $(collapsedViews + ' .overflowed-item').remove();
        $(collapsedViews).append(listElements);
        var views = getUserAllowedViews(Object.keys(page.views.content));
        if (hiddenElements.length > 0) {
            visibleViewCount = $("#designer-view-mode").children('li').length - hiddenElements.length;
        }

        if ($(collapsedViews).children('li').length > 0 || views.length !== visibleViews.length) {
            $('#more-views').removeClass('hidden');
        }
        else {
            $('#more-views').addClass('hidden');
        }
    };

    /**
     * Check for the auto-generated name to stop repeating the same name.
     * @param {String} prefix
     * @param {Number} pid
     * @return {Number}
     * @private
     * */
    var checkForExistingPageNames = function (prefix, pid) {
        var i;
        var pages = dashboard.pages;
        var length = pages.length;
        var page = prefix + pid;
        for (i = 0; i < length; i++) {
            if (pages[i].id === page) {
                pid++;
                page = prefix + pid;
                return checkForExistingPageNames(prefix, pid);
            }
        }
        return pid;
    };

    /**
     * Build up the page options for the given type of page.
     * @param {String} type
     * @returns {{id: string, title: string}}
     * @private
     */
    var pageOptions = function (type) {
        if (type === 'login') {
            return {
                id: 'login',
                title: 'Login'
            };
        }

        var pid = 0;
        var prefix = 'page';
        var titlePrefix = 'Page ';
        pid = checkForExistingPageNames(prefix, pid);
        return {
            id: prefix + pid,
            title: titlePrefix + pid
        };
    };

    /**
     * Initializes the dashboard.
     * @param {Object} db   Dashboard object
     * @param {String} page Page ID
     * @returns {null}
     * @private
     */
    var initDashboard = function (db, page) {
        dashboard = (ues.global.dashboard = db);
        var pages = dashboard.pages;
        if (pages.length > 0) {
            renderPage(page || db.landing || pages[0].id);
        } else {
            renderPage(null)
        }
    };

    /**
     * Load the content within the banner placeholder.
     * @return {null}
     */
    var loadBanner = function () {
        ues.global.dashboard.banner = ues.global.dashboard.banner || {
                globalBannerExists: false,
                customBannerExists: false
            };

        var $placeholder = $('.ues-banner-placeholder');
        var customDashboard = ues.global.dashboard.isUserCustom || false;
        var banner = ues.global.dashboard.banner;
        var bannerExists = banner.globalBannerExists || banner.customBannerExists;
        // create the view model to be passed to handlebar
        var data = {
            isAdd: !bannerExists && !banner.cropMode,
            isEdit: bannerExists && !banner.cropMode,
            isCrop: banner.cropMode,
            isCustomBanner: customDashboard && banner.customBannerExists,
            showRemove: (customDashboard && banner.customBannerExists) || !customDashboard
        };
        $placeholder.html(bannerHbs(data));

        // display the image
        var bannerImage = $placeholder.find('.banner-image');
        if (bannerExists) {
            bannerImage.css('background-image',
                "url('" + bannerImage.data('src') + '?rand=' + Math.floor(Math.random() * 100000) + "')").show();
        } else {
            bannerImage.hide();
        }
    };

    /**
     * Change event handler for the banner file control.
     * @param {Object} e Event object
     * @return {null}
     */
    var bannerChanged = function (e) {
        var file = e.target.files[0];
        if (file.size == 0) {
            return;
        }

        if (!new RegExp('^image/', 'i').test(file.type)) {
            return;
        }

        // since a valid image is selected, render the banner in crop mode
        ues.global.dashboard.banner.cropMode = true;
        loadBanner();
        $('.ues-banner-placeholder button').prop('disabled', true);
        $('.ues-dashboard-banner-loading').show();

        var $placeholder = $('.ues-banner-placeholder');
        var srcCanvas = document.getElementById('src-canvas');
        var $srcCanvas = $(srcCanvas);
        var img = new Image();
        var width = $placeholder.width();
        var height = $placeholder.height();
        // remove previous cropper bindings to the canvas (this will remove all the created controls as well)
        $srcCanvas.cropper('destroy');
        // draw the selected image in the source canvas and initialize cropping
        var srcCtx = srcCanvas.getContext('2d');
        var objectUrl = URL.createObjectURL(file);
        img.onload = function () {
            // draw the uploaded image on the canvas
            srcCanvas.width = img.width;
            srcCanvas.height = img.height;
            srcCtx.drawImage(img, 0, 0);
            // bind the cropper
            $srcCanvas.cropper({
                aspectRatio: width / height,
                autoCropArea: 1,
                strict: true,
                guides: true,
                highlight: true,
                dragCrop: false,
                cropBoxMovable: false,
                cropBoxResizable: true,
                crop: function (e) {
                    // draw the cropped image part in the dest. canvas and get the base64 encoded string
                    var cropData = $srcCanvas.cropper('getData');
                    var destCanvas = document.getElementById('dest-canvas');
                    var destCtx = destCanvas.getContext('2d');
                    destCanvas.width = width;
                    destCanvas.height = height;
                    destCtx.drawImage(img, Math.max(cropData.x, 0), Math.max(cropData.y, 0), cropData.width,
                        cropData.height, 0, 0, destCanvas.width, destCanvas.height);
                    var dataUrl = destCanvas.toDataURL('image/jpeg');
                    $('#banner-data').val(dataUrl);
                }
            });
            $('.ues-banner-placeholder button').prop('disabled', false);
            $('.ues-dashboard-banner-loading').hide();
        };
        img.src = objectUrl;
    };

    /**
     * Initialize the banner.
     * @return {null}
     */
    var initBanner = function () {
        loadBanner();
        // bind a handler to the change event of the file element (removing the handler initially to avoid multiple
        // binding to the same handler)
        var fileBanner = document.getElementById('file-banner');
        fileBanner.removeEventListener('change', bannerChanged);
        fileBanner.addEventListener('change', bannerChanged, false);
        // event handler for the banner edit button
        $('.ues-banner-placeholder').on('click', '#btn-edit-banner', function (e) {
            $('#file-banner').val('').click();
        });
        // event handler for the banner save button
        $('.ues-banner-placeholder').on('click', '#btn-save-banner', function (e) {
            var $form = $('#ues-dashboard-upload-banner-form');
            var cropData = $form.find('#banner-data').val();
            $.ajax({
                url: $form.attr('action'),
                type: $form.attr('method'),
                async: false,
                data: {'data': cropData}
            }).success(function (d) {
                if (ues.global.dashboard.isUserCustom) {
                    ues.global.dashboard.banner.customBannerExists = true;
                } else {
                    ues.global.dashboard.banner.globalBannerExists = true;
                }
                ues.global.dashboard.banner.cropMode = false;
                loadBanner();
            });
        });
        // event handler for the banner cancel button
        $('.ues-banner-placeholder').on('click', '#btn-cancel-banner', function (e) {
            ues.global.dashboard.banner.cropMode = false;
            $('#file-banner').val('');
            loadBanner();
        });
        // event handler for the banner remove button
        $('.ues-banner-placeholder').on('click', '#btn-remove-banner', function (e) {
            var $form = $('#ues-dashboard-upload-banner-form');
            if (ues.global.dashboard.isUserCustom && !ues.global.dashboard.banner.customBannerExists) {
                // in order to remove the global banner from a personalized dashboard, we need to save an empty resource.
                $.ajax({
                    url: $form.attr('action'),
                    type: $form.attr('method'),
                    async: false,
                    data: {data: ''}
                }).success(function (d) {

                    // we need to suppress the global banner when removing the global banner from a custom dashboard.
                    // therefore the following flag is set to false forcefully.
                    ues.global.dashboard.banner.globalBannerExists = false;

                    if (ues.global.dashboard.isUserCustom) {
                        ues.global.dashboard.banner.customBannerExists = false;
                    }

                    ues.global.dashboard.banner.cropMode = false;

                    loadBanner();
                });

            } else {
                // remove the banner
                $.ajax({
                    url: $form.attr('action'),
                    type: 'DELETE',
                    async: false,
                    dataType: 'json'
                }).success(function (d) {

                    if (ues.global.dashboard.isUserCustom) {
                        ues.global.dashboard.banner.globalBannerExists = d.globalBannerExists;
                        ues.global.dashboard.banner.customBannerExists = false;
                    } else {
                        ues.global.dashboard.banner.globalBannerExists = false;
                    }
                    ues.global.dashboard.banner.cropMode = false;
                    loadBanner();
                });
            }
        });
    };

    initUI();
    initDashboard(ues.global.dashboard, ues.global.page);

    ues.dashboards.save = saveDashboard;

    /**
     * Hide/show all menu items except landing page
     * @param {Boolean} state
     * @return {null}
     */
    var manipulateAllMenuItems = function (bool) {
        var menu = dashboard.menu;
        var landing = dashboard.landing;
        manipulateSubordinates(menu, landing);

        function manipulateSubordinates(menu, landing) {
            for (var i = 0; i < menu.length; i++) {
                if (menu[i].id !== landing) {
                    menu[i].ishidden = bool;
                }
                if (menu[i].subordinates.length > 0) {
                    manipulateSubordinates(menu[i].subordinates, landing);
                }
            }
        }
    };

    /**
     * Hide/show particular menu item.
     * @param {String} pageID
     * @return {null}
     */
    var manipulateMenuItem = function (pageId) {
        var menu = dashboard.menu;
        var landing = dashboard.landing;
        manipulateSubordinates(menu, landing);
        updateHideAllMenuItemsState();

        function manipulateSubordinates(menu, landing) {
            for (var i = 0; i < menu.length; i++) {
                //page should not be current landing page
                if (menu[i].id !== landing && menu[i].id === pageId) {
                    //TODO get state from the UI
                    if (menu[i].ishidden) {
                        menu[i].ishidden = false;
                    } else {
                        // hide all the subordinates of the menu item as well
                        menu[i].ishidden = true;
                        if (menu[i].subordinates.length > 0) {
                            makeSubordinatesHidden(menu[i].subordinates);
                        }
                    }
                    saveDashboard();
                    return;
                }

                if (menu[i].subordinates.length > 0 && !menu[i].ishidden) {
                    manipulateSubordinates(menu[i].subordinates, landing);
                } else if (menu[i].ishidden && checkParentMenuHidden(menu[i], pageId)) {
                    showInformation(i18n_data['cannot.hide.page'], i18n_data['parents.hidden']);
                }
            }
        }
    };

    /**
     * Check parent menu of given view, is hidden or not
     * @param menu
     * @param currentView Selected current view
     * @returns {boolean} true if parent of selected view is hidden
     */
    var checkParentMenuHidden = function (menu, currentView) {
        if (menu.id === currentView) {
            return true;
        }
        if (menu.subordinates.length > 0) {
            for (var i = 0; i < menu.subordinates.length; i++) {
                if (checkParentMenuHidden(menu.subordinates[i], currentView)) {
                    return true;
                }
            }
        }
    };

    /**
     * To make all the subordinates of a particular menu hidden
     * @param menu Subordinates menu to make hidden
     */
    var makeSubordinatesHidden = function (menu) {
        for (var j = 0; j < menu.length; j++) {
            menu[j].ishidden = true;
            if (menu[j].subordinates.length > 0) {
                makeSubordinatesHidden(menu[j].subordinates);
            }
        }
    };

    $(document).on('click', '.context-menu i', function () {
        if ($(this).parent().find('.gadget-actions').is(':visible')) {
            $(this).parent().find('.gadget-actions').hide();
        } else {
            $(this).parent().find('.gadget-actions').show();
        }
    });

    /**
     * update dashboard.hideAllMenuItems state
     * @return {null}
     */
    var updateHideAllMenuItemsState = function () {
        var menu = dashboard.menu;
        var visibleMenuItems = [];
        traverseSubordinates(menu);
        dashboard.hideAllMenuItems = (visibleMenuItems.length === 1 &&
            dashboard.landing) || (visibleMenuItems.length === 0);
        saveDashboard();
        updateMenuList();

        function traverseSubordinates(menu) {
            for (var i = 0; i < menu.length; i++) {
                if (!menu[i].ishidden) {
                    visibleMenuItems.push(menu[i].id);
                }
                if (menu[i].subordinates.length > 0) {
                    traverseSubordinates(menu[i].subordinates);
                }
            }
        }
    };
});

// Initialize nano scrollers
var nanoScrollerSelector = $(".nano");
nanoScrollerSelector.nanoScroller();

/**
 * Update sidebar.
 * @param {String} view     Selector of the sidebar pane
 * @param {Object} button   Event source
 * @return {null}
 */
function updateSidebarNav(view, button) {
    var target = $(button).data('target');
    $(view).show();
    $(view).siblings().hide();
    $('.content').show();
    $('.menu').hide();
    $('#btn-sidebar-menu').closest('li').removeClass('active');

    if ($(view).find('button[data-target=#left-sidebar-sub]').length == 0) {
        $('#left-sidebar-sub').hide();
    } else {
        $('#left-sidebar-sub').show();
    }

    nanoScrollerSelector[0].nanoscroller.reset();
}

/**
 * Loads hierarchical menu creation page
 * @param {Object} button   Event source
 * @return {null}
 */
function loadMenuCreator(button) {
    $('.menu').show();
    $('.content').hide();
    $(button).closest('li').addClass('active');
}

/**
 * Update the UI when closing the right sidebar.
 * @param {Object} button       Event source
 * @return {null}
 */
function updateSidebarOptions(button) {

    var target = $(button).data('target');

    $('.gadget').removeClass('active');
    setTimeout(function () {
        if ($(target).hasClass('toggled')) {
            $(button).closest('.gadget').addClass('active');
            $(button).closest('.gadget').removeClass('deactive');
            $('.gadget:not(.active)').addClass('deactive');
        } else {
            $('.gadget').removeClass('active').removeClass('deactive');
        }
    }, 5);
}

/**
 * Toggle caret when sidebar toggles.
 * @param {*} e Event object
 * @return {null}
 */
function toggleCaret(e) {
    $(e.target)
        .prev('.panel-heading')
        .toggleClass('dropup dropdown');
    nanoScrollerSelector[0].nanoscroller.reset();
}

$('.sidebar-wrapper').on('hidden.bs.collapse', toggleCaret);
$('.sidebar-wrapper').on('shown.bs.collapse', toggleCaret);

$('#left-sidebar').on('hidden.sidebar', function (event) {
    $(event.target).find('button[data-target=#left-sidebar-sub]').removeClass('active').attr('aria-expanded', 'false');
    $.sidebar_toggle('hide', '#left-sidebar-sub', '.page-content-wrapper');
});

$('#gridGuideToggle').change(function () {
    $('body').toggleClass('grid-on');
});

$('.gadgets-grid').on({
    mouseenter: function () {
        toggleHeading($(this), true);
    },
    mouseleave: function () {
        toggleHeading($(this), false);
    }
}, '.ues-component');

/**
 * Toggle gadget heading when no heading is activated.
 * @param {Object} source       Event source
 * @param {Boolean} show        Flag
 * @return {null}
 */
function toggleHeading(source, show) {
    if (source.hasClass('ues-no-heading')) {
        var heading = source.find('.ues-component-heading');
        if (show) {
            heading.slideDown();
        } else {
            heading.slideUp();
        }
    }
}

// Enforce min/max values of number fields
$('input[type=number]').on('change', function () {
    var input = $(this);
    var max = input.attr('max');
    var min = input.attr('min');
    if (input.val().trim() == '') {
        return;
    }
    var value = parseInt(input.val());
    if (max !== '' && !isNaN(max) && value > parseInt(max)) {
        input.val(max);
    }
    if (min !== '' && !isNaN(min) && value < parseInt(min)) {
        input.val(min);
    }
}).on('blur', function () {
    var input = $(this);
    if (input.val() == '' && input.attr('min')) {
        input.val(input.attr('min'));
    }
});
/**
 * To sanitzie the user input for security timeout
 * @param value Value, user entered
 * @param min Minimum allowed value
 * @param max Maximum allowed value
 * @param recommended Recommended value
 * @returns sanitized value
 */
function sanitizeSecurityTimeOut(value, min, max, recommended) {
    if (parseInt(value) < min || isNaN(value)) {
        return recommended;
    } else if (parseInt(value) > max) {
        return max;
    } else {
        return value;
    }
}