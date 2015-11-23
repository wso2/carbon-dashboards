$(function () {
    //TODO: cleanup this

    var COMPONENTS_PAGE_SIZE = 20;

    var dashboardsApi = ues.utils.tenantPrefix() + 'apis/dashboards';

    var dashboardsUrl = ues.utils.tenantPrefix() + 'dashboards';

    var resolveURI = ues.dashboards.resolveURI;

    var findPage = ues.dashboards.findPage;

    var DEFAULT_DASHBOARD_VIEW = 'default';
    var ANONYMOUS_DASHBOARD_VIEW = 'anon';

    var lang = navigator.languages ? navigator.languages[0] : (navigator.language || navigator.userLanguage || navigator.browserLanguage);

    var dashboard;

    var page;

    var pageType;

    var activeComponent;

    var pageSelect = DEFAULT_DASHBOARD_VIEW; //this is to store switch between default/anon view

    var freshDashboard = true;

    var storeCache = {
        gadget: [],
        widget: [],
        layout: []
    };
    
    var gridster;

    $(document).ready(function () {
        $(".nav li.disabled a").click(function () {
            return false;
        });
    });

    var clone = function (o) {
        return JSON.parse(JSON.stringify(o));
    };

    /**
     * Precompiling Handlebar templates
     */
    var layoutsListHbs = Handlebars.compile($("#ues-layouts-list-hbs").html() || '');

    var layoutHbs = Handlebars.compile($("#ues-layout-hbs").html() || '');

    var componentsListHbs = Handlebars.compile($("#ues-components-list-hbs").html() || '');

    var noComponentsHbs = Handlebars.compile($("#ues-no-components-hbs").html() || '');

    var componentToolbarHbs = Handlebars.compile($("#ues-component-toolbar-hbs").html() || '');

    var pageOptionsHbs = Handlebars.compile($("#ues-page-properties-hbs").html() || '');

    var componentPropertiesHbs = Handlebars.compile($("#ues-component-properties-hbs").html() || '');

    var pagesListHbs = Handlebars.compile($("#ues-pages-list-hbs").html() || '');

    var bannerHbs = Handlebars.compile($('#ues-dashboard-banner-hbs').html() || '');
    
    var componentBoxListHbs = Handlebars.compile($("#ues-component-box-list-hbs").html() || '');

    /**
     * generates a random id
     * @returns {string}
     * @private
     */
    var randomId = function () {
        return Math.random().toString(36).slice(2);
    };

    /**
     * switches workspaces in the designer
     * @param name
     * @private
     */
    var showWorkspace = function (name) {
        $('.ues-workspace').hide();
        $('#ues-workspace-' + name).show();

        if (name === 'designer') {
            initBanner();
        }
    };

    /**
     * show the store of a given type
     * @param type
     * @private
     */
    var showStore = function (type) {
        var store = $('#ues-store').removeClass('ues-hidden');
        store.find('.ues-store-assets').addClass('ues-hidden');
        store.find('#ues-store-' + type).removeClass('ues-hidden');

        var designer = $('#ues-designer');
        if (designer.hasClass('ues-storeprop-visible') || designer.hasClass('ues-store-visible')) {
            return;
        }
        if (designer.hasClass('ues-properties-visible')) {
            designer.removeClass('ues-properties-visible').addClass('ues-storeprop-visible');
            return;
        }
        designer.addClass('ues-store-visible');
    };

    /**
     * hide the store
     * @private
     */
    var hideStore = function () {
        $('#ues-store').addClass('ues-hidden');

        var designer = $('#ues-designer');
        if (designer.hasClass('ues-storeprop-visible')) {
            designer.removeClass('ues-storeprop-visible').addClass('ues-properties-visible');
            return;
        }
        designer.removeClass('ues-store-visible');

    };

    /**
     * check whether store is visible
     * @returns {boolean}
     * @private
     */
    var storeVisible = function () {
        return !$('#ues-store').hasClass('ues-hidden');
    };

    /**
     * shows properties panel
     * @private
     */
    var showProperties = function () {
        $('#ues-properties').removeClass('ues-hidden');
        var designer = $('#ues-designer');
        if (designer.hasClass('ues-storeprop-visible') || designer.hasClass('ues-properties-visible')) {
            return;
        }
        if (designer.hasClass('ues-store-visible')) {
            designer.removeClass('ues-store-visible').addClass('ues-storeprop-visible');
            return;
        }
        designer.addClass('ues-properties-visible');
    };

    /**
     * hides properties panel
     * @private
     */
    var hideProperties = function () {
        $('#ues-properties').addClass('ues-hidden');

        var menu = $('.ues-context-menu');
        menu.find('.ues-component-properties-toggle').parent().removeClass('active');
        menu.find('.ues-page-properties-toggle').parent().removeClass('active');

        var designer = $('#ues-designer');
        if (designer.hasClass('ues-storeprop-visible')) {
            designer.removeClass('ues-storeprop-visible').addClass('ues-store-visible');
            return;
        }
        designer.removeClass('ues-properties-visible');
    };

    /**
     * removes properties panel
     * @private
     */
    var removeProperties = function () {
        $('#ues-properties').empty();
    };

    /**
     * checks whether properties panel is visible
     * @returns {boolean}
     * @private
     */
    var propertiesVisible = function () {
        return !$('#ues-properties').hasClass('ues-hidden');
    };

    /**
     * update component properties panel and save
     * @param sandbox
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
     * renders the component properties panel
     * @param component
     * @private
     */
    var renderComponentProperties = function (component) {
        activeComponent = component;
        var ctx = buildPropertiesContext(component, page);
        var el = $('#ues-properties').find('.ues-content').html(componentPropertiesHbs(ctx))
            .find('.ues-sandbox').on('change', 'input, select, textarea', function () {
                updateComponentProperties($(this).closest('.ues-sandbox'));
            });

        $(".form-control.ues-localized-title").on("keypress", function (e) {
            return sanitizeOnKeyPress(this, e, /[^a-z0-9-\s]/gim);
        }).on('change', function (e) {
            if ($.trim($(this).val()) == '') {
                $(this).val('');
            }
        });

        $(".form-control.ues-localized-height").on("keypress", function (e) {
            return sanitizeOnKeyPress(this, e, /[^0-9]/gim);
        });

        $('[data-toggle="tooltip"]', el).tooltip();
        var toggle = $('#ues-workspace-designer').find('.ues-context-menu')
            .find('.ues-context-menu-actions')
            .find('.ues-component-properties-toggle');
        var parent = toggle.parent();
        parent.siblings().removeClass('active');
        parent.addClass('active').show();
        showProperties();
    };

    /**
     * Render maximized view for a gadget
     * @param component
     * @param componentContainer
     * @private
     */
    var renderMaxView = function (component, view) {
        if (component.hasCustomFullView) {
            component.viewOption = view;
            ues.components.update(component, function (err, block) {
                if (err) {
                    throw err;
                }
            });
        }
    };

    /**
     * find an asset of the given type from the store cache
     * @param type
     * @param id
     * @returns {*}
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
     * find a given component in the current page
     * @param id
     * @returns {*}
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
     * save component properties
     * @param id
     * @param data
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
     * removes and destroys the given component from the page
     * @param component
     * @param done
     * @private
     */
    var removeComponent = function (component, done) {
        destroyComponent(component, function (err) {
            if (err) {
                return done(err);
            }
            var container = $('#' + component.id);
            var area = container.closest('.ues-component-box').attr('id');
            pageType = pageType ? pageType : DEFAULT_DASHBOARD_VIEW;
            var content = page.content[pageType];
            area = content[area];
            var index = area.indexOf(component);
            area.splice(index, 1);
            container.remove();

            var properties = $('#ues-properties').find('.ues-content');
            var compId = properties.find('.ues-sandbox').data('component');
            if (compId !== component.id) {
                return done();
            }
            properties.empty();
            hideProperties();
            done();
        });
    };

    /**
     * destroys the given component
     * @param component
     * @param done
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
     * destroys a given list of components of an area
     * @param components
     * @param done
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
     * destroys all areas in a given page
     * @param page
     * @param done
     * @private
     */
    var destroyPage = function (page, pageType, done) {
        var checked = $('#toggle-dashboard-view').prop('checked');
        var area;
        pageType = pageType ? pageType : DEFAULT_DASHBOARD_VIEW;

        if (!page.isanon && checked) {
            pageType = DEFAULT_DASHBOARD_VIEW;
        } else if (!page.isanon && !checked) {
            pageType = ANONYMOUS_DASHBOARD_VIEW;
        }

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
            $('#ues-designer').empty();
            if (!done) {
                return;
            }

            done(err);
        });
    };

    /**
     * remove and destroys a given page
     * @param pid
     * @param done
     * @private
     */
    var removePage = function (pid, type, done) {
        var p = findPage(dashboard, pid);
        var pages = dashboard.pages;
        var index = pages.indexOf(p);
        pages.splice(index, 1);
        saveDashboard();
        if (page.id !== pid) {
            return done(false);
        }
        destroyPage(p, type, done);
    };

    /**
     * pops up the preview dashboard page
     * @param page
     * @private
     */
    var previewDashboard = function (page) {
        var isAnonView = ues.global.type.toString().localeCompare(ANONYMOUS_DASHBOARD_VIEW) == 0 ? 'true' : 'false';
        var url = dashboardsUrl + '/' + dashboard.id + '/' + page.id + '?isAnonView=' + isAnonView;
        window.open(url, '_blank');
    };

    /**
     * pops up the export dashboard page
     * @private
     */
    var exportDashboard = function () {
        window.open(dashboardsApi + '/' + dashboard.id, '_blank');
    };

    /**
     * saves the dashboard content
     * @private
     */
    var saveDashboard = function () {
        var method,
            url,
            isRedirect = false;

        if (freshDashboard) {
            freshDashboard = false;
            method = 'POST';
            url = dashboardsApi;
            isRedirect = true;
        } else {
            method = 'PUT';
            url = dashboardsApi + '/' + dashboard.id;
        }
        $.ajax({
            url: url,
            method: method,
            data: JSON.stringify(dashboard),
            contentType: 'application/json'
        }).success(function (data) {
            console.log('dashboard saved successfully');
            if (isRedirect) {
                isRedirect = false;
                window.location = dashboardsUrl + '/' + dashboard.id + "?editor=true";
            }
        }).error(function () {
            console.log('error saving dashboard');
        });
    };
    
    var gridsterUlDimension = { };
    var designerScrollTop = 0;

    /**
     * initializes the component toolbar
     * @private
     */
    var initComponentToolbar = function () {
        var designer = $('#ues-designer');
        designer.on('click', 'a.ues-component-full-handle', function () {
            
            var id = $(this).closest('.ues-component').attr('id'),
                component = findComponent(id),
                componentContainer = $(this).closest('.ues-component-box'),
                componentContainerId = componentContainer.attr('id'),
                gridsterUl = $('.gridster > ul');
            
            if (component.fullViewPoped) {
                // rendering normal view
                
                gridster.enable().enable_resize();
                
                // restore the size of the gridster ul
                gridsterUl.width(gridsterUlDimension.width).height(gridsterUlDimension.height);
                
                $('.ues-component-box').show();
                
                //minimize logic
                componentContainer
                    .removeClass('ues-fullview-visible')
                    .css('height', '');
                
                // restore the scroll position
                designer.scrollTop(designerScrollTop);
                
                renderMaxView(component, DEFAULT_DASHBOARD_VIEW);
                
                component.fullViewPoped = false;
            } else {
                // rendering full view
                
                // backup the scroll position
                designerScrollTop = designer.scrollTop();
                
                gridster.disable().disable_resize();
                
                // backup the size of the gridster ul and reset element size
                gridsterUlDimension = { width: gridsterUl.width(), height: gridsterUl.height() };
                gridsterUl.width('auto').height('auto');
                
                $('.ues-component-box:not(#' + componentContainerId + ')').hide();
                
                //maximize logic
                componentContainer
                    .addClass('ues-fullview-visible')
                    .css('height', (designer.height() - 100) + 'px');
                
                renderMaxView(component, 'full');
                
                component.fullViewPoped = true;
            }
        });

        $('body').on('click', '.modal-footer button', function () {
            $('#componentFull').modal('hide');

        });
        designer.on('click', '.ues-component .ues-toolbar .ues-properties-handle', function () {
            var id = $(this).closest('.ues-component').attr('id');
            renderComponentProperties(findComponent(id));
        });
        designer.on('click', '.ues-component .ues-toolbar .ues-trash-handle', function () {
            var id = $(this).closest('.ues-component').attr('id');
            removeComponent(findComponent(id), function (err) {
                if (err) {
                    console.error(err);
                }
                saveDashboard();
            });
        });
        designer.on('click', '.ues-design-default-view', function () {
            //default
            pageType = DEFAULT_DASHBOARD_VIEW;
            ues.global.type = DEFAULT_DASHBOARD_VIEW;
            switchPage(getPageId(), pageType);
            $('.toggle-design-view-anon').removeClass('disabled');
            $('.toggle-design-view-default').addClass('disabled');
        });
        designer.on('#toggle-dashboard-view').change(function () {
            var checked = $('#toggle-dashboard-view').prop('checked');
            var state = 'on';

            if (checked) {
                pageType = DEFAULT_DASHBOARD_VIEW;
                ues.global.type = DEFAULT_DASHBOARD_VIEW;
                state = 'on';

                switchPage(getPageId(), ANONYMOUS_DASHBOARD_VIEW);

            } else {
                pageType = ANONYMOUS_DASHBOARD_VIEW;
                ues.global.type = ANONYMOUS_DASHBOARD_VIEW;
                ues.global.anon = true;
                state = 'off';

                switchPage(getPageId(), DEFAULT_DASHBOARD_VIEW);
            }

        });
        designer.on('click', '.ues-design-anon-view', function () {
            //anon
            pageType = ANONYMOUS_DASHBOARD_VIEW;
            ues.global.type = ANONYMOUS_DASHBOARD_VIEW;
            ues.global.anon = true;
            switchPage(getPageId(), pageType);
            $('.toggle-design-view-default').removeClass('disabled');
            $('.toggle-design-view-anon').addClass('disabled');
        });
        designer.on('mouseenter', '.ues-component .ues-toolbar .ues-move-handle', function () {
            $(this).draggable({
                cancel: false,
                appendTo: 'body',
                helper: 'clone',
                start: function (event, ui) {
                    //console.log('dragging');
                },
                stop: function () {
                    //$('#left a[href="#components"]').tab('show');
                }
            });
        }).on('mouseleave', '.ues-component .ues-toolbar .ues-move-handle', function () {
            $(this).draggable('destroy');
        });

    };

    /**
     * return page id from DOM
     * @private
     */
    var getPageId = function () {
        return $('.ues-page-id').text();
    };

    /**
     * initializes the ues properties
     * @private
     */
    var initUESProperties = function () {
        $('body').on('click', '.close-db-settings', function () {
            hideProperties();
        });
    };

    /**
     * initializes the toggle for dashboard view switching
     * @private
     */
    var initToggleView = function () {
        $(function () {
            $('#toggle-dashboard-view').bootstrapToggle();
        })
    };

    /**
     * renders the component toolbar of a given component
     * @param component
     * @private
     */
    var renderComponentToolbar = function (component) {
        var el = $('#' + component.id).prepend($(componentToolbarHbs(component)));
        $('[data-toggle="tooltip"]', el).tooltip();
    };

    /**
     * updates the styles of a given store asset
     * @param asset
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
     * creates a component in the given container
     * @param container
     * @param asset
     * @private
     */
    var createComponent = function (container, asset) {
        var id = randomId();
        //TODO: remove hardcoded gadget
        var area = container.attr('id');
        pageType = pageType ? pageType : DEFAULT_DASHBOARD_VIEW;
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
            renderComponentProperties(component);
            saveDashboard();
        });
    };

    /**
     * move given component into the given container
     * @param container
     * @param id
     * @private
     */
    var moveComponent = function (container, id) {
        var component = findComponent(id);
        var area = container.attr('id');
        pageType = pageType ? pageType : DEFAULT_DASHBOARD_VIEW;
        var content = page.content[pageType];
        content = content[area] || (content[area] = []);
        content.push(component);
        removeComponent(component, function (err) {
            if (err) {
                throw err;
            }
            ues.components.create(container, component, function (err, block) {
                if (err) {
                    throw err;
                }
                renderComponentToolbar(component);
                renderComponentProperties(component);
                saveDashboard();
            });
        });
    };

    /**
     * triggers update hook of a given component
     * @param id
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
     * builds up the component notifiers
     * @param notifiers
     * @param current
     * @param component
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
     * builds up the area notifiers
     * @param notifiers
     * @param component
     * @param components
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
     * builds up the page notifiers
     * @param component
     * @param page
     * @returns {{}}
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
     * find matching notifiers for a given component
     * @param component
     * @param page
     * @returns {Array}
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
        console.log(listeners);
        return listeners;
    };

    /**
     * find the wired notifier
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
     * wire an event
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
     * get all notifiers of a given event
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
     * wire events of a given component
     * @param component
     * @param notifiers
     * @returns {*}
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
     * build the hbs context for component properties panel
     * @param component
     * @param page
     * @returns {{id: (*|component.id), title: *, options: *, styles: (styles|*|buildPropertiesContext.styles), settings: *, listeners: *}}
     * @private
     */
    var buildPropertiesContext = function (component, page) {
        var notifiers = findNotifiers(component, page);
        var content = component.content;
        return {
            id: component.id,
            title: content.title,
            options: content.options,
            styles: content.styles,
            settings: content.settings,
            listeners: wireEvents(component, notifiers)
        };
    };

    /**
     * Check whether current landing page is anonymous or not.
     * @param landing
     * @return boolean
     * @private
     * */
    var checkForAnonLandingPage = function (landing) {
        var isLandingAnon = false;
        for (var availablePage in dashboard.pages) {
            if (dashboard.pages[availablePage].id == landing) {
                isLandingAnon = dashboard.pages[availablePage].isanon;
                break;
            }
        }

        return isLandingAnon;
    };

    /**
     * Check whether there are any anonymous pages.
     * @param pageId
     * @return boolean
     * @private
     * */
    var checkForAnonPages = function (pageId) {
        var isAnonPagesAvailable = false;
        for (var availablePage in dashboard.pages) {
            if (dashboard.pages[availablePage].id != pageId && dashboard.pages[availablePage].isanon) {
                isAnonPagesAvailable = dashboard.pages[availablePage].isanon;
                break;
            }
        }

        return isAnonPagesAvailable;
    };

    /**
     * Check whether there are any pages which has given id.
     * @param pageId
     * @return boolean
     * @private
     * */
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
     * @param pageTitle
     * @return boolean
     * @private
     * */
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
     * Generate message box according to the type.
     * @param1 type
     * @param2 text
     * @private
     * */
    var generateMessage = function (type, text) {
        return noty({
            text: text,
            type: type,
            closeWith: ['button', 'click'],
            layout: 'topCenter',
            theme: 'wso2',
            timeout: '3500',
            dismissQueue: true,
            killer: true,
            maxVisible: 1,
            animation: {
                open: {height: 'toggle'}, // jQuery animate function property object
                close: {height: 'toggle'}, // jQuery animate function property object
                easing: 'swing', // easing
                speed: 500 // opening & closing animation speed
            }
        });
    };

    /**
     * Show error style for given element
     * @param1 element
     * @param2 errorElement
     * @private
     * */
    var showInlineError = function (element, errorElement) {
        element.val('');
        element.parent().addClass("has-error");
        element.addClass("has-error");
        element.parent().find("span.glyphicon").removeClass("hide");
        element.parent().find("span.glyphicon").addClass("show");
        errorElement.removeClass("hide");
        errorElement.addClass("show");
    };

    /**
     * Hide error style for given element
     * @param1 element
     * @param2 errorElement
     * @private
     * */
    var hideInlineError = function (element, errorElement) {
        element.parent().removeClass("has-error");
        element.removeClass("has-error");
        element.parent().find("span.glyphicon").removeClass("show");
        element.parent().find("span.glyphicon").addClass("hide");
        errorElement.removeClass("show");
        errorElement.addClass("hide");
    };

    /**
     * update page options
     * @param e
     * @private
     */
    var updatePageProperties = function (e) {
        
        var titleError = $("#title-error"),
            idError = $("#id-error"),
            hasError = false,
            id = $('input[name=id]', e),
            title = $('input[name=title]', e),
            idVal = $.trim(id.val()),
            titleVal = $.trim(title.val());
        
        // validate inputs
        hideInlineError(id, idError);
        hideInlineError(title, titleError);
        
        if (!idVal) {
            showInlineError(id, idError);
            hasError = true;
        }
        
        if(!titleVal) {
            showInlineError(title, titleError);
            hasError = true;
        }
        
        if (hasError) {
            return;
        }
        
        var landing = $('input[name=landing]', e),
            toggleView = $('#toggle-dashboard-view'),
            anon = $('input[name=anon]', e),
            fluidLayout = $('input[name=fluidLayout]', e), 
            hasAnonPages = checkForAnonPages(idVal);
        
        var fn = { 
            id: function() {
                
                if (checkForPagesById(idVal) && page.id != idVal) {
                    generateMessage("error", "A page with entered URL already exists. Please select a different URL");
                    id.val(page.id);
                } else {
                    page.id = idVal;
                    if (landing.is(":checked")) {
                        dashboard.landing = idVal;
                    }
                }
                
            }, 
            title: function() {
                
                if (checkForPagesByTitle(titleVal) && page.title.toUpperCase() != titleVal.toUpperCase()){
                    generateMessage("error", "A page with entered title already exists. Please select a different title");
                    title.val(page.title);
                    titleVal = page.title;
                } else {
                    page.title = titleVal;
                }
               
                $('#ues-designer .ues-page-title .page-title').text(titleVal);
                $('#ues-properties .ues-page-title').find().text(titleVal);
                
            }, 
            landing: function() {
                
                if (landing.is(':checked')) {
                    if (hasAnonPages && !page.isanon) {
                        landing.prop("checked", false);
                        generateMessage("error", "Please add an anonymous view to this page before select it as the landing page");
                    } else {
                        dashboard.landing = idVal;
                    }
                }
                
            }, 
            anon: function() {
                
                if (anon.is(':checked')) {
                    if (checkForAnonLandingPage(dashboard.landing) || dashboard.landing == idVal) {
                        ues.global.dbType = ANONYMOUS_DASHBOARD_VIEW;
                        dashboard.isanon = true;
                        page.isanon = true;
                        // create the template if there is no content create before
                        page.layout.content.anon = page.layout.content.anon ||  page.layout.content.loggedIn;
                        $(".toggle-design-view").removeClass("hide");
                        toggleView.bootstrapToggle('off');
                    } else {
                        $(anon).prop("checked", false);
                        generateMessage("error", "Please add an anonymous view to the landing page in order to make this page anonymous");
                    }
                } else {
                    if (hasAnonPages && dashboard.landing == idVal) {
                        $(anon).prop("checked", true);
                        generateMessage("error", "There are existing pages which are anonymous. Remove their anonymous views to remove anonymous view for landing page");
                    } else {
                        // switch to anon dashboard
                        if (ues.global.dbType != ANONYMOUS_DASHBOARD_VIEW) {
                            dashboard.isanon = false;
                        }

                        page.isanon = false;
                        
                        // the anon layout should not be deleted since the gadgets in this layout is already there in the content

                        $(".toggle-design-view").addClass("hide");

                        toggleView.bootstrapToggle(toggleView.prop("checked") ? 'on' : 'off');

                        page.content.anon = { };
                    }
                }
                
            },
            fluidLayout: function() {
                page.layout.fluidLayout = fluidLayout.is(':checked');
            }
        };
        
        if (typeof fn[e.context.name] === 'function') {
            fn[e.context.name]();
            
            updatePagesList();
            saveDashboard();
            
        } else {
            console.error('function not implemented')
        }
    };

    /**
     * Sanitize the given event's key code.
     * @param1 event
     * @param1 regEx
     * @return boolean
     * @private
     * */
    var sanitizeOnKeyPress = function (element, event, regEx) {
        var code;
        if (event.keyCode) {
            code = event.keyCode;
        } else if (event.which) {
            code = event.which;
        }

        var character = String.fromCharCode(code);
        if (character.match(regEx)) {
            return false;
        } else {
            return !($.trim($(element).val()) == '' && character.match(/[\s]/gim));
        }
    };

    /**
     * renders page options
     * @param page
     * @private
     */
    var renderPageProperties = function (page) {
        $('#ues-properties').find('.ues-content').html(pageOptionsHbs({
            id: page.id,
            title: page.title,
            landing: (dashboard.landing == page.id),
            isanon: page.isanon,
            isUserCustom: dashboard.isUserCustom,
            fluidLayout: page.layout.fluidLayout || false
        })).find('.ues-sandbox').on('change', 'input', function () {
            updatePageProperties($(this).closest('.ues-sandbox'));
        });

        $(".form-control.title").on("keypress", function (e) {
            return sanitizeOnKeyPress(this, e, /[^a-z0-9-\s]/gim);
        });

        $(".form-control.id").on("keypress", function (e) {
            return sanitizeOnKeyPress(this, e, /[^a-z0-9-\s]/gim);
        }).on("keyup", function (e) {
            var sanitizedInput = $(this).val().replace(/[^\w]/g, '-').toLowerCase();
            $(this).val(sanitizedInput);
        });

        var toggle = $('#ues-workspace-designer').find('.ues-context-menu')
            .find('.ues-context-menu-actions')
            .find('.ues-page-properties-toggle');
        var parent = toggle.parent();
        parent.siblings().removeClass('active');
        parent.addClass('active');
        showProperties();
    };

    /**
     * saves page options of the component
     * @param sandbox
     * @param options
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
     * save settings of the component
     * @param sandbox
     * @param settings
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
        });
    };

    /**
     * save styles of the component
     * @param sandbox
     * @param styles
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
     * save notifiers of the component
     * @param sandbox
     * @param notifiers
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
     * holds the store paging history for infinite scroll
     * @type {{}}
     * @private
     */
    var pagingHistory = {};

    /**
     * loads given type of assets matching the query
     * @param type
     * @param query
     * @private
     */
    var loadAssets = function (type, query) {
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
                console.log(err);
                return;
            }
            var assets = $('#ues-store-' + type).find('.ues-thumbnails');
            var fresh = !paging.start;
            var assetz = storeCache[type];
            storeCache[type] = assetz.concat(data);
            paging.start += COMPONENTS_PAGE_SIZE;
            paging.end = !data.length;
            if (!fresh) {
                assets.append(componentsListHbs({
                    type: type,
                    assets: data,
                    lang: lang
                }));
                return;
            }
            if (data.length) {
                assets.html(componentsListHbs({
                    type: type,
                    assets: data,
                    lang: lang
                }));
                return;
            }
            assets.html(noComponentsHbs());
        });
    };

    /**
     * initializes the components
     * @private
     */
    var initComponents = function () {
        $('#ues-store').on('mouseenter', '.ues-thumbnail', function () {
            $(this).draggable({
                cancel: false,
                appendTo: 'body',
                helper: 'clone',
                start: function (event, ui) {
                    ui.helper.addClass('ues-store-thumbnail');
                },
                stop: function (event, ui) {
                    ui.helper.removeClass('ues-store-thumbnail');
                }
            });
        }).on('mouseleave', '.ues-thumbnail', function () {
            $(this).draggable('destroy');
        });
    };

    /**
     * initializes the designer
     * @private
     */
    var initDesigner = function () {
        $('#ues-store-menu-actions').find('.ues-store-toggle').click(function () {
            var thiz = $(this);
            var parent = thiz.parent();
            var type = thiz.data('type');
            parent.siblings().addBack().removeClass('active');

            var store = $('#ues-store');
            var assets = $('#ues-store-' + type);
            if (store.hasClass('ues-hidden') || assets.hasClass('ues-hidden')) {
                parent.addClass('active');
                showStore(type);
                return;
            }
            hideStore();
        });
    };

    /**
     * Load the layouts for workspace.
     * @private
     * */
    var loadLayouts = function () {
        ues.store.assets('layout', {
            start: 0,
            count: 20
        }, function (err, data) {
            storeCache.layout = data;
            var workspace = $('#ues-workspace-layout').find('.ues-content').html(layoutsListHbs(data));
        });
    };

    /**
     * Initialize the layout for the workspace
     * @private
     * */
    var initLayoutWorkspace = function () {
        $('#ues-workspace-layout').find('.ues-content').on('click', '.thumbnail .ues-add', function () {
            createPage(pageOptions(), $(this).data('id'), function (err) {
                showWorkspace('designer');
            });
        });
        loadLayouts();
    };

    /**
     * initializes the store
     * @private
     */
    var initStore = function () {
        loadAssets('gadget');
        loadAssets('widget');
        $('#ues-store').find('.ues-store-assets').scroll(function () {
            var thiz = $(this);
            var type = thiz.data('type');
            var child = $('.ues-content', thiz);
            if (thiz.scrollTop() + thiz.height() < child.height() - 100) {
                return;
            }
            var query = $('.ues-search-box input', thiz).val();
            loadAssets(type, query);
        }).find('.ues-search-box input').on('keypress', function (e) {
            if (e.which !== 13) {
                return;
            }
            e.preventDefault();
            var thiz = $(this);
            var query = thiz.val();
            var type = thiz.closest('.ues-store-assets').data('type');
            loadAssets(type, query);
        })
    };

    var toggleProperties = function () {

    };

    var initDesignerMenu = function () {

        $("#ues-workspace-designer").show();

        var menu = $('#ues-workspace-designer').find('.ues-context-menu');

        menu.find('.ues-page-add').on('click', function () {
            layoutWorkspace();
        });
        menu.find('.ues-dashboard-preview').on('click', function () {
            previewDashboard(page);
        });
        menu.find('.ues-dashboard-export').on('click', function () {
            exportDashboard();
        });

        menu.find('.ues-tiles-menu-toggle').click(function () {
            menu.find('.ues-tiles-menu').slideToggle();
        });

        var actions = menu.find('.ues-context-menu-actions');

        actions.find('.ues-component-properties-toggle').click(function () {
            var thiz = $(this);
            var parent = thiz.parent();
            if (parent.hasClass('active')) {
                //parent.removeClass('active');
                hideProperties();
                return;
            }
            renderComponentProperties(activeComponent);
        });

        actions.find('.ues-page-properties-toggle').click(function () {
            var thiz = $(this);
            var parent = thiz.parent();
            if (parent.hasClass('active')) {
                //parent.removeClass('active');
                hideProperties();
                return;
            }
            renderPageProperties(page);
        });

        actions.find('.ues-pages-list').on('click', 'li a', function () {
            var thiz = $(this);
            var pid = thiz.data('id');

            ues.global.isSwitchToNewPage = true;
            switchPage(pid, pageType);
            ues.global.isSwitchToNewPage = false;

            initBanner();
        });

        actions.find('.ues-pages-list').on('click', 'li a .ues-trash', function (e) {
            e.stopPropagation();
            var thiz = $(this);
            var pid = thiz.parent().data('id');
            removePage(pid, DEFAULT_DASHBOARD_VIEW, function (err) {
                var pages = dashboard.pages;
                updatePagesList(pages);
                if (!pages.length) {
                    dashboard.landing = null;
                    hideProperties();
                    initFirstPage();
                    return;
                }
                var first = pages[0];
                if (pid === dashboard.landing) {
                    dashboard.landing = first.id;
                }
                if (pid !== page.id) {
                    return;
                }
                hideProperties();
                renderPage(first.id);
            });
        });
    };

    var initLayoutMenu = function () {
        var menu = $('#ues-workspace-layout').find('.ues-context-menu');
        menu.find('.ues-go-back').on('click', function () {
            showWorkspace('designer');
        });
        menu.find('.ues-tiles-menu-toggle').click(function () {
            menu.find('.ues-tiles-menu').slideToggle();
        });
    };

    var initContextMenus = function () {
        initDesignerMenu();
        initLayoutMenu();
    };

    /**
     * Register the "set_pref" rpc function. When user set the user preferences using
     * pref.set() method this will be executed.
     * @private
     */
    var registerRpc = function () {
        gadgets.rpc.register('set_pref', function (token, name, value) {

            //Store the gadget id in a variable
            var id = this.f.split("-")[2];

            var pages = dashboard.pages;
            var numberOfPages = pages.length;
            for (var i = 0; i < numberOfPages; i++) {
                var pageContent = pages[i].content.default;
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

            saveDashboard();
        });
    };

    /**
     * initialized adding block function
     */
    var initAddBlock = function() {

        // add block handler
        $('#ues-add-block-btn').on('click', function() {

            var width = parseInt($('#dummy-size').attr('data-w')) || 0, 
                height = parseInt($('#dummy-size').attr('data-h')) || 0;

            if (width == 0 || height == 0) {
                return;
            }

            gridster.add_widget(componentBoxListHbs({ blocks: [{ id: guid() }] }), width, height, 1, 1);
            updateLayout();

            $('#ues-add-block-menu-item').removeClass('open');
            
            listenLayout();
        });

        var dummyGadgetWidth = 30;

        $('#dummy-gadget').resizable({
            grid : dummyGadgetWidth,
            containment : "#dummy-gadget-container",
            resize : function(event, ui) {

                var h = Math.round($(this).height() / dummyGadgetWidth), 
                    w = Math.round($(this).width() / dummyGadgetWidth), 
                    display = w + "x" + h;

                $(this).find('#dummy-size').html(display).attr({
                    'data-w' : w,
                    'data-h' : h
                });
            }
        });
    }

    /**
     * initializes the UI
     * @private
     */
    var initUI = function () {
        registerRpc();
        initContextMenus();
        initLayoutWorkspace();
        initDesigner();
        initStore();
        initComponentToolbar();
        initComponents();
        initUESProperties();
        initToggleView();
        initAddBlock();
    };

    /**
     * initializes the layout listeners
     * @private
     */
    var listenLayout = function () {
        $('#ues-designer').find('.ues-component-box:not([data-banner=true])').droppable({
            //activeClass: 'ui-state-default',
            hoverClass: 'ui-state-hover',
            //accept: ':not(.ui-sortable-helper)',
            drop: function (event, ui) {
                //$(this).find('.placeholder').remove();
                var id = ui.helper.data('id');
                var action = ui.helper.data('action');
                var type = ui.helper.data('type');
                var el = $(this);
                switch (action) {
                    case 'move':
                        if (!hasComponents($(this))) {
                            moveComponent(el, id);
                        }
                        break;
                    default:
                        if (!hasComponents($(this))) {
                            createComponent(el, findStoreCache(type, id));
                        }
                }
            }
        });
    };

    var hasComponents = function (container) {
        var components = container.find('.ues-component').length;
        if (components > 0) {
            return true;
        }
        return false;
    };

    /**
     * get the container for layouts
     * @returns {*|jQuery}
     * @private
     */
    var layoutContainer = function () {
        return $('#ues-designer').html(layoutHbs({
            pages: dashboard.pages,
            current: page,
            isanon: (page.isanon && !dashboard.isUserCustom)
        })).find('.default-ues-layout');
    };

    var updatePagesList = function () {
        $('#ues-workspace-designer').find('.ues-context-menu .ues-pages-list').html(pagesListHbs({
            current: page,
            pages: dashboard.pages
        }));
    };

    /**
     * creates a page with the given options
     * @param options
     * @param lid
     * @param done
     * @private
     */
    var createPage = function (options, lid, done) {
        var layout = findStoreCache('layout', lid);        
        $.get(resolveURI(layout.url), function (data) {
            
            var id = options.id;
            var page = {
                id: id,
                title: options.title,
                layout: { 
                    content: {
                        loggedIn: JSON.parse(data),
                    },
                    fluidLayout: false
                },
                isanon: false,
                content: {
                    default: {},
                    anon: {}
                }
            };
            
            dashboard.landing = dashboard.landing || id;
            dashboard.isanon = false;
            dashboard.pages.push(page);
            saveDashboard();
            hideProperties();

            if (ues.global.page) {
                currentPage(findPage(dashboard, ues.global.page.id));
                switchPage(id, pageType);
                done();
            } else {
                renderPage(id, done);
            }

        }, 'html');
    };

    /**
     * returns the current page
     * @param p
     * @returns {*}
     * @private
     */
    var currentPage = function (p) {
        return page = (ues.global.page = p);
    };

    /**
     * switches the given page
     * @param pid
     * @private
     */
    var switchPage = function (pid, pageType) {
        if (!page) {
            return renderPage(pid);
        }
        destroyPage(page, pageType, function (err) {
            if (err) {
                throw err;
            }
            renderPage(pid);
        });
    };

    /**
     * update the layout after modification
     */
    var updateLayout = function() { 
        
        // extract the layout from the designer (gridster) and save it
        var json = { blocks: gridster.serialize() }, 
            id, i;
        
        // find the current page index
        for(i = 0; i < ues.global.dashboard.pages.length; i++) {
            if (ues.global.dashboard.pages[i].id === page.id) {
                id = i;
            }
        }
        
        if (typeof id === 'undefined') {
        	throw 'specified page : ' + page.id + ' cannot be found';
        }
        
        if (pageType === ANONYMOUS_DASHBOARD_VIEW) {
            ues.global.dashboard.pages[id].layout.content.anon = json;
        } else {
            ues.global.dashboard.pages[id].layout.content.loggedIn = json;
        }
    
        saveDashboard();
    }

    /**
     * generate GUID
     * @returns {*}
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
     * renders the given page
     * @param pid
     * @param done
     * @private
     */
    var renderPage = function (pid, done) {
        currentPage(findPage(dashboard, pid));
        if (!page) {
            throw 'specified page : ' + pid + ' cannot be found';
        }
        if (propertiesVisible()) {
            renderPageProperties(page);
        }

        pageType = pageType ? pageType : DEFAULT_DASHBOARD_VIEW;
        if (ues.global.isSwitchToNewPage || !page.isanon) {
            pageType = DEFAULT_DASHBOARD_VIEW;
            ues.global.type = DEFAULT_DASHBOARD_VIEW;
        } else if (!($("#toggle-dashboard-view").prop("checked")) && $("#toggle-dashboard-view").length > 0) {
            pageType = ANONYMOUS_DASHBOARD_VIEW;
            ues.global.type = ANONYMOUS_DASHBOARD_VIEW;
        }

        // TODO: Disable the properties if no gadgets available in the view.
        $('.ues-context-menu .ues-component-properties-toggle').parent().hide();

        var default_container = layoutContainer();
        ues.dashboards.render(default_container, dashboard, pid, pageType, function (err) {
            $('#ues-designer').find('.ues-component').each(function () {
                var id = $(this).attr('id');
                renderComponentToolbar(findComponent(id));
            });
            listenLayout();
            
            var gridsterContainer = $('.gridster > ul'), 
                minBlockWidth = Math.ceil($('.gridster').width() / 12) - 10,
                minBlockHeight = minBlockWidth + 30;
            
            // bind the gridster
            gridster = gridsterContainer.gridster({
                widget_margins: [5, 5],
                widget_base_dimensions: [minBlockWidth, minBlockHeight],
                min_cols: 12,
                serialize_params: function (el, coords) {
                    return {
                        id: el.prop('id'),
                        col: coords.col,
                        row: coords.row,
                        size_x: coords.size_x,
                        size_y: coords.size_y,
                        banner: el.attr('data-banner') == 'true'
                    };
                },
                draggable: {
                    handle: '.ues-component-box-header',
                    stop: function() {
                        updateLayout();
                    }
                },
                resize: {
                    enabled: true,
                    max_size: [12, 12],
                    stop: function() {
                        updateLayout();
                    }
                }
            }).data('gridster');
            
            // stop resizing banner placeholder
            $('.gridster [data-banner=true] .gs-resize-handle').remove();
            
            // remove block handler
            $('.gridster').on('click', '.ues-component-box-remove-handle', function() {
                var componentBox = $(this).closest('.ues-component-box');
                
                componentBox.find('.ues-component').each(function(i, component) {
                    var componentId = $(component).attr('id');
                    
                    removeComponent(findComponent(componentId), function (err) {
                        if (err) {
                            console.error(err);
                        }
                        saveDashboard();
                    });
                });
                
                gridster.remove_widget(componentBox, function() {
                    updateLayout(); 
                });
            });
            
            if (!done) {
                return;
            }
            done(err);
        }, true);
        
        // stop closing the add block dropdown on clicking
        $('#ues-add-block-menu').on('click', function(e) {
            e.stopPropagation();
        });
        
        updatePagesList();
        initToggleView();

        if (pageType != DEFAULT_DASHBOARD_VIEW) {
            $("#toggle-dashboard-view").parent().addClass("off");
            $(".toggle-group").find(".active").removeClass("active");
            $(".toggle-group").find(".toggle-off").addClass("active");
            $("#toggle-dashboard-view").prop("checked", false);
        }
    };

    /**
     * build up the page options for the given type of page
     * @param type
     * @returns {{id: string, title: string}}
     * @private
     */
    var pageOptions = function (type) {
        var pages = dashboard.pages;
        if (type === 'landing' || !pages.length) {
            return {
                id: 'landing',
                title: 'Welcome'
            };
        }
        if (type === 'login') {
            return {
                id: 'login',
                title: 'Login'
            };
        }
        var i;
        var pid = 0;
        var prefix = 'page';
        var titlePrefix = 'Page ';
        var page = prefix + pid;
        var length = pages.length;
        for (i = 0; i < length; i++) {
            if (pages[i].id === page) {
                pid++;
                page = prefix + pid;
            }
        }
        return {
            id: page,
            title: titlePrefix + pid
        };
    };

    var layoutWorkspace = function () {
        var firstPage = !dashboard.pages.length;
        var back = $('#ues-workspace-layout').find('.ues-context-menu-actions .ues-go-back');
        firstPage ? back.hide() : back.show();
        showWorkspace('layout');
    };

    /**
     * initializes the given type of page
     * @private
     */
    var initFirstPage = function () {
        layoutWorkspace();
    };

    /**
     * initializes the dashboard
     * @param db
     * @param page
     * @param fresh
     * @private
     */
    var initDashboard = function (db, page, fresh) {
        freshDashboard = fresh;
        dashboard = (ues.global.dashboard = db);
        if (fresh) {
            initFirstPage();
            return;
        }
        var pages = dashboard.pages;
        if (!pages.length) {
            initFirstPage();
            return;
        }
        renderPage(page || db.landing || pages[0].id);
    };

    /**
     * load the content within the banner placeholder
     */
    var loadBanner = function () {

        ues.global.dashboard.banner = ues.global.dashboard.banner || {
                globalBannerExists: false,
                customBannerExists: false
            };

        var $placeholder = $('.ues-banner-placeholder'),
            customDashboard = ues.global.dashboard.isUserCustom || false,
            banner = ues.global.dashboard.banner;

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
        var img = $placeholder.find('#img-banner');
        if (bannerExists) {
            img.attr('src', img.data('src') + '?rand=' + Math.floor(Math.random() * 100000)).show();
        } else {
            img.hide();
        }
    }

    /**
     * initialize the banner
     */
    var initBanner = function () {

        loadBanner();

        // bind a handler to the change event of the file element
        document.getElementById('file-banner').addEventListener('change', function (e) {
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
            
            var $placeholder = $('.ues-banner-placeholder'),
                srcCanvas = document.getElementById('src-canvas'),
                $srcCanvas = $(srcCanvas),
                img = new Image(),
                width = $placeholder.width(),
                height = $placeholder.height();

            // remove previous cropper bindings to the canvas (this will remove all the created controls as well)
            $srcCanvas.cropper('destroy');

            // draw the selected image in the source canvas and initialize cropping
            var srcCtx = srcCanvas.getContext('2d'),
                objectUrl = URL.createObjectURL(file);

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
                        var cropData = $srcCanvas.cropper('getData'),
                            destCanvas = document.getElementById('dest-canvas'),
                            destCtx = destCanvas.getContext('2d');

                        destCanvas.width = width;
                        destCanvas.height = height;

                        destCtx.drawImage(img, cropData.x, cropData.y, cropData.width, cropData.height, 0, 0, destCanvas.width, destCanvas.height);

                        var dataUrl = destCanvas.toDataURL('image/jpeg');
                        $('#banner-data').val(dataUrl);
                    }
                });
            }
            img.src = objectUrl;
        }, false);

        // event handler for the banner edit button
        $('.ues-banner-placeholder').on('click', '#btn-edit-banner', function (e) {
            $('#file-banner').click();
        });

        // event handler for the banner save button
        $('.ues-banner-placeholder').on('click', '#btn-save-banner', function (e) {
            var $form = $('#ues-dashboard-upload-banner-form');
            var cropData = $form.find('#banner-data').val();

            $.ajax({
                url: $form.attr('action'),
                type: $form.attr('method'),
                data: {'data': cropData},
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
            $.ajax({
                url: $('#ues-dashboard-upload-banner-form').attr('action'),
                type: 'DELETE',
            }).success(function (d) {

                if (ues.global.dashboard.isUserCustom) {
                    ues.global.dashboard.banner.customBannerExists = false;
                } else {
                    ues.global.dashboard.banner.globalBannerExists = false;
                }
                ues.global.dashboard.banner.cropMode = false;
                loadBanner();
            });
        });
    }

    initUI();
    initDashboard(ues.global.dashboard, ues.global.page, ues.global.fresh);
    initBanner();

    ues.dashboards.save = saveDashboard;
});
