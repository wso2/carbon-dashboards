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
import { Redirect, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { FlatButton, Snackbar } from 'material-ui';
import { ActionNoteAdd } from 'material-ui/svg-icons';

import LeftSidePane from './LeftSidePane';
import PageCard from './PageCard';

class PagesSidePane extends Component {
    constructor(props) {
        super(props);
        this.state = {
            validationErrorMessage: null,
        };

        this.getPageById = this.getPageById.bind(this);
        this.getPageUrl = this.getPageUrl.bind(this);
        this.setValidationErrorMessage = this.setValidationErrorMessage.bind(this);
        this.handlePageTitleUpdate = this.handlePageTitleUpdate.bind(this);
        this.handlePageUrlUpdate = this.handlePageUrlUpdate.bind(this);
        this.handleLandingPageUpdate = this.handleLandingPageUpdate.bind(this);
        this.handlePageAdd = this.handlePageAdd.bind(this);
        this.handlePageDelete = this.handlePageDelete.bind(this);
    }

    getPageById(pageId) {
        return this.props.dashboard.pages.find(page => (page.id === pageId));
    }

    getPageUrl(pageId) {
        return `/designer/${this.props.dashboard.url}/${pageId}`;
    }

    setValidationErrorMessage(message) {
        this.setState({ validationErrorMessage: message });
    }

    handlePageTitleUpdate(pageId, newTitle) {
        return new Promise((resolve, reject) => {
            if (!newTitle || (newTitle.length < 1)) {
                reject('Page title cannot be empty');
            } else {
                const updatingPage = this.getPageById(pageId);
                if (!updatingPage) {
                    this.setValidationErrorMessage(`Cannot find page for ID '${pageId}'!`);
                    reject();
                }
                const currentTitle = updatingPage.name;
                updatingPage.name = newTitle;
                this.props.updateDashboard()
                    .then(() => resolve())
                    .catch(() => {
                        updatingPage.name = currentTitle;
                        reject();
                    });
            }
        });
    }

    handlePageUrlUpdate(pageId, newUrl) {
        return new Promise((resolve, reject) => {
            if (!newUrl || (newUrl.length < 1)) {
                reject('Page URL cannot be empty');
            } else if (newUrl !== encodeURIComponent(newUrl)) {
                reject('Page URL cannot contain special characters');
            } else {
                const updatingPage = this.getPageById(pageId);
                if (!updatingPage) {
                    this.setValidationErrorMessage(`Cannot find page for ID '${pageId}'!`);
                    reject();
                }
                const currentUrl = updatingPage.id;
                const currentLandingPage = this.props.dashboard.landingPage;
                if (currentLandingPage === currentUrl) {
                    this.props.dashboard.landingPage = newUrl;
                }
                updatingPage.id = newUrl;
                this.props.updateDashboard()
                    .then(() => {
                        this.props.history.push(this.getPageUrl(updatingPage.id));
                        resolve();
                    })
                    .catch(() => {
                        updatingPage.id = currentUrl;
                        this.props.dashboard.landingPage = currentLandingPage;
                        reject();
                    });
            }
        });
    }

    handleLandingPageUpdate(newLandingPageId) {
        return new Promise((resolve, reject) => {
            if (!this.getPageById(newLandingPageId)) {
                this.setValidationErrorMessage(`Cannot find page for ID '${newLandingPageId}'!`);
                reject();
            }
            const currentLandingPage = this.props.dashboard.landingPage;
            this.props.dashboard.landingPage = newLandingPageId;
            this.props.updateDashboard()
                .then(() => resolve())
                .catch(() => {
                    this.props.dashboard.landingPage = currentLandingPage;
                    reject();
                });
        });
    }

    handlePageAdd() {
        return new Promise((resolve, reject) => {
            const pages = this.props.dashboard.pages;
            const count = pages.length + 1;
            const newPage = {
                id: `new-page-${count}`,
                name: `New Page-${count}`,
                content: [],
            };
            pages.push(newPage);
            this.props.updateDashboard()
                .then(() => {
                    this.props.history.push(this.getPageUrl(newPage.id));
                    resolve();
                })
                .catch(() => {
                    pages.pop();
                    reject();
                });
        });
    }

    handlePageDelete(pageId) {
        return new Promise((resolve, reject) => {
            if (!this.getPageById(pageId)) {
                this.setValidationErrorMessage(`Cannot find page for ID '${pageId}'!`);
                reject();
            } else if (this.props.dashboard.landingPage === pageId) {
                this.setValidationErrorMessage('Cannot delete landing page!');
                reject();
            }
            const currentPages = this.props.dashboard.pages;
            _.remove(this.props.dashboard.pages, page => (page.id === pageId));
            this.props.updateDashboard()
                .then(() => resolve())
                .catch(() => {
                    this.props.dashboard.pages = currentPages;
                    reject();
                });
        });
    }

    renderPageCard(page, landingPageId) {
        return (
            <span>
                <PageCard
                    key={page.id}
                    page={page}
                    landingPageId={landingPageId}
                    updatePageTitle={this.handlePageTitleUpdate}
                    updatePageUrl={this.handlePageUrlUpdate}
                    updateLandingPage={this.handleLandingPageUpdate}
                    deletePage={this.handlePageDelete}
                />
                {page.pages ? page.pages.map(subPage => this.renderPageCard(subPage, landingPageId)) : null}
            </span>
        );
    }

    render() {
        const pages = this.props.dashboard.pages;
        const landingPageId = this.props.dashboard.landingPage;

        return (
            <span>
                {(this.getPageById(this.props.match.params.pageId) == null) ?
                    <Redirect to={this.getPageUrl(landingPageId)} /> :
                    null}
                <LeftSidePane isHidden={this.props.isHidden} isOpen={this.props.isOpen} theme={this.props.theme}>
                    <div style={{ paddingTop: 10 }}>
                        {pages.map(page => this.renderPageCard(page, landingPageId))}
                    </div>
                    <div style={{ textAlign: 'center', paddingTop: 15 }}>
                        <FlatButton
                            primary
                            label={<FormattedMessage id="create.page" defaultMessage="Add Page" />}
                            icon={<ActionNoteAdd />}
                            onClick={this.handlePageAdd}
                        />
                    </div>
                </LeftSidePane>
                <Snackbar
                    open={this.state.validationErrorMessage != null}
                    message={this.state.validationErrorMessage}
                    autoHideDuration={4000}
                    onRequestClose={() => this.setState({ validationErrorMessage: null })}
                />
            </span>
        );
    }
}

PagesSidePane.propTypes = {
    isHidden: PropTypes.bool,
    isOpen: PropTypes.bool,
    theme: PropTypes.shape({}).isRequired,
    dashboard: PropTypes.shape({
        url: PropTypes.string.isRequired,
        landingPage: PropTypes.string.isRequired,
        pages: PropTypes.arrayOf({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired,
    updateDashboard: PropTypes.func.isRequired,
    history: PropTypes.shape({}).isRequired,
    match: PropTypes.shape({}).isRequired,
};

PagesSidePane.defaultProps = {
    isHidden: false,
    isOpen: false,
};

export default withRouter(PagesSidePane);
