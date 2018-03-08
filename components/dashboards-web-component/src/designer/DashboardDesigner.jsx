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
import {Redirect, Link} from 'react-router-dom';
import _ from 'lodash';


// App Components
import {Header} from '../common';
import DashboardAPI from '../utils/apis/DashboardAPI';
import {widgetLoadingComponent, dashboardLayout} from '../utils/WidgetLoadingComponent';
import DashboardRenderingComponent from '../utils/DashboardRenderingComponent';
import DashboardUtils from '../utils/DashboardUtils';
import Error403 from '../error-pages/Error403';
import Error404 from '../error-pages/Error404';
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
import {HttpStatus} from "../utils/Constants";

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
        showPopoutIcon: false,
        showMaximiseIcon: true,
        responsive: true,
        responsiveMode: 'always',
        showCloseIcon: true,
    },
    dimensions: {
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
            leftSidebarOpen: true,
            leftSidebarPanel: sidebarPanels.WIDGETS,
            designerClass: 'designer-container-collapsed',
            redirect: false,
            redirectUrl: '',
            widgetConfigPanelOpen: false,
            publishers: [],
            hasPermission: true,
            hasDashboard: true,
            isSessionValid: true
        };
        this.loadDashboard = this.loadDashboard.bind(this);
        this.registerNotifier = this.registerNotifier.bind(this);
        this.updateDashboard = this.updateDashboard.bind(this);
        this.handleWidgetConfiguration = this.handleWidgetConfiguration.bind(this);
        this.updateDashboardByWidgetConfPanel = this.updateDashboardByWidgetConfPanel.bind(this);
        this.updatePageContent = this.updatePageContent.bind(this);
        this.getDashboard = this.getDashboard.bind(this);
        this.getPageId = this.getPageId.bind(this);
        this.changeParentState = this.changeParentState.bind(this);
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
        if (this.props.match.params[1]) {
            this.setState({
                leftSidebarOpen: true,
                leftSidebarPanel: sidebarPanels.PAGES
            });
        }
    }

    render() {
        console.log("render Invoked!");
        if (!this.state.isSessionValid) {
            return (
                <Redirect to={{pathname: `${window.contextPath}/logout`}}/>
            );
        }
        DashboardDesigner.loadTheme();
        let dashboardPageContent = DashboardDesigner.getDashboardContent(this.props.match.params[1],
            this.state.dashboard)[0];
        if (!this.state.hasPermission) {
            return <Error403/>;
        }
        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                <div className="dashboard-designer">
                    {this.state.redirect ? <Redirect to={this.state.redirectUrl}/> : ''}

                    <Header
                        title={<FormattedMessage id="dashboard.designer.title" defaultMessage="Dashboard Designer"/>}/>

                    {/* Portal navigation bar */}
                    <div className="navigation-bar">
                        <Link to={window.contextPath + '/'}>
                            <RaisedButton label={<FormattedMessage id="back.button" defaultMessage="Back"/>}
                                          icon={<BackIcon/>} style={{'margin-right': '12px'}}
                                          backgroundColor="rgb(13, 31, 39)" />
                        </Link>
                        <FlatButton label={<FormattedMessage id="save.page.button" defaultMessage="Save Page"/>}
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
                                              dashboard={this.state.dashboard}
                                              updateDashboardByWidgetConfPanel = {this.updateDashboardByWidgetConfPanel}
                                              getDashboard = {this.getDashboard}
                                              updateDashboard = {this.updateDashboard}
                                              updatePageContent = {this.updatePageContent}
                                              loadDashboard = {this.loadDashboard}
                                              getPageId = {this.getPageId}
                                              changeParentState = {this.changeParentState}
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

            function difference(object, base) {
                function changes(object, base) {
                    return _.transform(object, function(result, value, key) {
                        if (!_.isEqual(value, base[key])) {
                            result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
                        }
                    });
                }
                return changes(object, base);
            }

            var deepDiffMapper = function() {
                return {
                    VALUE_CREATED: 'created',
                    VALUE_UPDATED: 'updated',
                    VALUE_DELETED: 'deleted',
                    VALUE_UNCHANGED: 'unchanged',
                    map: function(obj1, obj2) {
                        if (this.isFunction(obj1) || this.isFunction(obj2)) {
                            throw 'Invalid argument. Function given, object expected.';
                        }
                        if (this.isValue(obj1) || this.isValue(obj2)) {
                            return {
                                type: this.compareValues(obj1, obj2),
                                data: (obj1 === undefined) ? obj2 : obj1
                            };
                        }

                        var diff = {};
                        for (var key in obj1) {
                            if (this.isFunction(obj1[key])) {
                                continue;
                            }

                            var value2 = undefined;
                            if ('undefined' != typeof(obj2[key])) {
                                value2 = obj2[key];
                            }

                            diff[key] = this.map(obj1[key], value2);
                        }
                        for (var key in obj2) {
                            if (this.isFunction(obj2[key]) || ('undefined' != typeof(diff[key]))) {
                                continue;
                            }

                            diff[key] = this.map(undefined, obj2[key]);
                        }

                        return diff;

                    },
                    compareValues: function(value1, value2) {
                        if (value1 === value2) {
                            return this.VALUE_UNCHANGED;
                        }
                        if (this.isDate(value1) && this.isDate(value2) && value1.getTime() === value2.getTime()) {
                            return this.VALUE_UNCHANGED;
                        }
                        if ('undefined' == typeof(value1)) {
                            return this.VALUE_CREATED;
                        }
                        if ('undefined' == typeof(value2)) {
                            return this.VALUE_DELETED;
                        }

                        return this.VALUE_UPDATED;
                    },
                    isFunction: function(obj) {
                        return {}.toString.apply(obj) === '[object Function]';
                    },
                    isArray: function(obj) {
                        return {}.toString.apply(obj) === '[object Array]';
                    },
                    isObject: function(obj) {
                        return {}.toString.apply(obj) === '[object Object]';
                    },
                    isDate: function(obj) {
                        return {}.toString.apply(obj) === '[object Date]';
                    },
                    isValue: function(obj) {
                        return !this.isObject(obj) && !this.isArray(obj);
                    }
                }
            }();

            let dashboard = this.getDashboard();
            let  dashboardCopy = JSON.parse(JSON.stringify(dashboard))
            console.log("####################################################")
            console.log("dashboardToSave",dashboard)
            console.log("####################################################")

            var optionsMap = new Object();

            /**
             * helper function to get the page from a given dashboard given the pageId
             * */
            function getPage(dashboard,pageID){
                let pages = dashboard.pages;
                if(pages){
                    for (let i = 0; i < pages.length; i++) {
                        let page = pages[i];
                        if(page.id === pageID ){
                            return page;
                        }
                    }
                }
                return null;
            }
            alert(pageId)
            let page = getPage(dashboard,pageId);
            function searchforWidgetsInAPage(page,OptionsMap){
                let obj = page;
                if(obj.type && obj.type === "component" && obj.props && obj.props.id){
                    console.log("Found :",obj.props.id);
                    let newObj = JSON.parse(JSON.stringify(obj))
                    OptionsMap[obj.props.id] = newObj.props.configs.options;
                }
                else if(obj.content){
                    for (let i = 0; i < obj.content.length ; i++) {
                        searchforWidgetsInAPage(obj.content[i],OptionsMap);
                    }

                }
                console.log(OptionsMap);
            }

            /**
             * helper function to replace Options
             * */
            function searchAndReplaceOptions(page,OptionsMap){
                let obj = page;
                if(obj.type && obj.type === "component" && obj.props && obj.props.id){
                    console.log("Found and Replaced:",obj.props.id);
                    obj.props.configs.options = OptionsMap[obj.props.id];
                }
                else if(obj.content){
                    for (let i = 0; i < obj.content.length ; i++) {
                        searchAndReplaceOptions(obj.content[i],OptionsMap);
                    }

                }
                console.log("InSearhandreplace",OptionsMap);
            }
            searchforWidgetsInAPage(page,optionsMap);
            alert("dashboardBeforeSaveBegin")
            alert(dashboard.pages[2].content["0"].content["0"].content["0"].props.configs.options[2].defaultData);
            let p = DashboardUtils.findDashboardPageById(dashboard, pageId);
            alert("dashboardAfterfindDashboardPageById()")
            alert(dashboard.pages[2].content["0"].content["0"].content["0"].props.configs.options[2].defaultData);

            p.content = dashboardLayout.toConfig().content;
            console.log("diff",difference(dashboardCopy,dashboard))
            var result = deepDiffMapper.map(dashboardCopy,dashboard)
            console.log(result);
            alert("dashboardAfterdashboardLayout.toConfig()")
            alert(dashboard.pages[2].content["0"].content["0"].content["0"].props.configs.options[2].defaultData);

            // dashboard = Object.assign(dashboard, dashboardCopy);
            // alert("dashboardAfterAssignment")
            // alert(dashboard.pages[2].content["0"].content["0"].content["0"].props.configs.options[2].defaultData);
            let newPage = getPage(dashboard,pageId);
            console.log("New Page",newPage);
            searchAndReplaceOptions(newPage,optionsMap)

            this.cleanDashboardJSON(dashboard.pages);
            alert("dashboardAftercleanDashboardJSON()")
            alert(dashboard.pages[2].content["0"].content["0"].content["0"].props.configs.options[2].defaultData);

            new DashboardAPI().updateDashboardByID(this.state.dashboard.id, dashboard);
            alert("dashboardAfterAPICall()")
            alert(dashboard.pages[2].content["0"].content["0"].content["0"].props.configs.options[2].defaultData);


            alert("theCopy")
            alert(dashboardCopy.pages[2].content["0"].content["0"].content["0"].props.configs.options[2].defaultData);

            window.global.notify(this.context.intl.formatMessage({
                id: "dashboard.update.success",
                defaultMessage: "Dashboard updated successfully!"
            }));
        } catch (e) {
            // Absorb the error since this doesn't relevant to the end-user.
        }
    }

    changeParentState(dashboard) {
        console.log("coming...",dashboard);
        alert("coming");
        alert(dashboard.pages[2].content["0"].content["0"].content["0"].props.configs.options[2].defaultData);
        this.state.dashboard = dashboard;
        console.log("after update...",this.state.dashboard);
        alert("after update");
        alert(this.state.dashboard.pages[2].content["0"].content["0"].content["0"].props.configs.options[2].defaultData);

    }

    cleanDashboardJSON(content) {
        if(!Array.isArray(content)) {
            delete content.reorderEnabled;
            if(content.hasOwnProperty('content')) {
                delete content.activeItemIndex;
                this.cleanDashboardJSON(content.content);
            } else {
                delete content.componentName;
                delete content.componentState;
                delete content.header;
            }
            if(content.hasOwnProperty('pages')) {
                this.cleanDashboardJSON(content.pages);
            }
        } else {
            content.forEach((item) => {
                this.cleanDashboardJSON(item);
            });
        }
    }

    /**
     * Load dashboard via the REST API.
     */
    loadDashboard() {
        new DashboardAPI("designer")
            .getDashboardByID(this.state.dashboardId)
            .then((response) => {
                let dashboard = response.data;
                dashboard.pages = JSON.parse(dashboard.pages);
                this.setState({
                    dashboard: dashboard
                });
            })
            .catch((err) => {
                if (err.response.status === HttpStatus.FORBIDDEN) {
                    this.setState({hasPermission: false});
                } else if (err.response.status === HttpStatus.NOTFOUND) {
                    this.setState({hasDashboard: false});
                } else if (err.response.status === HttpStatus.UNAUTHORIZED) {
                    this.setState({isSessionValid: false});
                }
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
        console.log('test1',dashboard);
        this.setState({
            dashboard: dashboard
        });
    }
    /**
     * To get the current dashboard state
     */
    getDashboard() {
        alert("getDashboard");
        alert(this.state.dashboard.pages[2].content["0"].content["0"].content["0"].props.configs.options[2].defaultData);
        console.log("getDashboardCalled",this.state.dashboard);
        return this.state.dashboard;
    }
    /**
     * To get the pageID of the current page at Designer view
     */
    getPageId() {
        let pageId = this.props.match.params[1];
        if (!pageId || pageId === '') {
            pageId = this.state.dashboard.landingPage;
        }
        return pageId;
    }
    /**
     * To reflect changes from WidgetConfigurationPanel on dashboard.
     * @param dashboard
     */
    updateDashboardByWidgetConfPanel(dashboard) {
        let state = this.state;
        state.dashboard = dashboard;
        this.setState(state);
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