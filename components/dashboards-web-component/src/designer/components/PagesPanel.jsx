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
// Components
import PageEntry from './PageEntry';
import DashboardUtils from '../../utils/DashboardUtils';
// Material-UI
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import AddCircleOutlineIcon from 'material-ui/svg-icons/content/add-circle-outline';

import {FormattedMessage} from 'react-intl';

let _pages = [];

const PAGE_ID_PREFIX = 'page';
const PAGE_TITLE_PREFIX = 'New Page - ';

export default class PagesPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pages: _pages
        };
        this.deletePageRecursively = this.deletePageRecursively.bind(this);
        this.buildPages = this.buildPages.bind(this);
    }

    componentWillReceiveProps(nextprops) {
        _pages = this.buildPages(nextprops.dashboard.pages);
        this.setState({
            pages: _pages,
            dashboard: nextprops.dashboard
        });
    }

    render() {
        return (
            <div style={this.getPanelStyles(this.props.visible)}>
                <h3>Pages</h3>
                <div style={{'text-align': 'center'}}>
                    <FlatButton label={<FormattedMessage id="create.page" defaultMessage="Create Page"/>} primary
                                  fullWidth icon={<AddCircleOutlineIcon/>}
                                  onClick={this.addPage.bind(this)}/>
                    <TextField hintText={<FormattedMessage id="search.hint.text" defaultMessage="Search..."/>}
                               onChange={(e) => this.searchPages(e)}/>
                </div>
                {
                    this.state.pages.map(p => {
                        return <PageEntry page={p}
                                          onPageUpdated={this.updatePage.bind(this)}
                                          onPageDeleted={this.deletePage.bind(this)}
                                          onLandingPageChanged={this.landingPageChanged.bind(this)}
                                          onPageSelected={this.pageSelected.bind(this)}/>
                    })
                }
            </div>
        );
    }

    /**
     * Get styles of the panel div.
     * @param visible
     * @returns {*}
     */
    getPanelStyles(visible) {
        return visible ? {} : {display: 'none'};
    }

    /**
     * Creates list of pages recursively.
     * @param p
     * @param a
     * @param baseUrl
     * @returns {*|Array}
     */
    buildPages(p, a, baseUrl) {
        if (!this.state.dashboard) {
            return [];
        }

        a = a || [];
        baseUrl = baseUrl || '';
        for (let i = 0; i < p.length; i++) {
            let pageUrl = baseUrl + p[i].id;
            a.push({
                id: p[i].id,
                title: p[i].name,
                url: pageUrl,
                landingPage: (this.state.dashboard.landingPage === p[i].id)
            });
            if (p[i].pages && p[i].pages.length > 0) {
                this.buildPages(p[i].pages, a, pageUrl + '/');
            }
        }
        return a;
    }

    /**
     * Search pages.
     * @param e
     */
    searchPages(e) {
        let filteredPages = _pages.filter((p) => {
            return p.title.toLowerCase().includes(e.target.value.toLowerCase());
        });
        this.setState({
            pages: filteredPages
        });
    }

    /**
     * Add new page.
     */
    addPage() {
        let uniqueId = this.generatePageId();
        let id = PAGE_ID_PREFIX + uniqueId;
        let title = PAGE_TITLE_PREFIX + uniqueId;
        this.props.dashboard.pages.push({
            id: id,
            name: title,
            content: [],
            pages: []
        });
        this.savePages(this.props.dashboard.pages);
        // navigate to newly added page
        window.location.href = window.contextPath + '/designer/' + this.props.dashboard.url + '/' + id;
    }

    /**
     * Update page identified by Id.
     * @param id
     * @param page
     */
    updatePage(id, page) {
        let p = DashboardUtils.findDashboardPageById(this.props.dashboard, id);
        p.id = page.id;
        p.name = page.title;
        this.savePages(this.props.dashboard.pages);
    }

    /**
     * Delete a page identified by Id.
     * @param id
     */
    deletePage(id) {
        let p = DashboardUtils.findDashboardPageById(this.props.dashboard, id);
        if (p.pages && p.pages.length > 0) {
            alert('Unable to delete this page since it contains sub-pages');
            return;
        }
        this.deletePageRecursively(this.props.dashboard.pages, id);
        this.savePages(this.props.dashboard.pages);
        // navigate to home page
        window.location.href = window.contextPath + '/designer/' + this.props.dashboard.url;
    }

    /**
     * Traverse the page structure and delete specific page identified by Id.
     * @param pages
     * @param id
     */
    deletePageRecursively(pages, id) {
        pages = pages || [];
        for (var i = 0; i < pages.length; i++) {
            if (pages[i].id === id) {
                // todo delete page
                pages.splice(i, 1);
                break;
            } else {
                this.deletePageRecursively(pages[i].pages, id);
            }
        }
    }

    /**
     * Landing page changed.
     * @param id
     */
    landingPageChanged(id) {
        let pages = this.state.pages.map(page => {
            page.id !== id ? page.landingPage = false : page.landingPage = true;
            return page;
        });
        if (this.props.onLandingPageChanged) {
            this.props.onLandingPageChanged(id);
        }
        this.setState({pages: pages});
    }

    /**
     * Save pages.
     * @param pages
     */
    savePages(pages) {
        this.props.dashboard.pages = pages;
        if (this.props.onDashboardUpdated) {
            this.props.onDashboardUpdated(this.props.dashboard);
        }
    }

    /**
     * Generate unique page Id.
     * @param id
     * @returns {*|number}
     */
    generatePageId(id) {
        id = id || _pages.length + 1;
        let candidateId = PAGE_ID_PREFIX + id;
        let hasPage = false;
        for (let i = 0; i < _pages.length; i++) {
            if (_pages[i].id.toLowerCase() === candidateId) {
                hasPage = true;
                break;
            }
        }
        return hasPage ? this.generatePageId(id + 1) : id;
    }

    pageSelected(id, url) {
        if (this.props.onPageSelected) {
            this.props.onPageSelected(id, url);
        }
    }
}