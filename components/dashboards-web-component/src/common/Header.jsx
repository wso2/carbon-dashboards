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
import PropTypes from 'prop-types';
import MuiThemeProviderNEW from '@material-ui/core/styles/MuiThemeProvider';

import { darkTheme, newDarkTheme } from '../utils/Theme';
import UserMenu from './UserMenu';

const defaultTheme = newDarkTheme;

const styles = {
    root: {
        flexGrow: 1,
        //zIndex: this.props.theme.zIndex.drawer + 100
    },
    title: {
        flexGrow: 1,
        fontSize: 16
    },
    logo: {
        label:{
            alignItems: 'center',
            display: 'flex',
            margin: '0 15px 0 0'
        }
    }
};

class Header extends Component {
    render() {
        return (
            <MuiThemeProviderNEW theme={newDarkTheme}>
                <AppBar position='static'>
                    <Toolbar variant='dense'>
                            {this.props.logo}
                        <Typography color="inherit" className={this.props.classes.title}>
                            {this.props.title}
                        </Typography>
                        {this.props.rightElement}
                    </Toolbar>
                </AppBar>
            </MuiThemeProviderNEW>
        );
    }
}

//
// <AppBar
//     style={{ zIndex: this.props.theme.zIndex.drawer + 100 }}  XXXXXXXX
//     title={this.props.title}   XXXXXX
//     iconElementRight={this.props.rightElement}
//     iconElementLeft={this.props.logo} XXXXXXXXXXXXXXXXXX
//     onLeftIconButtonClick={this.props.onLogoClick}
//     iconStyleLeft={{ margin: '0 15px 0 0', display: 'flex', alignItems: 'center' }} XXXXXXXXXXXXXXXX
//     titleStyle={{ fontSize: 16 }} XXXXXXXXXXXXXXXXXXXXXXXX
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
        <div stryle={{}}>
            <Link style={{margin: '0 15px 0 0', display: 'flex', alignItems: 'center' }} to={'/'}>
                <img
                    height='17'
                    src={`${window.contextPath}/public/app/images/logo.svg`}
                    alt='logo'
                />
            </Link>
        </div>
    ),
    onLogoClick: null,
    rightElement: <UserMenu />,
    theme: defaultTheme,
};

export default withStyles(styles)(Header);
