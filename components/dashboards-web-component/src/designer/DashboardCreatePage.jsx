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
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { MuiThemeProvider } from 'material-ui/styles';
import { RaisedButton, TextField, Snackbar, FlatButton } from 'material-ui';
import { withRouter } from 'react-router-dom';

import DesignerHeader from './components/DesignerHeader';
import FormPanel from '../common/FormPanel';
import defaultTheme from '../utils/Theme';
import DashboardAPI from '../utils/apis/DashboardAPI';
import DashboardUtils from '../utils/DashboardUtils';
import { HttpStatus } from '../utils/Constants';
import AuthManager from '../auth/utils/AuthManager';

/**
 * Style constants.
 */
const styles = {
    fieldError: {},
    messageBox: { textAlign: 'center' },
    errorMessage: {},
    successMessage: {},
};

/**
 * Create dashboard component.
 */
class DashboardCreatePage extends Component {
    /**
     * Constructor.
     */
    constructor() {
        super();
        this.state = {
            showMessage: false,
            message: '',
            url: '',
            fieldErrors: {
                name: { error: '', style: '' },
                url: { error: '', style: '' },
            },
            dashboard: {
                name: '',
                url: '',
                owner:'',
                description: '',
            },
        };
        this.addDashboard = this.addDashboard.bind(this);
        this.validateFields = this.validateFields.bind(this);
    }

    /**
     * Show error message.
     *
     * @param {string} message Error message
     */
    showError(message) {
        this.showMessage(message, styles.errorMessage);
    }

    /**
     * Show info message.
     *
     * @param {string} message Message
     * @param {string} style Message style
     */
    showMessage(message, style = styles.successMessage) {
        this.setState({
            messageStyle: style,
            showMessage: true,
            message,
        });
    }

    /**
     * Validate form fields.
     *
     * @returns {boolean} Validation status
     */
    validateFields() {
        let valid = true;
        if (this.state.dashboard.name === '') {
            this.state.fieldErrors.name = { error: 'Required', style: styles.fieldError };
            this.setState({ fieldErrors: this.state.fieldErrors });
            valid = false;
        }

        if (this.state.dashboard.url === '') {
            this.state.fieldErrors.url = { error: 'Required', style: styles.fieldError };
            this.setState({ fieldErrors: this.state.fieldErrors });
            valid = false;
        }
        return valid;
    }

    /**
     * Add dashboard.
     */
    addDashboard() {
        if (!this.validateFields()) {
            return;
        }
        //TODO : set the owner at the api layer once the backend apis are secured
        const dashboard = {
            url: this.state.dashboard.url,
            owner: AuthManager.getUser().username,
            name: this.state.dashboard.name,
            description: this.state.dashboard.description,
            parentId: 0,
            landingPage: 'home',
            pages: [
                {
                    id: 'home',
                    name: this.context.intl.formatMessage({id: "home", defaultMessage: "Home"}),
                    content: [],
                },
            ],
        };
        new DashboardAPI()
            .createDashboard(dashboard)
            .then((response) => {
                switch (response.status) {
                    case HttpStatus.CREATED: {
                        this.showMessage(this.context.intl.formatMessage({
                                id: "dashboard.create.success",
                                defaultMessage: "Dashboard {name} is created successfully!"
                            }, {name: this.state.dashboard.name}), styles.successMessage);
                        setTimeout(() => {
                            this.props.history.push(`/designer/${this.state.dashboard.url}`)
                        }, 1000);
                        break;
                    }
                    default: {
                        this.showError(this.context.intl.formatMessage({
                            id: "dashboard.create.failure",
                            defaultMessage: "Unable to create the dashboard due to unknown error."
                        }));
                        break;
                    }
                }
            })
            .catch((error) => {
                if (error.response.status === HttpStatus.CONFLICT){
                    this.showError(this.context.intl.formatMessage({
                        id: "dashboard.error.sameurl",
                        defaultMessage: "Dashboard with same url already exists. Please use a different url."
                    }));
                } else {
                    this.showError(this.context.intl.formatMessage({
                        id: "dashboard.add.error",
                        defaultMessage: "Couldn't create the dashboard!!"
                    }));
                }
            });
    }

    /**
     * Render dashboard create page.
     *
     * @returns {XML} HTML content
     */
    render() {
        return (
            <MuiThemeProvider muiTheme={defaultTheme}>
                <div>
                    <DesignerHeader />

                    <FormPanel
                        title={<FormattedMessage id="create.dashboard" defaultMessage="Create Dashboard" />}
                        width="800"
                    >
                        <TextField
                            floatingLabelText={
                                <FormattedMessage id="dashboard.name" defaultMessage="Name of your Dashboard" />
                            }
                            value={this.state.dashboard.name}
                            hintText={
                                <FormattedMessage id="dashboard.name.hint.text" defaultMessage="E.g. Sales Statistics" />
                            }
                            fullWidth
                            errorText={this.state.fieldErrors.name.error}
                            errorStyle={this.state.fieldErrors.name.style}
                            onChange={(e, value) => {
                                this.state.fieldErrors.name = { error: '', style: '' };
                                this.state.dashboard.name = value;
                                this.state.dashboard.url = DashboardUtils.sanitizeInput(value.toLowerCase()
                                    .replace(/\s+/g, ''));
                                this.setState({
                                    fieldErrors: this.state.fieldErrors,
                                    dashboard: this.state.dashboard,
                                });
                            }}
                        />
                        <br />
                        <TextField
                            floatingLabelText={<FormattedMessage id="dashboard.url" defaultMessage="URL" />}
                            value={this.state.dashboard.url}
                            hintText={
                                <FormattedMessage id="dashboard.url.hint.text" defaultMessage="E.g. sales-stats" />
                            }
                            fullWidth
                            errorText={this.state.fieldErrors.url.error}
                            errorStyle={this.state.fieldErrors.url.style}
                            onChange={(e, value) => {
                                this.state.fieldErrors.url = { error: '', style: '' };
                                this.state.dashboard.url = DashboardUtils.sanitizeInput(value.toLowerCase()
                                    .replace(/\s+/g, ''));
                                this.setState({
                                    fieldErrors: this.state.fieldErrors,
                                    dashboard: this.state.dashboard,
                                });
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
                            value={this.state.dashboard.description}
                            fullWidth
                            onChange={(e, value) => {
                                this.state.dashboard.description = value;
                                this.setState({
                                    dashboard: this.state.dashboard,
                                });
                            }}
                        />
                        <br />
                        <br />
                        <RaisedButton
                            onClick={this.addDashboard}
                            label={<FormattedMessage id="add.button" defaultMessage="Add" />}
                            primary
                            style={{'margin-top':'30px'}}
                        />
                        <FlatButton
                            label={<FormattedMessage id="cancel.button" defaultMessage="Cancel"/>}
                            style={{'margin': '30px 20px'}}
                            onClick={() => this.props.history.push('/')}
                        />
                    </FormPanel>
                    <Snackbar
                        contentStyle={styles.messageBox}
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

DashboardCreatePage.contextTypes ={
    intl: PropTypes.object.isRequired
};

export default withRouter(DashboardCreatePage);
