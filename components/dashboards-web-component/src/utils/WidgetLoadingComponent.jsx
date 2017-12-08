/*
 *  Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */

import GoldenLayout from 'golden-layout';

let dashboardLayout = new GoldenLayout();
let registeredWidgetsCount = 0;
let widgets = new Map();
let widgetCount = 0;
let finishedRegisteringCallback;

function registerWidget(widgetId, widgetObj) {

    if (!widgets.get(widgetId)) {
        widgets.set(widgetId, widgetObj);
        dashboardLayout.registerComponent(widgetId, widgets.get(widgetId));
        registeredWidgetsCount++;
        if (registeredWidgetsCount === widgetCount) {
            finishedRegisteringCallback ? finishedRegisteringCallback(true) : "";
            global.dashboard.universalWidgetList.map(universalWidget => {
                if (widgets.get("UniversalGadget")) {
                    dashboardLayout.registerComponent(universalWidget, widgets.get("UniversalGadget"));
                }
            });
            dashboardLayout.init();
        }
    }
}

function getWidget(widgetId) {
    return widgets.get(widgetId);
}

class WidgetLoadingComponent {

    createGoldenLayoutInstance(config, container, onModified) {
        dashboardLayout = new GoldenLayout(config, container);
        // TODO identify an event which invokes when a component gets manipulated
        return dashboardLayout;
    }

    setRegisteredWidgetsCount(registeredWidgets) {
        registeredWidgetsCount = registeredWidgets;
    }

    setWidgetsMap(widgetsMap) {
        widgets = widgetsMap;
    }

    setWidgetCount(widgetsCount) {
        widgetCount = widgetsCount;
    }

    loadWidget(widgetID) {
        let head = document.getElementsByTagName('head')[0];
        let script = document.createElement('script');
        //TODO Need to get the app context properly when the server is ready
        let appContext = window.contextPath;
        let baseURL = window.location.origin;
        script.type = 'text/javascript';
        script.src = baseURL + appContext + "/public/extensions/widgets/" + widgetID + "/" + widgetID + ".js";
        head.appendChild(script);
    }

    createDragSource(widget, newItemConfig) {
        return dashboardLayout.createDragSource(widget, newItemConfig);
    }

    setfinishedRegisteringCallback(callback) {
        finishedRegisteringCallback = callback;
    }

    callFinishedRegisteringCallback() {
        finishedRegisteringCallback ? finishedRegisteringCallback(true, true) : "";
    }

    initializeDashboard() {
        dashboardLayout.init();
    }

    getWidgetMap() {
        return widgets;
    }

    registerComponent(name,object){
        dashboardLayout.registerComponent(name,object);
    }
}

let widgetLoadingComponent = new WidgetLoadingComponent();

global.dashboard = {};
global.dashboard.registerWidget = registerWidget;
global.dashboard.getWidget = getWidget;
global.dashboard.pubsubMap = new Map();

export {registeredWidgetsCount, widgets, widgetCount, widgetLoadingComponent, dashboardLayout};