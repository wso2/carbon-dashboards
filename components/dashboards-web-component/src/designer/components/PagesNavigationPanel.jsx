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
import Paper from 'material-ui/Paper';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right';
import {Link} from 'react-router-dom';

import {FormattedMessage} from 'react-intl';

class PagesNavigationPanel extends React.Component {
    constructor(props) {
        super(props);
        this.loadTheme = this.loadTheme.bind(this);
        this.generateDashboardPagesMenu = this.generateDashboardPagesMenu.bind(this);
        this.isThemeSwitchToggled = this.isThemeSwitchToggled.bind(this);
        this.setThemeSwitchToggled = this.setThemeSwitchToggled.bind(this);
    }

    generateDashboardPagesMenu(page, parentPageId) {
        if (!page.pages) {
            return (
                <Link
                    to={`${this.props.match.params[0]}/dashboards/${this.props.match.params.id}/` + (parentPageId ? parentPageId + "/" + page.id : page.id)}
                    replace={true}>
                    <MenuItem className="pages-menu-item" primaryText={page.name}/>
                </Link>
            );
        } else {
            parentPageId = parentPageId ? parentPageId + "/" + page.id : page.id;
            return (
                <section>
                    <Link to={`${this.props.match.params[0]}/dashboards/${this.props.match.params.id}/` + parentPageId}
                          replace={true}>
                        <MenuItem className="pages-menu-item" primaryText={page.name}/>
                    </Link>
                    <MenuItem primaryText="">
                        {page.pages.map(page => {
                            return this.generateDashboardPagesMenu(page, parentPageId)
                        })}
                    </MenuItem>
                </section>
            );
        }
    }

    componentWillMount() {
        this.loadTheme("", this.isThemeSwitchToggled());
    }

    render() {
        if (this.props.dashboardContent) {
            this.props.pagesList = this.props.dashboardContent.map(page => {
                return (
                    <Paper className="pages-menu" style={{"backgroundColor":"transparent"}}>
                        <Menu className="pages-menu">
                            {this.generateDashboardPagesMenu(page)}
                        </Menu>
                    </Paper>
                );
            });
        }

        return (
            <div>
                <div className="dashboard-view-product-logo">
                    <i className="icon fw fw-wso2-logo"></i>
                </div>
                <div className="dashboard-view-product-name">
                    {this.props.dashboardName}
                </div>
                <div>
                    {this.props.pagesList}
                </div>
                <div className="dark-light-theme-switch-div">
                    <FormattedMessage id="light" defaultMessage="Light"/>
                    <Toggle
                        onToggle={this.loadTheme}
                        labelPosition="right"
                        label={<FormattedMessage id="dark" defaultMessage="Dark"/>}
                        defaultToggled={this.isThemeSwitchToggled()}
                        className="dark-light-theme-switch-toggleBtn"
                    />
                </div>
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

export default PagesNavigationPanel;