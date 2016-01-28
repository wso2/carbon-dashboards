$(function () {
    var DASHBOARD_DEFAULT_VIEW = 'default',
        DASHBOARD_FULL_SCEEN_VIEW = 'full',
        DASHBOARD_SETTINGS_VIEW = 'settings',
        CONTAINER_PREFIX = 'gadget-';

    var page;

    /**
     * Precompiling Handlebar templates
     */
    var componentToolbarHbs = Handlebars.compile($('#ues-component-actions-hbs').html() || ''),
        gadgetSettingsViewHbs = Handlebars.compile($('#ues-gadget-setting-hbs').html() || '');

    /**
     * initializes the component toolbar
     * @private
     */
    var initComponentToolbar = function () {

        // gadget maximization handler
        $('.ues-components-grid').on('click', '.ues-component-full-handle', function (e) {
            var id = $(this).closest('.ues-component').attr('id'),
                component = findComponent(id),
                componentBox = $(this).closest('.ues-component-box');

            if (component.fullViewPoped) {

                // render normal view
                // restore the normal view (remove the css class, restore the original height and remove the temporary attribute)
                componentBox
                    .removeClass('ues-component-fullview')
                    .css('height', componentBox.attr('data-original-height'))
                    .removeAttr('data-original-height');

                renderMaxView(component, DASHBOARD_DEFAULT_VIEW);

                $(this).attr('title', $(this).data('maximize-title'));

                component.fullViewPoped = false;
            } else {

                // render max view
                // change the container height for the max view (including backing up the original height for restoration later)
                componentBox
                    .attr('data-original-height', componentBox.css('height'))
                    .addClass('ues-component-fullview')
                    .css('height', ($(window).height() - 40) + 'px');

                renderMaxView(component, DASHBOARD_FULL_SCEEN_VIEW);

                $(this).attr('title', $(this).data('minimize-title'));

                component.fullViewPoped = true;
            }
        });

        // gadget settings handler
        $('.ues-components-grid').on('click', '.ues-component-settings-handle', function (e) {
            e.preventDefault();

            var id = $(this).closest('.ues-component').attr('id'),
                component = findComponent(id),
                componentContainer = $('#' + CONTAINER_PREFIX + id);

            // toggle the component settings view if exists
            if (component.hasCustomUserPrefView) {
                switchComponentView(component, (component.viewOption == DASHBOARD_SETTINGS_VIEW ? DASHBOARD_SETTINGS_VIEW : DASHBOARD_SETTINGS_VIEW));
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
    var switchComponentView = function(component, view){
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
     * Renders the component toolbar of a given component
     * @param {Object} component
     * @returns {null}
     * @private
     */
    var renderComponentToolbar = function (component) {

        if (component) {

            var container = $('#' + component.id);
            container.find('.ues-component-actions').html($(componentToolbarHbs(component.content)));

            // hide the settings button from the anon view
            if (ues.global.dbType === 'anon') {
                $('a.ues-component-settings-handle', container).hide();
            }
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
     * This is the initial call from the dashboard.js
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

        ues.dashboards.render($('.gadgets-grid'), ues.global.dashboard, ues.global.page, ues.global.dbType, function() {

            // render component toolbar for each components
            $('.ues-component-box .ues-component').each(function () {
                var component = findComponent($(this).attr('id'));
                renderComponentToolbar(component);
            });
        });
    };

    initDashboard();
    initComponentToolbar();
});

/**
 * We make this true so that the dashboard.jag files inline ues.dashboards.render method is not triggered.
 * @type {boolean}
 */
ues.global.renderFromExtension = true;
