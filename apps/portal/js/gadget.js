/*
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
$(function () {
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

        var content = page.content.default;
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
     * To render the specific gadget in a certain page
     */
    var renderGadget = function () {
        window.onresize = function(){ location.reload(); }
        var com = $('.emb-gadget');
        var id = window.location.pathname.split("/").pop();
        console.log(ues.global.dbType);
        var allPages = ues.global.dashboard.pages;

        if (allPages.length > 0) {
            page = (ues.global.page ? ues.global.page : allPages[0]);
        }
        for (var i = 0; i < allPages.length; i++) {
            if (ues.global.page == allPages[i].id) {
                page = allPages[i];
            }
        }
        var componentBoxContentHbs = Handlebars.compile($('#ues-component-box-content-hbs').html());
        com.html(componentBoxContentHbs());
        createComponent(com, findComponent(id), function (err) {
            if (err) {
            }
        });
    }

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
        var id = window.location.pathname.split("/").pop();

        if (component.content.styles.hide_gadget) {
            hideGadget(sandbox);
        } else {
            showGadget(sandbox);
        }


        plugin.create(sandbox, component, ues.hub, done);
    };

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
     * Show Gadget the gadget
     * @param sandbox
     */
    var showGadget = function (sandbox) {
        sandbox.removeClass('ues-hide-gadget');
        sandbox.find('.ues-component-body').show();
    };

    renderGadget();
});

