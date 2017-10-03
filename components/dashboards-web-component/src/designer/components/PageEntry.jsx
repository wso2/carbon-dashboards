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

import React, {Component} from 'react';
// Material-UI
import {Card, CardHeader, CardText} from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import Checkbox from 'material-ui/Checkbox';

export default class PageEntry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            page: props.page,
            pageId: props.page.id
        };
        this.dirty = false;
        this.updatePage = this.updatePage.bind(this);
    }

    render() {
        return (
            <Card onExpandChange={(expanded) => this.entryExpanded(expanded)}>
                <CardHeader title={this.state.page.title} actAsExpander showExpandableButton/>
                <CardText expandable>
                    <TextField value={this.state.page.id} fullWidth floatingLabelText="URL"
                               onBlur={this.updatePage}
                               onChange={(e) => {
                                   this.state.page.id = e.target.value;
                                   this.setState({
                                       page: this.state.page
                                   });
                                   this.dirty = true;
                               }}/>
                    <TextField value={this.state.page.title} fullWidth floatingLabelText="Title"
                               onBlur={this.updatePage}
                               onChange={(e) => {
                                   this.state.page.title = e.target.value;
                                   this.setState({
                                       page: this.state.page
                                   });
                                   this.dirty = true;
                               }}/>
                    <Checkbox label="Make as Home Page" checked={this.state.page.landingPage}
                              disabled={this.state.page.landingPage} onCheck={this.makeAsHomePage.bind(this)}/>
                    <RaisedButton label="Delete" labelPosition="after" secondary fullWidth icon={<DeleteIcon/>}
                                  onClick={this.deletePage.bind(this)} disabled={this.state.page.landingPage}/>
                </CardText>
            </Card>
        );
    }

    updatePage() {
        // Check if the onPageUpdated event handler is defined and the page object is dirty. If so invoke the event.
        if (this.props.onPageUpdated && this.dirty) {
            this.props.onPageUpdated(this.state.pageId, this.state.page);
            this.dirty = false;
        }
    }

    deletePage() {
        if (this.props.onPageDeleted) {
            this.props.onPageDeleted(this.state.pageId);
        }
    }

    makeAsHomePage(e, checked) {
        if (this.props.onLandingPageChanged) {
            this.props.onLandingPageChanged(this.state.page.id);
        }

        let page = this.state.page;
        page.landingPage = checked;
        this.setState({
            page: page
        });
    }

    entryExpanded(expanded) {
        if (expanded && this.props.onPageSelected) {
            this.props.onPageSelected(this.state.page.id, this.state.page.url);
        }
    }
}