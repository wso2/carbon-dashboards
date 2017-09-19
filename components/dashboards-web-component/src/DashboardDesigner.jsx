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
 */

import React from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Drawer from 'material-ui/Drawer';
import WidgetIcon from 'material-ui/svg-icons/device/widgets';
import List from 'material-ui/List/';
import ListItem from 'material-ui/List/ListItem';

import Header from './Header';
import WidgetsList from './WidgetsList';
import {widgetLoadingComponent, dashboardLayout} from './WidgetLoadingComponent';
import DashboardRenderingComponent from './DashboardRenderingComponent';
import DashboardUtils from './utils/dashboard-utils';
import DashboardsAPIs from './utils/dashboard-apis';
import WidgetInfoAPIS from './utils/widget-info-apis';

const muiTheme = getMuiTheme(darkBaseTheme);

const config = {
    settings: {
        hasHeaders: true,
        constrainDragToContainer: true,
        reorderEnabled: true,
        selectionEnabled: false,
        popoutWholeStack: false,
        blockedPopoutsThrowError: true,
        closePopoutsOnUnload: true,
        showPopoutIcon: true,
        showMaximiseIcon: true,
        responsive: true,
        responsiveMode: 'always',
        showCloseIcon: true,
    },
    dimensions: {
        minItemWidth: 400,
        minItemHeight: 400,
    },
    content: [],
};

let widgetList = [];
let isDashboardLoaded = false;

class DashboardDesigner extends React.Component {
    constructor() {
        super();
        this.loadTheme = this.loadTheme.bind(this);
        this.toggleWidgetList = this.toggleWidgetList.bind(this);
        this.state = {
            widgetListToggled: true,
            designerClass: "dashboard-designer-container-expanded",
            dashboardContent: [],
            widgetList: []
        };
        this.getDashboardContent = this.getDashboardContent.bind(this);
        this.setDashboardProperties = this.setDashboardProperties.bind(this);
        this.initializeWidgetList = this.initializeWidgetList.bind(this);
        this.setWidgetList = this.setWidgetList.bind(this);
    }

    render() {
        this.loadTheme();
        return (<MuiThemeProvider muiTheme={muiTheme}>
            <div>
                <Header dashboardName="Dashboard Designer"></Header>
                <Drawer width={50} open={true} containerClassName="designer-left-panel-list">
                    <List className="designer-left-panel-list-comp">
                        <ListItem className="designer-list-item"
                                  isKeyboardFocused={this.state.widgetListToggled}
                                  onClick={this.toggleWidgetList}
                                  leftIcon={<WidgetIcon color="white"/>}></ListItem></List>
                </Drawer>
                <WidgetsList widgetList={this.state.widgetList}
                             widgetListToggled={this.state.widgetListToggled}></WidgetsList>
                <div id="dashboard-view" className={this.state.designerClass}></div>
                <DashboardRenderingComponent config={config} name={this.state.dashboardContent}
                                             dashboardContent={this.getDashboardContent(this.props.match.params[1],
                                                 this.state.dashboardContent, this.state.landingPage)}/>
            </div>
        </MuiThemeProvider>);
    }

    toggleWidgetList(event) {
        this.setState({
            widgetListToggled: !this.state.widgetListToggled,
            designerClass: this.state.widgetListToggled ?
                "dashboard-designer-container-collapsed" : "dashboard-designer-container-expanded"
        });

        setTimeout(function () {
            dashboardLayout.updateSize();
        }, 100);
    }

    componentDidMount() {
        let dashboardsAPis = new DashboardsAPIs();
        let promisedDashboard = dashboardsAPis.getDashboardByID(this.props.match.params.id);
        promisedDashboard.then(this.setDashboardProperties).catch(function (error) {
            //TODO Need to use proper notification library to show the error
        });
        window.onresize = function () {
            dashboardLayout.updateSize();
        };

        let widgetInfoAPIS = new WidgetInfoAPIS();
        let promisedWidgetInfo = widgetInfoAPIS.getWidgetsInfo();
        promisedWidgetInfo.then(this.setWidgetList).catch(function (error) {
            //TODO Need to use proper notification library to show the error
        });
        widgetLoadingComponent.setfinishedRegisteringCallback(this.initializeWidgetList);
    }

    setWidgetList(response) {
        widgetList = response.data;
        this.setState({
            widgetList: response.data
        }, this.initializeWidgetList);
    }


    initializeWidgetList(isWidgetsLoaded) {
        let newItemConfig;
        if (isWidgetsLoaded) {
            isDashboardLoaded = isWidgetsLoaded;
        }
        if (!(widgetList.length === 0) && isDashboardLoaded) {
            widgetList.map(widget => {
                newItemConfig = {
                    title: widget.name,
                    type: 'react-component',
                    component: widget.name
                };
                widgetLoadingComponent.createDragSource(document.getElementById(widget.name), newItemConfig);
                widgetLoadingComponent.loadWidget(widget.name)
            });
            if (!isWidgetsLoaded) {
                widgetLoadingComponent.initializeDashboard();
            }
        }
    }

    getDashboardContent(pageId, dashboardContent, landingPage) {
        return new DashboardUtils().getDashboardByPageId(pageId, dashboardContent, landingPage);
    }

    setDashboardProperties(response) {
        this.setState({
            dashboardName: response.data.name,
            dashboardContent: (JSON.parse(response.data.pages)),
            landingPage: response.data.landingPage
        });
    }

    loadTheme() {
        let head = document.getElementsByTagName('head')[0];
        let link = document.createElement('link');
        //TODO Need to get the app context properly when the server is ready
        let appContext = window.location.pathname.split("/")[1];
        let baseURL = window.location.origin;
        link.type = 'text/css';
        link.href = baseURL + "/" + appContext + "/public/themes/light/css/goldenlayout-light-theme.css";
        link.rel = "stylesheet";
        head.appendChild(link);
    }
}

export default DashboardDesigner;