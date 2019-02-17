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
import PropTypes from 'prop-types';
import Link from 'react-router-dom/Link';
import _sortBy from 'lodash/sortBy';

import Fab from '@material-ui/core/Fab';
import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';
import Typography from '@material-ui/core/Typography';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import withStyles from '@material-ui/core/styles/withStyles';
import ContentAddIcon from '@material-ui/icons/Add';

import DashboardCard from './components/DashboardCard';
import Header from '../common/Header';
import { newDarkTheme } from '../utils/Theme';
import DashboardAPI from '../utils/apis/DashboardAPI';

const styles = theme => ({
    grid: {
        padding: theme.spacing.unit * 1,
        margin: 0,
        width: '100%',
        maxWidth: '100%',
    },
    dashboardMessage: {
        textAlign: 'center',
        fontWeight: 'bold',
        paddingTop: '10%',
        width: '100%',
    },
    fab: {
        position: 'absolute',
        bottom: theme.spacing.unit * 3,
        right: theme.spacing.unit * 3,
    },
});

/**
 * Dashboards listing page a.k.a landing page.
 */
class DashboardListingPage extends Component {
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
        DashboardAPI.getDashboardList()
            .then((response) => {
                const dashboards = _sortBy(response.data, 'url');
                this.setState({ dashboards });
            })
            .catch(() => {
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
        const { classes } = this.props;
        if (!dashboards) {
            // Dashboards are loading.
            return (
                <Typography className={classes.dashboardMessage}>
                    <FormattedMessage id='listing.loading' defaultMessage='Loading Dashboards...' />
                </Typography>
            );
        }

        if (error) {
            // Error while loading dashboards.
            return (
                <Snackbar
                    open
                    message={(
                        <FormattedMessage
                            id='listing.error.cannot-list'
                            defaultMessage='Cannot list available dashboards'
                        />
                    )}
                    autoHideDuration={4000}
                />
            );
        }

        if (dashboards.length === 0) {
            // No dashboards available.
            return (
                <Typography className={classes.dashboardMessage}>
                    <FormattedMessage id='listing.error.no-dashboards' defaultMessage='No Dashboards Available' />
                </Typography>
            );
        }

        // Render dashboards.
        return this.state.dashboards.map(dashboard => (
            <DashboardCard key={dashboard.url} dashboard={dashboard} />
        ));
    }

    render() {
        const { classes } = this.props;
        return (
            <MuiThemeProvider theme={newDarkTheme}>
                <Header showWidgetStoreButton />
                <Grid
                    container
                    className={classes.grid}
                    direction='row'
                    justify='flex-start'
                    alignItems='baseline'
                    spacing={24}
                >
                    {this.renderDashboardThumbnails()}
                </Grid>

                <Fab color='primary' className={classes.fab} component={Link} to='/create' title='Create Dashboard'>
                    <ContentAddIcon />
                </Fab>
            </MuiThemeProvider>
        );
    }
}

DashboardListingPage.propTypes = {
    classes: PropTypes.shape({}).isRequired,
};

export default withStyles(styles)(DashboardListingPage);
