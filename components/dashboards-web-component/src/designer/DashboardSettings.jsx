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

import React, {Component} from 'react';
//App components
import Header from '../common/Header';
import FormPanel from '../common/FormPanel';
import DashboardAPI from '../utils/apis/DashboardAPIs';
// Material-UI
import {MuiThemeProvider, darkBaseTheme, getMuiTheme} from 'material-ui/styles';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Snackbar from 'material-ui/Snackbar';
import ClearIcon from 'material-ui/svg-icons/content/clear';

const muiTheme = getMuiTheme(darkBaseTheme);
const styles = {
    messageBox: {textAlign: 'center', color: 'white'},
    errorMessage: {backgroundColor: "#FF5722", color: "white"},
    successMessage: {backgroundColor: "#4CAF50", color: "white"}
};
const constants = {
    HTTP_OK: 200
};

export default class DashboardSettings extends Component {
    constructor() {
        super();
        this.state = {
            dashboard: {},
            showMessage: false,
            message: ''
        };
        this.updateDashboard = this.updateDashboard.bind(this);
        this.showMessage = this.showMessage.bind(this);
    }

    componentWillMount() {
        new DashboardAPI()
            .getDashboardByID(this.props.match.params.id)
            .then(response => this.setState({dashboard: response.data}));
    }

    render() {
        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                <div>
                    <Header title={<FormattedMessage id="portal" defaultMessage="Portal"/>} />

                    {/* Portal navigation bar */}
                    <div className="navigation-bar">
                        <RaisedButton
                            label={<FormattedMessage id="cancel.button" defaultMessage="Cancel"/>}
                            icon={<ClearIcon/>}
                            style={{'margin-right': '12px'}}
                            onClick={() => {
                                window.location.href = window.contextPath + '/';
                            }}/>
                    </div>

                    <FormPanel title={<FormattedMessage id="dashboard.settings.title" defaultMessage="Dashboard Settings"/>} width="800">
                        <TextField
                            floatingLabelText={<FormattedMessage id="dashboard.url" defaultMessage="URL"/>}
                            disabled
                            fullWidth
                            value={'/' + this.props.match.params.id}
                        />
                        <br/>
                        <TextField
                            floatingLabelText={<FormattedMessage id="dashboard.name" defaultMessage="Name of your Dashboard"/>}
                            hintText={<FormattedMessage id="dashboard.name.hint.text" defaultMessage="E.g. Sales Statistics"/>}
                            fullWidth
                            value={this.state.dashboard.name}
                            onChange={(e) => {
                                this.state.dashboard.name = e.target.value;
                                this.setState({dashboard: this.state.dashboard});
                            }}
                        />
                        <br/>
                        <TextField
                            floatingLabelText={<FormattedMessage id="dashboard.description" defaultMessage="Description"/>}
                            hintText={<FormattedMessage id="dashboard.description.hint.text" defaultMessage="E.g. Monthly Sales Statistics"/>}
                            fullWidth
                            multiLine
                            value={this.state.dashboard.description}
                            onChange={(e) => {
                                this.state.dashboard.description = e.target.value;
                                this.setState({dashboard: this.state.dashboard});
                            }}
                        />
                        <br/>
                        <br/>
                        <RaisedButton
                            onClick={this.updateDashboard}
                            label={<FormattedMessage id="save.button" defaultMessage="Save"/>}
                            primary
                            disabled={this.state.dashboard.name === ''}
                        />
                    </FormPanel>
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

    /**
     * Update dashboard.
     */
    updateDashboard() {
        if (this.state.dashboard.name.length === 0) {
            this.showError("Please fill the dashboard name field !!");
            return;
        }

        this.state.dashboard.pages = JSON.parse(this.state.dashboard.pages);
        new DashboardAPI()
            .updateDashboardByID(this.props.match.params.id, this.state.dashboard)
            .then(response => {
                if (response.status === constants.HTTP_OK) {
                    this.showMessage("Dashboard '" + this.state.dashboard.name + "' is updated successfully.");
                }
            })
            .catch(error => {
                this.showError("Failed updating dashboard roles.");
            });
    }

    /**
     * Show error message.
     * @param message
     */
    showError(message) {
        this.showMessage(message, styles.errorMessage);
    }

    /**
     * Show message.
     * @param message
     * @param style
     */
    showMessage(message, style = styles.successMessage) {
        this.setState({
            messageStyle: style,
            showMessage: true,
            message: message
        });
    }
}
