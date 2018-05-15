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
     * @param widgetName {string} widget name
     * @param widgetClass {class} widget class
     * @throws {Error} if a class is already registered for the specified widget name
     */
    registerWidgetClass(widgetName, widgetClass) {
        if (this.registry.get(widgetName)) {
            throw new Error(`Widget '${widgetName} is already registered.`);
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
global.dashboard = {};
global.dashboard.registerWidget = function (widgetId, widgetObj) {
    console.warn('[DEPRICATED] \'window.dashboard.registerWidget(widgetId, widgetObj)\' function is depricated. '
                 + 'Instead please use \'Widget.registerWidgetClass(widgetName, widgetClass)\' function.');
    if (_extendsFromDepricatedWidgetClassVersion(widgetId, widgetObj)) {
        console.warn('[DEPRICATED] \'@wso2-dashboards/widget@1.0.0\' is depricated. Please user a newer version.');
        _patchWidgetClass(widgetObj);
    }
    instance.registerWidgetClass(widgetId, widgetObj);
};

function _extendsFromDepricatedWidgetClassVersion(widgetName, widgetClass) {
    return !(widgetClass.prototype.__proto__).version;
}

function _patchWidgetClass(widgetClass) {
    let superWidgetClassPrototype = widgetClass.prototype.__proto__;
    superWidgetClassPrototype.subscribe = function (listenerCallback) {
        const self = this;
        let publisherIds = self.props.configs.pubsub.publishers;
        if (publisherIds && Array.isArray(publisherIds)) {
            publisherIds.forEach(publisherId => self.props.glEventHub.on(publisherId, listenerCallback));
        }
    };

}
