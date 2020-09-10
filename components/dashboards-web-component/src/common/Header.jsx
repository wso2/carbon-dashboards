/*
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { AppBar } from 'material-ui';
import { Helmet } from 'react-helmet';
import Axios from 'axios';

import UserMenu from './UserMenu';
import defaultTheme from '../utils/Theme';

import AuthManager from '../auth/utils/AuthManager';

const baseURL = `${window.location.origin}${window.contextPath}/apis/dashboards`;

export default class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            faviconPath: '',
            logoPath: '',
        };
    }

    componentDidMount() {
        const httpClient = Axios.create({
            baseURL,
            timeout: 300000,
            headers: { Authorization: 'Bearer ' + AuthManager.getUser().SDID },
        });

        httpClient.get('/favicon-path')
            .then((response) => {
                this.setState({ faviconPath: response.data });
            })
            .catch((error) => {
                console.error('Unable to get the favicon path for the dashboard.', error);
            });

        httpClient.get('/logo-path')
            .then((response) => {
                this.setState({ logoPath: response.data });
            })
            .catch((error) => {
                console.error('Unable to get the logo image path for the dashboard.', error);
            });
    }

    render() {
        const { faviconPath, logoPath } = this.state;
        const {
            onLogoClick, theme, title, rightElement, NavMenu
        } = this.props;
        const logo = (
            <>
                {NavMenu}
                <Link style={{ height: '17px' }} to="/">
                    <img
                        height='17'
                        src={logoPath}
                        alt='logo'
                    />
                </Link>
            </>
        );

        return (
            <>
                <Helmet>
                    <link
                        id="favicon"
                        rel="shortcut icon"
                        href={faviconPath}
                        type="image/x-icon"
                    />
                </Helmet>
                <AppBar
                    style={{ zIndex: theme.zIndex.drawer + 100 }}
                    title={title}
                    iconElementRight={rightElement}
                    iconElementLeft={logo}
                    iconStyleLeft={{ margin: '0 15px 0 0', display: 'flex', alignItems: 'center' }}
                    titleStyle={{ fontSize: 16 }}
                    zDepth={2}
                />
            </>
        );
    }
}


Header.propTypes = {
    onLogoClick: PropTypes.func,
    title: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element,
    ]).isRequired,
    rightElement: PropTypes.element,
    theme: PropTypes.shape({}),
};

Header.defaultProps = {
    onLogoClick: null,
    rightElement: <UserMenu />,
    theme: defaultTheme,
};
