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

import {Checkbox, RaisedButton, Snackbar, TextField} from 'material-ui';
import {darkBaseTheme, getMuiTheme, MuiThemeProvider} from 'material-ui/styles';
import Qs from 'qs';
import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';
import PropTypes from 'prop-types';
import {FormPanel, Header} from '../common';

import {FormattedMessage} from 'react-intl';

import AuthManager from './utils/AuthManager';

const muiTheme = getMuiTheme(darkBaseTheme);

/**
 * Style constants.
 */
const styles = {
    messageBox: {textAlign: 'center', color: 'white'},
    errorMessage: {backgroundColor: '#17262e', color: 'white', border: '2px solid #e74c3c'},
    cookiePolicy: {padding: '10px', backgroundColor: '#fcf8e3', fontFamily: muiTheme.fontFamily,
        border: '1px solid #faebcc', color: '#8a6d3b'},
    cookiePolicyAnchor: {fontWeight: 'bold', color: '#8a6d3b'}
};

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
            referrer: window.contextPath,
        };
        this.authenticate = this.authenticate.bind(this);
    }

    /**
     * Extract the referrer and check whether the user logged-in.
     */
    componentDidMount() {
        // Extract referrer from the query string.
        const queryString = this.props.location.search.replace(/^\?/, '');
        const params = Qs.parse(queryString);
        if (params.referrer) {
            this.state.referrer = params.referrer;
        }

        // If the user already logged in set the state to redirect user to the referrer page.
        if (AuthManager.isLoggedIn()) {
            this.state.authenticated = true;
        }
    }

    /**
     * Refresh the access token when the browser session is restored.
     */
    componentWillMount(){
        if (AuthManager.isRememberMeSet() && !AuthManager.isLoggedIn()) {
            AuthManager.authenticateWithRefreshToken()
                .then(() => this.setState({authenticated: true}));
        }
    }

    /**
     * Call authenticate API and authenticate the user.
     *
     * @param {{}} e event
     */
    authenticate(e) {
        e.preventDefault();
        AuthManager
            .authenticate(this.state.username, this.state.password, this.state.rememberMe)
            .then(() => this.setState({authenticated: true}))
            .catch((error) => {
                const errorMessage = error.response && error.response.status === 401 ?
                    this.context.intl.formatMessage({
                        id: "login.error.message",
                        defaultMessage: "Invalid username/password!"
                    }) :
                    this.context.intl.formatMessage({
                        id: "login.unknown.error",
                        defaultMessage: "Unknown error occurred!"
                    });
                this.setState({
                    username: '',
                    password: '',
                    error: errorMessage,
                    showError: true,
                });
            });
    }

    /**
     * Renders the login page.
     *
     * @return {XML} HTML content
     */
    render() {
        // If the user is already authenticated redirect to referrer link.
        if (this.state.authenticated) {
            return (
                <Redirect to={this.state.referrer}/>
            );
        }

        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                <div>
                    <Header title={<FormattedMessage id="portal" defaultMessage="Portal"/>} hideUserSettings/>
                    <FormPanel title={<FormattedMessage id="login.title" defaultMessage="Login"/>}
                               onSubmit={this.authenticate}>
                        <TextField
                            autoFocus
                            fullWidth
                            autoComplete="off"
                            floatingLabelText={<FormattedMessage id="login.username" defaultMessage="Username"/>}
                            value={this.state.username}
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
                            value={this.state.password}
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
                            style={{'margin':'30px 0'}}
                        />
                        <br />
                        <RaisedButton
                            primary
                            type="submit"
                            disabled={this.state.username === '' || this.state.password === ''}
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
                        contentStyle={styles.messageBox}
                        bodyStyle={styles.errorMessage}
                        onRequestClose={() => this.setState({error: '', showError: false})}
                    />
                </div>
            </MuiThemeProvider>
        );
    }
}

Login.contextTypes = {
    intl: PropTypes.object.isRequired
};