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

import React, {Component} from 'react';
// Material UI
import AppBar from 'material-ui/AppBar/AppBar';
// CSS
import './Header.css';

import './Header.css';

export default class Header extends Component {
    render() {
        return (
            <AppBar
                title={this.props.title}
                iconElementLeft={<i className="icon fw fw-wso2-logo header-icon"></i>}
            />
        );
    }
}

Header.propTypes = {
    title: React.PropTypes.string
};

Header.defaultProps = {
    title: 'Portal'
};