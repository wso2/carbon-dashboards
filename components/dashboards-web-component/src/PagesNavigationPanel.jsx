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
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Paper from 'material-ui/Paper';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right';
import {Link} from 'react-router-dom';

class PagesNavigationPanel extends React.Component {
    constructor(props) {
        super(props);
        this.loadTheme = this.loadTheme.bind(this);
        this.generateDashboardPagesMenu = this.generateDashboardPagesMenu.bind(this);
    }

    generateDashboardPagesMenu(page, parentPageId) {
        if (!page.pages) {
            return <Link to={`${this.props.match.params[0]}/dashboards/${this.props.match.params.id}/` +
            (parentPageId ? parentPageId + "/" + page.id : page.id)} replace={true}>
                <MenuItem className="pages-menu-item" leftIcon={<ChevronRight/>} primaryText={page.name}/>
            </Link>;
        } else {
            parentPageId = parentPageId ? parentPageId + "/" + page.id : page.id;
            return <section><Link
                to={`${this.props.match.params[0]}/dashboards/${this.props.match.params.id}/` + parentPageId}
                replace={true}>
                <MenuItem className="pages-menu-item" leftIcon={<ChevronRight/>} primaryText={page.name}/>
            </Link>
                <MenuItem primaryText="">
                    { page.pages.map(page => {
                        return this.generateDashboardPagesMenu(page, parentPageId)
                    }) }
                </MenuItem></section>;
        }
    }

    render() {
        if (this.props.dashboardContent) {
            this.props.pagesList = this.props.dashboardContent.map(page => {
                return <MuiThemeProvider><Paper className="pages-menu">
                    <Menu className="pages-menu">
                        {this.generateDashboardPagesMenu(page)}
                    </Menu>
                </Paper></MuiThemeProvider>;
            });
        }
        this.loadTheme("", false);
        return <div className={"sidebar-wrapper sidebar-nav hidden-xs pages-navigation-panel " + this.props.toggled}>
            <div className="product-logo pages-nav-panel-product-logo">
                <i className="icon fw fw-wso2-logo"></i>
            </div>
            <div className="product-name pages-nav-panel-dashboard-name">
                {this.props.dashboardName}
            </div>
            <div>
                <ul className="nav nav-pills nav-stacked menu-customize pages">
                    {this.props.pagesList}
                </ul>
            </div>
            <hr/>
            <MuiThemeProvider>
                <div className="dark-light-theme-switch-div">
                    Light
                    <Toggle
                        onToggle={this.loadTheme}
                        labelPosition="right"
                        label="Dark"
                        className="dark-light-theme-switch-toggleBtn"
                    />
                </div>
            </MuiThemeProvider>
        </div>;
    }

    loadTheme(event, isInputChecked) {
        var styleSheet = document.getElementById("dashboard-theme");
        if (styleSheet !== null) {
            styleSheet.disabled = true;
            styleSheet.parentNode.removeChild(styleSheet);
        }
        let head = document.getElementsByTagName('head')[0];
        let link = document.createElement('link');
        //TODO Need to get the app context properly when the server is ready
        let appContext = window.location.pathname.split("/")[1];
        let baseURL = window.location.origin;
        link.type = 'text/css';
        if (isInputChecked) {
            link.href = baseURL + "/" + appContext + "/themes/goldenlayout-dark-theme.css";
        } else {
            link.href = baseURL + "/" + appContext + "/themes/goldenlayout-light-theme.css";
        }
        link.id = "dashboard-theme";
        link.rel = "stylesheet";
        head.appendChild(link);
    }
}

export default PagesNavigationPanel;