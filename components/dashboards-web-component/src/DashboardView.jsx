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

import React from 'react';
import DashboardViewHeader from './DashboardViewHeader';
import DashboardRenderingComponent from './DashboardRenderingComponent';
import PagesNavigationPanel from './PagesNavigationPanel';
import axios from 'axios';

class DashboardView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageId: this.props.match.params.pageId,
            toggled: "toggled",
            dashboardViewCSS: "dashboard-view",
            dashboardContent: []
        };
        this.togglePagesNavPanel = this.togglePagesNavPanel.bind(this);
        this.setDashboardProperties = this.setDashboardProperties.bind(this);
    }

    componentDidMount() {
        let httpClient = axios.create({
            baseURL: window.location.origin + '/dashboard',
            timeout: 2000
        });
        httpClient.get(this.props.match.params.id).then(this.setDashboardProperties).catch(function (error) {
            //TODO Need to use proper notification library to show the error
        });
    }

    setDashboardProperties(response) {
        let pages;
        pages = Object.keys(JSON.parse(response.data.content)[0]);
        this.setState({
            dashboardName: response.data.name,
            dashboardContent: JSON.parse(response.data.content),
            pages: pages
        });
    }

    getDashboardByPageId(pageId, dashboardContent) {
        let dashboardPageContent = [];
        if (dashboardContent[0]) {
            if (!pageId) {
                dashboardPageContent.push(dashboardContent[0]["page0"]);
            } else {
                dashboardPageContent.push(dashboardContent[0][pageId]);
            }
        }
        return dashboardPageContent;
    }

    togglePagesNavPanel(toggled) {
        if (toggled) {
            this.setState({toggled: "toggled", dashboardViewCSS: "dashboard-view"});
        } else {
            this.setState({toggled: "", dashboardViewCSS: "dashboard-view-full-width"});
        }
    }

    render() {
        return <section>
            <DashboardViewHeader dashboardName={this.state.dashboardName}
                                 togglePagesNavPanel={this.togglePagesNavPanel}></DashboardViewHeader>
            <PagesNavigationPanel dashboardId={this.props.match.params.id} pages={this.state.pages}
                                  dashboardName={this.state.dashboardName}
                                  toggled={this.state.toggled}></PagesNavigationPanel>
            <div id="dashboard-view" className={this.state.dashboardViewCSS}></div>
            <DashboardRenderingComponent
                dashboardContent={this.getDashboardByPageId(this.props.match.params.pageId, this.state.dashboardContent)}></DashboardRenderingComponent>
        </section>;
    }
}

export default DashboardView;