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

import React, { Component, Fragment } from 'react';
import Link from 'react-router-dom/Link';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';
import AccountCircle from '@material-ui/icons/AccountCircle';

import AuthManager from '../auth/utils/AuthManager';

export default class UserMenu extends Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorElement: null,
        };
    }

    render() {
        const user = AuthManager.getUser();
        if (user) {
            return (
                <Fragment>
                    <Button onClick={event => this.setState({ anchorElement: event.currentTarget })}>
                        <AccountCircle />
                        <span style={{ paddingLeft: 5 }}>{user.username}</span>
                    </Button>
                    <Popover
                        open={!!this.state.anchorElement}
                        anchorEl={this.state.anchorElement}
                        onClose={() => this.setState({ anchorElement: null })}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <MenuItem component={Link} to={'/logout'}>
                            <FormattedMessage id='logout' defaultMessage='Logout' />
                        </MenuItem>
                    </Popover>
                </Fragment>
            );
        } else {
            return (
                <Button component={Link} to={`/login?referrer=${window.location.pathname}`}>
                    <FormattedMessage id='login' defaultMessage='Login' />
                </Button>
            );
        }
    }
}
