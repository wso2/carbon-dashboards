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
import Header from './Header';
import axios from 'axios';
import NavigationBar from './NavigationBar';
import DashboardThumbnail from './DashboardThumbnail';
import '../public/css/dashboard.css';

class DashboardListing extends React.Component {
    constructor() {
        super();
        this.state = {
            dashboard: ""
        };
        this.retrieveDashboards = this.retrieveDashboards.bind(this);
    }

    componentDidMount() {
        this.retrieveDashboards();
    }

    retrieveDashboards() {
        //TODO Need to get the baseURL properly when the server part is ready
        let httpClient = axios.create({
            baseURL: window.location.origin,
            timeout: 2000
        });
        let thisRef = this;
        httpClient.get('/dashboards').then(function (response) {
            let dashboardList;
            dashboardList = response.data.map(dashboard => {
                return <DashboardThumbnail dashboard={dashboard}/>;
            });
            thisRef.setState({dashboard: dashboardList});
        }).catch(function (error) {
            //TODO Need to use proper notification library to show the error
        });
    }

    render() {
        //TODO Need to get the dashboardName using app context
        return <div>
            <Header dashboardName="Portal"/>
            <NavigationBar/>
            <div>
                {this.state.dashboard}
            </div>
        </div>;
    }
}

export default DashboardListing;