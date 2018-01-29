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
import FlatButton from 'material-ui/FlatButton';
import {FormattedMessage} from 'react-intl';
import {Header} from '../common';
import DashboardThumbnail from './DashboardThumbnail';
import DashboardAPI from '../utils/apis/DashboardAPI';
import '../../public/css/dashboard.css';
import '../common/Global.css';
import { Redirect } from 'react-router-dom';

const muiTheme = getMuiTheme(darkBaseTheme);

class DashboardListing extends React.Component {
    constructor() {
        super();
        this.state = {
            dashboards: "",
            open: true,
            isSessionValid: true,
        };
        this.retrieveDashboards = this.retrieveDashboards.bind(this);
    }

    componentDidMount() {
        this.retrieveDashboards();
    }

    render() {
        if (!this.state.isSessionValid) {
            return (
                <Redirect to={{pathname: `${window.contextPath}/logout`}}/>
            );
        }
        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                <div>
                    <Header title={<FormattedMessage id="portal" defaultMessage="Portal"/>}/>

                    {/* Portal navigation bar */}
                    <div className="navigation-bar">
                        <FlatButton
                            label={<FormattedMessage id="create.dashboard" defaultMessage="Create Dashboard"/>}
                            icon={<ContentAdd/>} primary
                            style={{'margin-right': '12px'}}
                            labelStyle={{'paddingLeft': '2px' }}
                            onClick={() => {
                                window.location.href = window.contextPath + '/create/';
                            }}/>
                        <FlatButton
                            label={<FormattedMessage id="create.widget" defaultMessage="Create Widget"/>}
                            icon={<ContentAdd/>} primary
                            style={{'margin-right': '12px'}}
                            labelStyle={{'paddingLeft': '2px' }}
                            onClick={() => {
                                window.location.href = window.contextPath + '/createGadget/';
                            }}/>
                    </div>
                    <div className="dashboard-listing-container" style={{overflow:"auto"}}>
                        {this.state.dashboards}
                    </div>
                </div>
            </MuiThemeProvider>
        );
    }

    retrieveDashboards() {
        let dashboardAPI = new DashboardAPI();
        let promised_dashboard_list = dashboardAPI.getDashboardList();
        let that = this;
        promised_dashboard_list.then((response) => {
            let dashboardList = [];
            let dashboardArray = response.data;
            dashboardArray.sort(function (dashboardA, dashboardB) {
                return dashboardA.url > dashboardB.url;
            });
            dashboardList = dashboardArray.map(dashboard => {
                return <DashboardThumbnail dashboard={dashboard} handleDelete={that.retrieveDashboards}
                                           muiTheme={muiTheme}/>;
            });
            if (dashboardList.length === 0) {
                dashboardList.push(<div className="no-dashboard-label">
                    <FormattedMessage id="listing.no.dashboards.available" defaultMessage="No Dashboards Available"/>
                </div>);
            }
            that.setState({dashboards: dashboardList});
        }).catch(function (error) {
                if (error.response.status === 401) {
                    that.setState({isSessionValid: false});
                }
                //TODO Need to use proper notification library to show the error
            }
        );
    }
}

export default DashboardListing;