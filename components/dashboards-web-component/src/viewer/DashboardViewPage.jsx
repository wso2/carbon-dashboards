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

import React, { Component } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import _ from 'lodash';

import { Divider, Drawer, IconButton, List, ListItem, makeSelectable, Subheader, Toggle } from 'material-ui';
import { MuiThemeProvider } from 'material-ui/styles';
import { ActionHome, NavigationMenu } from 'material-ui/svg-icons';

import DashboardAPI from '../utils/apis/DashboardAPI';
import Error403 from '../error-pages/Error403';
import Error404 from '../error-pages/Error404';
import Error500 from '../error-pages/Error500';
import PageLoadingIndicator from '../common/PageLoadingIndicator';
import { HttpStatus } from '../utils/Constants';
import DashboardRenderer from './components/DashboardRenderer';
import Header from '../common/Header';
import UserMenu from '../common/UserMenu';
import PortalButton from '../common/PortalButton';
import ThemeButton from './components/ThemeButton';
import { darkTheme, lightTheme } from '../utils/Theme';
import './components/gl-override-styles.css';
import './components/side-bar-nav-styles.css';
import DashboardReportGenerationCard from './components/DashboardReportGenerationCard';

const SelectableList = makeSelectable(List);

class DashboardViewPage extends Component {

    constructor(props) {
        super(props);
        const isDarkTheme = window.localStorage.getItem('isDarkTheme');
        this.dashboard = null;
        this.isInitilialLoading = true;
        this.state = {
            dashboardFetchStatus: HttpStatus.UNKNOWN,
            isSidePaneOpen: true,
            isCurrentThemeDark: isDarkTheme ? isDarkTheme === 'true' : true,
        };

        this.fetchDashboard = this.fetchDashboard.bind(this);
        this.handleSidePaneToggle = this.handleSidePaneToggle.bind(this);
        this.handleThemeToggle = this.handleThemeToggle.bind(this);
        this.getNavigationToPage = this.getNavigationToPage.bind(this);
        this.renderHeader = this.renderHeader.bind(this);
        this.renderSidePane = this.renderSidePane.bind(this);
        this.renderPagesList = this.renderPagesList.bind(this);
        this.renderDashboard = this.renderDashboard.bind(this);
        this.renderSideBarNav = this.renderSideBarNav.bind(this);
    }

    componentDidMount() {
        if (!this.dashboard) {
            this.fetchDashboard();
        }
    }

    fetchDashboard() {
        new DashboardAPI().getDashboardByID(this.props.match.params.dashboardId)
            .then((response) => {
                this.dashboard = response.data;
                if (_.isString(this.dashboard.pages)) {
                    this.dashboard.pages = JSON.parse(this.dashboard.pages);
                }
                this.setState({ dashboardFetchStatus: HttpStatus.OK });
            })
            .catch((error) => {
                this.dashboard = null;
                this.setState({ dashboardFetchStatus: error.response.status });
            });
    }

    handleSidePaneToggle() {
        this.setState({
            isSidePaneOpen: !this.state.isSidePaneOpen,
        });
    }

    handleThemeToggle() {
        window.localStorage.setItem('isDarkTheme', !this.state.isCurrentThemeDark);
        this.setState({
            isCurrentThemeDark: !this.state.isCurrentThemeDark,
        });
    }

    getNavigationToPage(pageId) {
        return {
            pathname: `/dashboards/${this.dashboard.url}/${pageId}`,
        };
    }

    render() {
        const currentTheme = this.state.isCurrentThemeDark ? darkTheme : lightTheme;

        switch (this.state.dashboardFetchStatus) {
            case HttpStatus.NOTFOUND:
                return <Error404 />;
            case HttpStatus.FORBIDDEN:
                return <Error403 />;
            case HttpStatus.SERVE_ERROR:
                return <Error500 />;
            case HttpStatus.UNKNOWN:
                // Still fetching the dashboard.
                return (
                    <MuiThemeProvider muiTheme={currentTheme}>
                        {this.renderHeader(currentTheme)}
                        <PageLoadingIndicator />
                    </MuiThemeProvider>
                );
            default:
            // Fetched the dashboard successfully.
        }
        // No page is mentioned in the URl. Let's redirect to the landing page so that we have a page to render.
        if (!this.props.match.params.pageId) {
            return <Redirect to={this.getNavigationToPage(this.dashboard.landingPage)} />;
        }
        // If this is the very first display of this page, then show the side pane briefly and close it.
        if (this.isInitilialLoading) {
            this.isInitilialLoading = false;
            setTimeout(() => this.handleSidePaneToggle(), 1000);
        }

        return (
            <MuiThemeProvider muiTheme={currentTheme}>
                {this.renderHeader(currentTheme)}
                {this.renderSidePane(currentTheme)}
                {this.renderSideBarNav(currentTheme)}
                <div
                    style={{
                        position: 'fixed',
                        top: 40,
                        right: 0,
                        bottom: 0,
                        width: 'calc(100% - 25px)',
                        overflowX: 'hidden',
                        overflowY: 'auto',
                    }}
                >
                    {this.renderDashboard(currentTheme)}
                </div>
            </MuiThemeProvider>
        );
    }

