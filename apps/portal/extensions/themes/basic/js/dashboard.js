$(function(){
    var componentToolbarHbs = Handlebars.compile($("#ues-component-toolbar-hbs").html());
    var componentMaxViewHbs = Handlebars.compile($("#ues-component-full-hbs").html());
    var gadgetSettingsViewHbs = Handlebars.compile($('#ues-gadget-setting-hbs').html());
    var page;

    /**
     * initializes the component toolbar
     */
    var initComponentToolbar = function () {
        $('#wrapper').on('click', 'a.ues-component-full-handle', function () {
            var id = $(this).closest('.ues-component').attr('id');
            var component = findComponent(id);
            var fullViewPopped = $('.modal-body > .ues-component');
            var componentContainer;
            if(component.fullViewPoped){
                $('#componentFull').modal('show');
                fullViewPopped.hide();
                $('#' + id + '_full').show();
            } else {
                if(fullViewPopped.length > 0){
                    fullViewPopped.hide();
                    $('#' + id + '_full').show();
                    $('#componentFull').modal('show');
                    componentContainer = $('.modal-body');
                }else{
                    var fullView = $('body').append(componentMaxViewHbs({}));
                    fullView.find('#componentFull').modal('show');
                    componentContainer = fullView.find('.modal-body');
                }
                component.viewOption = 'full';
                renderMaxView(component, componentContainer);
                component.fullViewPoped = true;
            }
        });

        $('#wrapper').on('click', 'a.ues-component-settings-handle', function () {
            var id = $(this).closest('.ues-component').attr('id');
            var body = $(this).closest('.panel-body');
            var component = findComponent(id);
            var optionsLength = Object.keys(component.content.options).length;
            console.log("onclick componenet");
            console.log(component);
            if (optionsLength > 0) {
                componentContainer = $('#gadget-' + id + '_full');
                var settings = gadgetSettingsViewHbs(component.content);
                //body.append(settings);
                componentContainer.append(settings);
                renderComponentProperties(component);

//            ues.components.destroy(component, function (err, block) {
//                if (err) {
//                    throw err;
//                }
//            });
//            ues.components.update(component, function (err, block) {
//                if (err) {
//                    throw err;
//                }
//            });
            }
        });

//        $('#wrapper').on('click', 'ues-component-properties-toggle', function () {
//            console.log("--------------------------------999990000000000");
//            var thiz = $(this);
//            var parent = thiz.parent();
//            if (parent.hasClass('active')) {
//                //parent.removeClass('active');
//                hideProperties();
//                return;
//            }
//            renderComponentProperties(activeComponent);
//        });
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
    var renderMaxView = function (component, componentContainer) {
        ues.components.create(componentContainer, component, function (err, block) {
            if (err) {
                throw err;
            }
        });
    };
    /**
     * renders the component toolbar of a given component
     * @param component
     */
    var renderComponentToolbar = function (component) {
        var el = $('#' + component.id).prepend($(componentToolbarHbs(component)));
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

        var content = page.content;
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
    var dashboardDone = function(){
        $('.ues-component-box div.ues-component').each(function(){
            var component = findComponent($(this).attr('id'));
            renderComponentToolbar(component);
        });
    };
    /**
     * This is the initial call from the dashboard.js
     */
    var initDashboard = function(){
        var allPages = ues.global.dashboard.pages;
        if(allPages.length>0){
            page = (ues.global.page?ues.global.page:allPages[0]);
        }
        for(var i = 0; i< allPages.length; i++){
            if(ues.global.page == allPages[i].id){
                page = allPages[i];
            }
        }
        $('body').on('click','.modal-footer button',function(){
            $('#componentFull').modal('hide');

        });
        ues.dashboards.render($('#wrapper'), ues.global.dashboard, ues.global.page,dashboardDone);

    };
    initDashboard();
    initComponentToolbar();
});
/**
 * We make this true so that the dashboard.jag files inline ues.dashboards.render method is not triggered.
 * @type {boolean}
 */
ues.global.renderFromExtension = true;