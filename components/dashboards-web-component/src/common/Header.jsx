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
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import PropTypes from 'prop-types';

// import { AppBar } from 'material-ui';

import UserMenu from './UserMenu';
import defaultTheme from '../utils/Theme';

const styles = {
    root: {
        flexGrow: 1,
    },
    grow: {
        flexGrow: 1,
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
};

class Header extends Component {
    render() {
        return (
            <AppBar position='static'>
                <Toolbar variant='dense'>
                    <IconButton className={this.props.classes.menuButton} color='inherit' aria-label='Logo'>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" color="inherit" className={this.props.classes.grow}>
                        {this.props.title}
                    </Typography>
                    <Button color="inherit">Login</Button>
                </Toolbar>
            </AppBar>
        );
    }
}
//
// <AppBar
//     style={{ zIndex: this.props.theme.zIndex.drawer + 100 }}
//     title={this.props.title}
//     iconElementRight={this.props.rightElement}
//     iconElementLeft={this.props.logo}
//     onLeftIconButtonClick={this.props.onLogoClick}
//     iconStyleLeft={{ margin: '0 15px 0 0', display: 'flex', alignItems: 'center' }}
//     titleStyle={{ fontSize: 16 }}
//     zDepth={2}
// />

Header.propTypes = {
    logo: PropTypes.element,
    onLogoClick: PropTypes.func,
    title: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element,
    ]).isRequired,
    rightElement: PropTypes.element,
    // theme: PropTypes.shape({}),
    classes: PropTypes.object.isRequired, // eslint-disable-line
};

Header.defaultProps = {
    logo: (
        <Link style={{ height: '17px' }} to={'/'}>
            <img
                height='17'
                src={`${window.contextPath}/public/app/images/logo.svg`}
                alt='logo'
            />
        </Link>
    ),
    onLogoClick: null,
    rightElement: <UserMenu />,
    theme: defaultTheme,
};

export default withStyles(styles)(Header);
