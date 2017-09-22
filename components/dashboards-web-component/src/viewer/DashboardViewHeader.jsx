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

class ViewHeader extends React.Component {
    constructor() {
        super();
        this.state = {
            toggled: true,
            viewHeaderCSS: "dashboard-view-header-toggled"
        };
        this.togglePagesNavPanel = this.togglePagesNavPanel.bind(this);
    }

    togglePagesNavPanel() {
        if (this.state.toggled) {
            this.setState({toggled: false, viewHeaderCSS: "dashboard-view-header"});
            this.props.togglePagesNavPanel(false);
        } else {
            this.setState({toggled: true, viewHeaderCSS: "dashboard-view-header-toggled"});
            this.props.togglePagesNavPanel(true);
        }

    }

    render() {
        return (
            <div className="dashboard-view-header-toggled">
                <a onClick={this.togglePagesNavPanel} className="sidebar-toggle-button hidden-xs active pages-nav-toggle-btn" aria-expanded={this.state.toggled}>
                    <span className="icon fw-stack">
                        <i className="fw fw-menu fw-stack-1x toggle-icon-left"></i>
                    </span>
                </a>
            </div>
        );
    }
}

export default ViewHeader;
