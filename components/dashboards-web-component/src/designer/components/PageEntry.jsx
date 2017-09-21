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

import React, { Component } from 'react';
import {Link} from 'react-router-dom';

import {Card, CardActions, CardHeader, CardText, CardTitle} from 'material-ui/Card';
import TextField from 'material-ui/TextField';

import '../../../public/css/designer.css';

export default class PageEntry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            page: props.page,
            originalId: props.page.id
        };
        // Initializing the dirty flag. Based on this the onPageChanged event will be triggered.
        this.dirty = false;
        this.handleChange = this.handleChange.bind(this);
        this.savePage = this.savePage.bind(this);
    }

    render () {
        let appContext = window.location.pathname.split('/')[1];
        let url = '/' + appContext + '/designer/' + this.props.dashboardUrl + '/' + this.props.pageUrl;
        let expanded = window.location.pathname.replace('/' + appContext + '/designer/' +
                this.props.dashboardUrl + '/', '').toLowerCase() === this.props.pageUrl.toLowerCase();
        return (
            <Card containerStyle={{'margin-bottom': '15px'}} expanded={expanded}>
                <CardHeader title={<Link to={url} replace={true}>{this.state.page.title}</Link>} actAsExpander={true}
                            showExpandableButton={true} />
                <CardText expandable={true}>
                    <div className="form-element">
                        <label>URL:</label>
                        <TextField hintText="URL" value={this.state.page.id} onBlur={this.savePage} id="txt-page-id"
                                   onChange={this.handleChange} style={{width: '206px'}} />
                    </div>
                    <div className="form-element">
                        <label>Title:</label>
                        <TextField hintText="Title" onBlur={this.savePage} id="txt-page-title"
                                   value={this.state.page.title} onChange={this.handleChange} style={{width: '206px'}} />
                    </div>
                </CardText>
            </Card>
        );
    }

    handleChange(e) {
        let page = this.state.page;
        switch(e.target.getAttribute('id').toLowerCase()) {
            case 'txt-page-id':
                page.id = e.target.value;
                break;
            case 'txt-page-title':
                page.title = e.target.value;
                break;
        }
        this.setState({
            page: page
        });
        this.dirty = true;
    }

    savePage() {
        // Check if the onPageChanged event handler is defined and the page object is dirty. If so invoke the event.
        if (this.props.onPageChanged && this.dirty) {
            this.props.onPageChanged(this.state.originalId, this.state.page)
            this.dirty = false;
        }
    }
}