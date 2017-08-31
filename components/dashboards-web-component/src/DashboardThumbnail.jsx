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
import {Link} from 'react-router-dom';

class DashboardThumbnail extends React.Component {
    render() {
        return (
            <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3 dashboard-thumbnail">
                <div className="dashboard-thumbnail-div">
                    <div className="add-padding-2x add-padding-top-5x">
                        <div>
                            <div className="media-left add-padding-right-4x add-padding-left-2x">
                                <i className="fw fw-dashboard media-object-5x dashboard-thumbnail-logo"></i>
                            </div>
                            <div className="media-body">
                                <h4 className="media-heading add-margin-top-1x">{this.props.dashboard.name}</h4>
                                <p>{this.props.dashboard.description}</p>
                            </div>
                        </div>
                        <div className="dashboard-thumbnail-action-panel">
                            <Link to={"dashboards/" + this.props.dashboard.url}>
                                        <span className="fw-stack dashboard-thumbnail-action-icon">
                                            <i className="fw fw-circle-outline fw-stack-2x"></i>
                                            <i className="fw fw-view fw-stack-1x"></i>
                                        </span>
                                View
                            </Link>
                            <a href="" className="dashboard-thumbnail-disabled-action-button">
                                        <span className="fw-stack dashboard-thumbnail-action-icon">
                                            <i className="fw fw-circle-outline fw-stack-2x"></i>
                                            <i className="fw fw-edit fw-stack-1x"></i>
                                        </span>
                                Design
                            </a>
                            <a href="" className="dashboard-thumbnail-disabled-action-button">
                                        <span className="fw-stack dashboard-thumbnail-action-icon">
                                            <i className="fw fw-circle-outline fw-stack-2x"></i>
                                            <i className="fw fw-settings fw-stack-1x"></i>
                                        </span>
                                Settings
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default DashboardThumbnail;