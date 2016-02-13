$(function () {
    //TODO: cleanup this
    var dashboard,
        page,
        pageType,
        activeComponent,
        gridster,
        breadcrumbs = [],
        recentlyOpenedPageProperty,
        storeCache = {
            gadget: [],
            widget: [],
            layout: []
        },
        nonCategoryKeyWord = "null",
        freshDashboard = true,
        gridsterUlDimension = {},
        designerScrollTop = 0,
        dashboardsApi = ues.utils.tenantPrefix() + 'apis/dashboards',
        dashboardsUrl = ues.utils.tenantPrefix() + 'dashboards',
        resolveURI = ues.dashboards.resolveURI,
        findPage = ues.dashboards.findPage,
        lang = navigator.languages ? navigator.languages[0] : (navigator.language || navigator.userLanguage || navigator.browserLanguage),
        COMPONENTS_PAGE_SIZE = 20,
        DUMMY_GADGET_SIZE = 30,
        DEFAULT_DASHBOARD_VIEW = 'default',
        ANONYMOUS_DASHBOARD_VIEW = 'anon',
        FULL_COMPONENT_VIEW = 'full',
        DEFAULT_COMPONENT_VIEW = 'default';

    $(document).ready(function () {
        $(".nav li.disabled a").click(function () {
            return false;
        });
        alignAddBlock();
    });

    $(window).resize(function () {
        alignAddBlock();
    });

    var alignAddBlock = function () {
        var el = $('#ues-add-block-menu'),
            parentTop = 330,
            elementHeight = el.height(),
            windowHeight = $(window).height(),
            top = ((parentTop + elementHeight) > windowHeight) ? (windowHeight - (parentTop + elementHeight)) + 'px' : '0';

        el.css('top', top);
    }

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

    var componentBoxContentHbs = Handlebars.compile($('#ues-component-box-content-hbs').html() || '');

    /**
     * Registering not equals helper to the Handlebars
     * */
    Handlebars.registerHelper('if_neq', function (a, b, blocks) {
        if (a != b) {
            return blocks.fn(this);
        } else {
            return blocks.inverse(this);
        }
    });

    /**
     * generates a random id
     * @returns {string}
     * @private
     */
    var randomId = function () {
        return Math.random().toString(36).slice(2);
    };

    /**
     * Initialize the nano scroller.
     * @private
     * */
    var initNanoScroller = function () {
        $(".nano").nanoScroller();
    };

    /**
     * switches workspaces in the designer
     * @param name
     * @private
     */
    var showWorkspace = function (name) {
        $('.ues-workspace').hide();
        $('#ues-workspace-' + name).show();
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
    var hideStore = function (type) {
        $('#ues-store').addClass('ues-hidden');
        $('#ues-store-' + type).addClass('ues-hidden');

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
        component.viewOption = view;
        ues.components.update(component, function (err, block) {
            if (err) {
                throw err;
            }
        });
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
        var addingParam = ues.global.type.toString().localeCompare(ANONYMOUS_DASHBOARD_VIEW) == 0 ? '?isAnonView=true' : '';
        var pageURL = dashboard.landing !== page.id ? page.id : '';
        var url = dashboardsUrl + '/' + dashboard.id + '/' + pageURL + addingParam;
        window.open(url, '_blank');
    };

    /**
     * Generate Noty Messages as to the content given parameters
     * @param1 text {String}
     * @param2 ok {Object}
     * @param3 cancel {Object}
     * @param4 type {String}
     * @param5 layout {String}
     * @param6 timeout {Number}
     * @return {Object}
     * @private
     * */
    var generateMessage = function (text, funPrimary, funSecondary, type, layout, timeout, close,mode) {
        var properties = {};
        properties.text = text;

        if(mode == undefined){

            if (funPrimary || funSecondary) {
                properties.buttons = [
                    {
                        addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) {
                        $noty.close();
                        if (funPrimary) {
                            funPrimary();
                        }
                    }
                    },
                    {
                        addClass: 'btn btn-danger', text: 'Cancel', onClick: function ($noty) {
                        $noty.close();
                        if (funSecondary) {
                            funSecondary();
                        }
                    }
                    }
                ];
            }

        }else if(mode == "DEL_BLOCK_OR_ALL"){

            if (funPrimary || funSecondary) {
                properties.buttons = [
                    {
                        addClass: 'btn btn-primary', text: 'Gadget & Block', onClick: function ($noty) {
                        $noty.close();
                        if (funPrimary) {
                            funPrimary();
                        }
                    }
                    },
                    {
                        addClass: 'btn btn-primary', text: 'Gadget Only', onClick: function ($noty) {
                        $noty.close();
                        if (funSecondary) {
                            funSecondary();
                        }
                    }
                    },
                    {
                        addClass: 'btn btn-danger', text: 'Cancel', onClick: function ($noty) {
                        $noty.close();
                    }
                    }
                ];
            }
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
            generateMessage("Saved Successfully", null, null, "success", "bottom", 2000, null);
            console.log('dashboard saved successfully');
            if (isRedirect) {
                isRedirect = false;
                window.location = dashboardsUrl + '/' + dashboard.id + "?editor=true";
            }
        }).error(function () {
            generateMessage("Error Occurred While Saving", null, null, "error", "bottom", 2000, null);
            console.log('error saving dashboard');
        });
    };

    /**
     * initializes the component toolbar
     * @private
     */
    var initComponentToolbar = function () {
        var designer = $('#ues-designer');

        designer.on('click', '.ues-component-box .ues-component-toolbar .ues-component-full-handle', function () {

            var id = $(this).closest('.ues-component').attr('id'),
                component = findComponent(id),
                componentContainer = $(this).closest('.ues-component-box'),
                componentContainerId = componentContainer.attr('id'),
                componentBody = componentContainer.find('.ues-component-body'),
                gridsterUl = $('.gridster > ul'),
                trashButton = componentContainer.find('.ues-component-toolbar .ues-trash-handle').parent();

            if (component.fullViewPoped) {
                // rendering normal view

                gridster.enable().enable_resize();

                // restore the size of the gridster ul
                gridsterUl.width(gridsterUlDimension.width).height(gridsterUlDimension.height);

                trashButton.show();
                $('.ues-component-box').show();

                //minimize logic
                componentContainer
                    .removeClass('ues-component-fullview')
                    .css('height', '')
                    .on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function () {
                        componentBody.fadeIn(300);
                        designer.scrollTop(designerScrollTop);
                        renderMaxView(component, DEFAULT_COMPONENT_VIEW);
                        component.fullViewPoped = false;
                    });

                $(this).attr('title', $(this).data('maximize-title'));

                componentBody.hide();

            } else {
                // rendering full view

                // backup the scroll position
                designerScrollTop = designer.scrollTop();

                gridster.disable().disable_resize();

                // backup the size of the gridster ul and reset element size
                gridsterUlDimension = {width: gridsterUl.width(), height: gridsterUl.height()};
                gridsterUl.width('auto').height('auto');

                trashButton.hide();
                $('.ues-component-box:not(#' + componentContainerId + ')').hide();

                //maximize logic
                componentContainer
                    .addClass('ues-component-fullview')
                    .css('height', ($('#ues-designer').height() - 100) + 'px')
                    .on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function () {
                        componentBody.fadeIn(300);
                        renderMaxView(component, FULL_COMPONENT_VIEW);
                        component.fullViewPoped = true;
                    });

                $(this).attr('title', $(this).data('minimize-title'));

                componentBody.hide();
            }
        });

        designer.on('click', '.ues-component-box .ues-component-toolbar .ues-properties-handle', function () {
            var id = $(this).closest('.ues-component').attr('id');
            var parent = $(this).parent();
            if (parent.hasClass('active')) {
                parent.removeClass('active');
                hideProperties();
                return;
            }
            parent.addClass("active");
            renderComponentProperties(findComponent(id));
        });

        designer.on('click', '.ues-component-box .ues-component-toolbar .ues-trash-handle', function () {

            var componentBox = $(this).closest('.ues-component-box'),
                id = componentBox.find('.ues-component').attr('id'),
                removeBlock = true;

            var removeWholeBlock = function () {
                if (id) {
                    removeComponent(findComponent(id), function (err) {
                        if (err) {
                            removeBlock = false;
                            console.error(err);
                        }
                        saveDashboard();
                    });

                }

                if (removeBlock) {
                    gridster.remove_widget(componentBox, function () {
                        updateLayout();
                    });
                }
            };

            var removeGadgetContent = function () {
                if (id) {
                    removeComponent(findComponent(id), function (err) {
                        if (err) {
                            removeBlock = false;
                            console.error(err);
                        }
                        saveDashboard();
                    });
                    componentBox.html(componentBoxContentHbs({appendResizeHandle: true}));
                }
            };

            if(id == undefined){
                generateMessage("This will remove the block. Do you want to continue?",
                    removeWholeBlock, null, "confirm", "topCenter", null, ["button"]);
            }else{
                generateMessage("What do you want to Delete ?",
                    removeWholeBlock, removeGadgetContent, "confirm", "topCenter", null, ["button"],"DEL_BLOCK_OR_ALL");
            }
        });

        $('body').on('click', '.modal-footer button', function () {
            $('#componentFull').modal('hide');

        });

        designer.on('click', '.ues-design-default-view', function () {
            //default
            pageType = DEFAULT_DASHBOARD_VIEW;
            ues.global.type = DEFAULT_DASHBOARD_VIEW;
            switchPage(getPageId(), pageType);
            $('.toggle-design-view-anon').removeClass('disabled');
            $('.toggle-design-view-default').addClass('disabled');
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
        if (component) {
            var el = $('#' + component.id + ' .ues-component-toolbar ul').html($(componentToolbarHbs(component.content)));
            $('[data-toggle="tooltip"]', el).tooltip();
        }
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
     * Check whether dashboard is anon or not based on whether there are anon
     * pages available or not.
     * @return isDashboardAnon{Boolean}: true if there are any page with anon view.
     * */
    var checkWhetherDashboardIsAnon = function () {
        var isDashboardAnon = false;
        for (var availablePage in dashboard.pages) {
            if (dashboard.pages[availablePage].isanon) {
                isDashboardAnon = true;
                break;
            }
        }

        return isDashboardAnon;
    };

    /**
     * Check whether there are any pages which has given id.
     * @param pageId {String}
     * @return {Boolean}
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
     * @param pageTitle {String}
     * @return {Boolean}
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

        if (!titleVal) {
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
            id: function () {

                if (checkForPagesById(idVal) && page.id != idVal) {
                    generateMessage("A page with entered URL already exists. Please select a different URL",
                        null, null, "error", "topCenter", 3500, ['button', 'click']);
                    id.val(page.id);
                } else {
                    page.id = idVal;
                    if (landing.is(":checked")) {
                        dashboard.landing = idVal;
                    }
                }

            },
            title: function () {

                if (checkForPagesByTitle(titleVal) && page.title.toUpperCase() != titleVal.toUpperCase()) {
                    generateMessage("A page with entered title already exists. Please select a different title",
                        null, null, "error", "topCenter", 3500, ['button', 'click']);
                    title.val(page.title);
                    titleVal = page.title;
                } else {
                    page.title = titleVal;
                }

                $('#ues-designer .ues-page-title .page-title').text(titleVal);
                $('#ues-properties .ues-page-title').find().text(titleVal);

            },
            landing: function () {

                if (landing.is(':checked')) {
                    if (hasAnonPages && !page.isanon) {
                        landing.prop("checked", false);
                        generateMessage("Please add an anonymous view to this page before select it as the landing page", null, null, "error", "topCenter", 3500, ['button', 'click']);
                    } else {
                        dashboard.landing = idVal;
                    }
                }

            },
            anon: function () {

                if (anon.is(':checked')) {
                    if (checkForAnonLandingPage(dashboard.landing) || dashboard.landing == idVal) {
                        ues.global.dbType = ANONYMOUS_DASHBOARD_VIEW;
                        dashboard.isanon = true;
                        page.isanon = true;
                        // create the template if there is no content create before
                        page.layout.content.anon = page.layout.content.anon || page.layout.content.loggedIn;
                        $(".toggle-design-view").removeClass("hide");
                        toggleView.bootstrapToggle('off');
                    } else {
                        $(anon).prop("checked", false);
                        generateMessage("Please add an anonymous view to the landing page in order to make this page anonymous", null, null, "error", "topCenter", 3500, ['button', 'click']);
                    }
                } else {
                    if (hasAnonPages && dashboard.landing == idVal) {
                        $(anon).prop("checked", true);
                        generateMessage("Cannot remove the anonymous view of landing page when there are pages with anonymous views", null, null, "error", "topCenter", 3500, ['button', 'click']);
                    } else {
                        page.isanon = false;

                        // Check if the dashboard is no longer anonymous.
                        if (!checkWhetherDashboardIsAnon()) {
                            dashboard.isanon = false;
                            ues.global.dbType = DEFAULT_DASHBOARD_VIEW;
                        }

                        // the anon layout should not be deleted since the gadgets in this layout is already there in the content
                        $(".toggle-design-view").addClass("hide");

                        toggleView.bootstrapToggle(toggleView.prop("checked") ? 'on' : 'off');

                        page.content.anon = {};
                    }
                }

            },
            fluidLayout: function () {
                page.layout.fluidLayout = fluidLayout.is(':checked');
            }
        };

        if (typeof fn[e.context.name] === 'function') {
            fn[e.context.name]();

            updatePagesList();
            saveDashboard();
            initNanoScroller();

        } else {
            console.error('function not implemented')
        }

        if (recentlyOpenedPageProperty && !$('#ues-dashboard-pages').find('#ues-page-properties').find("#" + recentlyOpenedPageProperty).hasClass('in')) {
            $('#ues-dashboard-pages').find('#ues-page-properties').find('a[data-id="' + recentlyOpenedPageProperty + '"]').click();
            initNanoScroller();
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
        if (character.match(regEx) && code != 8 && code != 46) {
            return false;
        } else {
            return !($.trim($(element).val()) == '' && character.match(/[\s]/gim));
        }
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
     * Check whether given category is already existing or not.
     * @param1 categories {Object}
     * @param2 category {String}
     * @return {Boolean}
     * @private
     * */
    var checkForExistingCategory = function (categories, category) {
        return categories[category] ? true : false;
    };

    /**
     * Filter the component By Categories
     * @param data {Object}
     * @return {Object}
     * @private
     * */
    var filterComponentByCategories = function (data) {
        var componentsWithCategories = {};
        var categories = {};
        for (var i = 0; i < data.length; i++) {
            var category = data[i].category ? data[i].category : nonCategoryKeyWord;
            if (checkForExistingCategory(categories, category)) {
                componentsWithCategories[category].components.push(data[i]);
            } else {
                var newCategory = {
                    components: [],
                    category: category
                };

                categories[category] = category;
                newCategory.components.push(data[i]);
                componentsWithCategories[category] = newCategory;
            }
        }
        return componentsWithCategories;
    };

    /**
     * Sort the Filtered component to show the non categorized components first.
     * @param1 nonCategoryString {String}
     * @param2 componentsWithCategories {String}
     * @return {Object}
     * @private
     * */
    var sortComponentsByCategory = function (nonCategoryString, componentsWithCategories) {
        var sortedList = {};
        sortedList[nonCategoryString] = componentsWithCategories[nonCategoryString];
        for (var i in componentsWithCategories) {
            if (i != nonCategoryString) {
                sortedList[i] = componentsWithCategories[i];
            }
        }
        return sortedList;
    };

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
        var actions = $('#ues-store-menu-actions');
        actions.find('.ues-store-toggle').click(function () {
            var thiz = $(this);
            var parent = thiz.parent();
            var type = thiz.data('type');
            parent.siblings().addBack().removeClass('active');
            var store = $('#ues-store');
            var assets = $('#ues-store-' + type);
            if (store.hasClass('ues-hidden') || assets.hasClass('ues-hidden')) {
                parent.addClass('active');
                assets.siblings().addClass('ues-hidden');
                showStore(type);
                initNanoScroller();
                return;
            }
            hideStore(type);
        });

        actions.find('.ues-pages-toggle').click(function () {
            var element = $(this);
            var parent = element.parent();
            var type = element.data('type');
            parent.siblings().addBack().removeClass('active');

            var store = $('#ues-store');
            var pagesMenu = $('#ues-dashboard-pages');
            var designer = $('#ues-designer');

            if (store.hasClass('ues-hidden') || pagesMenu.hasClass('ues-hidden')) {
                parent.addClass('active');
                pagesMenu.siblings().addClass('ues-hidden');
                showPages();
                initNanoScroller();
                return;
            }
            parent.removeClass('active');
            hidePages();
        });
    };

    /**
     * Show the page list.
     * @private
     * */
    var showPages = function () {
        $('#ues-store').removeClass('ues-hidden');
        $('#ues-dashboard-pages').removeClass('ues-hidden');
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
     * Hide the page list.
     * @private
     * */
    var hidePages = function () {
        $('#ues-dashboard-pages').addClass('ues-hidden');
        $('#ues-store').addClass('ues-hidden');
        var designer = $('#ues-designer');
        if (designer.hasClass('ues-storeprop-visible')) {
            designer.removeClass('ues-storeprop-visible').addClass('ues-properties-visible');
            return;
        }
        designer.removeClass('ues-store-visible');
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
        $('#ues-workspace-layout').find('.ues-content').on('click', '.layout-selection', function (e) {
            e.preventDefault();
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
        $('#ues-store').find('.ues-store-assets')
            .scroll(function () {
                var thiz = $(this);
                var type = thiz.data('type');
                var child = $('.ues-content', thiz);
                if (thiz.scrollTop() + thiz.height() < child.height() - 100) {
                    return;
                }
                var query = $('.ues-search-box input', thiz).val();
                loadAssets(type, query);
                initNanoScroller();
            })
            .find('.ues-search-box input')
            .on('keypress', function (e) {
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

    var addBreadcrumbsParents = function (pageName, url, element) {
        var breadCrumb = element ? $(element).find('#ues-breadcrumbs') : $('#ues-breadcrumbs');
        breadcrumbs.push(pageName);
        breadCrumb.append("<li><a href='" + url + "'>" + pageName + "</a></li>");
    };

    var addBreadcrumbsCurrent = function (pageName, element) {
        var breadCrumb = element ? $(element).find('#ues-breadcrumbs') : $('#ues-breadcrumbs');
        if (breadCrumb.find(".active").text() != pageName) {
            removeBreadcrumbsCurrent();
            removeBreadcrumbsElement(pageName, "a", "li");

        }
        breadcrumbs.push(pageName);
        breadCrumb.append("<li class='active'>" + pageName + "</li>");
    };

    var removeBreadcrumbsCurrent = function (element) {
        var breadCrumb = element ? $(element).find('#ues-breadcrumbs') : $('#ues-breadcrumbs');
        breadCrumb.find(".active").remove();
        breadcrumbs.pop();
    };

    var removeBreadcrumbsElement = function (text, element, parent, breadCrumbElement) {
        var breadCrumb = breadCrumbElement ? $(breadCrumbElement).find('#ues-breadcrumbs') : $('#ues-breadcrumbs');
        var anchors = breadCrumb.find(element);
        for (var i = 0; i < anchors.length; i++) {
            if ($(anchors[i]).text() == text) {
                parent ? $(anchors[i]).parent(parent).remove() : $(anchors[i]).remove();
                break;
            }
        }
    };

    var initDesignerMenu = function () {
        var designer = $("#ues-workspace-designer");
        designer.show();

        var menu = designer.find('.ues-context-menu');
        menu.find('.ues-dashboard-preview').on('click', function () {
            previewDashboard(page);
        });

        menu.find('.ues-copy').on('click', function (e) {
            e.preventDefault();
            var reset = function () {
                window.open($('.ues-copy').attr('href'), "_self");
            };

            generateMessage("This will remove all the customization added to the dashboard." +
                " Do you want to continue?", reset, null, "confirm", "topCenter", null, ["button"]);
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

        var pagesMenu = $("#ues-dashboard-pages");
        pagesMenu.find(".ues-pages-list").on('click', 'li a', function () {
            var thiz = $(this);
            var pid = thiz.data('id');
            ues.global.isSwitchToNewPage = true;
            switchPage(pid, pageType);
            ues.global.isSwitchToNewPage = false;
        });
        pagesMenu.find("#ues-page-properties").on("click", 'a', function (e) {
            var thiz = $(this);
            var pid = thiz.data('id');
            if ($("#" + pid).hasClass('in')) {
                $("#" + pid).removeClass('in');
                recentlyOpenedPageProperty = null;
                e.stopPropagation();
                return;
            }

            // do not re-render if the user clicks on the current page name
            if (pid != page.id) {
                ues.global.isSwitchToNewPage = true;
                switchPage(pid, pageType);
                ues.global.isSwitchToNewPage = false;
            }

            $('#' + pid).find('.panel-body').html(pageOptionsHbs({
                id: page.id,
                title: page.title,
                landing: (dashboard.landing == page.id),
                isanon: page.isanon,
                isUserCustom: dashboard.isUserCustom,
                fluidLayout: page.layout.fluidLayout || false
            })).find('.ues-sandbox').on('change', 'input', function () {
                updatePageProperties($(this).closest('.ues-sandbox'));
            });

            $("#page-title").on("keypress", function (e) {
                return sanitizeOnKeyPress(this, e, /[^a-z0-9-\s]/gim);
            });

            $("#page-url").on("keypress", function (e) {
                return sanitizeOnKeyPress(this, e, /[^a-z0-9-\s]/gim);
            }).on("keyup", function (e) {
                var sanitizedInput = $(this).val().replace(/[^\w]/g, '-').toLowerCase();
                $(this).val(sanitizedInput);
            });

            recentlyOpenedPageProperty = pid;
        });
        pagesMenu.find("#ues-page-properties").on("click", 'a .ues-trash', function (e) {
            e.stopPropagation();
            var thiz = $(this);
            var pid = thiz.parent().parent().data('id');
            var removePageFromDB = function () {
                removePage(pid, DEFAULT_DASHBOARD_VIEW, function (err) {
                    var pages = dashboard.pages;

                    if (recentlyOpenedPageProperty == pid) {
                        recentlyOpenedPageProperty = null;
                    }

                    updatePagesList(pages);
                    initNanoScroller();
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

                    saveDashboard();
                    if (pid !== page.id) {
                        updatePagesList(pages);
                        initNanoScroller();
                        return;
                    }
                    hideProperties();
                    renderPage(first.id);
                });
            };

            generateMessage("This will remove the page and all its content." +
                " Do you want to continue?", removePageFromDB, null, "confirm", "topCenter", null);
        });

        pagesMenu.find(".ues-search-box input").on("keypress", function (e) {
            if (e.which !== 13) {
                return;
            }
            e.preventDefault();
            var searchQuery = "" + $(this).val();
            var pages = dashboard.pages;
            var resultPages = [];
            if (searchQuery) {
                for (var i = 0; i < pages.length; i++) {
                    if (pages[i].title.toLowerCase().indexOf(searchQuery.toLowerCase()) >= 0) {
                        resultPages.push(pages[i]);
                    }
                }
                updatePagesList(page, resultPages, dashboard.landing);
                initNanoScroller();
            } else {
                updatePagesList();
                initNanoScroller();
            }
        });
        pagesMenu.find('.ues-page-add').on('click', function () {
            layoutWorkspace();
            removeBreadcrumbsCurrent($('#ues-workspace-layout').find('.ues-context-menu'));
            removeBreadcrumbsElement(dashboard.title, "a", "li", $('#ues-workspace-layout').find('.ues-context-menu'));
            addBreadcrumbsParents(dashboard.title, ues.utils.tenantPrefix() + "./dashboards/" + dashboard.id + "/?editor=true", $('#ues-workspace-layout').find('.ues-context-menu'));
            addBreadcrumbsCurrent("Add Page", $('#ues-workspace-layout').find('.ues-context-menu'));
        });
    };

    var initLayoutMenu = function () {
        var menu = $('#ues-workspace-layout').find('.ues-context-menu');
        menu.find('.ues-go-back').on('click', function () {
            removeBreadcrumbsCurrent($('#ues-workspace-layout').find('.ues-context-menu'));
            removeBreadcrumbsElement(dashboard.title, "a", "li", $('#ues-workspace-layout').find('.ues-context-menu'));
            addBreadcrumbsCurrent(dashboard.title);
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
    var initAddBlock = function () {

        // add block handler
        $('#ues-add-block-btn').on('click', function () {
            var width = parseInt($('#dummy-size').attr('data-w')) || 0,
                height = parseInt($('#dummy-size').attr('data-h')) || 0,
                id = guid();

            if (width == 0 || height == 0) {
                return;
            }

            gridster.add_widget(componentBoxListHbs({blocks: [{id: id}]}), width, height, 1, 1);

            $('.ues-component-box#' + id).html(componentBoxContentHbs({appendResizeHandle: true}));
            $('#ues-add-block-menu-item').removeClass('open');

            updateLayout();
            listenLayout();
        });

        $('#dummy-gadget').resizable({
            grid: DUMMY_GADGET_SIZE,
            containment: "#dummy-gadget-container",
            resize: function (event, ui) {

                var height = Math.round($(this).height() / DUMMY_GADGET_SIZE),
                    width = Math.round($(this).width() / DUMMY_GADGET_SIZE),
                    label = width + 'x' + height;

                $(this).find('#dummy-size').html(label).attr({
                    'data-w': width,
                    'data-h': height
                });
            }
        });
    };

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

        // Adding breadcrumbs.
        addBreadcrumbsParents("Dashboards", ues.utils.tenantPrefix() + "./dashboards");

        if (ues.global.dashboard.isEditorEnable && ues.global.dashboard.isUserCustom) {
            generateMessage("You have given editor permission for this dashboard." +
                    " Please reset the dashboard to receive the permission.",
                null, null, "error", "topCenter", null, ["button"]);
        }

        $('[data-toggle="tooltip"]').tooltip();
    };

    /**
     * initializes the layout listeners
     * @private
     */
    var listenLayout = function () {
        $('#ues-designer').find('.ues-component-box:not([data-banner=true])').droppable({
            hoverClass: 'ui-state-hover',
            drop: function (event, ui) {

                var id = ui.helper.data('id'),
                    type = ui.helper.data('type');

                if (!hasComponents($(this))) {
                    createComponent($(this), findStoreCache(type, id));
                }
            }
        });
    };

    /**
     * check whether the container has any components
     * @param container
     * @returns boolean
     */
    var hasComponents = function (container) {
        return (container.find('.ues-component .ues-component-body div').length > 0);
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

    /**
     * Update the page list as changes happened to the pages.
     * @param current {Object}
     * @param pages {Object}
     * @param landing {String}
     * @private
     * */
    var updatePagesList = function (current, pages, landing) {
        $('#ues-dashboard-pages').find('#ues-page-properties').html(pagesListHbs({
            current: current ? current : page,
            pages: pages ? pages : dashboard.pages,
            home: landing ? landing : dashboard.landing
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
            dashboard.isanon = dashboard.isanon ? dashboard.isanon : false;
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

            addBreadcrumbsCurrent(dashboard.title);
            initNanoScroller();
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
    var updateLayout = function () {
        // extract the layout from the designer (gridster) and save it
        var json = {blocks: gridster.serialize()},
            id, i;

        // find the current page index
        for (i = 0; i < ues.global.dashboard.pages.length; i++) {
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
    };

    /**
     * generate GUID
     * @returns {*}
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
     * renders the given page in the designer view
     * @param pid
     * @param done
     * @private
     */
    var renderPage = function (pid, done) {
        currentPage(findPage(dashboard, pid));
        if (!page) {
            throw 'specified page : ' + pid + ' cannot be found';
        }

        // TODO: Revise the following commented line.
        //if (propertiesVisible()) {
        //    renderPageProperties(page);
        //}

        pageType = pageType ? pageType : DEFAULT_DASHBOARD_VIEW;
        if (ues.global.isSwitchToNewPage || !page.isanon) {
            pageType = DEFAULT_DASHBOARD_VIEW;
            ues.global.type = DEFAULT_DASHBOARD_VIEW;
        } else if (!($("#toggle-dashboard-view").prop("checked")) && $("#toggle-dashboard-view").length > 0) {
            pageType = ANONYMOUS_DASHBOARD_VIEW;
            ues.global.type = ANONYMOUS_DASHBOARD_VIEW;
        }

        // TODO: Disable the properties if no gadgets available in the view.
        //$('.ues-context-menu .ues-component-properties-toggle').parent().hide();

        var default_container = layoutContainer();
        ues.dashboards.render(default_container, dashboard, pid, pageType, function (err) {
            $('#ues-designer').find('.ues-component').each(function () {
                var id = $(this).attr('id');
                renderComponentToolbar(findComponent(id));
            });
            listenLayout();

            var gridsterContainer = $('.gridster > ul'),
                minBlockWidth = Math.ceil($('.gridster').width() / 12) - 30,
                minBlockHeight = minBlockWidth + 30;

            // bind the gridster to the layout
            gridster = gridsterContainer.gridster({
                widget_margins: [15, 15],
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
                    handle: '.ues-component-header, .ues-component-header .ues-component-title',
                    stop: function () {
                        updateLayout();
                    }
                },
                resize: {
                    enabled: true,
                    max_size: [12, 12],
                    start: function (e, ui, widget) {
                        // hide the component content on start resizing the component
                        var container = widget.find('.ues-component');
                        if (container) {
                            container.find('.ues-component-body').hide();
                        }
                    },
                    stop: function (e, ui, widget) {
                        // re-render component on stop resizing the component
                        var container = widget.find('.ues-component');
                        if (container) {
                            container.find('.ues-component-body').show();
                            if (container.attr('id')) {
                                updateComponent(container.attr('id'));
                            }
                        }

                        updateLayout();
                    }
                }
            }).data('gridster');

            // stop resizing banner placeholder
            $('.gridster [data-banner=true] .gs-resize-handle').remove();

            if (!done) {
                return;
            }

            done(err);

        }, true);

        // stop closing the add block dropdown on clicking
        $('#ues-add-block-menu').on('click', function (e) {
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

        initBanner();
    };

    /**
     * Check for the autogenerated name to stop repeating the same name.
     * @param1 prefix {String}
     * @param2 pid {Number}
     * @return {Number}
     * @private
     * */
    var checkForExistingPageNames = function (prefix, pid) {
        var i,
            pages = dashboard.pages,
            length = pages.length,
            page = prefix + pid;

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
     * Configure the layout selection workspace.
     * @private
     * */
    var layoutWorkspace = function () {
        var firstPage = !dashboard.pages.length,
            back = $('#ues-workspace-layout').find('.ues-context-menu-actions .ues-go-back'),
            cancel = $('#ues-workspace-layout').find('.ues-context-menu-actions .ues-cancel');

        if (firstPage) {
            back.hide();
            cancel.show();
        } else {
            back.show();
            cancel.hide();
        }
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
        addBreadcrumbsCurrent(dashboard.title);
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
            showRemove: (customDashboard && banner.customBannerExists) || !customDashboard,
            isEditable: (pageType == DEFAULT_DASHBOARD_VIEW)
        };
        $placeholder.html(bannerHbs(data));

        // display the image
        var img = $placeholder.find('#img-banner');
        if (bannerExists) {
            img.attr('src', img.data('src') + '?rand=' + Math.floor(Math.random() * 100000)).show();
        } else {
            img.hide();
        }
    };

    /**
     * Change event handler for the banner file control
     * @oaram e
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

            $('.ues-banner-placeholder button').prop('disabled', false);
            $('.ues-dashboard-banner-loading').hide();
        };
        img.src = objectUrl;
    };

    /**
     * initialize the banner
     */
    var initBanner = function () {

        loadBanner();

        // bind a handler to the change event of the file element (removing the handler initially to avoid multiple binding to the same handler)
        var fileBanner = document.getElementById('file-banner');
        fileBanner.removeEventListener('change', bannerChanged);
        fileBanner.addEventListener('change', bannerChanged, false);

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
            var $form = $('#ues-dashboard-upload-banner-form');

            if (ues.global.dashboard.isUserCustom && !ues.global.dashboard.banner.customBannerExists) {

                // in order to remove the global banner from a personalized dashboard, we need to save an empty resource.
                $.ajax({
                    url: $form.attr('action'),
                    type: $form.attr('method'),
                    data: {data: ''},
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
    initDashboard(ues.global.dashboard, ues.global.page, ues.global.fresh);

    ues.dashboards.save = saveDashboard;
});
