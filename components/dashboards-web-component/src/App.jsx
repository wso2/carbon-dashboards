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
import axios from 'axios';
import {addLocaleData, defineMessages, IntlProvider} from 'react-intl';
import {BrowserRouter, Route, Link, Switch} from 'react-router-dom';
// App components
import DashboardView from './viewer/DashboardView';
import DashboardListing from './listing/DashboardListing';
import DashboardDesigner from './designer/DashboardDesigner';
import DashboardCreate from './designer/DashboardCreatePage';
import DashboardSettings from './designer/DashboardSettings';

//TODO: take appContext from UI server utility
const publicPath = '/portal/public/app/';
const language = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage;
const languageWithoutRegionCode = language.toLowerCase().split(/[_-]+/)[0];

class App extends Component {
    constructor() {
        super();
        this.state = {
            messages: {}
        }

    };
    
    componentWillMount(){
        let localeFileName = (languageWithoutRegionCode || language || 'en');
        let that = this;
        axios.get(window.location.origin + publicPath + 'locales/' + localeFileName + '.json')
            .then(function (response) {
                addLocaleData(require('react-intl/locale-data/' + localeFileName));
                that.setState({
                    messages: defineMessages(response.data)
                });
            })
            .catch(function (error) {
                axios.get(window.location.origin + publicPath + 'locales/en.json')
                    .then(function (response) {
                        addLocaleData(require('react-intl/locale-data/en'));
                        that.setState({
                            messages: defineMessages(response.data)
                        });
                    }).catch(function (error) {
                });
            });

    }
    render () {
        // TODO portal is the app context. Need to get the app context properly and use here
        return (
            <IntlProvider locale={language} messages={this.state.messages}>
                <BrowserRouter history>
                    <Switch>
                        {/* Dashboard listing a.k.a. landing page */}
                        <Route exact path='/portal' component={DashboardListing}/>
                        {/* Create dashboard */}
                        <Route exact path='/portal/create' component={DashboardCreate}/>
                        {/* Dashboard settings */}
                        <Route exact path='/portal/settings/:id' component={DashboardSettings}/>
                        {/* Dashboard designer */}
                        <Route exact path='*/designer/:dashboardId' component={DashboardDesigner}/>
                        <Route path='*/designer/:dashboardId/*' component={DashboardDesigner}/>
                        {/* Dashboard view */}
                        <Route exact path='*/dashboards/:id' component={DashboardView}/>
                        <Route path='*/dashboards/:id/*' component={DashboardView}/>
                    </Switch>
                </BrowserRouter>
            </IntlProvider>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('content'));