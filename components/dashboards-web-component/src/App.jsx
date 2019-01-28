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

import Axios from 'axios';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { addLocaleData, defineMessages, IntlProvider } from 'react-intl';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Login from './auth/Login';
import Logout from './auth/Logout';
import SecuredRouter from './auth/SecuredRouter';

import '../public/css/dashboard.css';

/**
 * App context.
 */
const appContext = window.contextPath;

/**
 * Language.
 * @type {string}
 */
const language = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage;

/**
 * Language without region code.
 */
const languageWithoutRegionCode = language.toLowerCase().split(/[_-]+/)[0];

/**
 * Entry-point of the portal application.
 */
class App extends Component {
    /**
     * Constructor. Initializes the state.
     */
    constructor() {
        super();
        this.state = {
            messages: {},
        };
    }

    /**
     * Initialize i18n.
     */
    componentWillMount() {
        const locale = (languageWithoutRegionCode || language || 'en');
        this.loadLocale(locale).catch(() => {
            this.loadLocale().catch(() => {
                // TODO: Show error message.
            });
        });
    }

    /**
     * Load locale file.
     *
     * @param {string} locale Locale name
     * @returns {Promise} Promise
     */
    loadLocale(locale = 'en') {
        return new Promise((resolve, reject) => {
            Axios
                .get(`${window.contextPath}/public/app/locales/${locale}.json`)
                .then((response) => {
                    // eslint-disable-next-line global-require, import/no-dynamic-require
                    addLocaleData(require(`react-intl/locale-data/${locale}`));
                    this.setState({ messages: defineMessages(response.data) });
                    resolve();
                })
                .catch(error => reject(error));
        });
    }

    /**
     * Renders routing.
     *
     * @return {XML} HTML content
     */
    render() {
        return (
            <IntlProvider locale={language} messages={this.state.messages}>
                <BrowserRouter basename={appContext}>
                    <Switch>
                        {/* Authentication */}
                        <Route path='/login' component={Login} />
                        <Route path='/logout' component={Logout} />
                        {/* Secured routes */}
                        <Route component={SecuredRouter} />
                    </Switch>
                </BrowserRouter>
            </IntlProvider>
        );
    }
}

// Following is exposed to the global space as widgets needs them as external/peer dependencies.
global.React = React;
global.ReactDOM = ReactDOM;

ReactDOM.render(<App />, document.getElementById('content'));
