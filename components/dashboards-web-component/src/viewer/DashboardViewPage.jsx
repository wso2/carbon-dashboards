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

import { AppBar, Divider, Drawer, FlatButton, List, ListItem, makeSelectable, Subheader, Toggle } from 'material-ui';
import { darkBaseTheme, getMuiTheme, lightBaseTheme, MuiThemeProvider } from 'material-ui/styles';
import { ActionHome, ActionViewModule } from 'material-ui/svg-icons';

import DashboardAPI from '../utils/apis/DashboardAPI';
import Error403 from '../error-pages/Error403';
import Error404 from '../error-pages/Error404';
import Error500 from '../error-pages/Error500';
import PageLoadingIndicator from '../common/PageLoadingIndicator';
import { HttpStatus } from '../utils/Constants';
import DashboardRenderer from '../common/DashboardRenderer';
import UserMenu from '../common/UserMenu';

const darkTheme = getMuiTheme({
    name: 'dark',
    palette: {
        primary1Color: '#24353f',
        textColor: '#bbb',
        alternateTextColor: '#bbb'
    },
    drawer: {
        color: '#17262e',
    }
}, darkBaseTheme);
const lightTheme = getMuiTheme({
    name: 'light',
    palette: {
        primary1Color: '#f1f1f1',
        textColor: '#1d3644',
        alternateTextColor: '#1d3644'
    },
    drawer: {
        color: '#d4d4d4',
    }
}, lightBaseTheme);
const SelectableList = makeSelectable(List);

class DashboardViewPage extends Component {

    constructor(props) {
        super(props);
        this.dashboard = null;
        this.isInitilialLoading = true;
        this.state = {
            dashboardFetchStatus: HttpStatus.OK,
            isSidePaneOpen: true,
            isCurrentThemeDark: true
        };

        this.fetchDashboard = this.fetchDashboard.bind(this);
        this.handleSidePaneToggle = this.handleSidePaneToggle.bind(this);
        this.handleThemeToggle = this.handleThemeToggle.bind(this);
        this.getNavigationToPage = this.getNavigationToPage.bind(this);
        this.renderHeader = this.renderHeader.bind(this);
        this.renderSidePane = this.renderSidePane.bind(this);
        this.renderPagesList = this.renderPagesList.bind(this);
        this.renderDashboard = this.renderDashboard.bind(this);
    }

    componentDidMount() {
        if (!this.dashboard) {
            this.fetchDashboard();
        }
    }

    fetchDashboard() {
        new DashboardAPI().getDashboardByID(this.props.match.params.dashboardId)
            .then(response => {
                this.dashboard = response.data;
                this.dashboard.pages = JSON.parse(this.dashboard.pages);
                this.setState({dashboardFetchStatus: HttpStatus.OK});
            })
            .catch(error => {
                this.dashboard = null;
                this.setState({dashboardFetchStatus: error.response.status});
            });
    }

    handleSidePaneToggle() {
        this.setState({
            isSidePaneOpen: !this.state.isSidePaneOpen
        });
    }

    handleThemeToggle() {
        this.setState({
            isCurrentThemeDark: !this.state.isCurrentThemeDark
        });
    }

    getNavigationToPage(pageId) {
        return {
            pathname: `/dashboards/${this.dashboard.url}/${pageId}`
        };
    }

    render() {
        const currentTheme = this.state.isCurrentThemeDark ? darkTheme : lightTheme;

        // Still fetching the dashboard.
        if (!this.dashboard) {
            return (
                <MuiThemeProvider muiTheme={currentTheme}>
                    {this.renderHeader(currentTheme)}
                    <PageLoadingIndicator />
                </MuiThemeProvider>
            );
        }
        // Something went wrong in dashboard fetching process.
        switch (this.state.dashboardFetchStatus) {
            case HttpStatus.NOTFOUND:
                return <Error404 />;
            case HttpStatus.FORBIDDEN:
                return <Error403 />;
            case HttpStatus.SERVE_ERROR:
                return <Error500 />;
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
                {this.renderDashboard(currentTheme)}
            </MuiThemeProvider>
        );
    }

    renderHeader(theme) {
        const rightIcons = (
            <span>
                <FlatButton
                    style={{minWidth: '48px'}}
                    label='Overview'
                    icon={<ActionViewModule />}
                    onClick={() => this.props.history.push('/')} />
                <UserMenu />
            </span>
        );
        return <AppBar
            style={{zIndex: theme.zIndex.drawerOverlay + 1}}
            onLeftIconButtonClick={this.handleSidePaneToggle}
            title={this.dashboard ? this.dashboard.name : this.props.match.params.dashboardId}
            iconElementRight={rightIcons}
            zDepth={2}
        />;
    }

    renderSidePane(theme) {
        const pageId = this.props.match.params.pageId, subPageId = this.props.match.params.subPageId;
        return (
            <Drawer
                docked={false}
                open={this.state.isSidePaneOpen}
                onRequestChange={isOpen => this.setState({isSidePaneOpen: isOpen})}
                containerStyle={{top: theme.appBar.height}}
                overlayStyle={{opacity: 0}}
            >
                <Subheader>
                    <FormattedMessage id='side-pane.pages' defaultMessage='Pages' />
                </Subheader>
                <SelectableList value={subPageId ? `${pageId}/${subPageId}` : pageId}>
                    {this.renderPagesList()}
                </SelectableList>
                <Divider />
                <Subheader>
                    <FormattedMessage id='theme.change-theme' defaultMessage='Theme' />
                </Subheader>
                <div style={{display: 'flex', marginLeft: 72}}>
                    <span style={{marginTop: 2, marginRight: 10}}>
                        <FormattedMessage id='theme.name.light' defaultMessage='Light' />
                    </span>
                    <Toggle
                        toggled={this.state.isCurrentThemeDark}
                        label={<FormattedMessage id='theme.name.dark' defaultMessage='Dark' />}
                        labelPosition='right'
                        onToggle={this.handleThemeToggle}
                    />
                </div>
            </Drawer>
        );
    }

    renderPagesList() {
        const landingPage = this.dashboard.landingPage;
        const history = this.props.history;
        return this.dashboard.pages.map(page => {
            let isLandingPage = (page.id === landingPage);
            let nestedItems = [];
            if (page.pages) {
                nestedItems = page.pages.map(subPage => {
                    let subPageId = `${page.id}/${subPage.id}`;
                    return <ListItem value={subPageId}
                                     primaryText={subPage.name}
                                     insetChildren={true}
                                     onClick={() => history.push(this.getNavigationToPage(subPageId))} />;
                });
            }
            return <ListItem value={page.id}
                             primaryText={page.name}
                             leftIcon={isLandingPage ? <ActionHome /> : null}
                             insetChildren={!isLandingPage}
                             nestedItems={nestedItems}
                             open={!!nestedItems}
                             onClick={() => history.push(this.getNavigationToPage(page.id))} />;
        });
    }

    renderDashboard(theme) {
        const pageId = this.props.match.params.pageId, subPageId = this.props.match.params.subPageId;
        let page = this.dashboard.pages.find(page => (page.id === pageId));

        if (page) {
            if (page.pages && subPageId) {
                page = page.pages.find(page => (page.id === subPageId));
            }
            return <DashboardRenderer goldenLayoutContents={page.content} theme={theme} />;
        } else {
            // Non-existing page ID found in the URL. Redirect to the landing page so that we have a page to render.
            return <Redirect to={this.getNavigationToPage(this.dashboard.landingPage)} />;
        }
    }
}

export default withRouter(DashboardViewPage);
