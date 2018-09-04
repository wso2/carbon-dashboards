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
import PropTypes from "prop-types";
import { Checkbox, FlatButton, Dialog } from 'material-ui';
import DashboardReportGenerator from '../../utils/DashboardReportGenerator';

export default class WidgetReportConfigurationDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dialogOpen: false,
            includeTime: false,
        };

        this.handleClose = this.handleClose.bind(this);
        this.handleOpen = this.handleOpen.bind(this);
        this.handleIncludeGenerateTime = this.handleIncludeGenerateTime.bind(this);
        this.handleIncludeNoOfRecords = this.handleIncludeNoOfRecords.bind(this);
        this.generateWidgetReport = this.generateWidgetReport.bind(this);
    }

    generateWidgetReport() {
        this.handleClose();
        const element = this.props.widget;
        const docTitle = this.props.title;
        DashboardReportGenerator.generateWidgetPdf(element, docTitle, this.state.includeTime, this.state.includeRecords,
            this.props.themeName);
        this.state.includeRecords = false;
        this.state.includeTime = false;
    }

    handleClose() {
        this.setState({ dialogOpen: false });
    }

    handleOpen() {
        this.hasTable(this.props.widget);
        this.setState({ dialogOpen: true });
    }

    handleIncludeGenerateTime() {
        this.setState({ includeTime: !this.state.includeTime });
    }

    handleIncludeNoOfRecords() {
        this.setState({ includeRecords: !this.state.includeRecords });
    }

    hasTable(element) {
        if (element.innerHTML.search('rt-table') > -1) {
            this.setState({ recordCountEnabled: true });
        } else {
            this.setState({ recordCountEnabled: false });
        }
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
                onClick={this.generateWidgetReport}
            />,
        ];

        return (
            <Dialog
                title='Select PDF options'
                actions={dialogActions}
                modal
                open={this.state.dialogOpen}
            >
                <Checkbox
                    label='Include report genetation time'
                    onClick={this.handleIncludeGenerateTime}
                />

                {(this.state.recordCountEnabled) && (
                    <Checkbox
                        label='Include number of records'
                        onClick={this.handleIncludeNoOfRecords}
                    />
                )}
            </Dialog>
        );
    }
}

WidgetReportConfigurationDialog.propTypes = {
    widget: PropTypes.object.isRequired,
    title: PropTypes.string.isRequired,
    themeName: PropTypes.string.isRequired,
};
