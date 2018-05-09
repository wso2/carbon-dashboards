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
import PropTypes from 'prop-types';
import GoldenLayout from 'golden-layout';
import GoldenLayoutContentUtils from "../utils/GoldenLayoutContentUtils";
import WidgetRenderer from "./WidgetRenderer";

export default class DashboardRenderer extends Component {

    constructor(props) {
        super(props);
        this.goldenLayout = null;
        this.loadingWidgetNames = GoldenLayoutContentUtils.getReferredWidgetNames(props.goldenLayoutContents);

        this.renderGoldenLayout = this.renderGoldenLayout.bind(this);
    }

    render(){
        return (
            <div id="dashboard-view"
                 className={styles.dashboardViewCSS}
                 style={{ color: this.state.muiTheme.palette.textColor }}
                 ref={element => this.renderGoldenLayout(element)}>
            </div>
        );
    }

    renderGoldenLayout(container) {
        if (this.goldenLayout) {
            return;
        }

        const config = {
            settings: {
                hasHeaders: true,
                constrainDragToContainer: false,
                reorderEnabled: false,
                selectionEnabled: false,
                popoutWholeStack: false,
                blockedPopoutsThrowError: true,
                closePopoutsOnUnload: true,
                showPopoutIcon: false,
                showMaximiseIcon: true,
                responsive: true,
                isClosable: false,
                responsiveMode: 'always',
                showCloseIcon: false,
            },
            dimensions: {
                headerHeight: 37
            },
            isClosable: false,
            content: this.props.goldenLayoutContents || []
        };
        this.goldenLayout = new GoldenLayout(config, container);
        this.loadingWidgetNames.forEach(widgetName => this.goldenLayout.registerComponent(widgetName, WidgetRenderer));
        window.onresize = () => this.goldenLayout.updateSize();
    }

    componentWillUnmount(){
        this.goldenLayout.destroy();
        this.goldenLayout = null;
    }
}

DashboardRenderer.propTypes = {
    goldenLayoutContents: PropTypes.array
};
