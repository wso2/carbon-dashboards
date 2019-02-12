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
import { FormattedMessage } from 'react-intl';
import Redirect from 'react-router-dom/Redirect';
import Qs from 'qs';
import PropTypes from 'prop-types';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Snackbar from '@material-ui/core/Snackbar';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import withStyles from '@material-ui/core/styles/withStyles';
import AccountCircle from '@material-ui/icons/AccountCircle';

import Header from '../common/Header';
import AuthManager from './utils/AuthManager';
import { newDarkTheme } from '../utils/Theme';

const defaultTheme = newDarkTheme;

const styles = theme => ({
    root: {
        width: '100%',
    },
    avatar: {
        margin: theme.spacing.unit * 2,
    },
    gridItem: {
        marginTop: theme.spacing.unit * 8,
    },
    paper: {
        marginTop: theme.spacing.unit * 2,
        padding: theme.spacing.unit * 2,
    },
    title: {
        padding: theme.spacing.unit * 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    form: {
        paddingBottom: theme.spacing.unit * 2,
    },
    submit: {
        marginTop: theme.spacing.unit * 3,
    },
});

/**
 * Login page.
 */
class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            rememberMe: false,
            authenticated: AuthManager.isLoggedIn(),
            authenticationErrorCode: 0,
        };
        this.authenticate = this.authenticate.bind(this);
    }

    componentDidMount() {
        if (AuthManager.isRememberMeSet() && !AuthManager.isLoggedIn()) {
            AuthManager.authenticateWithRefreshToken()
                .then(() => this.setState({ authenticated: true }));
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
            .then(() => this.setState({ authenticated: true }))
            .catch((error) => {
                this.setState({
                    username: '',
                    password: '',
                    rememberMe: false,
                    authenticated: AuthManager.isLoggedIn(),
                    authenticationErrorCode: error.response ? error.response.status : -1,
                });
            });
    }

    renderLoginFormHeader(classes) {
        return (
            <div className={classes.title}>
                <Avatar className={classes.avatar}><AccountCircle /></Avatar>
                <Typography component='h1' variant='h5'>
                    <FormattedMessage id='login.title' defaultMessage='Login to Portal' />
                </Typography>
            </div>
        );
    }

    renderLoginForm(classes) {
        return (
            <form className={classes.form} onSubmit={this.authenticate}>
                <TextField
                    margin='normal'
                    required
                    autoFocus
                    fullWidth
                    autoComplete='off'
                    label={<FormattedMessage id='login.username' defaultMessage='Username' />}
                    name='username'
                    value={this.state.username}
                    onChange={event => this.setState({ username: event.target.value })}
                />
                <TextField
                    margin='normal'
                    required
                    fullWidth
                    type='password'
                    autoComplete='off'
                    label={<FormattedMessage id='login.password' defaultMessage='Password' />}
                    name='password'
                    value={this.state.password}
                    onChange={event => this.setState({ password: event.target.value })}
                />
                <FormControlLabel
                    control={(
                        <Checkbox
                            value='remember'
                            color='primary'
                            checked={this.state.rememberMe}
                            onChange={event => this.setState({ rememberMe: event.target.checked })}
                        />
                    )}
                    label={<FormattedMessage id='login.rememberMe' defaultMessage='Remember Me' />}
                />
                <Button
                    type='submit'
                    fullWidth
                    variant='contained'
                    color='primary'
                    className={classes.submit}
                    disabled={this.state.username === '' || this.state.password === ''}
                >
                    <FormattedMessage id='login.button' defaultMessage='Login' />
                </Button>
            </form>
        );
    }

    renderCookiePolicy() {
        return (
            <Typography variant='body2'>
                <FormattedMessage
                    id='login.cookie-policy'
                    values={{
                        link: (
                            <Link href='/policies/cookie-policy' target='_blank'>
                                <FormattedMessage id='login.cookie-policy.link' defaultMessage='Cookie Policy' />
                            </Link>
                        ),
                    }}
                    defaultMessage='After a successful sign in, we use a cookie in your browser to track your session.
                    You can refer our {link} for more details.'
                />
            </Typography>
        );
    }

    renderPrivacyPolicy() {
        return (
            <Typography variant='body2'>
                <FormattedMessage
                    id='login.privacy.policy'
                    values={{
                        link: (
                            <Link href='/policies/privacy-policy' target='_blank'>
                                <FormattedMessage id='login.privacy-policy.link' defaultMessage='Privacy Policy' />
                            </Link>
                        ),
                    }}
                    defaultMessage='By signing in, you agree to our {link}.'
                />
            </Typography>
        );
    }

    renderErrorMessage() {
        const { authenticationErrorCode } = this.state;
        if (!authenticationErrorCode) {
            return null;
        }

        let message;
        switch (authenticationErrorCode) {
            case 401:
                message = <FormattedMessage id='login.error.credentials' defaultMessage='Invalid username/password' />;
                break;
            case 500:
                message = <FormattedMessage id='login.error.server' defaultMessage='Server error' />;
                break;
            default:
                message = <FormattedMessage id='login.error.unknown' defaultMessage='Unknown error occurred!' />;
        }
        return (
            <Snackbar
                open
                message={message}
                autoHideDuration={4000}
                onClose={() => this.setState({ authenticationErrorCode: 0 })}
            />
        );
    }

    render() {
        // If the user is already authenticated redirect to referrer link.
        if (this.state.authenticated) {
            let { referrer } = Qs.parse(this.props.location.search, { ignoreQueryPrefix: true });
            if (referrer) {
                if (referrer.startsWith(window.contextPath)) {
                    const contextPathTrimmed = referrer.substr(window.contextPath.length);
                    referrer = (contextPathTrimmed && contextPathTrimmed.length) ? contextPathTrimmed : '/';
                } else if (!referrer.startsWith('/')) {
                    referrer = '/' + referrer;
                }
            } else {
                referrer = '/';
            }
            return (
                <Redirect to={referrer} />
            );
        }

        const { classes } = this.props;
        return (
            <MuiThemeProvider theme={defaultTheme}>
                <Header
                    title={<FormattedMessage id='portal.title' defaultMessage='Portal' />}
                    showUserMenu={false}
                />

                <Grid container justify='center' className={classes.root}>
                    <Grid item xl={2} lg={3} md={4} sm={6} xs={9} className={classes.gridItem}>
                        <Paper elevation={2} className={classes.paper}>
                            {this.renderLoginFormHeader(classes)}
                            {this.renderLoginForm(classes)}
                        </Paper>
                        <Paper elevation={2} className={classes.paper}>
                            {this.renderCookiePolicy()}
                            <br />
                            {this.renderPrivacyPolicy()}
                        </Paper>
                    </Grid>
                </Grid>

                {this.renderErrorMessage()}
            </MuiThemeProvider>
        );
    }
}

Login.propTypes = {
    location: PropTypes.shape({ search: PropTypes.string }).isRequired,
    classes: PropTypes.shape({}).isRequired,
};

export default withStyles(styles)(Login);
