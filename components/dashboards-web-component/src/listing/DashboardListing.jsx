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
import ContentAdd from 'material-ui/svg-icons/content/add';
import RaisedButton from 'material-ui/RaisedButton';

import {FormattedMessage} from 'react-intl';

import Header from '../common/Header';
import DashboardThumbnail from './DashboardThumbnail';
import DashboardsAPIs from '../utils/apis/DashboardAPIs';
import '../../public/css/dashboard.css';
import '../common/Global.css';

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
        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                <div>
                    <Header title={<FormattedMessage id="portal" defaultMessage="Portal"/>}/>

                    {/* Portal navigation bar */}
                    <div className="navigation-bar">
                        <RaisedButton label={<FormattedMessage id="create.dashboard" defaultMessage="Create dashboard"/>} icon={<ContentAdd/>} primary
                                      style={{'margin-right': '12px'}}
                                      onClick={() => {
                                          window.location.href = window.contextPath + '/create/';
                                      }}/>
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