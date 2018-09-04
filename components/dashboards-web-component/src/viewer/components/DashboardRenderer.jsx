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
import 'golden-layout/src/css/goldenlayout-base.css';

import GoldenLayoutContentUtils from '../../utils/GoldenLayoutContentUtils';
import DashboardThumbnail from '../../utils/DashboardThumbnail';
import { Event } from '../../utils/Constants';
import GoldenLayoutFactory from '../../utils/GoldenLayoutFactory';

import '../../common/styles/custom-goldenlayout-dark-theme.css';
import glDarkTheme from '!!css-loader!../../common/styles/custom-goldenlayout-dark-theme.css';
import '../../common/styles/custom-goldenlayout-light-theme.css';
import glLightTheme from '!!css-loader!../../common/styles/custom-goldenlayout-light-theme.css';
import './dashboard-container-styles.css';

const glDarkThemeCss = glDarkTheme.toString();
const glLightThemeCss = glLightTheme.toString();
const dashboardContainerId = 'dashboard-container';

export default class DashboardRenderer extends Component {

    constructor(props) {
        super(props);
        this.goldenLayout = null;
        this.loadedWidgetsCount = 0;
        this.state = {
            height: window.innerHeight
        };

        this.handleWindowResize = this.handleWindowResize.bind(this);
        this.renderGoldenLayout = this.renderGoldenLayout.bind(this);
        this.destroyGoldenLayout = this.destroyGoldenLayout.bind(this);
        this.triggerThemeChangeEvent = this.triggerThemeChangeEvent.bind(this);
        this.onWidgetLoadedEvent = this.onWidgetLoadedEvent.bind(this);
        this.unmounted = false;
    }

    handleWindowResize() {
        if (this.goldenLayout) {
            this.goldenLayout.updateSize();
        }
        this.setState({height: window.innerHeight});
    }

    componentDidMount() {
        this.setState({height: window.innerHeight});
        window.addEventListener('resize', this.handleWindowResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowResize);
        this.unmounted = true;
        this.destroyGoldenLayout();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.goldenLayoutContents !== nextProps.goldenLayoutContents) {
            // Receiving a new dashboard to render.
            this.destroyGoldenLayout();
            return true;
        } else if (this.state.height !== nextState.height) {
            // Dashboard resized.
            this.destroyGoldenLayout();
            return true;
        } else if (this.props.theme !== nextProps.theme) {
            // Receiving a new theme.
            this.triggerThemeChangeEvent(nextProps.theme);
            return true;
        }
        return false;
    }

    render() {
        let { theme, height } = this.props;

        // Calculate optimal dashboard height for the current screen.
        const containerHeight = this.state.height - 55;
        if (height) {
            height = parseInt(height);
        }
        height = height && height > containerHeight ? height : containerHeight;

        return (
            <div>
                <style>{this.props.theme.name === 'dark' ? glDarkThemeCss : glLightThemeCss}</style>
                <div
                    style={{
                        color: theme.palette.textColor,
                        backgroundColor: theme.palette.canvasColor,
                        fontFamily: theme.fontFamily,
                        height: height,
                    }}
                >
                    <div
                        id={dashboardContainerId}
                        className="dashboard-view-container"
                        ref={() => {
                            if (!this.unmounted) {
                                this.renderGoldenLayout();
                            }
                        }}
                    />
                </div>
            </div>
        );
    }

    renderGoldenLayout() {
        if (this.goldenLayout) {
            return;
        }

        let goldenLayoutContents = this.props.goldenLayoutContents;

        GoldenLayoutContentUtils.traverseWidgetContents(goldenLayoutContents, (widgetContent) => {
            let isHeaderShown = _.get(widgetContent, 'props.configs.options.header');
            widgetContent.header.show = isHeaderShown;
        });

        const goldenLayout = GoldenLayoutFactory.createForViewer(dashboardContainerId, goldenLayoutContents);
        const numberOfWidgets = GoldenLayoutContentUtils.getReferredWidgetClassNames(goldenLayoutContents).length;
        goldenLayout.eventHub.on(Event.DASHBOARD_VIEWER_WIDGET_LOADED,
            () => this.onWidgetLoadedEvent(numberOfWidgets, this.props.dashboardId));
        goldenLayout.initialize();
        this.goldenLayout = goldenLayout;
    }

    destroyGoldenLayout() {
        if (this.goldenLayout) {
            this.goldenLayout.destroy();
            delete this.goldenLayout;
        }
        this.goldenLayout = null;
        this.loadedWidgetsCount = 0;
    }

    triggerThemeChangeEvent(newTheme) {
        if (this.goldenLayout) {
            this.goldenLayout.eventHub.trigger(Event.DASHBOARD_VIEWER_THEME_CHANGE, newTheme);
        }
    }

    onWidgetLoadedEvent(totalNumberOfWidgets, dashboardName) {
        this.loadedWidgetsCount++;
        if (this.loadedWidgetsCount === totalNumberOfWidgets) {
            DashboardThumbnail.saveDashboardThumbnail(dashboardName, dashboardContainerId);
        }
    }
}

DashboardRenderer.propTypes = {
    dashboardId: PropTypes.string.isRequired,
    goldenLayoutContents: PropTypes.arrayOf({}).isRequired,
    theme: PropTypes.shape({}).isRequired,
};
