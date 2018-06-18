/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import { FormattedMessage } from 'react-intl';
import { MuiThemeProvider, Snackbar } from 'material-ui';

import DashboardCard from './components/DashboardCard';
import FabSpeedDial from './components/FabSpeedDial';
import Header from '../common/Header';
import defaultTheme from '../utils/Theme';
import DashboardAPI from '../utils/apis/DashboardAPI';

const styles = {
    thumbnailsWrapper: {
        width: '100%',
        height: '100%',
    },
    dashboardMessage: {
        textAlign: 'center',
        fontSize: '2.5em',
        fontFamily: defaultTheme.fontFamily,
        fontWeight: 'bold',
        paddingTop: '10%',
        color: defaultTheme.appBar.color,
    },
};

/**
 * Dashboards listing page a.k.a landing page.
 */
export default class DashboardListingPage extends Component {
    /**
     * Constructor.
     */
    constructor() {
        super();
        this.state = {
            dashboards: undefined,
            error: false,
        };
        this.retrieveDashboards = this.retrieveDashboards.bind(this);
        this.renderDashboardThumbnails = this.renderDashboardThumbnails.bind(this);
    }

    /**
     * Retrieve dashboards from the dashboard repository.
     */
    componentDidMount() {
        this.retrieveDashboards();
    }

    /**
     * Retrieve dashboards from the dashboard repository.
     */
    retrieveDashboards() {
        new DashboardAPI().getDashboardList()
            .then((response) => {
                const dashboards = response.data;
                dashboards.sort((dashboardA, dashboardB) => dashboardA.url > dashboardB.url);
                this.setState({ dashboards });
            })
            .catch(function () {
                this.setState({
                    dashboards: [],
                    error: true,
                });
            });
    }

    /**
     * Render dashboard thumbnails.
     * @return {XML} dashboard thumbnails
     */
    renderDashboardThumbnails() {
        const { dashboards, error } = this.state;

        if (!dashboards) {
            // Dashboards are loading.
            return (
                <div style={styles.dashboardMessage}>
                    <FormattedMessage id='listing.loading' defaultMessage='Loading Dashboards...' />
                </div>
            );
        }

        if (error) {
            // Error while loading dashboards.
            return (
                <Snackbar
                    open={this.state.error}
                    message={
                        <FormattedMessage
                            id='listing.error.cannot-list'
                            defaultMessage='Cannot list available dashboards'
                        />
                    }
                    autoHideDuration={4000}
                />
            );
        }

        if (dashboards.length === 0) {
            // No dashboards available.
            return (
                <div style={styles.dashboardMessage}>
                    <FormattedMessage id='listing.error.no-dashboards' defaultMessage='No Dashboards Available' />
                </div>
            );
        }

        // Render dashboards.
        return this.state.dashboards.map((dashboard) => {
            return <DashboardCard key={dashboard.url} dashboard={dashboard} />;
        });
    }

    /**
     * Render dashboard listing page.
     * @returns {XML} HTML content
     */
    render() {
        return (
            <MuiThemeProvider muiTheme={defaultTheme}>
                <Header title={<FormattedMessage id='portal.title' defaultMessage='Portal' />} />
                <div style={styles.thumbnailsWrapper}>
                    {this.renderDashboardThumbnails()}
                </div>
                <FabSpeedDial theme={defaultTheme} />
            </MuiThemeProvider>
        );
    }
}
