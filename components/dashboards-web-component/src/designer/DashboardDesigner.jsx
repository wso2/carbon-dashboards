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

import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';
// App Components
import {Header} from '../common';
import DashboardAPI from '../utils/apis/DashboardAPI';
import {widgetLoadingComponent, dashboardLayout} from '../utils/WidgetLoadingComponent';
import DashboardRenderingComponent from '../utils/DashboardRenderingComponent';
import DashboardUtils from '../utils/DashboardUtils';
import WidgetsList from './components/WidgetsList';
import PagesPanel from './components/PagesPanel';
import WidgetConfigurationPanel from './components/WidgetConfigurationPanel';
// Material UI
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import WidgetsIcon from 'material-ui/svg-icons/device/widgets';
import PagesIcon from 'material-ui/svg-icons/editor/insert-drive-file';
import Drawer from 'material-ui/Drawer';
import Snackbar from 'material-ui/Snackbar';
import BackIcon from 'material-ui/svg-icons/navigation/arrow-back';
import SaveIcon from 'material-ui/svg-icons/content/save';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import PropTypes from 'prop-types';
//React Intl for Localization
import {FormattedMessage} from 'react-intl';
// CSS
import '../common/Global.css';
import './DashboardDesigner.css';

/**
 * Material-UI theme.
 */
const muiTheme = getMuiTheme(darkBaseTheme);

/**
 * Golden layout configurations.
 * @type {{*}}
 */
const config = {
    settings: {
        hasHeaders: true,
        constrainDragToContainer: true,
        reorderEnabled: true,
        selectionEnabled: true,
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
        headerHeight: 37
    },
    content: [],
};

/**
 * UI style constants.
 * @type {{actionBarWidth: number, sidebarWidth: string}}
 */
const styles = {
    actionBarWidth: 58,
    sidebarWidth: '314px'
};

/**
 * Sidebar panels.
 * @type {{PAGES: string, WIDGETS: string}}
 */
const sidebarPanels = {
    PAGES: 'PAGES',
    WIDGETS: 'WIDGETS'
};

