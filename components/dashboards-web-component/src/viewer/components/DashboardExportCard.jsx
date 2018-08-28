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
import { Card, CardHeader, CardActions, RaisedButton, List, ListItem, SelectField, MenuItem } from 'material-ui';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import ReportGenerationButton from './ReportGenerationButton';
import html2canvas from 'html2canvas';


export default class DashboardExportCard extends Component {

    constructor(props){
        super(props);
        this.state={
            expanded: false,
            pageList: [],
            pageSize: 'A4',
            resizeRatio: 1,
            canvasWidth: 0,
            canvasHeight: 0,
        };

        this.handleCardClick = this.handleCardClick.bind(this);
        this.capturePage = this.capturePage.bind(this);
        this.removePage = this.removePage.bind(this);
    }

    render(){

        const pageSizes = ['A4', 'Letter', 'Government-Letter'];

        return (
            <Card
                style={{ margin: 10 }}
                expanded={this.state.expanded}
                onExpandChange={this.handleCardClick}
            >
                <CardHeader title='Export dashboard' actAsExpander style={{ paddingRight: '0px' }} />
                <CardActions expandable style={{ display: 'flex', paddingRight: '0px' }}>
                    <div style={{ marginRight: 0 }}>


                        <RaisedButton label='Capture current page'
                            onClick={this.capturePage}
                            primary />

                        <List>
                            {this.state.pageList.map(field =>
                                <ListItem primaryText={
                                                this.props.pages.find(page => page.id === field).name}
                                rightIcon={<DeleteIcon />}
                                          onClick={() => this.removePage(field)} />
                            )}
                        </List>

                        <SelectField
                            style={{ width: 200 }}
                            floatingLabelText='Page Size'
                            value={this.state.pageSize}
                            onChange={(event, index, value) => { this.setState({ pageSize: value }) }}

                        >
                            {pageSizes.map(field =>
                                (
                                    <MenuItem
                                        key = {field}
                                        value = {field}
                                        primaryText = {field}
                                    />
                                ))}
                        </SelectField>

                        <ReportGenerationButton
                            pageSize = {this.state.pageSize}
                            pageList = {this.state.pageList}
                            pages = {this.props.pages}
                        />


                    </div>
                </CardActions>
            </Card>

        );
    }

    handleCardClick(expand) {
        this.setState({ expanded: expand });
    }

    async removePage(index) {

        const tempPageList = this.state.pageList.slice();
        const ind = tempPageList.indexOf(index);
        tempPageList.splice(ind, 1);
        this.setState({ pageList: tempPageList });

        if (tempPageList.indexOf(index) == -1) {
            localStorage.removeItem(index);
        }

    }

    async capturePage(index) {

        const url = window.location.href;
        const parts = url.split('/');
        const currentPage = parts[parts.length - 1] === '' ? parts[parts.length - 2] : parts[parts.length - 1];

        await html2canvas(document.getElementById('dashboard-container')).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const w = canvas.width;
            const h = canvas.height;
            localStorage.setItem(currentPage, JSON.stringify({ imageData: imgData, width: w, height: h }));

            const tempPageList = this.state.pageList.slice();
            tempPageList.push(currentPage);
            this.setState({ pageList: tempPageList });

            const val = 620 / canvas.width;
            this.state.resizeRatio = val;
            this.state.canvasWidth = canvas.width;
            this.state.canvasHeight = canvas.height;
        });
    }
}
