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

class NavigationBar extends React.Component {

    render() {
        return (
            <div>
                <div className="breadcrumb-wrapper">
                    <ol className="breadcrumb">
                        <li className="active"><i className="icon fw fw-home"></i> Dashboards</li>
                    </ol>
                </div>

                <div className="navbar-wrapper">
                    <nav className="navbar navbar-default affix-top">
                        <div className="container-fluid">
                            <div className="navbar-header">
                                <button type="button" className="navbar-toggle">
                                    <span className="sr-only">Toggle navigation</span>
                                </button>
                                <a className="navbar-menu-toggle">
                            <span className="icon fw-stack">
                                <i className="fw fw-down fw-stack-1x"></i>
                            </span>
                                </a>
                            </div>
                            <div className="navbar-collapse collapse">
                                <ul className="nav navbar-nav collapse-nav-sub">
                                    <li>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </nav>
                </div>
            </div>
        );
    }
}

export default NavigationBar;