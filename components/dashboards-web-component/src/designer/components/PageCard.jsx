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
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import {
    Card,
    CardActions,
    CardHeader,
    CardText,
    Checkbox,
    Dialog,
    FlatButton,
    IconButton,
    TextField,
} from 'material-ui';
import { ActionDeleteForever } from 'material-ui/svg-icons';

class PageCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: props.page.name,
            url: props.page.id,
            titleValidationErrorMessage: null,
            urlValidationErrorMessage: null,
            isDashboardDeleteConfirmDialogOpen: false,
        };

        this.handleCardClick = this.handleCardClick.bind(this);
        this.handlePageTitleUpdate = this.handlePageTitleUpdate.bind(this);
        this.handlePageUrlUpdate = this.handlePageUrlUpdate.bind(this);
        this.hideDashboardDeleteConfirmDialog = this.hideDashboardDeleteConfirmDialog.bind(this);
        this.showDashboardDeleteConfirmDialog = this.showDashboardDeleteConfirmDialog.bind(this);
    }

    handleCardClick(expand) {
        if (expand) {
            this.props.history.push(`/designer/${this.props.match.params.dashboardId}/${this.props.page.id}`);
        }
    }

    handlePageTitleUpdate() {
        const page = this.props.page;
        const newPageTitle = this.state.title;
        if (page.name === newPageTitle) {
            return; // nothing has changed
        }

        this.props.updatePageTitle(page.id, newPageTitle)
            .then(() => this.setState({ titleValidationErrorMessage: null }))
            .catch(errorMessage => this.setState({ title: page.name, titleValidationErrorMessage: errorMessage }));
    }

    handlePageUrlUpdate() {
        const page = this.props.page;
        const newPageUrl = this.state.url;
        if (page.id === newPageUrl) {
            return; // nothing has changed
        }

        this.props.updatePageUrl(page.id, newPageUrl)
            .then(() => this.setState({ titleValidationErrorMessage: null }))
            .catch(errorMessage => this.setState({ url: page.id, urlValidationErrorMessage: errorMessage }));
    }

    hideDashboardDeleteConfirmDialog() {
        this.setState({ isDashboardDeleteConfirmDialogOpen: false });
    }

    showDashboardDeleteConfirmDialog() {
        this.setState({ isDashboardDeleteConfirmDialogOpen: true });
    }

    renderDashboardDeleteConfirmDialog(page) {
        const actionsButtons = [
            <FlatButton
                primary
                label={<FormattedMessage id='dialog-box.confirmation.no' defaultMessage='No' />}
                onClick={this.hideDashboardDeleteConfirmDialog}
            />,
            <FlatButton
                primary
                label={<FormattedMessage id='dialog-box.confirmation.yes' defaultMessage='Yes' />}
                onClick={() => this.props.deletePage(page.id)}
            />,
        ];

        return (
            <Dialog
                title={`Do you want to delete '${page.name}' page?`}
                actions={actionsButtons}
                open={this.state.isDashboardDeleteConfirmDialogOpen}
                modal={false}
                onRequestClose={this.hideDashboardDeleteConfirmDialog}
            >
                This action cannot be undone
            </Dialog>
        );
    }

    render() {
        const page = this.props.page;
        return (
            <span>
                <Card
                    style={{ margin: 10 }}
                    expanded={this.props.match.params.pageId === page.id}
                    onExpandChange={this.handleCardClick}
                >
                    <CardHeader title={page.name} actAsExpander showExpandableButton />
                    <CardText expandable>
                        <TextField
                            floatingLabelText={<FormattedMessage id="page.title" defaultMessage="Title" />}
                            value={this.state.title}
                            errorText={this.state.titleValidationErrorMessage}
                            onChange={event => this.setState({ title: event.target.value })}
                            onBlur={this.handlePageTitleUpdate}
                        />
                        <TextField
                            floatingLabelText={<FormattedMessage id="page.url" defaultMessage="URL" />}
                            value={this.state.url}
                            errorText={this.state.urlValidationErrorMessage}
                            onChange={event => this.setState({ url: event.target.value })}
                            onBlur={this.handlePageUrlUpdate}
                        />
                    </CardText>
                    <CardActions expandable style={{ display: 'flex' }}>
                        <div style={{ marginRight: 0, flexGrow: 2 }}>
                            <Checkbox
                                label={<FormattedMessage id="mark.homepage" defaultMessage="Mark as home" />}
                                defaultChecked={page.id === this.props.landingPageId}
                                disabled={page.id === this.props.landingPageId}
                                onCheck={() => this.props.updateLandingPage(this.props.page.id)}
                            />
                        </div>
                        <div style={{ marginRight: 0 }}>
                            <IconButton
                                tooltip="Delete"
                                style={{ paddingTop: 0, height: 24 }}
                                disabled={page.id === this.props.landingPageId}
                                onClick={this.showDashboardDeleteConfirmDialog}
                            >
                                <ActionDeleteForever />
                            </IconButton>
                        </div>
                    </CardActions>
                </Card>
                {this.renderDashboardDeleteConfirmDialog(page)}
            </span>
        );
    }
}

PageCard.propTypes = {
    page: PropTypes.shape({ id: PropTypes.string.isRequired, name: PropTypes.string.isRequired }).isRequired,
    landingPageId: PropTypes.string,
    updatePageTitle: PropTypes.func.isRequired,
    updatePageUrl: PropTypes.func.isRequired,
    updateLandingPage: PropTypes.func.isRequired,
    deletePage: PropTypes.func.isRequired,
    history: PropTypes.shape({}).isRequired,
    match: PropTypes.shape({}).isRequired,
};

PageCard.defaultProps = {
    parentPageId: null,
    landingPageId: null,
};

export default withRouter(PageCard);
