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
import RaisedButton from 'material-ui/RaisedButton';
import AddCircleOutlineIcon from 'material-ui/svg-icons/content/add-circle-outline';
import TextField from 'material-ui/TextField';
import PageEntry from './PageEntry';
import DashboardsAPIs from '../../utils/apis/DashboardAPIs';

var pages = [];

const styles = {
    open: {
    },
    close: {
        display: 'none'
    }
};

export default class PagesPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pages: pages
        };
        this.searchPages = this.searchPages.bind(this);
        this.addPage = this.addPage.bind(this);
        this.savePage = this.savePage.bind(this);
        this.buildPages = this.buildPages.bind(this);
    }

    componentWillReceiveProps(props) {
        pages = this.buildPages(props.dashboard.pages);
        this.setState({
            pages: pages
        });
    }

    buildPages(p, a, baseUrl) {
        a = a || [];
        baseUrl = baseUrl || '';
        for(var i = 0; i < p.length; i++) {
            let pageUrl = baseUrl + p[i].id;
            a.push({
                id: p[i].id,
                title: p[i].name,
                url: pageUrl
            });
            if (p[i].pages && p[i].pages.length > 0) {
                this.buildPages(p[i].pages, a, pageUrl + '/');
            }
        }
        return a;
    }

    render () {
        return (
            <div style={this.props.show ? styles.open : styles.close}>
                <div style={{'text-align': 'center'}}>
                    <RaisedButton label="Create Page" primary={true} icon={<AddCircleOutlineIcon />}
                                  style={{margin: 12}} onClick={this.addPage} />
                    <TextField hintText="Search..." onChange={this.searchPages} />
                </div>
                {
                    this.state.pages.map(p => {
                        return (
                            <PageEntry page={p} dashboardUrl={this.props.dashboard.url} pageUrl={p.url}
                                       onPageChanged={this.savePage} />
                        );
                    })
                }
            </div>
        );
    }

    searchPages(e) {
        let filteredPages = pages.filter(function(p) {
            return p.title.toLowerCase().includes(e.target.value.toLowerCase());
        });
        this.setState({
            pages: filteredPages
        });
    }

    addPage() {
        let uniqueId = this.generatePageId(pages.length);
        let id = 'page' + uniqueId;
        let title = 'New Page - ' +uniqueId;
        pages.push({ 
            id: id,
            title: title,
            url: id
        });
        this.setState({
            pages: pages
        });

        this.props.dashboard.pages.push({
            id: id,
            name: title,
            content: [],
            pages: []
        });
        let dashboardsAPIs = new DashboardsAPIs();
        dashboardsAPIs.updateDashboardByID(this.props.dashboard.id, this.props.dashboard);
        window.global.notify('Page added succcessfully!');
    }

    generatePageId(id) {
        let candidateId = id;
        let hasPage = false;
        for (let i = 0; i < pages.length; i++) {
            if (pages[i].id.toLowerCase() === candidateId) {
                hasPage = true;
                break;
            }
        }
        if (!hasPage) {
            return candidateId;
        }
        return generatePageId(id);
    }

    savePage(id, page) {
        let path = page.url.split('/');
        if (path.length > 1) {
            // TODO: handle hierarchical pages
            return;
        }

        if (path.length === 0) {
            for(let i = 0; i < this.props.dashboard.pages.length; i++) {
                if (this.props.dashboard.pages[i].landingPage) {
                    this.props.dashboard.pages[i].id = page.id;
                    this.props.dashboard.pages[i].name = page.title;
                }
            }
        } else {
            for(let i = 0; i < this.props.dashboard.pages.length; i++) {
                if (this.props.dashboard.pages[i].id === id) {
                    this.props.dashboard.pages[i].id = page.id;
                    this.props.dashboard.pages[i].name = page.title;
                }
            }
        }
        let dashboardsAPIs = new DashboardsAPIs();
        dashboardsAPIs.updateDashboardByID(this.props.dashboard.id, this.props.dashboard);

        for(let i = 0; i < pages.length; i++) {
            if (pages[i].id === id) {
                pages[i] = page;
                this.setState({
                    pages: pages
                });
                break;
            }
        }
        
        let appContext = window.location.pathname.split('/')[1];
        let url = '/' + appContext + '/designer/' + this.props.dashboard.url;
        window.location.href = url;
        
        window.global.notify('Dashboard saved successfully!');
    }
}