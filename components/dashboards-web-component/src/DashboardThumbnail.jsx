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
import RaisedButton from 'material-ui/RaisedButton';

class DashboardThumbnail extends React.Component {
    render() {
        let styles = {
            card: {
                "background-color": this.props.muiTheme.palette.primary3Color
            },
            title: {
                "color": this.props.muiTheme.palette.textColor
            },
            subtitle: {
                "color": this.props.muiTheme.palette.alternateTextColor
            }
        };

        return (
            <div className="dashboard-thumbnail">
                <div style={styles.card} className="content">
                    <h4 style={styles.title}>{this.props.dashboard.name}</h4>
                    <p style={styles.subtitle}>{this.props.dashboard.description}</p>
                    <div className="actions">
                        <Link to={"dashboards/" + this.props.dashboard.url}>
                            <span className="fw-stack icon">
                                <i className="fw fw-circle-outline fw-stack-2x"></i>
                                <i className="fw fw-view fw-stack-1x"></i>
                            </span>
                            View
                        </Link>
                        <a href="" className="disabled">
                            <span className="fw-stack icon">
                                <i className="fw fw-circle-outline fw-stack-2x"></i>
                                <i className="fw fw-edit fw-stack-1x"></i>
                            </span>
                            Design
                        </a>
                        <a href="" className="disabled">
                            <span className="fw-stack icon">
                                <i className="fw fw-circle-outline fw-stack-2x"></i>
                                <i className="fw fw-settings fw-stack-1x"></i>
                            </span>
                            Settings
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}

export default DashboardThumbnail;