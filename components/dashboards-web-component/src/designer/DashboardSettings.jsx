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

import { RaisedButton, Snackbar, TextField } from 'material-ui';
import { darkBaseTheme, getMuiTheme, MuiThemeProvider } from 'material-ui/styles';
import ClearIcon from 'material-ui/svg-icons/content/clear';
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { FormPanel, Header } from '../common';
import DashboardAPI from '../utils/apis/DashboardAPI';
import DashboardSettingsRoles from './DashboardSettingsRoles';
import { HttpStatus } from '../utils/Constants';

/**
 * Material UI theme.
 */
const muiTheme = getMuiTheme(darkBaseTheme);

/**
 * Style constants.
 */
const styles = {
    messageBox: { textAlign: 'center', color: 'white' },
    errorMessage: { backgroundColor: '#FF5722', color: 'white' },
    successMessage: { backgroundColor: '#4CAF50', color: 'white' },
};

/**
 * Dashboard settings.
 */
export default class DashboardSettings extends Component {
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
        };
        this.updateDashboard = this.updateDashboard.bind(this);
        this.showMessage = this.showMessage.bind(this);
    }

    /**
     * Loads the dashboar via the API.
     */
    componentWillMount() {
        new DashboardAPI()
            .getDashboardByID(this.props.match.params.id)
            .then(response => this.setState({ dashboard: response.data }));
    }

    /**
     * Update dashboard.
     */
    updateDashboard() {
        const { dashboard } = this.state;

        // Validate fields.
        if (dashboard.name.length === 0) {
            this.showError('Please fill the dashboard name!');
            return;
        }

        // Save dashboard metadata.
        dashboard.pages = JSON.parse(dashboard.pages);
        new DashboardAPI()
            .updateDashboardByID(dashboard.url, dashboard)
            .then((response) => {
                if (response.status === HttpStatus.OK) {
                    this.showMessage(`Dashboard '${dashboard.name}' is updated successfully.`);
                    setTimeout(() => {
                        window.location.href = window.contextPath;
                    }, 1000);
                }
            })
            .catch(() => this.showError('Failed updating dashboard roles.'));

        // Save dashboard roles only if there are changes.
        if (this.rolesComponent) {
            this.rolesComponent
                .saveRoles()
                .then(() => this.showMessage('Dashboard roles saved successfully!'))
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
        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                <div>
                    {/* Header */}
                    <Header title={<FormattedMessage id="portal" defaultMessage="Portal" />} />

                    {/* Portal navigation bar */}
                    <div className="navigation-bar">
                        <Link to={window.contextPath}>
                            <RaisedButton
                                label={<FormattedMessage id="cancel.button" defaultMessage="Cancel" />}
                                icon={<ClearIcon />}
                                style={{ 'margin-right': '12px' }}
                            />
                        </Link>
                    </div>

                    {/* Settings form */}
                    <FormPanel
                        title={<FormattedMessage id="dashboard.settings.title" defaultMessage="Dashboard Settings" />}
                        width="800"
                    >
                        {/* General information */}
                        <TextField
                            floatingLabelText={<FormattedMessage id="dashboard.url" defaultMessage="URL" />}
                            disabled
                            fullWidth
                            value={'/' + this.props.match.params.id}
                        />
                        <br />
                        <TextField
                            floatingLabelText={
                                <FormattedMessage id="dashboard.name" defaultMessage="Name of your Dashboard" />
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
                                this.setState({ dashboard: this.state.dashboard });
                            }}
                        />
                        <br />
                        <TextField
                            floatingLabelText={
                                <FormattedMessage id="dashboard.description" defaultMessage="Description" />
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
                                this.setState({ dashboard: this.state.dashboard });
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
                            label={<FormattedMessage id="save.button" defaultMessage="Save" />}
                            primary
                            disabled={this.state.dashboard.name === ''}
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
                            this.setState({ showMessage: false, message: '' });
                        }}
                    />
                </div>
            </MuiThemeProvider>
        );
    }
}

