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

import React from 'react';
// import Widget from '@wso2-dashboards/widget';
import Widget from '../../../../base-widget/src/Widget';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {Card, CardHeader, List, ListItem, FontIcon} from 'material-ui';
import AccountIcon from 'material-ui/svg-icons/action/account-circle';

/**
 * Demonstrates how to retrieve user information from a widget.
 */
class UserInfo extends Widget {
    /**
     * Constructor.
     */
    constructor(props) {
        super(props);
    }

    /**
     * Implements the renderWidget function.
     */
    render () {
        let styles = {
            container: {
                fontFamily: 'Roboto, sans-serif',
                color: '#9c9c9c',
                textAlign: 'center',
            },
        };

        // This returns user object with available user info attributes.
        // Syntax: super.getCurrentUser()
        // Return {{username: string}}
        const user = super.getCurrentUser();
        return (
            <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
                <div style={styles.container}>
                    <h3>User Information</h3>
                    <p style={{fontSize: '1.8em'}}><strong>Username: </strong>{user.username}</p>
                </div>
            </MuiThemeProvider>
        );
    }
}

global.dashboard.registerWidget("UserInfo", UserInfo);
