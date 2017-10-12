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
import WidgetInfoAPIS from '../../utils/apis/WidgetInfoAPIs';
import {dashboardLayout, widgetLoadingComponent} from '../../utils/WidgetLoadingComponent';
import WidgetListThumbnail from './WidgetListThumbnail';
import {pubsubComponent} from '../../utils/PubSubComponent';
// Material-UI
import TextField from 'material-ui/TextField';
import Divider from 'material-ui/Divider';

let widgets = [];
let isDashboardLoaded = false;
let widgetListDragSources = new Map();

export default  class WidgetsList extends React.Component {
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
        let widgetInfoAPIS = new WidgetInfoAPIS();
        let promisedWidgetInfo = widgetInfoAPIS.getWidgetsInfo();
        promisedWidgetInfo.then(this.setWidgets).catch(function (error) {
            //TODO Need to use proper notification library to show the error
        });
        widgetLoadingComponent.setfinishedRegisteringCallback(this.initializeWidgetList);
    }

    setWidgets(response) {
        widgets = response.data;
        this.setState({
            widgets: widgets,
            filteredWidgetSet: new Set(widgets.map((widget) => {
                return widget.name
            }))
        }, this.initializeWidgetList);
    }

    initializeWidgetList(isWidgetsLoaded, initDashboardFlag) {
        let newItemConfig;
        var generateguid = function () {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }

            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        };

        if (isWidgetsLoaded) {
            isDashboardLoaded = true;
        }
        if (!(widgets.length === 0) && isDashboardLoaded) {
            widgets.map(widget => {
                newItemConfig = {
                    title: widget.name,
                    type: 'react-component',
                    component: widget.name,
                    props: {id: generateguid(), configs: widget.configs}
                };
                widgetListDragSources.set(widget.name, widgetLoadingComponent.createDragSource(document.getElementById(widget.name), newItemConfig));
                widgetLoadingComponent.loadWidget(widget.name);
            });
            if (initDashboardFlag) {
                widgetLoadingComponent.initializeDashboard();
            }
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
                            props: {id: generateguid(), configs: item.config.props.configs}
                        };

                        pubsubComponent.addWidgetToPublishersList(item.config);
                        let position = dashboardLayout._dragSources.indexOf(widgetListDragSources.get(item.config.component));
                        dashboardLayout._dragSources.splice(position, 1);
                        widgetListDragSources.get(item.config.component)._dragListener.destroy();
                        widgetListDragSources.set(item.config.component,
                            widgetLoadingComponent.createDragSource(document.getElementById(item.config.component), newItemConfig));
                    }
                });
            });
        }
    }


    render() {
        return (
            <div style={this.getPanelStyles(this.props.visible)}>
                <h3>Widgets</h3>
                <div className="widget-search-div">
                    <TextField className="widget-search-textfield" onChange={this.searchWidget} hintText="Search.."/>
                </div>
                <Divider/>
                {
                    this.state.widgets.map(widget => {
                        return <WidgetListThumbnail widgetID={widget.name} isDisplayed={this.isDisplayed(widget.name)}
                                                    data={this.state.widgetList} widgetName={widget.name}/>;
                    })
                }
                <Divider/>
                {
                    this.state.filteredWidgetSet.size === 0 ?
                        <div className="no-widgets-text">No widgets found !</div> : ""
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