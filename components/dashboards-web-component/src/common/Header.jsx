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
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import Link from 'react-router-dom/Link';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
// TODO: Remove MuiThemeProviderNEW
import MuiThemeProviderNEW from '@material-ui/core/styles/MuiThemeProvider';
import withStyles from '@material-ui/core/styles/withStyles';

import { newDarkTheme } from '../utils/Theme';
import WidgetStoreButton from './WidgetButton';
import PortalButton from './PortalButton';
import UserMenu from './UserMenu';

const styles = theme => ({
    title: {
        flexGrow: 1,
        paddingLeft: theme.spacing.unit,
    },
});

/**
 * Header component.
 */
class Header extends Component {
    render() {
        const {
            classes,
            logo,
            title,
            extraRightElement,
            showWidgetStoreButton,
            showPortalButton,
            showUserMenu,
        } = this.props;

        return (
            <MuiThemeProviderNEW theme={newDarkTheme}>
                <AppBar position='static'>
                    <Toolbar variant='dense'>
                        {logo}
                        <Typography variant='h6' color='inherit' className={classes.title}>
                            {title}
                        </Typography>
                        {extraRightElement}
                        {showWidgetStoreButton && <WidgetStoreButton />}
                        {showPortalButton && <PortalButton />}
                        {showUserMenu && <UserMenu />}
                    </Toolbar>
                </AppBar>
            </MuiThemeProviderNEW>
        );
    }
}

Header.propTypes = {
    logo: PropTypes.element,
    title: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element,
    ]),
    extraRightElement: PropTypes.element,
    showWidgetStoreButton: PropTypes.bool,
    showPortalButton: PropTypes.bool,
    showUserMenu: PropTypes.bool,
    classes: PropTypes.shape({}).isRequired,
};

Header.defaultProps = {
    logo: (
        <Link style={{ display: 'flex', alignItems: 'center' }} to='/'>
            <img
                height='17'
                src={`${window.contextPath}/public/app/images/logo.svg`}
                alt='logo'
            />
        </Link>
    ),
    title: <FormattedMessage id='portal.title' defaultMessage='Portal' />,
    extraRightElement: null,
    showWidgetStoreButton: false,
    showPortalButton: false,
    showUserMenu: true,
};

export default withStyles(styles)(Header);
