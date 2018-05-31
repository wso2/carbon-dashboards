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

import AuthManager from './utils/AuthManager';
import DashboardCreatePage from '../designer/DashboardCreatePage';
import DashboardDesignerPage from '../designer/DashboardDesignerPage';
import DashboardSettings from '../designer/DashboardSettings';
import DashboardListingPage from '../listing/DashboardListingPage';
import DashboardViewPage from '../viewer/DashboardViewPage';
import GadgetsGenerationWizard from '../gadgets-generation-wizard/components/GadgetsGenerationWizard';

/**
 * Session skew.
 */
const sessionSkew = 100;

/**
 * Secured router (protects secured pages).
 */
export default class SecuredRouter extends Component {

    constructor() {
        super();
        this.handleSessionInvalid = this.handleSessionInvalid.bind(this);
        window.handleSessionInvalid = this.handleSessionInvalid;
    }

    handleSessionInvalid() {
        this.forceUpdate();
    }

    /**
     * Refreshes the access token by validating the expiration timee.
     */
    componentWillMount() {
        setInterval(function () {
            if (AuthManager.getUser()) {
                const expiresOn = new Date(AuthManager.getUser().expires);
                if ((expiresOn - new Date()) / 1000 < sessionSkew) {
                    AuthManager.authenticateWithRefreshToken();
                }
            }
        }, 60000);
    }

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

            const params = Qs.stringify({referrer});
            return (
                <Redirect to={{pathname: '/login', search: params}} />
            );
        }

        return (
            <Switch>
                {/* Dashboard listing a.k.a. landing page */}
                <Route exact path={'/'} component={DashboardListingPage} />

                {/* Create dashboard */}
                <Route exact path={'/create'} component={DashboardCreatePage} />

                {/* Create gadget */}
                <Route exact path={'/createGadget'} component={GadgetsGenerationWizard} />

                {/* Dashboard settings */}
                <Route exact path={'/settings/:id'} component={DashboardSettings} />

                {/* Dashboard designer */}
                <Route exact path='/designer/:dashboardId/:pageId?/:subPageId?' component={DashboardDesignerPage} />

                {/* Dashboard view */}
                <Route exact path='/dashboards/:dashboardId/:pageId?/:subPageId?' component={DashboardViewPage} />
            </Switch>
        );
    }
}
