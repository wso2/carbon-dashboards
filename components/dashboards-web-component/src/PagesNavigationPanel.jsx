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
import {Link} from 'react-router-dom';

class PagesNavigationPanel extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.pages) {
            this.props.pagesList = this.props.pages.map(page => {
                return <li><Link to={this.props.dashboardId + "/" + page} replace>{page}</Link></li>;
            });
        }
        return <div className={"sidebar-wrapper sidebar-nav hidden-xs pages-navigation-panel " + this.props.toggled}>
            <div className="product-logo pages-nav-panel-product-logo">
                <i className="icon fw fw-wso2-logo"></i>
            </div>
            <div className="product-name pages-nav-panel-dashboard-name">
                {this.props.dashboardName}
            </div>
            <div>
                <ul className="nav nav-pills nav-stacked menu-customize pages">
                    {this.props.pagesList}
                </ul>
            </div>
        </div>;
    }
}

export default PagesNavigationPanel;