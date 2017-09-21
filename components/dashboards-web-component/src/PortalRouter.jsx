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
import DashboardView from './DashboardView';
import DashboardListing from './DashboardListing';
import DashboardDesigner from './DashboardDesigner';
import DashboardCreate from './DashboardCreatePage';
import DashboardSettings from './DashboardSettings';
import {
    Route,
    Link,
    Switch
} from 'react-router-dom';

class PortalRouter extends React.Component {
    //TODO portal is the app context. Need to get the app context properly and use here
    render() {
        return <div>
            <Switch>
                <Route exact path='/portal' component={DashboardListing}/>
                <Route exact path='/portal/create' component={DashboardCreate}/>
                <Route exact path='/portal/settings/:id' component={DashboardSettings}/>
                <Route exact path='*/designer/:id' component={DashboardDesigner}/>
                <Route path='*/designer/:id/*' component={DashboardDesigner}/>
                <Route exact path='*/dashboards/:id' component={DashboardView}/>
                <Route path='*/dashboards/:id/*' component={DashboardView}/>
            </Switch>
        </div>;
    }
}

export default PortalRouter;