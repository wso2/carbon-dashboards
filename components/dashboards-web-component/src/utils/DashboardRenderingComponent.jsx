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
import 'golden-layout/src/css/goldenlayout-base.css';

import {widgetLoadingComponent} from './WidgetLoadingComponent';
import {pubsubComponent} from './PubSubComponent';

let dashboardLayout = widgetLoadingComponent.createGoldenLayoutInstance();

class DashboardRenderingComponent extends React.Component {
    constructor(props) {
        super(props);
        this.renderDashboard = this.renderDashboard.bind(this);
        this.findWidget = this.findWidget.bind(this);
        this.updateLayout = this.updateLayout.bind(this);
        this.wirePubSubWidgets = this.wirePubSubWidgets.bind(this);
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
            document.getElementById('dashboard-view'), this.props.onContentModified);
        let that = this;
        dashboardLayout.on("initialised", function () {
            that.wirePubSubWidgets(dashboardLayout.toConfig().content);
            if (that.props.onInitialized) {
                that.props.onInitialized();
            }
        });

        if (this.props.designer) {
            this.handleWidgetConfigurationButton();
        }
        if (widgetList.size === 0) {
            widgetLoadingComponent.callFinishedRegisteringCallback();
        }
        widgetList.forEach(widget => {
            widgetList.add(widget);
            widgetLoadingComponent.loadWidget(widget);
        });
    }

    handleWidgetConfigurationButton() {
        let that = this;
        dashboardLayout.on("itemDropped", function (item) {
            that.isSubscriber(item.config) ? "" : item.parent.header.controlsContainer.children()[0].remove();
        });
        dashboardLayout.on("itemCreated", function (item) {
            if (item.isComponent && item.parent) {
                item.parent.header.controlsContainer.children()[3].style.display = "list-item";
                that.isSubscriber(item.config) ? "" : item.parent.header.controlsContainer.children()[0].remove();
            }
            else if (item.header) {
                let element = document.createElement("i");
                element.className = "fw fw-configarations widget-configuration-button";
                let selectedWidget = item;
                element.addEventListener("click", function (event) {
                    let isSameWidgetClicked = selectedWidget.layoutManager.selectedItem === selectedWidget;
                    if (isSameWidgetClicked) {
                        selectedWidget.header.element[0].classList.remove("widget-title-bar-selected")
                        selectedWidget.deselect();
                    } else {
                        selectedWidget.header.element[0].classList.add("widget-title-bar-selected")
                        selectedWidget.select();
                    }
                    that.props.handleWidgetConfiguration(event, isSameWidgetClicked);
                });
                item.header.controlsContainer.prepend(element);
            }
        });
    }

    isSubscriber(widgetInfo) {
        let widgetConfig = widgetInfo.props.configs;
        return (widgetConfig && widgetConfig.pubsub && widgetConfig.pubsub.types &&
            widgetConfig.pubsub.types.indexOf("subscriber") != -1);
    }


    wirePubSubWidgets(content) {
        content.forEach(contentItem => {
            if (!(contentItem.type === 'component')) {
                this.wirePubSubWidgets(contentItem.content)
            } else {
                let widgetConfigs = contentItem.props.configs;
                if (widgetConfigs) {
                    let pubsubTypes = widgetConfigs.pubsub ? widgetConfigs.pubsub.types : [];
                    pubsubTypes = pubsubTypes ? pubsubTypes : [];
                    pubsubTypes.map(type => {
                        if (type === "publisher") {
                            pubsubComponent.addPublisherToMap(contentItem.component + "_"
                                + contentItem.props.id.substring(0, 3), {
                                id: contentItem.props.id, widgetOutputs: widgetConfigs.pubsub.publisherWidgetOutputs});
                        } else if (type === "subscriber" &&
                            widgetConfigs.pubsub && widgetConfigs.pubsub.widgetInputOutputMapping) {
                            widgetConfigs.pubsub.publishers.map(publisher => {
                                pubsubComponent.wire(contentItem.props.id + "_" + publisher, publisher);
                            });
                        }
                    });
                }
            }
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