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

import { getMuiTheme, MuiThemeProvider, darkBaseTheme } from 'material-ui/styles';
import CircularProgress from 'material-ui/CircularProgress';
import { AppBar, Drawer, FlatButton, IconButton, IconMenu, MenuItem } from 'material-ui';
import ActionHome from 'material-ui/svg-icons/action/home';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import DashboardRenderingComponent from '../utils/DashboardRenderingComponent';
import Sidebar from './components/Sidebar';
import DashboardAPI from '../utils/apis/DashboardAPI';
import DashboardUtils from '../utils/DashboardUtils';
import AuthManager from '../auth/utils/AuthManager';
import Error404 from '../error-pages/Error404';
import './Dashboard.css';

const darkMuiTheme = getMuiTheme({
    "palette": {
        "primary1Color": "#24353f",
        "textColor": "#bbb",
        "alternateTextColor": "#bbb"
    },
    "drawer": {
        "color": "#17262e",
    }
});

const lightMuiTheme = getMuiTheme({
    "palette": {
        "primary1Color": "#f1f1f1",
        "textColor": "#1d3644",
        "alternateTextColor": "#1d3644"
    },
    "drawer": {
        "color": "#d4d4d4",
    }
});

let config = {
    settings: {
        hasHeaders: true,
        constrainDragToContainer: false,
        reorderEnabled: false,
        selectionEnabled: false,
        popoutWholeStack: false,
        blockedPopoutsThrowError: true,
        closePopoutsOnUnload: true,
        showPopoutIcon: false,
        showMaximiseIcon: true,
        responsive: true,
        isClosable: false,
        responsiveMode: 'always',
        showCloseIcon: false,
    },
    dimensions: {
        headerHeight: 37
    },
    isClosable: false,
    content: []
};

class DashboardView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageId: this.props.match.params.pageId,
            toggled: "toggled",
            dashboardViewCSS: "dashboard-view",
            dashboardContent: [],
            open: true,
            contentClass: "content-drawer-opened",
            isDark: false,
            muiTheme: darkMuiTheme,
            requestHideLoading: false,
            invalidURL: false,
        };
        this.togglePagesNavPanel = this.togglePagesNavPanel.bind(this);
        this.setDashboardProperties = this.setDashboardProperties.bind(this);
        this.handleToggle = this.handleToggle.bind(this);
        this.handleTheme = this.handleTheme.bind(this);
    }

    handleToggle() {
        this.setState({
            open: !this.state.open,
            contentClass: this.state.open ? "content-drawer-closed" : "content-drawer-opened"
        });
        var that = this;
        setTimeout(function () {
            that.dashboardRenderingComponent.updateLayout();
        }, 100);
    }

    componentDidMount() {
        let dashboardAPI = new DashboardAPI();

        dashboardAPI.getDashboardList().then((response) => {
            if (response.data.filter((d) => d.url === this.props.match.params.id).length > 0) {
                let promised_dashboard = dashboardAPI.getDashboardByID(this.props.match.params.id);
                promised_dashboard.then(this.setDashboardProperties).catch(function (error) {
                    //TODO Need to use proper notification library to show the error
                });
            } else {
                this.setState({invalidURL: true, requestHideLoading:true})
            }
        });
    }

    setDashboardProperties(response) {
        const dashboard = response.data;
        dashboard.pages = JSON.parse(dashboard.pages);
        this.setState({
            dashboard,
            dashboardName: dashboard.name,
            dashboardContent: dashboard.pages,
            landingPage: dashboard.landingPage,
        });
    }

    togglePagesNavPanel(toggled) {
        if (toggled) {
            this.setState({ toggled: "toggled", dashboardViewCSS: "dashboard-view" });
        } else {
            this.setState({ toggled: "", dashboardViewCSS: "dashboard-view-full-width" });
        }
    }

    handleTheme(isDark) {
        this.setState({
            muiTheme: isDark ? getMuiTheme(darkMuiTheme) : getMuiTheme(lightMuiTheme),
            isDark,
        });
    }

    /**
     * Render right side header links.
     *
     * @returns {XML} HTML content
     */
    renderRightLinks() {
        // If the user is not set show the login button. Else show account information.
        const user = AuthManager.getUser();
        if (!user) {
            return <span />
        }

        return (
            <div className="viewer-header-right-btn-group">
                <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
                    <Link to={`${window.contextPath}/`}>
                        <IconButton
                            tooltip={<FormattedMessage id="viewer.back.tooltip" defaultMessage="Back to Home" />}>
                            <ActionHome />
                        </IconButton>
                    </Link>
                    <span>{user.username}</span>
                    <IconMenu
                        iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
                        targetOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
                    >
                        <MenuItem
                            primaryText={<FormattedMessage id="logout" defaultMessage="Logout" />}
                            containerElement={<Link to={`${window.contextPath}/logout`} />}
                        />
                    </IconMenu>
                </MuiThemeProvider>
            </div>
        );
    }

    render() {
        let showLoading = true;
        if (this.state.requestHideLoading) {
            showLoading = false;
            this.state.requestHideLoading = false;
        }

        const themeClass = this.state.isDark ? 'viewer-dark' : 'viewer-light';
        const dashboard = this.state.dashboard || {
            name: '',
            pages: [],
            landingPage: '',
        };

        return (
            <MuiThemeProvider muiTheme={this.state.muiTheme}>
                {
                    this.state.invalidURL ?
                        <Error404 />:
                        <div>
                            <Drawer open={this.state.open} className="viewer-drawer">
                                <Sidebar
                                    dashboard={dashboard}
                                    dashboardId={this.props.match.params.id}
                                    dashboardContent={this.state.dashboardContent}
                                    dashboardName={this.state.dashboardName}
                                    toggled={this.state.toggled}
                                    match={this.props.match}
                                    handleThemeSwitch={this.handleTheme}
                                />
                            </Drawer>
                            <div className={`content-box ${this.state.contentClass} ${themeClass}`}>
                                <AppBar
                                    title=""
                                    iconClassNameRight="muidocs-icon-navigation-expand-more"
                                    onLeftIconButtonTouchTap={this.handleToggle}
                                    className="viewer-app-bar"
                                    iconElementRight={this.renderRightLinks()}
                                    containerStyle={{ paddingRight: 15 }}
                                />
                                <div id="dashboard-view" className={this.state.dashboardViewCSS}
                                     style={{ color: this.state.muiTheme.palette.textColor }}>
                                    <div
                                        className="dashboard-spinner"
                                        style={showLoading ? {} : {display: 'none'}}
                                    >
                                        <CircularProgress size={150} thickness={10}/>
                                        <div
                                            className="loading-label"
                                            style={{ color: this.state.muiTheme.palette.textColor }}>
                                            Loading...
                                        </div>
                                    </div>
                                </div>
                                <DashboardRenderingComponent
                                    config={config}
                                    ref={(c) => {
                                        this.dashboardRenderingComponent = c;
                                    }}
                                    dashboardContent={new DashboardUtils().getDashboardByPageId(this.props.match.params[1],
                                        this.state.dashboardContent, this.state.landingPage)}
                                    onInitialized={() => this.setState({ requestHideLoading: true })}
                                />
                            </div>
                        </div>
                }
            </MuiThemeProvider>
        );
    }
}

export default DashboardView;
