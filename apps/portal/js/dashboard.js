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
var RPC_GADGET_BUTTON_CALLBACK = "RPC_GADGET_BUTTON_CALLBACK";
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
    var page;
    /**
     * Pre-compiling Handlebar templates
     */
    var componentToolbarHbs = Handlebars.compile($('#ues-component-actions-hbs').html());
    var gadgetSettingsViewHbs = Handlebars.compile($('#ues-gadget-setting-hbs').html());
    /**
     * Initializes the component toolbar.
     * @return {null}
     * @private
     */
    var initComponentToolbar = function () {
        var viewer = $('.ues-components-grid');


        //gadget title bar custom button function handler
        viewer.on('click', '.ues-custom-action', function (e) {
            var fid = $(this).closest('.ues-component-box').find('iframe').attr('id');
            var action = $(this).attr('data-action');
            gadgets.rpc.call(fid, RPC_GADGET_BUTTON_CALLBACK, null, action);
        });

        // gadget maximization handler
        viewer.on('click', '.ues-component-full-handle', function (e) {
            var id = $(this).closest('.ues-component').attr('id');
            var component = findComponent(id);
            var componentBox = $(this).closest('.ues-component-box');
            var gsContainer = $('.grid-stack');
            var gsBlock = componentBox.parent();
            if (component.fullViewPoped) {
                // render normal view
                $('.ues-component-box').show();
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
            var component = findComponent(id);
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
            var container = $('#' + component.id);
            var noOfDefaultBtn = 0;
            var userPrefsExists = false;
            for (var key in component.content.options) {
                if (component.content.options[key].type.toUpperCase() != 'HIDDEN') {
                    userPrefsExists = true;
                    break;
                }
            }
            if (userPrefsExists) {
                noOfDefaultBtn = noOfDefaultBtn + 1;
            }
            // anon dashboards doesn't have settings option
            if (component.content.defaultButtonConfigs) {
                if (component.content.defaultButtonConfigs.isMaximize) {
                    noOfDefaultBtn = noOfDefaultBtn + 1;
                }
            }
            if (component.content.toolbarButtons) {
                var customtoolbarOpt = component.content.toolbarButtons.custom || {};
                for (var customBtn in customtoolbarOpt) {
                    if (customtoolbarOpt.hasOwnProperty(customBtn)) {
                        noOfDefaultBtn = noOfDefaultBtn + 1;
                        var iconTypeCSS = 'css';
                        var iconTypeImage = 'image';
                        if (customtoolbarOpt[customBtn].iconType.toUpperCase() === iconTypeCSS.toUpperCase()) {
                            customtoolbarOpt[customBtn].isTypeCSS = true;
                        }
                        if (customtoolbarOpt[customBtn].iconType.toUpperCase() === iconTypeImage.toUpperCase()) {
                            customtoolbarOpt[customBtn].isTypeImage = true;
                        }
                    }
                }
            }
            component.content.isDropDownView = noOfDefaultBtn > 3;
            // anon dashboards doesn't have settings option
            component.content.userPrefsExists = userPrefsExists && (ues.global.dbType !== 'anon');
            container.find('.ues-component-actions').html($(componentToolbarHbs(component.content)));
        }
    };

    /**
     * Find a given component in the current page
     * @param {Number} id
     * @returns {Object}
     * @private
     */
    var findComponent = function (id) {
        var i;
        var length;
        var area;
        var component;
        var components;
        var content = (ues.global.dbType === 'anon' ? page.content.anon : page.content.default);
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
                var component = findComponent($(this).attr('id'));
                renderComponentToolbar(component);
            });
            $('.grid-stack').gridstack({
                width: 12,
                cellHeight: 50,
                verticalMargin: 30,
                disableResize: true,
                disableDrag: true,
            });
        });
        $('.nano').nanoScroller();
    };

    initDashboard();
    initComponentToolbar();
});

/**
 * We make this true so that the dashboard.jag files inline ues.dashboards.render method is not triggered.
 * @type {boolean}
 */
ues.global.renderFromExtension = true;
