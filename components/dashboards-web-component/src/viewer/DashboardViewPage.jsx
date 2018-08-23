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

import { Divider, Drawer, IconButton, List, ListItem, makeSelectable, Subheader, Toggle, Checkbox, CardText, CardHeader,
         CardActions ,RaisedButton, SelectField, MenuItem, Card, FlatButton, Dialog, CircularProgress } from 'material-ui';
import { MuiThemeProvider } from 'material-ui/styles';
import { ActionHome, NavigationMenu } from 'material-ui/svg-icons';
import DeleteIcon from 'material-ui/svg-icons/action/delete';

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
import '../utils/GoldenLayoutOverrides.css';

import html2cavas from 'html2canvas';
import DashboardReportGenerator from '../utils/DashboardReportGenerator';
import ReportGenerationButton from './components/ReportGenerationButton';

const SelectableList = makeSelectable(List);

/**
 * App context sans starting forward slash.
 */
const appContext = window.contextPath.substr(1);

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
            exportPagesList: [],
            pageList: [],
            isPrintChecked: false,
            pageSize: 'A4',
            resizeRatio: 1,
            canvasWidth: 0,
            canvasHeight: 0,
            expanded: false,
        };

        this.fetchDashboard = this.fetchDashboard.bind(this);
        this.handleSidePaneToggle = this.handleSidePaneToggle.bind(this);
        this.handleThemeToggle = this.handleThemeToggle.bind(this);
        this.getNavigationToPage = this.getNavigationToPage.bind(this);
        this.renderHeader = this.renderHeader.bind(this);
        this.renderSidePane = this.renderSidePane.bind(this);
        this.renderPagesList = this.renderPagesList.bind(this);
        this.renderDashboard = this.renderDashboard.bind(this);

        this.handleChange = this.handleChange.bind(this);
        this.capturePage = this.capturePage.bind(this);
        this.handleCardClick = this.handleCardClick.bind(this);
        this.removePage = this.removePage.bind(this);

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
                <div
                    style={{
                        position: 'fixed',
                        top: 40,
                        right: 0,
                        bottom: 0,
                        left: 0,
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

        const pageSizes = ['A4', 'Letter', 'Government-Letter'];
        const orientations = ['Landscape', 'Portrait'];

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
                <span>
                    <Card
                        style={{ margin: 10 }}
                        expanded={this.state.expanded}
                        onExpandChange={this.handleCardClick}
                    >
                        <CardHeader title='Export dashboard' actAsExpander style={{ paddingRight: '0px' }} />
                        <CardActions expandable style={{ display: 'flex', paddingRight: '0px' }}>
                            <div style={{ marginRight: 0 }}>


                                <RaisedButton label='Capture current page'
                                    onClick={this.capturePage}
                                    primary />

                                <List>
                                    {this.state.pageList.map(field =>
                                        <ListItem primaryText={
                                                        this.dashboard.pages.find(page => page.id === field).name}
                                        rightIcon={<DeleteIcon />}
                                                  onClick={() => this.removePage(field)} />
                                    )}
                                </List>

                                <SelectField
                                    style={{ width: 200 }}
                                    floatingLabelText='Page Size'
                                    value={this.state.pageSize}
                                    onChange={(event, index, value) => { this.setState({ pageSize: value }) }}

                                >
                                    {pageSizes.map(field =>
                                        (
                                            <MenuItem
                                                key = {field}
                                                value = {field}
                                                primaryText = {field}
                                            />
                                        ))}
                                </SelectField>

                                <ReportGenerationButton
                                    pageSize = {this.state.pageSize}
                                    pageList = {this.state.pageList}
                                    pages = {this.dashboard.pages}
                                />


                            </div>
                        </CardActions>
                    </Card>
                </span>

            </Drawer>
        );
    }

    handleCardClick(expand) {
        this.setState({ expanded: expand });
    }

    handleChange(index) {
        let tempExportList = this.state.exportPagesList.slice();

        if (typeof tempExportList[index] != 'undefined') {
            tempExportList[index].value = !tempExportList[index].value;
            this.setState({ exportPagesList: tempExportList }, () => this.capturePage(index));
        } else {
            tempExportList[index] = { value: true };
            this.setState({ exportPagesList: tempExportList }, () => this.capturePage(index));
        }

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
                />
            );
        });
        return pagesList;
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
                    goldenLayoutContents={page.content}
                    height={page.height}
                    theme={theme}
                />
            );
        } else {
            // Non-existing page ID found in the URL. Redirect to the landing page so that we have a page to render.
            return <Redirect to={this.getNavigationToPage(this.dashboard.landingPage)} />;
        }
    }

    async removePage(index) {

        const tempPageList = this.state.pageList.slice();
        const ind = tempPageList.indexOf(index);
        tempPageList.splice(ind, 1);
        this.setState({ pageList: tempPageList });

        if (tempPageList.indexOf(index) == -1) {
            localStorage.removeItem(index);
        }

    }

    async capturePage(index) {

        const url = window.location.href;
        const parts = url.split('/');
        const currentPage = parts[parts.length - 1] === '' ? parts[parts.length - 2] : parts[parts.length - 1];

        await html2cavas(document.getElementById('dashboard-container')).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const w = canvas.width;
            const h = canvas.height;
            localStorage.setItem(currentPage, JSON.stringify({ imageData: imgData, width: w, height: h }));

            const tempPageList = this.state.pageList.slice();
            tempPageList.push(currentPage);
            this.setState({ pageList: tempPageList });

            const val = 620 / canvas.width;
            this.state.resizeRatio = val;
            this.state.canvasWidth = canvas.width;
            this.state.canvasHeight = canvas.height;
        });
    }

}

export default withRouter(DashboardViewPage);
