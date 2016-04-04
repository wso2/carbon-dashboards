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

(function () {
    /**
     * Find a component.
     * @param {String} type Type of the plugin
     * @return {Object}
     */
    var findPlugin = function (type) {
        var plugin = ues.plugins.components[type];
        if (!plugin) {
            throw 'ues dashboard plugin for ' + type + ' cannot be found';
        }
        return plugin;
    };

    /**
     * Create a component inside a container.
     * @param {Object} container Gadget container
     * @param {Object} component Component object
     * @param {function} done Callback function
     * @return {null}
     */
    var createComponent = function (container, component, done) {
        var type = component.content.type;
        var plugin = findPlugin(type);

        var sandbox = container.find('.ues-component');
        sandbox.attr('id', component.id).attr('data-component-id', component.id);

        plugin.create(sandbox, component, ues.hub, done);
    };

    /**
     * Update a particular component.
     * @param {Object} component Component object
     * @param {function} done Callback function
     * @return {null}
     */
    var updateComponent = function (component, done) {
        var plugin = findPlugin(component.content.type);
        var container = $('#' + component.id);
        plugin.update(container, component, ues.hub, done);
    };

    /**
     * Destroy a component.
     * @param {Object} component Component object
     * @param {function} done Callback function
     * @return {null}
     */
    var destroyComponent = function (component, done) {
        var plugin = findPlugin(component.content.type);
        var container = $('#' + component.id);
        plugin.destroy(container, component, ues.hub, done);
    };

    /**
     * Get a component ID.
     * @param {String} clientId Container ID
     * @return {String} Gadget ID
     */
    var componentId = function (clientId) {
        return clientId.replace('sandbox-gadget-', '');
    };

    var wirings;

    // Overriding publish for clients method
    var publishForClient = ues.hub.publishForClient;
    ues.hub.publishForClient = function (container, topic, data) {
        var clientId = componentId(container.getClientID());
        var channels = wirings[clientId + '.' + topic];
        if (!channels) {
            return;
        }
        channels.forEach(function (channel) {
            publishForClient.apply(ues.hub, [container, channel, data]);
        });
    };

    //overriding publish method
    var publish = ues.hub.publish;
    ues.hub.publish = function (topic, data) {
        $(".gadgets-grid").find('.ues-component').each(function () {
            var id = $(this).attr('id');
            var channel = id + "." + topic;
            publish.apply(ues.hub, [channel, data]);
        });
    };

    var wires = function (page, pageType) {
        var content = page.content[pageType];
        var area;
        var blocks;
        var wirez = {};

        var wire = function (wirez, id, listeners) {
            var event;
            var listener;
            for (event in listeners) {
                if (listeners.hasOwnProperty(event)) {
                    listener = listeners[event];
                    if (!listener.on) {
                        continue;
                    }
                    listener.on.forEach(function (notifier) {
                        var channel = notifier.from + '.' + notifier.event;
                        var wire = wirez[channel] || (wirez[channel] = []);
                        wire.push(id + '.' + event);
                    });
                }
            }
        };

        for (area in content) {
            if (content.hasOwnProperty(area)) {
                blocks = content[area];
                blocks.forEach(function (block) {
                    var listeners = block.content.listen;
                    if (!listeners) {
                        return;
                    }
                    wire(wirez, block.id, listeners);
                });
            }
        }
        return wirez;
    };

    /**
     * Set page title.
     * @param {Object} dashboard Dashboard object
     * @param {Object} page Page object
     */
    var setDocumentTitle = function (dashboard, page) {
        document.title = dashboard.title + ' | ' + page.title;
    };

    /**
     * Convert JSON layout to Gridstack.
     * @param {Object} json Layout object
     * @return {String} HTML markup
     */
    var getGridstackLayout = function (json) {
        var componentBoxListHbs = Handlebars.compile($("#ues-component-box-list-hbs").html());
        var container = $('<div />').addClass('grid-stack');
        $(componentBoxListHbs(json)).appendTo(container);
        return container;
    }

    /**
     * Renders a page in the dashboard designer and the view modes.
     * @param {Object} element Gadget container wrapper
     * @param {Object} dashboard Dashboard object
     * @param {Object} page Page object
     * @param {String} pageType Type of the page
     * @param {function} done Callback function
     * @param {Boolean} isDesigner Flag to indicate the designer
     * @return {null}
     */
    var renderPage = function (element, dashboard, page, pageType, done, isDesigner) {
        setDocumentTitle(dashboard, page);
        wirings = wires(page, pageType);

        var layout = (pageType === 'anon' ? $(page.layout.content.anon) : $(page.layout.content.loggedIn));
        var content = page.content[pageType];
        var componentBoxContentHbs = Handlebars.compile($('#ues-component-box-content-hbs').html());
        // this is to be rendered only in the designer. in the view mode, the template is rendered in the server
        element.html(getGridstackLayout(layout[0]));
        
        // render gadget contents
        $('.ues-component-box').each(function (i, container) {
            container = $(container);
            // Calculate the data-height field which is required to render the gadget
            var gsItem = container.closest('.grid-stack-item');
            var node = gsItem.data('_gridstack_node');
            var gsHeight = node ? node.height : parseInt(gsItem.attr('data-gs-height'));
            var height = (gsHeight * 150) + ((gsHeight - 1) * 30);
            container.attr('data-height', height);
            var id = container.attr('id');
            var hasComponent = content.hasOwnProperty(id) && content[id][0];
            // the component box content (the skeleton) should be added only in the designer mode and the view mode only
            // if there is a component
            if (isDesigner || hasComponent) {
                container.html(componentBoxContentHbs());
            }
            if (hasComponent) {
                createComponent(container, content[id][0], function (err) {
                    if (err) {
                    }
                });
            }
        });
        if (!done) {
            return;
        }
        done();
    };

    /**
     * Find a particular page within a dashboard
     * @param {Object} dashboard Dashboard object
     * @param {String} id Page id
     * @return {Object} Page object
     */
    var findPage = function (dashboard, id) {
        var i;
        var page;
        var pages = dashboard.pages;
        var length = pages.length;
        for (i = 0; i < length; i++) {
            page = pages[i];
            if (page.id === id) {
                return page;
            }
        }
    };

    /**
     * Render the dashboard.
     * @param {Object} element Gadget container element
     * @param {Object} dashboard Dashboard object
     * @param {String} name Name of the page
     * @param {String} pageType Type of the page
     * @param {function} done Callback function
     * @param {Boolean} isDesigner Flag to indicate the designer mode
     * @return {null}
     */
    var renderDashboard = function (element, dashboard, name, pageType, done, isDesigner) {
        isDesigner = isDesigner || false;
        name = name || dashboard.landing;
        var page = findPage(dashboard, name);
        if (!page) {
            throw 'requested page : ' + name + ' cannot be found';
        }
        renderPage(element, dashboard, page, pageType, done, isDesigner);
    };

    var rewireDashboard = function (page, pageType) {
        wirings = wires(page, pageType);
    };

    /**
     * Resolve URI.
     * @param {String} uri URI
     * @return {String} Resolved path
     */
    var resolveURI = function (uri) {
        var index = uri.indexOf('://');
        var scheme = uri.substring(0, index);
        var uriPlugin = ues.plugins.uris[scheme];
        if (!uriPlugin) {
            return uri;
        }
        var path = uri.substring(index + 3);
        return uriPlugin(path);
    };

    ues.components = {
        create: createComponent,
        update: updateComponent,
        destroy: destroyComponent
    };

    ues.dashboards = {
        render: renderDashboard,
        rewire: rewireDashboard,
        findPage: findPage,
        resolveURI: resolveURI
    };

    ues.assets = {};

    ues.plugins = {
        assets: {},
        components: {},
        uris: {}
    };
}());
