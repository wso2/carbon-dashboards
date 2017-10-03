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
            dashboardLayout.init();
        }
    }
}

class WidgetLoadingComponent {

    createGoldenLayoutInstance(config, container) {
        dashboardLayout = new GoldenLayout(config, container);
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
        let appContext = window.location.pathname.split("/")[1];
        let baseURL = window.location.origin;
        script.type = 'text/javascript';
        script.src = baseURL + "/" + appContext + "/public/extensions/widgets/" + widgetID + "/" + widgetID + ".js";
        head.appendChild(script);
    }

    createDragSource(widget, newItemConfig) {
        dashboardLayout.createDragSource(widget, newItemConfig);
    }

    setfinishedRegisteringCallback(callback) {
        finishedRegisteringCallback = callback;
    }

    callFinishedRegisteringCallback(){
        finishedRegisteringCallback ? finishedRegisteringCallback(true, true) : "";
    }

    initializeDashboard(){
        dashboardLayout.init();
    }
}

let widgetLoadingComponent = new WidgetLoadingComponent();

global.dashboard = {};
global.dashboard.registerWidget = registerWidget;

export {registeredWidgetsCount, widgets, widgetCount, widgetLoadingComponent, dashboardLayout};