    renderHeader(theme) {
        const logo = (
            <IconButton style={{ margin: 0, padding: 0, width: 'initial', height: theme.appBar.height }}>
                <NavigationMenu />
            </IconButton>
        );
        return (
            <Header
                title={this.dashboard ? this.dashboard.name : this.props.match.params.dashboardId}
                logo={logo}
                onLogoClick={this.handleSidePaneToggle}
                rightElement = {
                    <span style={{ position: 'relative' }}>
                        <ThemeButton
                            onThemeButtonClick={this.handleThemeToggle}
                            theme={theme}
                        />
                        <PortalButton />
                        <UserMenu />
                    </span>
                }
                theme={theme}
            />
        );
    }

    renderSidePane(theme) {
        const pageId = this.props.match.params.pageId,
            subPageId = this.props.match.params.subPageId;
        return (
            <Drawer
                docked={false}
                open={this.state.isSidePaneOpen}
                onRequestChange={isOpen => this.setState({ isSidePaneOpen: isOpen })}
                containerStyle={{ top: theme.appBar.height }}
                overlayStyle={{ opacity: 0 }}
            >
                <Subheader>
                    <FormattedMessage id='side-pane.pages' defaultMessage='Pages' />
                </Subheader>
                <SelectableList value={subPageId ? `${pageId}/${subPageId}` : pageId}>
                    {this.renderPagesList()}
                </SelectableList>
                <br />
                <Divider />
                <DashboardReportGenerationCard
                    pages={this.dashboard.pages}
                    dashboardName={this.dashboard ? this.dashboard.name : this.props.match.params.dashboardId}
                />
            </Drawer>
        );
    }

    /**
     * Render pages menu.
     *
     * @returns {XML} Html content
     */
    renderPagesList() {
        const landingPage = this.dashboard.landingPage;
        const history = this.props.history;
        let pagesList = [];
        this.dashboard.pages.forEach((page) => {
            if (page.hidden) {
                return;
            }
            const isLandingPage = (page.id === landingPage);
            let subPagesList = [];
            if (page.pages) {
                page.pages.forEach((subPage) => {
                    if (subPage.hidden) {
                        return;
                    }
                    const subPageId = `${page.id}/${subPage.id}`;
                    subPagesList.push(
                        <ListItem
                            key={subPageId}
                            value={subPageId}
                            primaryText={subPage.name}
                            insetChildren
                            onClick={() => history.push(this.getNavigationToPage(subPageId))}
                        />
                    );
                });
            }
            pagesList.push(
                <ListItem
                    key={page.id}
                    value={page.id}
                    primaryText={page.name}
                    leftIcon={isLandingPage ? <ActionHome /> : null}
                    insetChildren={!isLandingPage}
                    nestedItems={subPagesList}
                    open={!!subPagesList}
                    onClick={() => history.push(this.getNavigationToPage(page.id))}
                    className={isLandingPage ? 'list-item homePage' : 'list-item'}
                />
            );
        });
        return pagesList;
    }

    renderSideBarNav(theme) {
        const pageId = this.props.match.params.pageId,
            subPageId = this.props.match.params.subPageId;
        return (
            <div className={'side-bar-nav'} style={{ background: theme.appBar.color }}>
                <SelectableList value={subPageId ? `${pageId}/${subPageId}` : pageId}>
                    {this.renderPagesList()}
                </SelectableList>
            </div>
        );
    }

    renderDashboard(theme) {
        const { pageId, subPageId } = this.props.match.params;
        let page = this.dashboard.pages.find(page => (page.id === pageId));
        if (page) {
            if (page.pages && subPageId) {
                page = page.pages.find(page => (page.id === subPageId));
            }
            return (
                <DashboardRenderer
                    dashboardId={this.dashboard.url}
                    dashboardName={this.dashboard ? this.dashboard.name : this.props.match.params.dashboardId}
                    dashboardPageContents={page.content}
                    dashboardPageHeight={page.height}
                    theme={theme}
                />
            );
        } else {
            // Non-existing page ID found in the URL. Redirect to the landing page so that we have a page to render.
            return <Redirect to={this.getNavigationToPage(this.dashboard.landingPage)} />;
        }
    }
}

export default withRouter(DashboardViewPage);
