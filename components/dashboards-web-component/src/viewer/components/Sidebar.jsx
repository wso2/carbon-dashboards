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
import Toggle from 'material-ui/Toggle';
import PageMenu from './PageMenu';
import ReactTooltip from 'react-tooltip'

import {FormattedMessage} from 'react-intl';

export default class Sidebar extends React.Component {
    constructor(props) {
        super(props);
        this.loadTheme = this.loadTheme.bind(this);
        this.isThemeSwitchToggled = this.isThemeSwitchToggled.bind(this);
        this.setThemeSwitchToggled = this.setThemeSwitchToggled.bind(this);
    }

    componentWillMount() {
        this.loadTheme("", this.isThemeSwitchToggled());
    }

    render() {
        return (
            <div>
                <div className="dashboard-view-product-logo">
                    <i className="icon fw fw-wso2-logo"></i>
                </div>
                <div className="dashboard-view-product-name">
                    {this.props.dashboardName}
                </div>
                <PageMenu dashboard={this.props.dashboard} />
                <div className="dark-light-theme-switch-div" data-tip="Switch Dashboard Theme">
                    <FormattedMessage id="light" defaultMessage="Light"/>
                    <Toggle
                        onToggle={this.loadTheme}
                        labelPosition="right"
                        label={<FormattedMessage id="dark" defaultMessage="Dark"/>}
                        defaultToggled={this.isThemeSwitchToggled()}
                        className="dark-light-theme-switch-toggleBtn"
                    />
                </div>
                <ReactTooltip />
            </div>
        );
    }

    isThemeSwitchToggled() {
        return JSON.parse(window.localStorage.getItem("theme") ? window.localStorage.getItem("theme") : "true");
    }

    setThemeSwitchToggled(theme) {
        window.localStorage.setItem("theme", theme);
    }

    loadTheme(event, isInputChecked) {
        var styleSheet = document.getElementById("dashboard-theme");
        if (styleSheet !== null) {
            styleSheet.disabled = true;
            styleSheet.parentNode.removeChild(styleSheet);
        }
        let head = document.getElementsByTagName('head')[0];
        let link = document.createElement('link');
        let appContext = window.contextPath;
        let baseURL = window.location.origin;
        link.type = 'text/css';
        if (isInputChecked) {
            this.setThemeSwitchToggled(true);
            link.href = baseURL + appContext + "/public/themes/dark/css/custom-goldenlayout-dark-theme.css";
            this.props.handleThemeSwitch(true);
        } else {
            this.setThemeSwitchToggled(false);
            link.href = baseURL + appContext + "/public/themes/light/css/custom-goldenlayout-light-theme.css";
            this.props.handleThemeSwitch(false);
        }
        link.id = "dashboard-theme";
        link.rel = "stylesheet";
        head.appendChild(link);
    }
}
