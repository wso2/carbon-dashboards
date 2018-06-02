/*
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * Registry that maintains widget classes against their names.
 */
class WidgetClassRegistry {

    constructor() {
        this.registry = new Map();
    }

    /**
     * Registers a widget class.
     * @param {string} widgetName  widget name
     * @param {class} widgetClass widget class
     * @throws {Error} if a class is already registered for the specified widget name
     */
    registerWidgetClass(widgetName, widgetClass) {
        if (this.registry.get(widgetName)) {
            return;
        }
        this.registry.set(widgetName, widgetClass);
    }

    /**
     * Returns class of a registered widget
     * @param {string} widgetName widget name
     * @returns {class} widget class
     */
    getWidgetClass(widgetName) {
        return this.registry.get(widgetName);
    }

    /**
     * Returns names of all registered widgets.
     * @returns {string[]} widget names
     */
    getRegisteredWidgetNames() {
        return Array.from(this.registry.keys());
    }
}

const instance = new WidgetClassRegistry();

export default instance;

// Following is to maintain backward compatibility with SP-4.0.0, SP-4.1.0
/**
 * Checks whether given widget class extends from a deprecated version of @wso2-dashboards/widget class.
 * @param {class} widgetClass class to be checked
 * @returns {boolean} true if extend from a deprecated version of the Widget class, otherwise false
 * @private
 */
function extendsFromDeprecatedWidgetClassVersion(widgetClass) {
    return !Object.getPrototypeOf(widgetClass.prototype).version;
}

/**
 * Patches given widget class which extends from a deprecated version of @wso2-dashboards/widget class, to be
 * compatible with newer versions.
 * @param {class} widgetClass widget class to be patched
 * @private
 */
function patchWidgetClass(widgetClass) {
    const superWidgetClassPrototype = Object.getPrototypeOf(widgetClass.prototype);
    // Patch subscribe method.
    superWidgetClassPrototype.subscribe = function (listenerCallback, publisherId, context) {
        const self = this;
        if (!publisherId) {
            const publisherIds = self.props.configs.pubsub.publishers;
            if (publisherIds && Array.isArray(publisherIds)) {
                publisherIds.forEach(id => self.props.glEventHub.on(id, listenerCallback));
            }
        } else {
            self.props.glEventHub.on(publisherId, listenerCallback, context);
        }
    };
}

global.dashboard = {};
global.dashboard.registerWidget = function (widgetId, widgetObj) {
    console.warn(`[DEPRECATED] Widget '${widgetId}' uses deprecated function `
        + '\'window.dashboard.registerWidget(widgetId, widgetObj)\'. '
        + 'Instead please use \'Widget.registerWidgetClass(widgetName, widgetClass)\' function.');
    if (extendsFromDeprecatedWidgetClassVersion(widgetObj)) {
        console.warn(`[DEPRECATED] Widget '${widgetId}' extends from a deprecated version of the Widget `
            + '(@wso2-dashboards/widget) class. Please use the newest version.');
        patchWidgetClass(widgetObj);
    }
    instance.registerWidgetClass(widgetId, widgetObj);
};
