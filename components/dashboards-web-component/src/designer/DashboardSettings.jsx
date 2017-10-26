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

import React from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Divider from 'material-ui/Divider';
import Snackbar from 'material-ui/Snackbar';
import ClearIcon from 'material-ui/svg-icons/content/clear';

import {FormattedMessage} from 'react-intl';

import Header from '../common/Header';
import DashboardAPIS from '../utils/apis/DashboardAPIs';

const muiTheme = getMuiTheme(darkBaseTheme);
const hintStyle = {color: "grey", bottom: 0};
const textareaStyle = {color: "black"};
const underlineStyle = {bottom: 0, bottomBorder: "1px solid #424242", color: "blue"};
const errorFieldStyle = {color: "#FF5722", marginTop: 5};
const textFieldStyle = {marginLeft: 15, width: 500, height: 25, color: "black"};
const messageBoxStyle = {textAlign: "center", color: "white"};
const errorMessageStyle = {backgroundColor: "#FF5722", color: "white"};
const successMessageStyle = {backgroundColor: "#4CAF50", color: "white"};

class DashboardSettings extends React.Component {

    constructor() {
        super();
        this.state = {
            showMsg: false,
            errorMessageName: "",
            errorStyleName: "",
            errorMessageURL: "",
            errorStyleURL: "",
            dashboardName: "",
            dashboardDescription: "",
            Message: ""

        };
        this.handleDashboardName = this.handleDashboardName.bind(this);
        this.handleDashboardDescription = this.handleDashboardDescription.bind(this);
        this.handleRequestClose = this.handleRequestClose.bind(this);
        this.updateDashboard = this.updateDashboard.bind(this);
        this.showMessage = this.showMessage.bind(this);
        this.showError = this.showError.bind(this);
    }

    handleDashboardName(event, value) {
        this.setState({
            dashboardName: value,
            errorMessageName: "",
            errorStyleName: ""
        });
    }

    handleDashboardDescription(event, value) {
        this.setState({
            dashboardDescription: value,
        });
    }

    handleRequestClose() {
        this.setState({
            showMsg: false,
            Message: ""
        });
    }

    componentWillMount() {
        let dashboardAPIs = new DashboardAPIS();
        let promised_dashboard = dashboardAPIs.getDashboardByID(this.props.match.params.id);
        let that = this;
        promised_dashboard.then(function (response) {
            that.setState({
                dashboardName: response.data.name,
                dashboardDescription: response.data.description,
                dashboard: response.data
            });
        })
    }

    updateDashboard() {
        let dashboardAPIs = new DashboardAPIS();
        this.state.dashboard.name = this.state.dashboardName;
        this.state.dashboard.description = this.state.dashboardDescription;
        this.state.dashboard.pages = JSON.parse(this.state.dashboard.pages);
        if (this.state.dashboardName.length === 0) {
            this.showError("Please fill the dashboard name field !!");
            return;
        }
        let that = this;
        dashboardAPIs.updateDashboardByID(this.props.match.params.id, this.state.dashboard).then(function (response) {
            if (response.status === 200) {
                that.showMessage("Dashboard '" + that.state.dashboard.name + "' is updated successfully !!");
            }
        })
    }

    showError(message) {
        this.setState({
            messageStyle: errorMessageStyle,
            showMsg: true,
            Message: message
        });
    }

    showMessage(message) {
        this.setState({
            messageStyle: successMessageStyle,
            showMsg: true,
            Message: message
        });
    }

    render() {
        return <MuiThemeProvider muiTheme={muiTheme}>
            <div>
                <Header title={<FormattedMessage id="portal" defaultMessage="Portal"/>} />

                {/* Portal navigation bar */}
                <div className="navigation-bar">
                    <RaisedButton label={<FormattedMessage id="cancel.button" defaultMessage="Cancel"/>} icon={<ClearIcon/>} style={{'margin-right': '12px'}}
                                  onClick={() => {
                                      window.location.href = window.contextPath + '/';
                                  }}/>
                </div>

                <div className="dashboard-settings-page-form-container">
                    <h1 className="dashboard-settings-header"><FormattedMessage id="dashboard.settings.title"
                                                                                defaultMessage="Dashboard Settings"/></h1>
                    <Divider className="dashboard-settings-divider"/>
                    <div className="dashboard-settings-form-group">
                        <label className="dashboard-settings-page-label-url">
                            <FormattedMessage id="dashboard.url" defaultMessage="URL"/>
                        </label>
                        <div className="dashboard-settings-url">
                            {"/" + this.props.match.params.id}
                        </div>
                    </div>
                    <div className="dashboard-settings-form-group">
                        <label className="dashboard-settings-page-label-name">
                            <FormattedMessage id="dashboard.name" defaultMessage="Name of your Dashboard"/>
                        </label>
                        <TextField errorText={this.state.errorMessageName} errorStyle={this.state.errorStyleName}
                                   onChange={this.handleDashboardName} id="dashboardName" hintStyle={hintStyle}
                                   textareaStyle={textareaStyle}
                                   underlineStyle={underlineStyle} style={textFieldStyle}
                                   hintText={<FormattedMessage id="dashboard.name.hint.text" defaultMessage="E.g. Sales Statistics"/>}
                                   value={this.state.dashboardName}/>
                    </div>
                    <div className="dashboard-settings-form-group">
                        <label className="dashboard-settings-page-label-description">
                            <FormattedMessage id="dashboard.description" defaultMessage="Description"/>
                        </label>
                        <TextField id="dashboardDescription" hintStyle={hintStyle} textareaStyle={textareaStyle}
                                   underlineStyle={underlineStyle} style={textFieldStyle}
                                   onChange={this.handleDashboardDescription}
                                   hintText={<FormattedMessage id="dashboard.description.hint.text" defaultMessage="E.g. Monthly Sales Statistics"/>}
                                   value={this.state.dashboardDescription}/>
                    </div>
                    <RaisedButton onClick={this.updateDashboard}
                                  label={<FormattedMessage id="save.button" defaultMessage="Save"/>} primary={true}
                                  className="dashboard-settings-save-button"/>
                </div>
                <Snackbar contentStyle={messageBoxStyle} bodyStyle={this.state.messageStyle} open={this.state.showMsg}
                          message={this.state.Message} autoHideDuration={4000}
                          onRequestClose={this.handleRequestClose}/>
            </div>
        </MuiThemeProvider>;
    }
}

export default DashboardSettings;