//$(function () {
//TODO: cleanup this


var dashboardsApi = ues.utils.tenantPrefix() + 'apis/dashboards';

var dashboardsUrl = ues.utils.tenantPrefix() + 'dashboards';

var resolveURI = ues.dashboards.resolveURI;

var findPage = ues.dashboards.findPage;

var dashboard;

var page;

var freshDashboard = true;

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

var pageOptionsHbs = Handlebars.compile($("#ues-page-properties-hbs").html() || '');

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
 * update component properties panel and save
 * @param sandbox
 */
var updateComponentProperties = function (sandbox, component) {
    var options = {};

    saveOptions(sandbox, options);

    saveComponentProperties(component, {
        options: options
    });
};

/**
 * renders the component properties panel
 * @param component
 */
var renderComponentProperties = function (component) {
    var el = $('.ues-gadget-options').on('change', 'input, select, textarea', function () {
        updateComponentProperties($(this).closest('.ues-sandbox'), component);
    });
    showProperties();
};

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
var saveComponentProperties = function (component, data) {
    var o;
    var opt;
    var block = component;
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
    updateComponent(component);
    saveDashboard(component);
    ues.dashboards.rewire(page);
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
var saveDashboard = function (component) {
    url = dashboardsApi + '/' + dashboard.id +'?personalize=true';
    $.ajax({
        url: url,
        method: 'PUT',
        data: JSON.stringify(dashboard),
        contentType: 'application/json'
    }).success(function (data) {
        console.log('dashboard saved successfully');
    }).error(function () {
        console.log('error saving dashboard');
    });
};

//var saveDashBoardResource = function (dashboard) {
//    url = dashboardsApi + '/' + dashboard.id;
//    $.ajax({
//        url: url,
//        method: 'PUT',
//        data: JSON.stringify(dashboard),
//        contentType: 'application/json'
//    }).success(function (data) {
//        console.log('dashboard saved successfully');
//    }).error(function () {
//        console.log('error saving dashboard');
//    });
//};

/**
 * initializes the ues properties
 */
var initUESProperties = function () {
    $('body').on('click', '.close-db-settings', function () {
        hideProperties();
    });
};

/**
 * triggers update hook of a given component
 * @param id
 */
var updateComponent = function (component) {
    ues.components.update(component, function (err) {
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
        title: page.title,
        isanon : page.isanon
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
 * holds the store paging history for infinite scroll
 * @type {{}}
 */
var pagingHistory = {};


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


var initContextMenus = function () {
    initDesignerMenu();
};

/**
 * initializes the UI
 */
var initUI = function () {
    initContextMenus();
    initComponents();
    initUESProperties();
};

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
};

initUI();
initDashboard(ues.global.dashboard, ues.global.page, ues.global.fresh);

initUI();

ues.dashboards.save = saveDashboard;

//});