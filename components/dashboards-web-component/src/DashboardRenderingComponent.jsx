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

import './WidgetLoadingComponent';
import {widgetLoadingComponent} from './WidgetLoadingComponent';

import 'golden-layout/src/css/goldenlayout-base.css';
import '../public/css/dashboard.css';

let dashboardLayout = widgetLoadingComponent.createGoldenLayoutInstance();

class DashboardRenderingComponent extends React.Component {
    constructor(props) {
        super(props);
        this.renderDashboard = this.renderDashboard.bind(this);
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
        let widgetList = new Set();
        widgetLoadingComponent.setWidgetsMap(new Map());
        widgetLoadingComponent.setWidgetCount(0);
        widgetLoadingComponent.setRegisteredWidgetsCount(0);
        let config = this.props.config;
        config.content = this.props.dashboardContent;
        if (this.props.dashboardContent[0]) {
            this.findWidget(this.props.dashboardContent, widgetList);
        } else {
            config.content = [];
        }
        widgetLoadingComponent.setWidgetCount(widgetList.size);
        dashboardLayout.destroy();
        dashboardLayout = widgetLoadingComponent.createGoldenLayoutInstance(config,
            document.getElementById('dashboard-view'));
        if (widgetList.size === 0) {
            widgetLoadingComponent.callFinishedRegisteringCallback();
        }
        widgetList.forEach(widget => {
            widgetList.add(widget);
            widgetLoadingComponent.loadWidget(widget)
        });
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

export default DashboardRenderingComponent;