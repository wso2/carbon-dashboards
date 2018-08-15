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
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { IconButton } from 'material-ui';

import LightBulbFillIcon from './LightBulbFill'
import LightBulbOutlineIcon from './LightBulbOutline';

class ThemeButton extends Component {
    render() {
        return (
            <IconButton
                style={{ color: '#fff', position: 'absolute', left: -40, }}
                onClick={this.props.onThemeButtonClick}
                title="Toggle Light/Dark theme"
            >
                {this.props.theme.name === 'dark' ? <LightBulbFillIcon /> : <LightBulbOutlineIcon />}
            </IconButton>
        );
    }
}

ThemeButton.propTypes = {
    theme: PropTypes.shape({}).isRequired,
    onThemeButtonClick: PropTypes.func.isRequired,
};

export default withRouter(ThemeButton);
