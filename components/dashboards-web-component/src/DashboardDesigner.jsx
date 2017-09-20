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
import {Link} from 'react-router-dom';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import WidgetsIcon from 'material-ui/svg-icons/device/widgets';
import PagesIcon from 'material-ui/svg-icons/editor/insert-drive-file';
import Drawer from 'material-ui/Drawer';
import Snackbar from 'material-ui/Snackbar';

import Header from './Header';
import {widgetLoadingComponent, dashboardLayout} from './WidgetLoadingComponent';
import DashboardsAPIs from './utils/dashboard-apis';
import DashboardRenderingComponent from './DashboardRenderingComponent';
import DashboardUtils from './utils/dashboard-utils';
import WidgetsList from './WidgetsList';
import PagesPanel from './designer/components/PagesPanel';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back';
import '../public/css/designer.css';

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

const styleConstants = {
    actionPanel: {
        width: 58
    },
    sidebar: {
        styles: {
            width: '314px'
        },

    }
};

export default class DashboardDesigner extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            leftSidebarOpen: true,
            showPagesPanel: false,
            showWidgetsPanel: true,
            dashboard: {},
            dashboardUrl: '',
            dashboardName: '',
            dashboardContent: [],
            landingPage: '',
            designerClass: 'dashboard-designer-container-expanded'
        };
        this.onWidgetsIconClick = this.onWidgetsIconClick.bind(this);
        this.onPagesIconClick = this.onPagesIconClick.bind(this);
        this.setDashboardProperties = this.setDashboardProperties.bind(this);
        this.getDashboardContent = this.getDashboardContent.bind(this);
        this.loadTheme = this.loadTheme.bind(this);
        this.dashboardModifiedHandler = this.dashboardModifiedHandler.bind(this);
    }

    componentDidMount() {
        let dashboardsAPIs = new DashboardsAPIs();
        let promisedDashboard = dashboardsAPIs.getDashboardByID(this.props.match.params.id);
        promisedDashboard.then(this.setDashboardProperties).catch(function (error) {
            //TODO Need to use proper notification library to show the error
        });
        window.onresize = function () {
            dashboardLayout.updateSize();
        };

        // Register global method for notifications.
        window.global = window.global || {};
        window.global.notify = (function (m) {
            this.setState({
                notify: true,
                notificationMessage: m
            });
        }).bind(this);
    }

    render() {
        this.loadTheme();
        return (
            <div>
                <MuiThemeProvider muiTheme={muiTheme}>
                    <div>
                        <Header dashboardName="Dashboard Designer"/>
                        <div className="portal-navigation-bar">
                            <Link to={"/portal/"}>
                                <FloatingActionButton mini={true} className="navigation-icon">
                                    <BackIcon />
                                </FloatingActionButton>
                            </Link>
                        </div>
                        <div className="designer-left-action-panel">
                            <Menu width={styleConstants.actionPanel.width}>
                                <MenuItem primaryText="&nbsp;" leftIcon={<WidgetsIcon />}
                                          onClick={this.onWidgetsIconClick}/>
                                <MenuItem primaryText="&nbsp;" leftIcon={<PagesIcon />}
                                          onClick={this.onPagesIconClick}/>
                            </Menu>
                        </div>
                        <div className="designer-container">
                            <Drawer open={this.state.leftSidebarOpen} containerClassName="designer-left-pane"
                                    containerStyle={styleConstants.sidebar.styles}>
                                <PagesPanel show={this.state.showPagesPanel} dashboard={this.state.dashboard}/>
                                <WidgetsList show={this.state.showWidgetsPanel}/>
                            </Drawer>
                        </div>

                        <div id="dashboard-view" className={this.state.designerClass}></div>
                        <DashboardRenderingComponent onDashboardModified={this.dashboardModifiedHandler} config={config} name={this.state.dashboardContent} 
                                dashboardContent={this.getDashboardContent(this.props.match.params[1], this.state.dashboardContent, this.state.landingPage)}/>

                        <Snackbar open={this.state.notify} message={this.state.notificationMessage}
                                  autoHideDuration={4000}/>
                    </div>
                </MuiThemeProvider>
            </div>
        );
    }

    dashboardModifiedHandler(config) {
        var path = [];
        let urlParts = window.location.pathname.split('/');
        if (urlParts.length > 1) {
            // todo hierarchical support needs to be implemented
            return;
        }
        var pageToSave = undefined;
        if (urlParts.length === 0) {
            for(var i = 0; i < this.state.dashboard.pages.length; i++) {
                if (this.state.dashboard.pages[i].landingPage) {
                    pageToSave = this.state.dashboard.pages[i];
                    break;
                }
            }
        } else {
            for(var i = 0; i < this.state.dashboard.pages.length; i++) {
                if (this.state.dashboard.pages[i].id == path[0]) {
                    pageToSave = this.state.dashboard.pages[i];
                }
            }
        }
        if (pageToSave) {
            // page.content = this.formatGoldenLayoutConfig(config);
            // let dashboardsAPIs = new DashboardsAPIs();
            // dashboardsAPIs.updateDashboardByID(this.state.dashboard.id, this.state.dashboard);
        }
    }

    formatGoldenLayoutConfig(config) {
        return config;
    }

    setDashboardProperties(response) {
        let dashboard = response.data;
        dashboard.pages = JSON.parse(dashboard.pages);
        this.setState({
            dashboardName: dashboard.name,
            dashboardContent: dashboard.pages,
            dashboard: dashboard,
            landingPage: dashboard.landingPage
        });
    }

    onWidgetsIconClick() {
        let leftSidebarOpen = this.state.showPagesPanel ? true : !this.state.leftSidebarOpen;
        this.setState({
            leftSidebarOpen: leftSidebarOpen,
            showWidgetsPanel: true,
            showPagesPanel: false,
            designerClass: leftSidebarOpen ? "dashboard-designer-container-expanded" :
                "dashboard-designer-container-collapsed"
        });
        setTimeout(function () {
            dashboardLayout.updateSize();
        }, 10);
    }

    onPagesIconClick() {
        let leftSidebarOpen = this.state.showWidgetsPanel ? true : !this.state.leftSidebarOpen;
        this.setState({
            leftSidebarOpen: leftSidebarOpen,
            showPagesPanel: true,
            showWidgetsPanel: false,
            designerClass: leftSidebarOpen ? "dashboard-designer-container-expanded" :
                "dashboard-designer-container-collapsed"
        });
        setTimeout(function () {
            dashboardLayout.updateSize();
        }, 10);
    }

    getDashboardContent(pageId, dashboardContent, landingPage) {
        return new DashboardUtils().getDashboardByPageId(pageId, dashboardContent, landingPage);
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