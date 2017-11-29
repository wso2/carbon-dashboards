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

import DashboardAPI from '../utils/apis/DashboardAPI';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import {FormattedMessage} from 'react-intl';

class DashboardThumbnail extends React.Component {

    constructor() {
        super();
        this.deleteDashboard = this.deleteDashboard.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleOpen = this.handleOpen.bind(this);
        this.state = {
            deleteDashboardDialog: false
        };
    }

    handleOpen() {
        this.setState({deleteDashboardDialog: true});
    }

    handleClose() {
        this.setState({deleteDashboardDialog: false});
    }

    deleteDashboard() {
        let dashboardAPI = new DashboardAPI();
        dashboardAPI.deleteDashboardByID(this.props.dashboard.url);
        this.props.handleDelete();
        this.setState({deleteDashboardDialog: false});
    }

    render() {
        let styles = {
            card: {
                "background-color": "#5d6e77"
            },
            title: {
                "color": "#eee"
            },
            subtitle: {
                "color": "#ccc",
                height: 17
            }
        };

        let actionsButtons = [
            <FlatButton
                label={<FormattedMessage id="confirmation.yes" defaultMessage="Yes"/>}
                primary={true}
                onClick={this.deleteDashboard}
            />,
            <FlatButton
                label={<FormattedMessage id="confirmation.no" defaultMessage="No"/>}
                primary={true}
                onClick={this.handleClose}
            />,
        ];

        return (
            <div>
                <Dialog
                    title={"Do you want to delete '" + this.props.dashboard.name + "' ?"}
                    actions={actionsButtons}
                    modal={true}
                    open={this.state.deleteDashboardDialog}
                ></Dialog>
                <div className="dashboard-thumbnail">
                    <div className="trash-button-div" onClick={this.handleOpen}>
                        <a href="#">
                            <i className="fw fw-delete fw-stack-1x trash-button-icon" title="Delete Dashboard"></i>
                        </a>
                    </div>
                    <div style={styles.card} className="content">
                        <h4 style={styles.title}>{this.props.dashboard.name}</h4>
                        <p style={styles.subtitle}>{this.props.dashboard.description}</p>
                        <div className="actions">
                            <Link to={"dashboards/" + this.props.dashboard.url}>
                            <span className="fw-stack icon">
                                <i className="fw fw-circle-outline fw-stack-2x"></i>
                                <i className="fw fw-view fw-stack-1x"></i>
                            </span>
                                <FormattedMessage id="view.button" defaultMessage="View"/>
                            </Link>
                            <Link to={"designer/" + this.props.dashboard.url}>
                            <span className="fw-stack icon edit-dashboard-icon">
                                <i className="fw fw-circle-outline fw-stack-2x"></i>
                                <i className="fw fw-edit fw-stack-1x"></i>
                            </span>
                                <FormattedMessage id="design.button" defaultMessage="Design"/>
                            </Link>
                            <Link to={"settings/" + this.props.dashboard.url}>
                            <span className="fw-stack icon edit-dashboard-icon">
                                <i className="fw fw-circle-outline fw-stack-2x"></i>
                                <i className="fw fw-settings fw-stack-1x"></i>
                            </span>
                                <FormattedMessage id="settings.button" defaultMessage="Settings"/>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default DashboardThumbnail;