export default class DashboardDesigner extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dashboardId: this.props.match.params.dashboardId,
            dashboard: undefined,
            leftSidebarOpen: false,
            leftSidebarPanel: sidebarPanels.PAGES,
            designerClass: 'designer-container-expanded',
            redirect: false,
            redirectUrl: '',
            widgetConfigPanelOpen: false,
            publishers: []
        };
        this.loadDashboard = this.loadDashboard.bind(this);
        this.registerNotifier = this.registerNotifier.bind(this);
        this.updateDashboard = this.updateDashboard.bind(this);
        this.handleWidgetConfiguration = this.handleWidgetConfiguration.bind(this);
        this.updatePageContent = this.updatePageContent.bind(this);
    }

    componentDidMount() {
        this.loadDashboard();
        this.registerNotifier();
        // Bind event handler for window resize
        window.onresize = function () {
            dashboardLayout.updateSize();
        };
    }

    componentWillMount() {
        widgetLoadingComponent.setfinishedRegisteringCallback();
    }

    render() {
        DashboardDesigner.loadTheme();
        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                <div className="dashboard-designer">
                    {this.state.redirect ? <Redirect to={this.state.redirectUrl}/> : ''}

                    <Header
                        title={<FormattedMessage id="dashboard.designer.title" defaultMessage="Dashboard Designer"/>}/>

                    {/* Portal navigation bar */}
                    <div className="navigation-bar">
                        <RaisedButton label={<FormattedMessage id="back.button" defaultMessage="Back"/>}
                                      icon={<BackIcon/>} style={{'margin-right': '12px'}}
                                      onClick={() => {
                                          window.location.href = window.contextPath + '/';
                                      }}
                                      backgroundColor="rgb(13, 31, 39)"/>
                        <FlatButton label={<FormattedMessage id="save.button" defaultMessage="Save"/>}
                                    primary
                                    icon={<SaveIcon/>}
                                    onClick={this.updatePageContent}/>
                    </div>

                    {/* Left action bar */}
                    <div className="left-action-bar">
                        <Menu width={styles.actionBarWidth} className="designer-left-menu">
                            <MenuItem primaryText="&nbsp;" leftIcon={<WidgetsIcon/>}
                                      onClick={this.toggleWidgetsPanel.bind(this)}/>
                            <MenuItem primaryText="&nbsp;" leftIcon={<PagesIcon/>}
                                      onClick={this.togglePagesPanel.bind(this)}/>
                        </Menu>
                    </div>

                    {/* Left sidebar */}
                    <div className="container">
                        <Drawer open={this.state.leftSidebarOpen} containerClassName="left-sidebar"
                                containerStyle={{
                                    width: styles.sidebarWidth,
                                    top: '106px',
                                    height: 'auto',
                                    bottom: '0',
                                    backgroundColor: '#24353f'
                                }}>
                            <PagesPanel dashboard={this.state.dashboard}
                                        onDashboardUpdated={(d) => this.updateDashboard(d)}
                                        onLandingPageChanged={(id) => this.landingPageChanged(id)}
                                        onPageSelected={(id, url) => this.pageNavigated(id, url)}
                                        visible={this.state.leftSidebarPanel === sidebarPanels.PAGES}/>
                            <WidgetsList visible={this.state.leftSidebarPanel === sidebarPanels.WIDGETS}/>
                        </Drawer>
                    </div>

                    {/* Dashboard renderer */}
                    <div id="dashboard-view" className={this.state.designerClass}/>
                    <DashboardRenderingComponent
                        config={config}
                        dashboardContent={DashboardDesigner.getDashboardContent(this.props.match.params[1], this.state.dashboard)}
                        onContentModified={this.updatePageContent.bind(this)}
                        handleWidgetConfiguration={this.handleWidgetConfiguration}
                        designer={true}
                    />

                    <WidgetConfigurationPanel publishers={this.state.publishers}
                                              open={this.state.widgetConfigPanelOpen}/>
                    {/* Notifier */}
                    <Snackbar
                        open={this.state.notify}
                        message={this.state.notificationMessage}
                        autoHideDuration={4000}/>
                </div>
            </MuiThemeProvider>
        );
    }


    handleWidgetConfiguration(event, isSameWidgetClicked) {
        this.setState({widgetConfigPanelOpen: !isSameWidgetClicked}, this.handleDashboardContainerStyles);
    }

    handleDashboardContainerStyles() {
        let dashboardViewClass;
        if (this.state.leftSidebarOpen && this.state.widgetConfigPanelOpen) {
            dashboardViewClass = "dashboard-designer-expanded-all";
        } else if (this.state.leftSidebarOpen) {
            dashboardViewClass = "designer-container-collapsed";
        } else if (this.state.widgetConfigPanelOpen) {
            dashboardViewClass = "dashboard-designer-container-collapsed-left"
        } else {
            dashboardViewClass = "designer-container-expanded";
        }

        this.setState({designerClass: dashboardViewClass});
        setTimeout(function () {
            dashboardLayout.updateSize();
        }, 10);
    }

    /**
     * Update content of the page.
     */
    updatePageContent() {
        try {
            let arr = (this.props.match.params[1] || '').split('/');
            let pageId;
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] !== '') {
                    pageId = arr[i];
                }
            }
            if (!pageId || pageId === '') {
                pageId = this.state.dashboard.landingPage;
            }

            let dashboard = this.state.dashboard;
            let p = DashboardUtils.findDashboardPageById(dashboard, pageId);
            p.content = dashboardLayout.toConfig().content;
            new DashboardAPI().updateDashboardByID(this.state.dashboard.id, dashboard);
            window.global.notify(this.context.intl.formatMessage({
                id: "dashboard.update.success",
                defaultMessage: "Dashboard updated successfully!"
            }));
        } catch (e) {
            // Absorb the error since this doesn't relevant to the end-user.
        }
    }

    /**
     * Load dashboard via the REST API.
     */
    loadDashboard() {
        new DashboardAPI()
            .getDashboardByID(this.state.dashboardId)
            .then((response) => {
                let dashboard = response.data;
                dashboard.pages = JSON.parse(dashboard.pages);
                this.setState({
                    dashboard: dashboard
                });
            })
            .catch((err) => {
                //TODO Need to use proper notification library to show the error
            });
    }

    /**
     * Return content of the dashboard page based on the pageId
     * @param pageId
     * @param dashboard
     * @returns {*}
     */
    static getDashboardContent(pageId, dashboard) {
        if (dashboard && dashboard.pages) {
            return new DashboardUtils().getDashboardByPageId(pageId, dashboard.pages, dashboard.landingPage);
        }
        return {};
    }

    /**
     * Register global notification method.
     */
    registerNotifier() {
        // TODO use React context if possible to pass the notifier
        window.global = window.global || {};
        window.global.notify = (function (m) {
            this.setState({
                notify: true,
                notificationMessage: m
            });
        }).bind(this);
    }

    /**
     * Toggle widgets panel.
     */
    toggleWidgetsPanel() {
        let leftSidebarOpen = this.state.leftSidebarPanel === sidebarPanels.PAGES ? true : !this.state.leftSidebarOpen;
        this.setState({
            leftSidebarOpen: leftSidebarOpen,
            leftSidebarPanel: sidebarPanels.WIDGETS
        }, this.handleDashboardContainerStyles);
    }

    /**
     * Toggle pages panel.
     */
    togglePagesPanel() {
        let leftSidebarOpen = this.state.leftSidebarPanel === sidebarPanels.WIDGETS ? true : !this.state.leftSidebarOpen;
        this.setState({
            leftSidebarOpen: leftSidebarOpen,
            leftSidebarPanel: sidebarPanels.PAGES
        }, this.handleDashboardContainerStyles);
    }

    /**
     * Save dashboard.
     * @param dashboard
     */
    updateDashboard(dashboard) {
        new DashboardAPI().updateDashboardByID(dashboard.id, dashboard);
        window.global.notify(this.context.intl.formatMessage({
            id: "dashboard.update.success",
            defaultMessage: "Dashboard updated successfully!"
        }));
        this.setState({
            dashboard: dashboard
        });
    }

    /**
     * Handles landing page changed event.
     * @param id
     */
    landingPageChanged(id) {
        let dashboard = this.state.dashboard;
        dashboard.landingPage = id;
        this.updateDashboard(dashboard);
    }

    /**
     * Load GoldenLayout theme.
     */
    static loadTheme() {
        let appContext = window.contextPath;
        let baseURL = window.location.origin;

        let head = document.getElementsByTagName('head')[0];
        let link = document.createElement('link');
        link.type = 'text/css';
        link.href = baseURL + appContext + "/public/themes/dark/css/custom-goldenlayout-dark-theme.css";
        link.rel = "stylesheet";
        head.appendChild(link);
    }

    pageNavigated(id, url) {
        this.setState({
            redirectUrl: window.contextPath + '/designer/' + this.state.dashboardId + '/' + url,
            redirect: true
        });
    }
}

DashboardDesigner.contextTypes = {
    intl: PropTypes.object.isRequired
};