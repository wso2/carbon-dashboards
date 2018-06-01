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
import Header from './components/Header';
import defaultTheme from '../utils/Theme';
import DashboardAPI from '../utils/apis/DashboardAPI';

const styles = {
    thumbnailsWrapper: {
        width: '100%',
        height: '100%',
    },
    noDashboardsMessage: {
        color: 'white',
        fontSize: '30px',
    },
};

class DashboardListingPage extends Component {
    constructor() {
        super();
        this.state = {
            isDashboardsFetchSuccess: true,
            dashboards: [],
        };
        this.retrieveDashboards = this.retrieveDashboards.bind(this);
        this.renderDashboardThumbnails = this.renderDashboardThumbnails.bind(this);
    }

    componentDidMount() {
        this.retrieveDashboards();
    }

    retrieveDashboards() {
        new DashboardAPI().getDashboardList()
            .then((response) => {
                const dashboards = response.data;
                dashboards.sort((dashboardA, dashboardB) => dashboardA.url > dashboardB.url);
                this.setState({
                    isDashboardsFetchSuccess: true,
                    dashboards,
                });
            })
            .catch(function () {
                this.setState({
                    isDashboardsFetchSuccess: false,
                    dashboards: [],
                });
            });
    }

    renderDashboardThumbnails() {
        if (!this.state.isDashboardsFetchSuccess) {
            return (
                <Snackbar
                    open={!this.state.isDashboardsFetchSuccess}
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
        if (this.state.dashboards.length === 0) {
            return (
                <div style={styles.noDashboardsMessage}>
                    <FormattedMessage id='listing.error.no-dashboards' defaultMessage='No Dashboards Available' />
                </div>
            );
        } else {
            return this.state.dashboards.map((dashboard) => {
                return <DashboardCard key={dashboard.url} dashboard={dashboard} />;
            });
        }
    }

    render() {
        return (
            <MuiThemeProvider muiTheme={defaultTheme}>
                <Header theme={defaultTheme} />
                <div style={styles.thumbnailsWrapper}>
                    {this.renderDashboardThumbnails()}
                </div>
                <FabSpeedDial theme={defaultTheme} />
            </MuiThemeProvider>
        );
    }
}

export default DashboardListingPage;
