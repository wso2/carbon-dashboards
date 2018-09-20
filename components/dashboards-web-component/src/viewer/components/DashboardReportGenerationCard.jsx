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
import { Card, CardHeader, CardActions, RaisedButton, List, ListItem, SelectField, MenuItem } from 'material-ui';
import html2canvas from 'html2canvas';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import DashboardReportGenerator from '../../utils/DashboardReportGenerator';

const pageSizes = ['A4', 'Letter', 'A3'];
const orientations = ['Landscape', 'Portrait'];

export default class DashboardReportGenerationCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pageList: [],
            pageSize: 'A4',
            orientation: 'Landscape',
            includeTime: true,
        };

        this.capturedPageList = [];

        this.capturePage = this.capturePage.bind(this);
        this.removePage = this.removePage.bind(this);
        this.resetFields = this.resetFields.bind(this);
        this.generateDashboardReport = this.generateDashboardReport.bind(this);
        this.renderCapturedPageList = this.renderCapturedPageList.bind(this);
    }

    /**
     * Generate dashboard report from the captured list of pages
     */
    generateDashboardReport() {
        const title = this.props.dashboardName;
        DashboardReportGenerator.generateDashboardPdf(this.state.pageSize.toLowerCase(),
            this.state.orientation.toLocaleLowerCase(), this.state.pageList, this.state.includeTime, title);
        this.resetFields();
    }

    /**
     * Reset the state fields into the default values
     */
    resetFields() {
        this.capturedPageList = [];
        this.setState({ pageList: [], pageSize: 'A4', orientation: 'Landscape' });
        DashboardReportGenerator.removePage(this.props.dashboardName);
    }

    /**
     * Removes a given page from the dashboard report generation pages list.
     * @param {string} pageName the name of the page to be removed from the captured list
     * @param {int} index the index of page to be removed from the page list.
     */
    removePage(pageName, index) {
        this.capturedPageList.splice(index, 1);
        const newCapturedObjectList = JSON.stringify(this.capturedPageList);
        DashboardReportGenerator.savePage(this.props.dashboardName, newCapturedObjectList);
        const tempPageList = this.state.pageList.slice();
        const indexOfPage = tempPageList.indexOf(pageName);
        tempPageList.splice(indexOfPage, 1);
        this.setState({ pageList: tempPageList });
    }

    /**
     * Capture the current dashboard page to be included in the report.
     */
    capturePage() {
        const url = window.location.pathname;
        const parts = url.split('/');
        let currentPage = parts[parts.length - 1] === '' ? parts[parts.length - 2] : parts[parts.length - 1];
        currentPage = this.props.pages.find((page) => {
            return page.id === currentPage;
        });

        const element = document.getElementById('dashboard-container');
        DashboardReportGenerator.setSVGProperties(element);
        html2canvas(element).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const width = canvas.width;
            const height = canvas.height;
            const imageData = JSON.stringify({ imageData: imgData, width, height, timestamp: new Date() });
            this.capturedPageList.push(imageData);
            const capturedPagesObject = JSON.stringify(this.capturedPageList);
            DashboardReportGenerator.savePage(this.props.dashboardName, capturedPagesObject);
            const tempPageList = this.state.pageList;
            tempPageList.push(currentPage.name);
            this.setState({ pageList: tempPageList });
        }).catch((er) => {
            console.error(er);
        });
    }

    /**
     * Renders the captured page list for report generation
     * @returns {any[]} the list of captured pages
     */
    renderCapturedPageList() {
        return (
            this.state.pageList.map((field, index) =>
                (<ListItem
                    primaryText={field}
                    rightIcon={<DeleteIcon style={{ height: '20px', width: '20px', top: '4px' }} />}
                    onClick={() => this.removePage(field, index)}
                    style={{ paddingLeft: '0px' }}
                />))
        );
    }

    render() {
        return (
            <div>
                <Card style={{ margin: 10, paddingBottom: '25px' }}>
                    <CardHeader
                        title={
                            <FormattedMessage
                                id='report.generation.card.title'
                                defaultMessage='Export Dashboard as PDF'
                            />
                        }
                        textStyle={{ paddingRight: '0px' }}
                    />
                    <CardActions style={{ display: 'flex', paddingRight: '0px' }}>
                        <div style={{ marginRight: 0 }}>
                            <RaisedButton
                                label={<FormattedMessage
                                    id='report.generation.capture.button.title'
                                    defaultMessage='Capture Current Page'
                                />}
                                onClick={this.capturePage}
                                backgroundColor={'#1c3b4a'}
                            />

                            <List>
                                {this.renderCapturedPageList()}
                            </List>

                            <SelectField
                                style={{ width: 200 }}
                                floatingLabelText={<FormattedMessage
                                    id='report.generation.page.size.title'
                                    defaultMessage='Page Size'
                                />}
                                value={this.state.pageSize}
                                onChange={(event, index, value) => {
                                    this.setState({ pageSize: value });
                                }}
                            >
                                {pageSizes.map(field =>
                                    (
                                        <MenuItem
                                            key={field}
                                            value={field}
                                            primaryText={field}
                                        />
                                    ))}
                            </SelectField>

                            <SelectField
                                style={{ width: 200 }}
                                floatingLabelText={<FormattedMessage
                                    id='report.generation.page.orientation.title'
                                    defaultMessage='Page Orientation'
                                />}
                                value={this.state.orientation}
                                onChange={(event, index, value) => {
                                    this.setState({ orientation: value });
                                }}
                            >
                                {orientations.map(field =>
                                    (
                                        <MenuItem
                                            key={field}
                                            value={field}
                                            primaryText={field}
                                        />
                                    ))}
                            </SelectField>

                            <RaisedButton
                                primary
                                label={
                                    <FormattedMessage
                                        id='report.generation.export.button.title'
                                        defaultMessage='Generate Report'
                                    />
                                }
                                onClick={this.generateDashboardReport}
                                disabled={!(this.state.pageList.length > 0)}
                                disabledBackgroundColor="rgb(27, 40, 47)"
                                style={{ paddingTop: '5px', paddingBottom: '5px' }}
                            />
                        </div>
                    </CardActions>
                </Card>
            </div>
        );
    }
}

DashboardReportGenerationCard.propTypes = {
    pages: PropTypes.arrayOf({
        id: PropTypes.string.isRequired,
        content: PropTypes.arrayOf({}).isRequired,
    }).isRequired,
    dashboardName: PropTypes.string.isRequired,
};
