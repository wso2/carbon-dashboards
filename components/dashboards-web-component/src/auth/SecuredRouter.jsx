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

import Qs from 'qs';
import React, { Component } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import DashboardCreatePage from '../designer/DashboardCreatePage';
import DashboardDesigner from '../designer/DashboardDesigner';
import DashboardSettings from '../designer/DashboardSettings';
import DashboardListing from '../listing/DashboardListing';
import DashboardView from '../viewer/DashboardView';
import AuthManager from './utils/AuthManager';
import GadgetsGenerationWizard from '../gadgets-generation-wizard/components/GadgetsGenerationWizard';

/**
 * App context.
 */
const appContext = window.contextPath;

/**
 * Secured router (protects secured pages).
 */
export default class SecuredRouter extends Component {
    /**
     * Render routing.
     *
     * @return {XML} HTML content
     */
    render() {
        // If the user is not logged in, redirect to the login page.
        if (!AuthManager.isLoggedIn()) {
            let referrer = this.props.location.pathname;
            const arr = referrer.split('');
            if (arr[arr.length - 1] !== '/') {
                referrer += '/';
            }

            const params = Qs.stringify({ referrer });
            return (
                <Redirect to={{ pathname: `${appContext}/login`, search: params }} />
            );
        }

        return (
            <Switch>
                {/* Dashboard listing a.k.a. landing page */}
                <Route exact path={appContext} component={DashboardListing} />

                {/* Create dashboard */}
                <Route exact path={`${appContext}/create`} component={DashboardCreatePage} />

                {/* Create gadget */}
                <Route exact path={`${appContext}/createGadget`} component={GadgetsGenerationWizard} />

                {/* Dashboard settings */}
                <Route exact path={`${appContext}/settings/:id`} component={DashboardSettings} />

                {/* Dashboard designer */}
                <Route exact path='*/designer/:dashboardId' component={DashboardDesigner} />
                <Route path='*/designer/:dashboardId/*' component={DashboardDesigner} />

                {/* Dashboard view */}
                <Route exact path='*/dashboards/:id' component={DashboardView} />
                <Route path='*/dashboards/:id/*' component={DashboardView} />
            </Switch>
        );
    }
}
