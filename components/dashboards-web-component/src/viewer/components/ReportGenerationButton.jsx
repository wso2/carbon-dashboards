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
import { Checkbox, RaisedButton, FlatButton, Dialog, CircularProgress } from 'material-ui';
import ReportGeneration from '../../utils/DashboardReportGenerator';


export default class ReportGenerationButton extends Component {

    constructor(props) {
        super(props);
        const isDarkTheme = window.localStorage.getItem('isDarkTheme');
        this.state = {
            reportStatusOpen: false,
            completed: 0,
            dialogOpen: false,
            includeTime:false,
        };

        this.handleClose = this.handleClose.bind(this);
        this.handleOpen = this.handleOpen.bind(this);
        this.handleIncludeGenerateTime = this.handleIncludeGenerateTime.bind(this);
        this.generateDashboardReport=this.generateDashboardReport.bind(this);
    }


    render(){
        const dialogActions = [
            <FlatButton
                label='Cancel'
                primary={true}
                onClick={this.handleClose}
            />,
            <FlatButton
                label='Export'
                primary={true}
                onClick={this.generateDashboardReport}
            />,
        ];

        const customStatusDailogStyle = {
            width: 400,
            maxWidth: 'none',
            position: 'relative'
        };

        return(
            <div>
                <RaisedButton label='Export'
                    onClick={this.handleOpen}
                    disabled={!(this.props.pageList.length > 0)}
                    primary />

                <Dialog
                    title='Select PDF options'
                    actions={dialogActions}
                    modal={true}
                    open={this.state.dialogOpen}
                >
                    <Checkbox
                        label='Include report genetation time'
                        onClick={this.handleIncludeGenerateTime}
                    />
                </Dialog>

                <Dialog
                    title='Report is generating'
                    contentStyle={customStatusDailogStyle}
                    modal={true}
                    open={this.state.reportStatusOpen}
                >
                    <CircularProgress
                        mode='determinate'
                        value={this.state.completed}
                        size={80}
                        thickness={5}
                        style={{ marginLeft: '35%' }}
                    />
                </Dialog>
            </div>

        );

    }

    handleClose() {
        this.setState({ dialogOpen: false });
    }

    handleOpen() {
        this.setState({ dialogOpen: true });
    }

    handleIncludeGenerateTime() {
        this.setState({ includeTime: !this.state.includeTime });
    }

    handleReportStatusClose() {
        this.setState({ reportStatusOpen: false });
    }

    handleReportStatusOpen() {
        this.setState({ reportStatusOpen: true });
    }

    progress = () => {
        const { completed } = this.state;
        this.setState({ completed: completed >= 100 ? 0 : completed + 10});
    };

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async generateDashboardReport(){

        //Starts showing report generation progress
        this.handleClose();
        this.handleReportStatusOpen();
        this.timer = setInterval(this.progress, 192);
        await this.sleep(2000);

        const title = document.getElementsByTagName('h1')[0].innerText;

        const pdf=ReportGeneration.generatePdf(this.props.pageSize.toLowerCase(),this.props.pageList,
                                                this.state.includeTime,title,this.props.pages);

        clearInterval(this.timer);
        this.handleReportStatusClose();
        this.state.completed = 0;
        this.state.includeRecords = false;
        this.state.includeTime = false;

    }
}

ReportGenerationButton.propTypes = {
    pageSize: PropTypes.string.isRequired,
    pageList: PropTypes.array.isRequired,
    pages: PropTypes.array.isRequired
};
