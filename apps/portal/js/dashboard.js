$(function () {
    var DASHBOARD_DEFAULT_VIEW = 'default';
    var DASHBOARD_FULL_SCEEN_VIEW = 'full';
    var DASHBOARD_SETTINGS_VIEW = 'settings';
    var containerPrefix = 'gadget-';

    var componentToolbarHbs = Handlebars.compile($('#ues-component-toolbar-hbs').html() || '');
    var gadgetSettingsViewHbs = Handlebars.compile($('#ues-gadget-setting-hbs').html() || '');
    var page;

    /**
     * initializes the component toolbar
     */
    var initComponentToolbar = function () {
        
        $('#wrapper').on('click', 'a.ues-component-full-handle', function (e) {
            
            var id = $(this).closest('.ues-component').attr('id'), 
                component = findComponent(id), 
                componentBox = $(this).closest('.ues-component-box');
            
            if (component.fullViewPoped) {
                
                // render normal view
                // restore the normal view (remove the css class, restore the original height and remove the temporary attribute)
                componentBox
                    .removeClass('ues-fullview-visible')
                    .css('height', '')
                    .removeAttr('data-height');
                
                renderMaxView(component, DASHBOARD_DEFAULT_VIEW);
                
                $(this).attr('title', $(this).data('maximize-title'));
                
                component.fullViewPoped = false;
            } else {
                
                // render max view                
                // change the container height for the max view (including backing up the original height for restoration later)
                componentBox
                    .attr('data-height', componentBox.css('height'))
                    .addClass('ues-fullview-visible')
                    .css('height', $(window).height() + 'px');
                
                renderMaxView(component, DASHBOARD_FULL_SCEEN_VIEW);
                
                $(this).attr('title', $(this).data('minimize-title'));
                             
                component.fullViewPoped = true;
            }
        });

        $('#wrapper').on('click', 'a.ues-component-settings-handle', function (e) {
            
            e.preventDefault();
            
            var id = $(this).closest('.ues-component').attr('id'),
                component = findComponent(id), 
                componentContainer = $('#' + containerPrefix + id);

            // toggle the component settings view if exists
            if (component.hasCustomUserPrefView) {
                if (component.viewOption == DASHBOARD_SETTINGS_VIEW) {
                    switchComponentView(component, DASHBOARD_DEFAULT_VIEW);
                } else {
                    switchComponentView(component, DASHBOARD_SETTINGS_VIEW);
                }
                return;
            }

            var settings = gadgetSettingsViewHbs(component.content);
            if (componentContainer.hasClass('ues-userprep-visible')) {
                componentContainer.removeClass('ues-userprep-visible');
                updateComponentProperties(componentContainer.find('.ues-sandbox'), component);
                componentContainer.find('.ues-sandbox').remove();
                return;
            }
            componentContainer.append(settings)
                .addClass('ues-userprep-visible');
        });
    };

    /**
     * Switch component view mode
     * @param component
     * @param view
     */
    var switchComponentView = function(component, view){
        component.viewOption = view;
        ues.components.update(component, function (err, block) {
            if (err) {
                throw err;
            }
        });
    };

    Handlebars.registerHelper('equals', function (left, right, options) {
        if (left === right) {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    /**
     * Render maximized view for a gadget
     * @param component
     * @param componentContainer
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
     * @param component
     */
    var renderComponentToolbar = function (component) {
        
        if (component) {
            
            var container = $('#' + component.id);
            container.find('.ues-component-toolbar ul').html($(componentToolbarHbs(component.content)));
            
            // hide the settings button from the anon view
            if (ues.global.dbType === 'anon') {
                $('a.ues-component-settings-handle', container).hide();
            }
            $('[data-toggle="tooltip"]', container).tooltip();
        }
    };
    
    /**
     * Find a given component in the current page
     * @param id
     * @returns {*}
     * @param content
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
     * This is the call back function for dashboard drawing
     */
    var dashboardDone = function () {
        $('.ues-component-box div.ues-component').each(function () {
            var component = findComponent($(this).attr('id'));
            renderComponentToolbar(component);
        });
    };
    
    /**
     * This is the initial call from the dashboard.js
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
        $('body').on('click', '.modal-footer button', function () {
            $('#componentFull').modal('hide');
        });
        ues.dashboards.render($('#wrapper'), ues.global.dashboard, ues.global.page, ues.global.dbType, dashboardDone);
    };
    
    initDashboard();
    initComponentToolbar();
});

/**
 * We make this true so that the dashboard.jag files inline ues.dashboards.render method is not triggered.
 * @type {boolean}
 */
ues.global.renderFromExtension = true;