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
import 'golden-layout/src/css/goldenlayout-base.css';

import GoldenLayoutContentUtils from '../../utils/GoldenLayoutContentUtils';
import WidgetRenderer from '../../common/WidgetRenderer';

import '../../common/styles/custom-goldenlayout-dark-theme.css';
import glDarkTheme from '!!css-loader!../../common/styles/custom-goldenlayout-dark-theme.css';
import './dashboard-container-styles.css';

const glDarkThemeCss = glDarkTheme.toString();
const dashboardContainerId = 'dashboard-container';

export default class DashboardRenderer extends Component {

    constructor(props) {
        super(props);
        this.goldenLayout = null;

        this.handleWindowResize = this.handleWindowResize.bind(this);
        this.renderGoldenLayout = this.renderGoldenLayout.bind(this);
        this.destroyGoldenLayout = this.destroyGoldenLayout.bind(this);
    }

    handleWindowResize() {
        if (this.goldenLayout) {
            this.goldenLayout.updateSize();
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleWindowResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowResize);
        this.destroyGoldenLayout();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.goldenLayoutContents !== nextProps.goldenLayoutContents) {
            // Receiving a new dashboard to render.
            this.destroyGoldenLayout();
            return true;
        }
        return false;
    }

    render() {
        return (
            <div>
                <style>{glDarkThemeCss}</style>
                <div
                    id={dashboardContainerId}
                    className='dashboard-design-container'
                    style={{
                        color: this.props.theme.palette.textColor,
                        backgroundColor: this.props.theme.palette.canvasColor,
                        fontFamily: this.props.theme.fontFamily,
                    }}
                    ref={() => this.renderGoldenLayout()}
                />
            </div>
        );
    }

    renderGoldenLayout() {
        if (this.goldenLayout) {
            return;
        }

        const config = {
            settings: {
                constrainDragToContainer: false,
                reorderEnabled: true,
                selectionEnabled: true,
                popoutWholeStack: false,
                blockedPopoutsThrowError: true,
                closePopoutsOnUnload: true,
                responsiveMode: 'always',
                hasHeaders: true,
                showPopoutIcon: false,
                showMaximiseIcon: false,
                showCloseIcon: true,
            },
            dimensions: {
                headerHeight: 37,
            },
            content: this.props.goldenLayoutContents || [],
        };
        const dashboardContainer = document.getElementById(dashboardContainerId);
        const goldenLayout = new GoldenLayout(config, dashboardContainer);
        const loadingWidgetNames = GoldenLayoutContentUtils.getReferredWidgetNames(this.props.goldenLayoutContents);
        loadingWidgetNames.forEach(widgetName => goldenLayout.registerComponent(widgetName, WidgetRenderer));

        // Workaround suggested in https://github.com/golden-layout/golden-layout/pull/348#issuecomment-350839014
        setTimeout(() => goldenLayout.init(), 0);
        this.goldenLayout = goldenLayout;
    }

    destroyGoldenLayout() {
        if (this.goldenLayout) {
            this.goldenLayout.destroy();
            delete this.goldenLayout;
        }
        this.goldenLayout = null;
    }
}

DashboardRenderer.propTypes = {
    goldenLayoutContents: PropTypes.array.isRequired,
    theme: PropTypes.shape({}).isRequired,
};
