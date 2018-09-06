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
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import ReportGenerationButton from './ReportGenerationButton';
import html2canvas from 'html2canvas';
import PropTypes from "prop-types";

const pageSizes = ['A4 Landscape','A4 Portrait', 'Letter Landscape', 'Letter Portrait', 'A3 Landscape', 'A3 Portrait'];

export default class DashboardReportGenerationCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: false,
            pageList: [],
            pageSize: 'A4 Landscape',
        };

        this.handleCardClick = this.handleCardClick.bind(this);
        this.capturePage = this.capturePage.bind(this);
        this.removePage = this.removePage.bind(this);
    }

    render() {
        return (
            <Card
                style={{ margin: 10 }}
                expanded={this.state.expanded}
                onExpandChange={this.handleCardClick}
            >
                <CardHeader title='Download dashboard' actAsExpander textStyle={{ paddingRight: '0px' }} />
                <CardActions expandable style={{ display: 'flex', paddingRight: '0px' }}>
                    <div style={{ marginRight: 0 }}>
                        <RaisedButton
                            label='Capture current page'
                            onClick={this.capturePage}
                            backgroundColor={'#a4b6c2'}
                        />

                        <List>
                            {this.state.pageList.map(field =>
                                (<ListItem
                                    primaryText={field}
                                    rightIcon={<DeleteIcon />}
                                    onClick={() => this.removePage(field)}
                                />),
                            )}
                        </List>

                        <SelectField
                            style={{ width: 200 }}
                            floatingLabelText='Page Size'
                            value={this.state.pageSize}
                            onChange={(event, index, value) => { this.setState({ pageSize: value }); }}
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

                        <ReportGenerationButton
                            pageSize={this.state.pageSize}
                            pageList={this.state.pageList}
                            pages={this.props.pages}
                            dashboardName={this.props.dashboardName}
                        />
                    </div>
                </CardActions>
            </Card>
        );
    }

    handleCardClick(expand) {
        this.setState({ expanded: expand });
    }

    removePage(index) {
        const tempPageList = this.state.pageList.slice();
        const indexOfPage = tempPageList.indexOf(index);
        tempPageList.splice(indexOfPage, 1);
        this.setState({ pageList: tempPageList });

        if (tempPageList.indexOf(index) == -1) {
            localStorage.removeItem(index);
        }
    }

    capturePage(index) {
        const url = window.location.href;
        const parts = url.split('/');
        let currentPage = parts[parts.length - 1] === '' ? parts[parts.length - 2] : parts[parts.length - 1];
        currentPage = this.props.pages.find((page) => {
            return page.id === currentPage;
        });

        html2canvas(document.getElementById('dashboard-container')).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const w = canvas.width;
            const h = canvas.height;
            localStorage.setItem('_dashboard-report:'+currentPage.name, JSON.stringify({ imageData: imgData, width: w, height: h }));

            const tempPageList = this.state.pageList.slice();
            tempPageList.push(currentPage.name);
            this.setState({ pageList: tempPageList });
        });
    }
}

DashboardReportGenerationCard.propTypes = {
    pages: PropTypes.array.isRequired,
    dashboardName: PropTypes.string.isRequired,
};
