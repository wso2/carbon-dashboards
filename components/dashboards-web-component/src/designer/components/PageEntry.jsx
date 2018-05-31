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
import { FormattedMessage } from 'react-intl';

import { Card, CardHeader, CardText } from 'material-ui/Card';
import { TextField, RaisedButton, Checkbox } from 'material-ui';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

const styles = {
    pageCard: {
        backgroundColor: '#17262e',
        marginBottom: '5px',
    },
};

/**
 * @deprecated
 */
export default class PageEntry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            page: props.page,
            showDeletePageEntry: false,
            pageId: props.page.id,
        };
        this.dirty = false;
        this.updatePage = this.updatePage.bind(this);
        this.deletePage = this.deletePage.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ page: nextProps.page });
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

    markAsHomePage(e, checked) {
        if (this.props.onLandingPageChanged) {
            this.props.onLandingPageChanged(this.state.page.id);
        }

        const page = this.state.page;
        page.landingPage = checked;
        this.setState({
            page,
        });
    }

    entryExpanded(expanded) {
        if (expanded && this.props.onPageSelected) {
            this.props.onPageSelected(this.state.page.id, this.state.page.url);
        }
    }

    render() {
        const actionsButtons = [
            <FlatButton
                label={<FormattedMessage id="confirmation.yes" defaultMessage="Yes" />}
                primary
                onClick={this.deletePage}
            />,
            <FlatButton
                label={<FormattedMessage id="confirmation.no" defaultMessage="No" />}
                primary
                onClick={() => { this.setState({ showDeletePageEntry: false }); }}
            />,
        ];
        return (
            <div>
                <Dialog
                    title={"Do you want to delete '" + this.state.page.title + "' ?"}
                    actions={actionsButtons}
                    modal
                    open={this.state.showDeletePageEntry}
                />
                <Card onExpandChange={expanded => this.entryExpanded(expanded)} style={styles.pageCard}>
                    <CardHeader title={this.state.page.title} actAsExpander showExpandableButton />
                    <CardText expandable>
                        <TextField
                            value={this.state.page.id}
                            fullWidth
                            floatingLabelText={<FormattedMessage id="page.url" defaultMessage="URL" />}
                            onBlur={this.updatePage}
                            onChange={(e) => {
                                this.state.page.id = e.target.value;
                                this.setState({
                                    page: this.state.page,
                                });
                                this.dirty = true;
                            }}
                        />
                        <TextField
                            value={this.state.page.title}
                            fullWidth
                            floatingLabelText={<FormattedMessage id="page.title" defaultMessage="Title" />}
                            onBlur={this.updatePage}
                            onChange={(e) => {
                                this.state.page.title = e.target.value;
                                this.setState({
                                    page: this.state.page,
                                });
                                this.dirty = true;
                            }}
                        />
                        <Checkbox
                            label={<FormattedMessage id="mark.homepage" defaultMessage="Mark as Home Page" />}
                            checked={this.state.page.landingPage}
                            disabled={this.state.page.landingPage}
                            onCheck={this.markAsHomePage.bind(this)}
                            className="home-page-checkbox"
                        />
                        <RaisedButton
                            label={<FormattedMessage id="delete" defaultMessage="Delete" />}
                            labelPosition="after"
                            fullWidth
                            icon={<DeleteIcon />}
                            onClick={() => { this.setState({ showDeletePageEntry: true }); }}
                            disabled={this.state.page.landingPage}
                            backgroundColor="#24353f"
                            disabledBackgroundColor="#1c2b33"
                        />
                    </CardText>
                </Card>
            </div>
        );
    }
}
