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
import { Checkbox, RaisedButton, FlatButton, Dialog } from 'material-ui';
import DashboardReportGenerator from '../../utils/DashboardReportGenerator';

export default class ReportGenerationButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isDialogOpen: false,
            includeTime: false,
        };

        this.handleClose = this.handleClose.bind(this);
        this.handleOpen = this.handleOpen.bind(this);
        this.handleIncludeGenerateTime = this.handleIncludeGenerateTime.bind(this);
        this.generateDashboardReport = this.generateDashboardReport.bind(this);
    }

    render() {
        const dialogActions = [
            <FlatButton
                label='Cancel'
                primary
                onClick={this.handleClose}
            />,
            <FlatButton
                label='Generate Report'
                primary
                onClick={this.generateDashboardReport}
            />,
        ];

        return (
            <div>
                <RaisedButton
                    label='Generate Report'
                    onClick={this.handleOpen}
                    disabled={!(this.props.pageList.length > 0)}
                    primary
                />

                <Dialog
                    title='Select PDF options'
                    actions={dialogActions}
                    modal
                    open={this.state.isDialogOpen}
                >
                    <Checkbox
                        label='Include report genetation time'
                        onClick={this.handleIncludeGenerateTime}
                    />
                </Dialog>
            </div>

        );
    }

    handleClose() {
        this.setState({ isDialogOpen: false });
    }

    handleOpen() {
        this.setState({ isDialogOpen: true });
    }

    handleIncludeGenerateTime() {
        this.setState({ includeTime: !this.state.includeTime });
    }

    generateDashboardReport() {
        this.handleClose();
        const title = this.props.dashboardName;
        DashboardReportGenerator.generateDashboardPdf(this.props.pageSize.toLowerCase(), this.props.pageList,
            this.state.includeTime, title);
        this.state.includeRecords = false;
        this.state.includeTime = false;
    }
}

ReportGenerationButton.propTypes = {
    pageSize: PropTypes.string.isRequired,
    pageList: PropTypes.array.isRequired,
    pages: PropTypes.array.isRequired,
    dashboardName: PropTypes.string.isRequired,
};
