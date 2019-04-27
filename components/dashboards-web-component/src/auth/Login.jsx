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

import { Checkbox, RaisedButton, Snackbar, TextField } from 'material-ui';
import { MuiThemeProvider } from 'material-ui/styles';
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import Qs from 'qs';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import FormPanel from '../common/FormPanel';

import AuthManager from './utils/AuthManager';
import Header from '../common/Header';
import defaultTheme from '../utils/Theme';
import { Constants } from './Constants';

/**
 * Style constants.
 */
const styles = {
    cookiePolicy: {
        padding: '10px',
        fontFamily: defaultTheme.fontFamily,
        border: '1px solid #8a6d3b',
        color: '#8a6d3b'
    },
    cookiePolicyAnchor: {
        fontWeight: 'bold',
        color: '#8a6d3b'
    },
};

const REFERRER_KEY = 'referrer';

/**
 * Login page.
 */
export default class Login extends Component {
    /**
     * Constructor.
     *
     * @param {{}} props Props
     */
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            authenticated: false,
            rememberMe: false,
            authType: Constants.AUTH_TYPE_UNKNOWN,
        };
        this.setReferrer(this.getReferrerFromQueryString());
        this.authenticate = this.authenticate.bind(this);
    }

    /**
     * Check authentication type and initialize the respective flow.
     */
    componentWillMount() {
        AuthManager.getAuthType()
            .then((response) => {
                if (response.data.authType === Constants.AUTH_TYPE_SSO) {
                    // initialize sso authentication flow
                    this.initSSOAuthenticationFlow();
                } else {
                    // initialize default authentication flow
                    this.initDefaultAuthenticationFlow();
                }
                // Once the auth type has been changed asynchronously, login page needs to be re-rendered to show the
                // login form.
                this.setState({ authType: response.data.authType });
            }).catch((e) => {
            console.error('Unable to get the authentication type.', e);
        });
    }

    /**
     * Initializes the default authentication flow.
     */
    initDefaultAuthenticationFlow() {
        if (AuthManager.isRememberMeSet() && !AuthManager.isLoggedIn()) {
            AuthManager.authenticateWithRefreshToken()
                .then(() =>
                    this.setState({
                        authenticated: true
                    })
                );
        }
    }

    /**
     * Initializes the SSO authentication flow.
     */
    initSSOAuthenticationFlow() {
        // check if the userDTO is available. if so try to authenticate the user. instead forward the user to the idp.
        // USER_DTO={"authUser":"admin","pID":"0918c1ad-fc0a-35fa","lID":"3ca21853-bd3c-3dfa","validityPeriod":3381};
        if (AuthManager.isSSOAuthenticated()) {
            const {authUser, pID, lID, validityPeriod, iID} = AuthManager.getSSOUserCookie();
            localStorage.setItem('rememberMe', true);
            localStorage.setItem('username', authUser);
            AuthManager.setUser({
                username: authUser,
                SDID: pID,
                validity: validityPeriod,
                expires: AuthManager.calculateExpiryTime(validityPeriod),
            });
            AuthManager.setCookie(Constants.REFRESH_TOKEN_COOKIE, lID, 604800, window.contextPath);
            AuthManager.setCookie(Constants.ID_TOKEN_COOKIE, iID, 604800, window.contextPath);
            AuthManager.deleteCookie(Constants.USER_DTO_COOKIE);
            this.setState({
                authenticated: true,
            });
        } else {
            // redirect the user to the service providers auth url
            AuthManager.ssoAuthenticate()
                .then((url) => {
                    window.location.href = url;
                })
                .catch((e) => {
                    console.error('Error getting SSO auth URL.');
                });
        }
    }

    /**
     * Get the referrer URL for the redirection after successful login.
     *
     * @returns {string} referrer URL
     */
    getReferrer() {
        const referrer = localStorage.getItem(REFERRER_KEY);
        localStorage.removeItem(REFERRER_KEY);
        return referrer || '/';
    }

    /**
     * Set referrer URL to the local storage.
     *
     * @param {String} referrer Referrer URL
     */
    setReferrer(referrer) {
        if (localStorage.getItem(REFERRER_KEY) == null) {
            localStorage.setItem(REFERRER_KEY, referrer);
        }
    }

    /**
     * Extract referrer URL from the query string.
     *
     * @returns {string} referrer URL
     */
    getReferrerFromQueryString() {
        const queryString = this.props.location.search.replace(/^\?/, '');
        return Qs.parse(queryString).referrer;
    }

    /**
     * Call authenticate API and authenticate the user.
     *
     * @param {{}} e event
     */
    authenticate(e) {
        const { intl } = this.context;
        const { username, password, rememberMe } = this.state;
        e.preventDefault();
        AuthManager
            .authenticate(username, password, rememberMe)
            .then(() => this.setState({ authenticated: true }))
            .catch((error) => {
                const errorMessage = error.response && error.response.status === 401
                    ? intl.formatMessage({ id: 'login.error.message', defaultMessage: 'Invalid username/password!' })
                    : intl.formatMessage({ id: 'login.unknown.error', defaultMessage: 'Unknown error occurred!' });
                this.setState({
                    username: '',
                    password: '',
                    error: errorMessage,
                    showError: true,
                });
            });
    }

    /**
     * Render default login page.
     *
     * @return {XML} HTML content
     */
    renderDefaultLogin() {
        const { username, password } = this.state;
        return (
            <MuiThemeProvider muiTheme={defaultTheme}>
                <div>
                    <Header
                        title={<FormattedMessage id='portal.title' defaultMessage='Portal' />}
                        rightElement={<span />}
                    />
                    <FormPanel
                        title={<FormattedMessage id="login.title" defaultMessage="Login" />}
                        onSubmit={this.authenticate}
                    >
                        <TextField
                            autoFocus
                            fullWidth
                            autoComplete="off"
                            floatingLabelText={<FormattedMessage id="login.username" defaultMessage="Username"/>}
                            value={username}
                            onChange={(e) => {
                                this.setState({
                                    username: e.target.value,
                                });
                            }}
                        />
                        <br />
                        <TextField
                            fullWidth
                            type="password"
                            autoComplete="off"
                            floatingLabelText={<FormattedMessage id="login.password" defaultMessage="Password"/>}
                            value={password}
                            onChange={(e) => {
                                this.setState({
                                    password: e.target.value,
                                });
                            }}
                        />
                        <br />
                        <Checkbox
                            label={<FormattedMessage id="login.rememberMe" defaultMessage="Remember Me"/>}
                            checked={this.state.rememberMe}
                            onCheck={(e, checked) => {
                                this.setState({
                                    rememberMe: checked,
                                });
                            }}
                            style={{ margin: '30px 0' }}
                        />
                        <br />
                        <RaisedButton
                            primary
                            type="submit"
                            disabled={username === '' || password === ''}
                            label={<FormattedMessage id="login.title" defaultMessage="Login"/>}
                            disabledBackgroundColor="rgb(27, 40, 47)"
                        />
                        <br />
                        <br />
                        <div style={styles.cookiePolicy}>
                            <div>
                                <FormattedMessage
                                    id="login.cookie.policy.before"
                                    defaultMessage="After a successful sign in, we use a cookie in your browser to
                                    track your session. You can refer our "
                                />
                                <a
                                    style={styles.cookiePolicyAnchor}
                                    href="/policies/cookie-policy"
                                    target="_blank"
                                >
                                    <FormattedMessage id="login.cookie.policy" defaultMessage="Cookie Policy"/>
                                </a>
                                <FormattedMessage id="login.cookie.policy.after" defaultMessage=" for more details."/>
                            </div>
                        </div>
                        <br />
                        <div style={styles.cookiePolicy}>
                            <div>
                                <FormattedMessage
                                    id="login.privacy.policy.before"
                                    defaultMessage="By signing in, you agree to our "
                                />
                                <a
                                    style={styles.cookiePolicyAnchor}
                                    href="/policies/privacy-policy"
                                    target="_blank">
                                    <FormattedMessage id="login.privacy.policy" defaultMessage="Privacy Policy"/>
                                </a>
                                <FormattedMessage id="login.privacy.policy.after" defaultMessage="."/>
                            </div>
                        </div>
                    </FormPanel>
                    <Snackbar
                        message={this.state.error}
                        open={this.state.showError}
                        autoHideDuration="4000"
                        onRequestClose={() => this.setState({ error: '', showError: false })}
                    />
                </div>
            </MuiThemeProvider>
        );
    }

    /**
     * Renders the login page.
     *
     * @return {XML} HTML content
     */
    render() {
        const { authenticated, authType } = this.state;
        // If the user is already authenticated redirect to referrer link.
        if (authenticated) {
            return (
                <Redirect to={this.getReferrer()} />
            );
        }

        // If the authType is not defined, show a blank page (or loading gif).
        if (authType === Constants.AUTH_TYPE_UNKNOWN) {
            return <div />;
        }

        // If the authType is sso, show a blank page since the redirection is pending.
        if (authType === Constants.AUTH_TYPE_SSO) {
            return <div />;
        }

        // Render the default login form.
        return this.renderDefaultLogin();
    }
}

Login.contextTypes = {
    intl: PropTypes.object.isRequired
};
