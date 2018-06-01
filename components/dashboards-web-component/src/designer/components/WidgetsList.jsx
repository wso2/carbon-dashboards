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
//Components
import WidgetAPI from '../../utils/apis/WidgetAPI';
import {dashboardLayout, widgetLoadingComponent} from '../../utils/WidgetLoadingComponent';
import WidgetListThumbnail from './WidgetListThumbnail';
import {pubsubComponent} from '../../utils/PubSubComponent';
import DashboardUtils from '../../utils/DashboardUtils';
// Material-UI
import TextField from 'material-ui/TextField';
import Divider from 'material-ui/Divider';

import {FormattedMessage} from 'react-intl';

let widgets = [];
let isDashboardLoaded = false;
let widgetListDragSources = new Map();
let isPreviouslyInitialized = false;
let universalWidgetList = global.dashboard.universalWidgetList = [];

/**
 * @deprecated
 */
export default class WidgetsList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            widgets: [],
            widgetList: "",
            filteredWidgetSet: new Set(this.props.widgetList)
        };
        this.searchWidget = this.searchWidget.bind(this);
        this.isDisplayed = this.isDisplayed.bind(this);
        this.setWidgets = this.setWidgets.bind(this);
        isDashboardLoaded = false;
    }

    searchWidget(event, value) {
        let filteredWidgetList = this.state.widgets.filter(function (widget) {
            return widget.name.toLowerCase().includes(value.toLowerCase());
        });
        this.state.filteredWidgetSet = new Set(filteredWidgetList.map((widget) => {
            return widget.name
        }));
        this.setState({widgetList: filteredWidgetList});
    }

    isDisplayed(widgetId) {
        if (this.state.filteredWidgetSet.has(widgetId)) {
            return "block";
        } else {
            return "none";
        }
    }

    componentDidMount() {
        let widgetAPI = new WidgetAPI();
        let promisedWidgetInfo = widgetAPI.getWidgetsInfo();
        promisedWidgetInfo.then(this.setWidgets).catch(function (error) {
            //TODO Need to use proper notification library to show the error
        });
        widgetLoadingComponent.setfinishedRegisteringCallback(this.initializeWidgetList);
    }

    setWidgets(response) {
        widgets = response.data;
        widgets.sort(function (a, b) {
            return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
        });
        this.setState({
            widgets: widgets,
            filteredWidgetSet: new Set(widgets.map((widget) => {
                return widget.name
            }))
        }, this.initializeWidgetList);
    }

    initializeWidgetList(isWidgetsLoaded, initDashboardFlag) {
        if (initDashboardFlag) {
            isPreviouslyInitialized = true;
        }

        let newItemConfig;

        let isItemCreated = false;
        dashboardLayout.on("initialised", function () {
            isItemCreated = false;
            dashboardLayout.on("componentCreated", function () {
                isItemCreated = true;
            });

            dashboardLayout.on("itemDropped", function (item) {
                if (item.isComponent && isItemCreated) {
                    isItemCreated = false;
                    newItemConfig = {
                        title: item.config.component,
                        type: 'react-component',
                        component: item.config.component,
                        props: {
                            id: DashboardUtils.generateguid(),
                            configs: item.config.props.configs,
                            widgetID: item.config.props.widgetID
                        }
                    };

                    pubsubComponent.isPublisher(item.config) ? pubsubComponent.addPublisherToMap(item.config.component
                        + "_" + item.config.props.id.substring(0, 3), item.config.props.id) : "";
                    let position = dashboardLayout._dragSources.indexOf(widgetListDragSources.get(item.config.component));
                    dashboardLayout._dragSources.splice(position, 1);
                    widgetListDragSources.get(item.config.component)._dragListener.destroy();
                    widgetListDragSources.set(item.config.component,
                        widgetLoadingComponent.createDragSource(document.getElementById(item.config.component),
                            newItemConfig));
                }
            });
        });

        if (isWidgetsLoaded) {
            isDashboardLoaded = true;
        }
        if (!(widgets.length === 0) && isDashboardLoaded) {
            widgets.map(widget => {
                newItemConfig = {
                    title: widget.name,
                    type: 'react-component',
                    component: widget.configs.isGenerated ? "UniversalWidget" : widget.id,
                    props: {id: DashboardUtils.generateguid(), configs: widget.configs, widgetID: widget.id}
                };
                widgetListDragSources.set(widget.id, widgetLoadingComponent.createDragSource(document.getElementById(widget.id), newItemConfig));
                if (widget.configs.isGenerated) {
                    universalWidgetList.push(widget.id);
                    widgetLoadingComponent.loadWidget("UniversalWidget");
                } else {
                    widgetLoadingComponent.loadWidget(widget.id);
                }
            });
            if (initDashboardFlag || isPreviouslyInitialized) {
                widgetLoadingComponent.initializeDashboard();
                isPreviouslyInitialized = false;
            }
        }
    }


    render() {
        return (
            <div style={this.getPanelStyles(this.props.visible)}>
                <h3><FormattedMessage id="widgets.heading" defaultMessage="Widgets"/></h3>
                <div className="widget-search-div">
                    <TextField className="widget-search-textfield" onChange={this.searchWidget}
                               hintText={<FormattedMessage id="search.hint.text" defaultMessage="Search..."/>}/>
                </div>
                <Divider/>
                {
                    this.state.widgets.map(widget => {
                        if (widget.id !== 'UniversalWidget') {
                            return <WidgetListThumbnail
                                widgetID={widget.id}
                                isDisplayed={this.isDisplayed(widget.name)}
                                data={this.state.widgetList}
                                widgetName={widget.name}
                            />;
                        }
                    })
                }
                <Divider/>
                {
                    this.state.filteredWidgetSet.size === 0 ?
                        <div className="no-widgets-text"><FormattedMessage id="no.widgets.found"
                                                                           defaultMessage="No Widgets Found"/>
                        </div> : ""
                }
            </div>);
    }

    /**
     * Get styles of the panel div.
     * @param visible
     * @returns {*}
     */
    getPanelStyles(visible) {
        return visible ? {} : {display: 'none'};
    }
}
