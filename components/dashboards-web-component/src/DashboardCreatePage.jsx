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
import {Link} from 'react-router-dom';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Divider from 'material-ui/Divider';
import Snackbar from 'material-ui/Snackbar';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Clear from 'material-ui/svg-icons/content/clear';

import Header from './Header';
import DashboardAPIS from './utils/dashboard-apis';
import DashboardUtils from './utils/dashboard-utils';

const muiTheme = getMuiTheme(darkBaseTheme);
const hintStyle = {color: "grey", bottom: 0};
const textareaStyle = {color: "black"};
const underlineStyle = {bottom: 0, bottomBorder: "1px solid #424242", color: "blue"};
const errorFieldStyle = {color: "#FF5722", marginTop: 5};
const textFieldStyle = {marginLeft: 15, width: 500, height: 25, color: "black"};
const messageBoxStyle = {textAlign: "center", color: "white"};
const errorMessageStyle = {backgroundColor: "#FF5722", color: "white"};
const successMessageStyle = {backgroundColor: "#4CAF50", color: "white"};

class DashboardCreatePage extends React.Component {

    constructor() {
        super();
        this.addDashboard = this.addDashboard.bind(this);
        this.handleRequestClose = this.handleRequestClose.bind(this);
        this.generateDashboardJSON = this.generateDashboardJSON.bind(this);
        this.state = {
            showMsg: false,
            url: "",
            errorMessageName: "",
            errorStyleName: "",
            errorMessageURL: "",
            errorStyleURL: ""

        };
        this.handleURL = this.handleURL.bind(this);
        this.handleDashboardName = this.handleDashboardName.bind(this);
    }

    render() {
        return <MuiThemeProvider muiTheme={muiTheme}>
            <div>
                <Header dashboardName="Portal"></Header>
                <div className="portal-navigation-bar">
                    <Link to={"/portal/"}>
                        <FloatingActionButton mini={true} className="navigation-icon">
                            <Clear />
                        </FloatingActionButton>
                        <div className="create-dashboard-text"> Cancel
                        </div>
                    </Link>
                </div>
                <div className="create-page-form-container">
                    <h1 className="create-dashboard-header">Create a Dashboard</h1>
                    <Divider className="create-dashboard-divider"/>
                    <div className="create-dashboard-form-group">
                        <label className="create-dashboard-page-label-name">
                            Name of your Dashboard <span className="required">*</span>
                        </label>
                        <TextField errorText={this.state.errorMessageName} errorStyle={this.state.errorStyleName}
                                   onChange={this.handleDashboardName} id="dashboardName" hintStyle={hintStyle}
                                   textareaStyle={textareaStyle}
                                   underlineStyle={underlineStyle} style={textFieldStyle}
                                   hintText="E.g. Sales Statistics"/>
                    </div>
                    <div className="create-dashboard-form-group">
                        <label className="create-dashboard-page-label-url">
                            URL <span className="required">*</span>
                        </label>
                        <TextField errorText={this.state.errorMessageURL} errorStyle={this.state.errorStyleURL}
                                   onChange={this.handleURL} value={this.state.url} id="dashboardURL"
                                   hintStyle={hintStyle}
                                   textareaStyle={textareaStyle} underlineStyle={underlineStyle} style={textFieldStyle}
                                   hintText="E.g. sales-stats"/>
                    </div>
                    <div className="create-dashboard-form-group">
                        <label className="create-dashboard-page-label-description">
                            Description
                        </label>
                        <TextField id="dashboardDescription" hintStyle={hintStyle} textareaStyle={textareaStyle}
                                   underlineStyle={underlineStyle} style={textFieldStyle}
                                   hintText="E.g. Monthly Sales Statistics"/>
                    </div>
                    <RaisedButton onClick={this.addDashboard} label="Add" primary={true}
                                  className="create-dashboard-button"/>
                    <Snackbar contentStyle={messageBoxStyle} bodyStyle={this.state.messageStyle}
                              open={this.state.showMsg}
                              message={this.state.Message} autoHideDuration={4000}
                              onRequestClose={this.handleRequestClose}/>
                </div>
            </div>
        </MuiThemeProvider>;
    }

    handleURL(event, value) {
        this.setState({
            url: new DashboardUtils().sanitizeInput(value.toLowerCase().replace(/\s+/g, '')),
            errorMessageURL: "",
            errorStyleURL: ""
        });
    }

    handleDashboardName(event, value) {
        this.setState({
            url: new DashboardUtils().sanitizeInput(value.toLowerCase().replace(/\s+/g, '')),
            errorMessageName: "",
            errorStyleName: ""
        });
    }

    handleRequestClose() {
        this.setState({
            showMsg: false,
            Message: ""
        });
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

    addDashboard() {
        let dashboardName = document.getElementById("dashboardName").value;
        let dashboardURL = document.getElementById("dashboardURL").value;
        let dashboardDescription = document.getElementById("dashboardDescription").value;
        if (!dashboardName) {
            this.setState({
                errorMessageName: "This field is required.",
                errorStyleName: errorFieldStyle
            });
            return;
        } else if (!dashboardURL) {
            this.setState({
                errorMessageURL: "This field is required.",
                errorStyleURL: errorFieldStyle
            });
            return;
        }
        let dashboardJson = {};
        dashboardJson.url = dashboardURL;
        dashboardJson.name = dashboardName;
        dashboardJson.description = dashboardDescription;
        dashboardJson = this.generateDashboardJSON(dashboardJson);
        let dashboardAPIs = new DashboardAPIS();
        var that = this;
        dashboardAPIs.getDashboardByID(dashboardURL).then(function (response) {
            if (typeof response.data === "string") {
                dashboardAPIs.createDashboard(dashboardJson).then(function (response) {
                    if (response.status === 201) {
                        that.showMessage("Dashboard - " + dashboardName + " is created successfully !!");
                        setTimeout(function () {
                            let appContext = window.location.pathname.split("/")[1];
                            window.location.href = "/" + appContext + "/designer/" + dashboardURL;
                        }, 1000)
                    }
                })
            }
            else {
                that.showError("Dashboard with same url already exists. Please use a different url !!");
            }
        }).catch(function () {
            that.showError("Error in adding dashboard !!");
        });
    }

    generateDashboardJSON(dashboardJson) {
        dashboardJson.parentId = 0;
        dashboardJson.landingPage = "home";
        dashboardJson.pages = [];
        let homePage = {};
        homePage.id = "home";
        homePage.name = "Home";
        homePage.content = [];
        dashboardJson.pages.push(homePage);
        return dashboardJson;
    }
}

export default DashboardCreatePage;