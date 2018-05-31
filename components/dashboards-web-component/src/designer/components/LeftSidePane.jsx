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
import { Drawer } from 'material-ui';

export default class LeftSidePane extends Component {
    render() {
        return (
            <Drawer
                open={this.props.isOpen}
                containerStyle={{
                    position: 'fixed',
                    top: this.props.theme.appBar.height,
                    left: this.props.isOpen ? 55 : 0,
                    width: 300,
                    height: '100%',
                    paddingBottom: 80,
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    display: this.props.isHidden ? 'none' : 'block',
                }}
            >
                {this.props.children}
            </Drawer>
        );
    }
}

LeftSidePane.propTypes = {
    children: PropTypes.element.isRequired,
    isHidden: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    theme: PropTypes.shape({}).isRequired,
};
