$(function () {
    //TODO: cleanup this

    var COMPONENTS_PAGE_SIZE = 20;

    var dashboardsApi = ues.utils.tenantPrefix() + 'apis/dashboards';

    var dashboardsUrl = ues.utils.tenantPrefix() + 'dashboards';

    var resolveURI = ues.dashboards.resolveURI;

    var findPage = ues.dashboards.findPage;

    var dashboard;

    var page;

    var activeComponent;

    var freshDashboard = true;

    var storeCache = {
        gadget: [],
        widget: [],
        layout: []
    };

    var clone = function (o) {
        return JSON.parse(JSON.stringify(o));
    };

    /**
     * Handlebars helpers
     */
    Handlebars.registerHelper('has', function () {
        var has = function (o) {
            if (!o) {
                return false;
            }
            if (o instanceof Array && !o.length) {
                return false;
            }
            var key;
            for (key in o) {
                if (o.hasOwnProperty(key)) {
                    return true;
                }
            }
            return false;
        };
        var args = Array.prototype.slice.call(arguments);
        var options = args.pop();
        var length = args.length;
        if (!length) {
            return new Handlebars.SafeString(options.inverse(this));
        }
        var i;
        for (i = 0; i < length; i++) {
            if (has(args[i])) {
                return new Handlebars.SafeString(options.fn(this));
            }
        }
        return new Handlebars.SafeString(options.inverse(this));
    });

    Handlebars.registerHelper('equals', function (left, right, options) {
        if (left === right) {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    Handlebars.registerHelper('dump', function (o) {
        return JSON.stringify(o);
    });

    Handlebars.registerHelper('resolveURI', function (path) {
        return ues.dashboards.resolveURI(path);
    });

    /**
     * Precompiling Handlebar templates
     */
    var layoutsListHbs = Handlebars.compile($("#ues-layouts-list-hbs").html() || '');

    var layoutHbs = Handlebars.compile($("#ues-layout-hbs").html());

    var componentsListHbs = Handlebars.compile($("#ues-components-list-hbs").html());

    var noComponentsHbs = Handlebars.compile($("#ues-no-components-hbs").html());

    var componentToolbarHbs = Handlebars.compile($("#ues-component-toolbar-hbs").html());

    var pageOptionsHbs = Handlebars.compile($("#ues-page-properties-hbs").html());

    var componentPropertiesHbs = Handlebars.compile($("#ues-component-properties-hbs").html() || '');

    var pagesListHbs = Handlebars.compile($("#ues-pages-list-hbs").html());

    /**
     * generates a random id
     * @returns {string}
     */
    var randomId = function () {
        return Math.random().toString(36).slice(2);
    };

    /**
     * switches workspaces in the designer
     * @param name
     */
    var showWorkspace = function (name) {
        $('.ues-workspace').hide();
        $('#ues-workspace-' + name).show();
    };

    /**
     * show the store of a given type
     * @param type
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
     */
    var storeVisible = function () {
        return !$('#ues-store').hasClass('ues-hidden');
    };

    /**
     * shows properties panel
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
     */
    var removeProperties = function () {
        $('#ues-properties').empty();
    };

    /**
     * checks whether properties panel is visible
     * @returns {boolean}
     */
    var propertiesVisible = function () {
        return !$('#ues-properties').hasClass('ues-hidden');
    };

    /**
     * update component properties panel and save
     * @param sandbox
     */
    var updateComponentProperties = function (sandbox) {
        var notifiers = {};
        var options = {};
        var settings = {};
        var styles = {};
        var id = sandbox.data('component');

        saveOptions(sandbox, options);
        saveSettings(sandbox, settings);
        saveStyles(sandbox, styles);
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
     */
    var renderComponentProperties = function (component) {
        activeComponent = component;
        var ctx = buildPropertiesContext(component, page);
        var el = $('#ues-properties').find('.ues-content').html(componentPropertiesHbs(ctx))
            .find('.ues-sandbox').on('change', 'input, select, textarea', function () {
                updateComponentProperties($(this).closest('.ues-sandbox'));
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
     * find an asset of the given type from the store cache
     * @param type
     * @param id
     * @returns {*}
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
     * save component properties
     * @param id
     * @param data
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

        ues.dashboards.rewire(page);
        updateComponent(id);
        saveDashboard();
    };

    /**
     * removes and destroys the given component from the page
     * @param component
     * @param done
     */
    var removeComponent = function (component, done) {
        destroyComponent(component, function (err) {
            if (err) {
                return done(err);
            }
            var container = $('#' + component.id);
            var area = container.closest('.ues-component-box').attr('id');
            var content = page.content;
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
     */
    var destroyPage = function (page, done) {
        var area;
        var content = page.content;
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
     */
    var removePage = function (pid, done) {
        var p = findPage(dashboard, pid);
        var pages = dashboard.pages;
        var index = pages.indexOf(p);
        pages.splice(index, 1);
        saveDashboard();
        if (page.id !== pid) {
            return done(false);
        }
        destroyPage(p, done);
    };

    /**
     * pops up the preview dashboard page
     * @param page
     */
    var previewDashboard = function (page) {
        window.open(dashboardsUrl + '/' + dashboard.id + '/' + page.id, '_blank');
    };

    /**
     * pops up the export dashboard page
     */
    var exportDashboard = function () {
        window.open(dashboardsApi + '/' + dashboard.id, '_blank');
    };

    /**
     * saves the dashboard content
     */
    var saveDashboard = function () {
        var method;
        var url;
        if (freshDashboard) {
            freshDashboard = false;
            method = 'POST';
            url = dashboardsApi;
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
        }).error(function () {
            console.log('error saving dashboard');
        });
    };

    /**
     * initializes the component toolbar
     */
    var initComponentToolbar = function () {
        var designer = $('#ues-designer');
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
        designer.on('mouseenter', '.ues-component .ues-toolbar .ues-move-handle', function () {
            $(this).draggable({
                cancel: false,
                appendTo: 'body',
                helper: 'clone',
                start: function (event, ui) {
                    console.log('dragging');
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
     * renders the component toolbar of a given component
     * @param component
     */
    var renderComponentToolbar = function (component) {
        var el = $('#' + component.id).prepend($(componentToolbarHbs(component)));
        $('[data-toggle="tooltip"]', el).tooltip();
    };

    /**
     * updates the styles of a given store asset
     * @param asset
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
     */
    var createComponent = function (container, asset) {
        var id = randomId();
        //TODO: remove hardcoded gadget
        var area = container.attr('id');
        var content = page.content;
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
     */
    var moveComponent = function (container, id) {
        var component = findComponent(id);
        var area = container.attr('id');
        var content = page.content;
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
     */
    var pageNotifiers = function (component, page) {
        var area;
        var notifiers = {};
        var content = page.content;
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
     * update page options
     * @param sandbox
     */
    var updatePageProperties = function (sandbox) {
        var id = $('.id', sandbox).val();
        var title = $('.title', sandbox).val();
        var landing = $('.landing', sandbox);
        page.id = id;
        page.title = title;
        if (landing.is(':checked')) {
            dashboard.landing = id;
        }
        $('#ues-designer').find('.ues-page-title').text(title);
        $('#ues-properties').find('.ues-page-title').text(title);
        updatePagesList();
        saveDashboard();
    };

    /**
     * renders page options
     * @param page
     */
    var renderPageProperties = function (page) {
        $('#ues-properties').find('.ues-content').html(pageOptionsHbs({
            id: page.id,
            title: page.title
        })).find('.ues-sandbox').on('change', 'input', function () {
            updatePageProperties($(this).closest('.ues-sandbox'));
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
     */
    var saveOptions = function (sandbox, options) {
        $('.ues-options input', sandbox).each(function () {
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
     */
    var saveStyles = function (sandbox, styles) {
        $('.ues-styles input', sandbox).each(function () {
            var el = $(this);
            var type = el.attr('type');
            var name = el.attr('name');
            if (type === 'text') {
                styles[name] = el.val();
                return;
            }
            if (type === 'checkbox') {
                styles[name] = el.is(':checked');
            }
        });

        styles.titlePosition = $('.ues-styles .ues-title-position', sandbox).val();
    };

    /**
     * save notifiers of the component
     * @param sandbox
     * @param notifiers
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
     */
    var pagingHistory = {};

    /**
     * loads given type of assets matching the query
     * @param type
     * @param query
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
                    assets: data
                }));
                return;
            }
            if (data.length) {
                assets.html(componentsListHbs({
                    type: type,
                    assets: data
                }));
                return;
            }
            assets.html(noComponentsHbs());
        });
    };

    /**
     * initializes the components
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

    var loadLayouts = function () {
        ues.store.assets('layout', {
            start: 0,
            count: 20
        }, function (err, data) {
            storeCache.layout = data;
            var workspace = $('#ues-workspace-layout').find('.ues-content').html(layoutsListHbs(data));
        });
    };

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
            switchPage(pid);
        });

        actions.find('.ues-pages-list').on('click', 'li a .ues-trash', function (e) {
            e.stopPropagation();
            var thiz = $(this);
            var pid = thiz.parent().data('id');
            removePage(pid, function (err) {
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
     * initializes the UI
     */
    var initUI = function () {
        initContextMenus();
        initLayoutWorkspace();
        initDesigner();
        initStore();
        initComponentToolbar();
        initComponents();
    };

    /**
     * initializes the layout listeners
     */
    var listenLayout = function () {
        $('#ues-designer').find('.ues-component-box').droppable({
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
                        moveComponent(el, id);
                        break;
                    default:
                        createComponent(el, findStoreCache(type, id));
                }
            }
        });
    };

    /**
     * get the container for layouts
     * @returns {*|jQuery}
     */
    var layoutContainer = function () {
        return $('#ues-designer').html(layoutHbs({
            pages: dashboard.pages,
            current: page
        })).find('.ues-layout');
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
     */
    var createPage = function (options, lid, done) {
        var layout = findStoreCache('layout', lid);
        $.get(resolveURI(layout.url), function (data) {
            layout.content = data;
            var id = options.id;
            var page = {
                id: id,
                title: options.title,
                layout: layout,
                content: {}
            };
            dashboard.landing = dashboard.landing || id;
            dashboard.pages.push(page);
            saveDashboard();
            hideProperties();
            renderPage(id, done);
        }, 'html');
    };

    /**
     * returns the current page
     * @param p
     * @returns {*}
     */
    var currentPage = function (p) {
        return page = (ues.global.page = p);
    };

    /**
     * switches the given page
     * @param pid
     */
    var switchPage = function (pid) {
        if (!page) {
            return renderPage(pid);
        }
        destroyPage(page, function (err) {
            if (err) {
                throw err;
            }
            renderPage(pid);
        });
    };

    /**
     * renders the given page
     * @param pid
     * @param done
     */
    var renderPage = function (pid, done) {
        currentPage(findPage(dashboard, pid));
        if (!page) {
            throw 'specified page : ' + pid + ' cannot be found';
        }
        if (propertiesVisible()) {
            renderPageProperties(page);
        }
        $('.ues-context-menu .ues-component-properties-toggle').parent().hide();
        var container = layoutContainer();
        ues.dashboards.render(container, dashboard, pid, function (err) {
            $('#ues-designer').find('.ues-component').each(function () {
                var id = $(this).attr('id');
                renderComponentToolbar(findComponent(id));
            });
            listenLayout();
            if (!done) {
                return;
            }
            done(err);
        });
        updatePagesList();
    };

    /**
     * build up the page options for the given type of page
     * @param type
     * @returns {{id: string, title: string}}
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
     */
    var initFirstPage = function () {
        layoutWorkspace();
    };

    /**
     * initializes the dashboard
     * @param db
     * @param page
     * @param fresh
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

    initUI();
    initDashboard(ues.global.dashboard, ues.global.page, ues.global.fresh);

    ues.dashboards.save = saveDashboard;

});