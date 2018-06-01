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
import PropTypes from 'prop-types';
import { Paper } from 'material-ui';
import { MuiThemeProvider } from 'material-ui/styles';

import { Header } from '../common';
import defaultTheme from '../utils/Theme';

export default class ErrorPage extends Component {

    render() {
        return (
            <MuiThemeProvider muiTheme={this.props.theme}>
                <Header />
                <Paper style={{ textAlign: 'center', width: '100%', height: '100%' }}>
                    <h1 style={{ fontSize: 40 }}>
                        {this.props.title}
                    </h1>
                    <span style={{fontSize: 20 }}>
                        {this.props.message}
                    </span>
                </Paper>
            </MuiThemeProvider>
        );
    }
}

ErrorPage.propTypes = {
    title: PropTypes.string,
    message: PropTypes.string,
    theme: PropTypes.shape({}),
};

ErrorPage.defaultProps = {
    title: 'Error',
    message: 'Unexpected error occurred',
    theme: defaultTheme,
};
