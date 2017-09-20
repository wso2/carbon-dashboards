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
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import Header from './Header';
import DashboardThumbnail from './DashboardThumbnail';
import DashboardsAPIs from './utils/dashboard-apis';
import '../public/css/dashboard.css';

const muiTheme = getMuiTheme(darkBaseTheme);

class DashboardListing extends React.Component {
    constructor() {
        super();
        this.state = {
            dashboards: "",
            open: true
        };
        this.retrieveDashboards = this.retrieveDashboards.bind(this);
    }

    componentDidMount() {
        this.retrieveDashboards();
    }

    render() {
        //TODO Need to get the dashboardName using app context
        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                <div>
                    <Header dashboardName="Portal"/>
                    <div className="portal-navigation-bar">
                        <Link to={"create"}>
                            <FloatingActionButton mini={true} className="navigation-icon">
                                <ContentAdd />
                            </FloatingActionButton>
                            <div className="create-dashboard-text"> Create Dashboard
                            </div>
                        </Link>
                    </div>
                    <div className="dashboard-listing-container">
                        {this.state.dashboards}
                    </div>
                </div>
            </MuiThemeProvider>
        );
    }

    retrieveDashboards() {
        let dashboardAPIs = new DashboardsAPIs();
        let promised_dashboard_list = dashboardAPIs.getDashboardList();
        let that = this;
        promised_dashboard_list.then((response) => {
            let dashboardList;
            dashboardList = response.data.map(dashboard => {
                return <DashboardThumbnail dashboard={dashboard} muiTheme={muiTheme}/>;
            });
            that.setState({dashboards: dashboardList});
        }).catch(function (error) {
                //TODO Need to use proper notification library to show the error
            }
        );
    }
}

export default DashboardListing;