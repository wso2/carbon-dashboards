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

import {RaisedButton, Snackbar, TextField} from 'material-ui';
import {darkBaseTheme, getMuiTheme, MuiThemeProvider} from 'material-ui/styles';
import ClearIcon from 'material-ui/svg-icons/content/clear';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link, withRouter } from 'react-router-dom';
import { Redirect } from 'react-router-dom';

import {FormPanel, Header} from '../common';
import DashboardAPI from '../utils/apis/DashboardAPI';
import DashboardSettingsRoles from './DashboardSettingsRoles';
import {HttpStatus} from '../utils/Constants';
import Error403 from '../error-pages/Error403';
import Error404 from '../error-pages/Error404';

/**
 * Material UI theme.
 */
const muiTheme = getMuiTheme(darkBaseTheme);

/**
 * Style constants.
 */
const styles = {
    messageBox: { textAlign: 'center', color: 'white' },
    errorMessage: { backgroundColor: '#17262e', color: 'white', border: '2px solid #e74c3c'},
    successMessage: { backgroundColor: '#17262e', color: 'white', border: '2px solid #2ecc71'},
};

/**
 * Dashboard settings.
 */
class DashboardSettings extends Component {
    /**
     * Constructor.
     * Initilaizes the component state.
     */
    constructor() {
        super();
        this.state = {
            dashboard: {},
            showMessage: false,
            message: '',
            hasPermission: true,
            hasDashboard: true,
            isSessionValid: true
        };
        this.updateDashboard = this.updateDashboard.bind(this);
        this.showMessage = this.showMessage.bind(this);
    }

    /**
     * Loads the dashboar via the API.
     */
    componentWillMount() {
        new DashboardAPI("settings")
            .getDashboardByID(this.props.match.params.id)
            .then(response => this.setState({dashboard: response.data}))
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
     * Update dashboard.
     */
    updateDashboard() {
        const {dashboard} = this.state;

        // Validate fields.
        if (dashboard.name.length === 0) {
            this.showError(this.context.intl.formatMessage({
                id: "settings.dashboard.name.missing",
                defaultMessage: "Please fill the dashboard name!"
            }));
            return;
        }

        // Save dashboard metadata.
        dashboard.pages = JSON.parse(dashboard.pages);
        new DashboardAPI()
            .updateDashboardByID(dashboard.url, dashboard)
            .then((response) => {
                if (response.status === HttpStatus.OK) {
                    this.showMessage(this.context.intl.formatMessage({
                        id: "dashboard.update.success",
                        defaultMessage: "Dashboard updated successfully!"
                    }));
                    setTimeout(() => {
                        this.props.history.push('/');
                    }, 1000);
                }
            })
            .catch(() => this.showError(this.context.intl.formatMessage({
                id: "settings.role.update.failure",
                defaultMessage: "Failed updating dashboard roles."
            })));

        // Save dashboard roles only if there are changes.
        if (this.rolesComponent) {
            this.rolesComponent
                .saveRoles()
                .then(() => this.showMessage(this.context.intl.formatMessage({
                    id: "settings.role.update.success",
                    defaultMessage: "Dashboard roles saved successfully!"
                })))
                .catch(error => this.showError(error));
        }
    }

    /**
     * Show error message.
     *
     * @param {string} message Error message.
     */
    showError(message) {
        this.showMessage(message, styles.errorMessage);
    }

    /**
     * Show message.
     *
     * @param {string} message Message
     * @param {{}} style Styles
     */
    showMessage(message, style = styles.successMessage) {
        this.setState({
            messageStyle: style,
            showMessage: true,
            message,
        });
    }

    /**
     * Renders the settings page.
     *
     * @returns {XML} HTML content
     */
    render() {
        if (!this.state.isSessionValid) {
            return (
                <Redirect to={{pathname: '/logout'}}/>
            );
        } else if (!this.state.hasPermission) {
            return <Error403/>;
        } else if (!this.state.hasDashboard) {
            return <Error404/>;
        }
        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                <div>
                    {/* Header */}
                    <Header title={<FormattedMessage id="portal" defaultMessage="Portal"/>}/>

                    {/* Settings form */}
                    <FormPanel
                        title={<FormattedMessage id="dashboard.settings.title" defaultMessage="Dashboard Settings"/>}
                        width="800"
                    >
                        {/* General information */}
                        <TextField
                            floatingLabelText={<FormattedMessage id="dashboard.url" defaultMessage="URL"/>}
                            disabled
                            fullWidth
                            value={'/' + this.props.match.params.id}
                        />
                        <br />
                        <TextField
                            floatingLabelText={
                                <FormattedMessage id="dashboard.name" defaultMessage="Name of your Dashboard"/>
                            }
                            hintText={
                                <FormattedMessage
                                    id="dashboard.name.hint.text"
                                    defaultMessage="E.g. Sales Statistics"
                                />
                            }
                            fullWidth
                            value={this.state.dashboard.name}
                            onChange={(e) => {
                                this.state.dashboard.name = e.target.value;
                                this.setState({dashboard: this.state.dashboard});
                            }}
                        />
                        <br />
                        <TextField
                            floatingLabelText={
                                <FormattedMessage id="dashboard.description" defaultMessage="Description"/>
                            }
                            hintText={
                                <FormattedMessage
                                    id="dashboard.description.hint.text"
                                    defaultMessage="E.g. Monthly Sales Statistics"
                                />
                            }
                            fullWidth
                            multiLine
                            value={this.state.dashboard.description}
                            onChange={(e) => {
                                this.state.dashboard.description = e.target.value;
                                this.setState({dashboard: this.state.dashboard});
                            }}
                        />
                        <br />
                        <br />
                        {/* Dashboard roles */}
                        <DashboardSettingsRoles
                            dashboard={this.state.dashboard}
                            muiTheme={muiTheme}
                            ref={(component) => {
                                this.rolesComponent = component;
                            }}
                        />
                        <br />
                        <br />
                        <RaisedButton
                            onClick={this.updateDashboard}
                            label={<FormattedMessage id="save.button" defaultMessage="Save"/>}
                            primary
                            disabled={this.state.dashboard.name === ''}
                        />

                        <RaisedButton
                            label={<FormattedMessage id="cancel.button" defaultMessage="Cancel"/>}
                            style={{'margin': '30px 10px'}}
                            backgroundColor="rgb(13, 31, 39)"
                            containerElement={<Link to={'/'}/>}
                        />

                    </FormPanel>

                    {/* Snackbar */}
                    <Snackbar
                        contentStyle={styles.messageBox}
                        bodyStyle={this.state.messageStyle}
                        open={this.state.showMessage}
                        message={this.state.message}
                        autoHideDuration={4000}
                        onRequestClose={() => {
                            this.setState({showMessage: false, message: ''});
                        }}
                    />
                </div>
            </MuiThemeProvider>
        );
    }
}

DashboardSettings.contextTypes ={
    intl: PropTypes.object.isRequired
};

export default withRouter(DashboardSettings);
