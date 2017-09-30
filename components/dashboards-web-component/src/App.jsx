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

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Route, Link, Switch} from 'react-router-dom';
// App components
import DashboardView from './viewer/DashboardView';
import DashboardListing from './listing/DashboardListing';
import DashboardDesigner from './designer/DashboardDesigner';
import DashboardCreate from './designer/DashboardCreatePage';
import DashboardSettings from './designer/DashboardSettings';

export default class App extends Component {
    render () {
        // TODO portal is the app context. Need to get the app context properly and use here
        return (
            <BrowserRouter history>
                <Switch>
                    {/* Dashboard listing a.k.a. landing page */}
                    <Route exact path='/portal' component={DashboardListing}/>
                    {/* Create dashboard */}
                    <Route exact path='/portal/create' component={DashboardCreate}/>
                    {/* Dashboard settings */}
                    <Route exact path='/portal/settings/:id' component={DashboardSettings}/>
                    {/* Dashboard designer */}
                    <Route exact path='*/designer/:id' component={DashboardDesigner}/>
                    <Route path='*/designer/:id/*' component={DashboardDesigner}/>
                    {/* Dashboard view */}
                    <Route exact path='*/dashboards/:id' component={DashboardView}/>
                    <Route path='*/dashboards/:id/*' component={DashboardView}/>
                </Switch>
            </BrowserRouter>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('content'));