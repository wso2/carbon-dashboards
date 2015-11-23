$(function () {
    var DEFAULT_DASHBOARD_VIEW = 'default';
    var DASHBOARD_FULL_SCEEN_VIEW = 'full';
    var DASHBOARD_SETTINGS_VIEW = 'settings';
    var containerPrefix = 'gadget-';

    var componentToolbarHbs = Handlebars.compile($("#ues-component-toolbar-hbs").html() || '');
    var gadgetSettingsViewHbs = Handlebars.compile($('#ues-gadget-setting-hbs').html() || '');
    var page;

    /**
     * initializes the component toolbar
     */
    var initComponentToolbar = function () {
        $('#wrapper').on('click', 'a.ues-component-full-handle', function () {
            
            var uesComponent = $(this).closest('.ues-component'), 
                component = findComponent(uesComponent.attr('id')), 
                componentContainer = $(this).closest('.ues-component-box'), 
                htmlBody = $('body');
            
            if (component.fullViewPoped) {
                
                // render normal view
                
                renderMaxView(component, DEFAULT_DASHBOARD_VIEW);
                
                componentContainer
                    .removeClass('ues-dashboard-fullview-visible')
                    .css('height', componentContainer.attr('data-height'))  // restore original height
                    .removeAttr('data-height');                             // remove temp attribute
                
                componentContainer.find('.panel-body, .panel-body iframe').css('height', '');
                htmlBody.css('overflow-y', '');
                
                //minimize logic
                component.fullViewPoped = false;
            } else {
                
                // render max view
                
                renderMaxView(component, DASHBOARD_FULL_SCEEN_VIEW);

                var height = $(window).height();
                
                componentContainer
                    .attr('data-height', componentContainer.css('height')) // backup original height
                    .addClass('ues-dashboard-fullview-visible')
                    .css('height', height + 'px');
                
                componentContainer.find('.panel-body, .panel-body iframe').css('height', (height - 40) + 'px');
                htmlBody.css('overflow-y', 'hidden');
                
                //maximize logic
                component.fullViewPoped = true;
                
                renderComponentMaxView(uesComponent);
            }
        });

        $('#wrapper').on('click', 'a.ues-component-settings-handle', function () {
            var id = $(this).closest('.ues-component').attr('id');
            var component = findComponent(id);
            componentContainer = $('#'+containerPrefix + id);

            if(component.hasCustomUserPrefView){
                if(component.viewOption == DASHBOARD_SETTINGS_VIEW){
                    switchComponentView(component, DEFAULT_DASHBOARD_VIEW);
                }else{
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
            componentContainer.append(settings);
            componentContainer.addClass('ues-userprep-visible');
        });
    };

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
        if(component.hasCustomFullView){
            component.viewOption = view;
            ues.components.update(component, function (err, block) {
                if (err) {
                    throw err;
                }
            });
        }
    };

    /**
     * Render maximized view for a gadget
     * @param component jQuery resresentative id
     */
    var renderComponentMaxView = function (jQueryId) {
        jQueryId.css('width','100%');
        jQueryId.css('position','inherit');
        jQueryId.css('left','inherit');
    };

    /**
     * renders the component toolbar of a given component
     * @param component
     */
    var renderComponentToolbar = function (component) {        
        var el = $('#' + component.id).prepend($(componentToolbarHbs(component.content)));
        // hide the settings button from the anon view
        if (ues.global.dbType === 'anon') {
            $('a.ues-component-settings-handle', el).hide();
        }
        $('[data-toggle="tooltip"]', el).tooltip();
    };
    
    /**
     * find a given component in the current page
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