/*
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import _ from 'lodash';

import { Paper, Snackbar } from 'material-ui';
import { MuiThemeProvider } from 'material-ui/styles';

import Header from './components/Header';
import LeftSideActions from './components/LeftSideActions';

import PageLoadingIndicator from '../common/PageLoadingIndicator';
import Error404 from '../error-pages/Error404';
import Error403 from '../error-pages/Error403';
import Error500 from '../error-pages/Error500';
import defaultTheme from '../utils/Theme';
import { HttpStatus } from '../utils/Constants';
import DashboardAPI from '../utils/apis/DashboardAPI';
import DashboardRenderer from './components/DashboardRenderer';

export default class DashboardDesignerPage extends Component {
    constructor(props) {
        super(props);
        this.dashboard = null;
        this.widgetsConfigurations = [];
        this.state = {
            dashboardUpdateResultMessage: null,
            dashboardFetchStatus: HttpStatus.UNKNOWN,
            hasWidgetsLoaded: false,
        };

        this.fetchDashboard = this.fetchDashboard.bind(this);
        this.handleDashboardUpdate = this.handleDashboardUpdate.bind(this);
        this.handleSetWidgetsConfigurations = this.handleSetWidgetsConfigurations.bind(this);
    }

    componentDidMount() {
        if (!this.dashboard) {
            this.fetchDashboard();
        }
    }

    fetchDashboard() {
        new DashboardAPI('designer').getDashboardByID(this.props.match.params.dashboardId)
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

    handleDashboardUpdate() {
        return new Promise((resolve, reject) => {
            new DashboardAPI('designer').updateDashboardByID(this.dashboard.url, this.dashboard)
                .then(() => {
                    this.setState({ dashboardUpdateResultMessage: `${this.dashboard.name} updated successfully.` });
                    resolve();
                })
                .catch(() => {
                    this.setState({ dashboardUpdateResultMessage: `Cannot update ${this.dashboard.name}!` });
                    reject();
                });
        });
    }

    handleSetWidgetsConfigurations(widgetsConfigurations) {
        this.widgetsConfigurations = widgetsConfigurations;
        this.setState({ hasWidgetsLoaded: true });
    }

    renderHeader(theme) {
        return (
            <Header
                theme={theme}
                title={<FormattedMessage id="dashboard.designer.title" defaultMessage="Dashboard Designer" />}
            />
        );
    }

    renderDashboard(theme) {
        if (!this.state.hasWidgetsLoaded) {
            return (
                <Paper
                    style={{ fontSize: 20, textAlign: 'center', width: '100%', height: '100%', paddingTop: '10%' }}
                >
                    <FormattedMessage id="widgets.loading.dashboard" defaultMessage="Widget are still loading..." />
                </Paper>
            );
        }

        return (
            <span>
                <DashboardRenderer
                    dashboard={this.dashboard}
                    widgetsConfigurations={this.widgetsConfigurations}
                    pageId={this.props.match.params.pageId}
                    updateDashboard={this.handleDashboardUpdate}
                    theme={theme}
                />
            </span>
        );
    }

    render() {
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
                    <MuiThemeProvider muiTheme={defaultTheme}>
                        {this.renderHeader(defaultTheme)}
                        <PageLoadingIndicator />
                    </MuiThemeProvider>
                );
            default:
            // Fetched the dashboard successfully.
        }
        // No page is mentioned in the URl. Let's redirect to the landing page so that we have a page to render.
        if (!this.props.match.params.pageId) {
            return <Redirect to={`/designer/${this.dashboard.url}/${this.dashboard.landingPage}`} />;
        }

        return (
            <MuiThemeProvider muiTheme={defaultTheme}>
                <span>
                    {this.renderHeader(defaultTheme)}
                    <div style={{ width: '100%', height: '100%' }}>
                        <LeftSideActions
                            theme={defaultTheme}
                            dashboard={this.dashboard}
                            updateDashboard={this.handleDashboardUpdate}
                            setWidgetsConfigurations={this.handleSetWidgetsConfigurations}
                        />
                        {this.renderDashboard(defaultTheme)}
                    </div>
                    <Snackbar
                        open={this.state.dashboardUpdateResultMessage != null}
                        message={this.state.dashboardUpdateResultMessage}
                        autoHideDuration={4000}
                        onRequestClose={() => this.setState({ dashboardUpdateResultMessage: null })}
                    />
                </span>
            </MuiThemeProvider>
        );
    }
}
