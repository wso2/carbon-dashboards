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

import React from 'react';
import GoldenLayout from 'golden-layout';
import 'golden-layout/src/css/goldenlayout-base.css';
import '../public/css/dashboard.css';

let dashboardLayout = new GoldenLayout();
let registeredWidgetsCount = 0;
let widgets = new Map();
let widgetCount = 0;

class DashboardRenderingComponent extends React.Component {
    constructor(props) {
        super(props);
        this.renderDashboard = this.renderDashboard.bind(this);
        this.loadWidget = this.loadWidget.bind(this);
        this.findWidget = this.findWidget.bind(this);
        this.updateLayout = this.updateLayout.bind(this);
    }

    updateLayout() {
        dashboardLayout.updateSize();
    }

    render() {
        this.renderDashboard();
        return null;
    }

    shouldComponentUpdate(nextProps) {
        return JSON.stringify(this.props.dashboardContent) !== JSON.stringify(nextProps.dashboardContent); 
    }

    renderDashboard() {
        window.onresize = function () {
            dashboardLayout.updateSize();
        };

        let config = {
            settings: {
                hasHeaders: false,
                constrainDragToContainer: false,
                reorderEnabled: false,
                selectionEnabled: false,
                popoutWholeStack: false,
                blockedPopoutsThrowError: true,
                closePopoutsOnUnload: true,
                showPopoutIcon: false,
                showMaximiseIcon: false,
                responsive: true,
                isClosable: false,
                responsiveMode: 'always',
                showCloseIcon: false,
            },
            dimensions: {
                minItemWidth: 400,
            },
            isClosable: false,
            content: []
        };

        let widgetList = new Set();
        widgets = new Map();
        widgetCount = 0;
        registeredWidgetsCount = 0;
        this.findWidget(this.props.dashboardContent, widgetList);
        widgetCount = widgetList.size;
        config.content = this.props.dashboardContent;
        dashboardLayout.destroy();
        dashboardLayout = new GoldenLayout(config, document.getElementById('dashboard-view'));
        widgetList.forEach(widget => {
            widgetList.add(widget);
            this.loadWidget(widget)
        });
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

    findWidget(content, widgets) {
        content.forEach(contentItem => {
            if (!(contentItem.type === 'component')) {
                contentItem.title = "";
                this.findWidget(contentItem.content, widgets)

            } else {
                //TODO Need to get the header config from widget configuration file
                contentItem.header = {"show": true};
                contentItem.isClosable = false;
                contentItem.componentName = "lm-react-component";
                widgets.add(contentItem.component);
            }
        });
        return widgets;
    }
}

function registerWidget(widgetId, widgetObj) {
    if (!widgets.get(widgetId)) {
        widgets.set(widgetId, widgetObj);
        dashboardLayout.registerComponent(widgetId, widgets.get(widgetId));
        registeredWidgetsCount++;
        if (registeredWidgetsCount === widgetCount) {
            dashboardLayout.init();
        }
    }
}

global.dashboard = {};
global.dashboard.registerWidget = registerWidget;

export default DashboardRenderingComponent;