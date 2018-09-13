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
import _ from 'lodash';
import { Snackbar } from 'material-ui';
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
import DashboardReportGenerator from "../../utils/DashboardReportGenerator";

const glDarkThemeCss = glDarkTheme.toString();
const glLightThemeCss = glLightTheme.toString();
const dashboardContainerId = 'dashboard-container';

export default class DashboardRenderer extends Component {

    constructor(props) {
        super(props);
        this.goldenLayout = null;
        this.loadedWidgetsCount = 0;
        this.state = {
            viewportHeight: window.innerHeight,
            showWidgetReportGenerationError: false,
        };

        this.handleWindowResize = this.handleWindowResize.bind(this);
        this.renderGoldenLayout = this.renderGoldenLayout.bind(this);
        this.destroyGoldenLayout = this.destroyGoldenLayout.bind(this);
        this.triggerThemeChangeEvent = this.triggerThemeChangeEvent.bind(this);
        this.onWidgetLoadedEvent = this.onWidgetLoadedEvent.bind(this);
        this.onGoldenLayoutComponentCreateEvent = this.onGoldenLayoutComponentCreateEvent.bind(this);
        this.unmounted = false;
        this.handleReportGenerationError = this.handleReportGenerationError.bind(this);
        this.renderReportGenerationErrorSnackBar = this.renderReportGenerationErrorSnackBar.bind(this);
    }

    handleWindowResize() {
        this.setState({ viewportHeight: window.innerHeight });
        if (this.goldenLayout) {
            this.goldenLayout.updateSize();
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleWindowResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowResize);
        this.unmounted = true;
        this.destroyGoldenLayout();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.dashboardPageContents !== nextProps.dashboardPageContents) {
            // Receiving a new dashboard to render.
            this.destroyGoldenLayout();
            return true;
        } else if (this.state.viewportHeight !== nextState.viewportHeight) {
            // Dashboard resized.
            return true;
        } else if (this.props.theme !== nextProps.theme) {
            // Receiving a new theme.
            this.triggerThemeChangeEvent(nextProps.theme);
            return true;
        } else if (this.state.showWidgetReportGenerationError !== nextState.showWidgetReportGenerationError) {
            return true;
        }
        // TODO : change the widget props when theme changes
        return false;
    }

    render() {
        const { theme, dashboardPageHeight } = this.props;

        // Calculate optimal dashboard height for the current screen.
        const height = (dashboardPageHeight != null && dashboardPageHeight !== '') ?
            parseInt(dashboardPageHeight, 10) : (this.state.viewportHeight - this.props.theme.appBar.height);

        return (
            <div>
                <style>{theme.name === 'dark' ? glDarkThemeCss : glLightThemeCss}</style>
                <div
                    style={{
                        color: theme.palette.textColor,
                        backgroundColor: theme.palette.canvasColor,
                        fontFamily: theme.fontFamily,
                        width: '100%',
                        height,
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
                {this.renderReportGenerationErrorSnackBar()}
            </div>
        );
    }

    renderGoldenLayout() {
        if (this.goldenLayout) {
            return;
        }

        const goldenLayoutContents = this.props.dashboardPageContents;
        GoldenLayoutContentUtils.traverseWidgetContents(goldenLayoutContents, (widgetContent) => {
            const isHeaderShown = _.get(widgetContent, 'props.configs.options.header');
            if (isHeaderShown != null) {
                widgetContent.header.show = isHeaderShown;
            }
            const headerTitle = _.get(widgetContent, 'props.configs.options.headerTitle');
            if (headerTitle != null) {
                widgetContent.title = headerTitle;
            }
        });

        const goldenLayout = GoldenLayoutFactory.createForViewer(dashboardContainerId, goldenLayoutContents);
        const numberOfWidgets = GoldenLayoutContentUtils.getReferredWidgetClassNames(goldenLayoutContents).length;
        goldenLayout.on('componentCreated', this.onGoldenLayoutComponentCreateEvent);
        goldenLayout.eventHub.on(Event.DASHBOARD_VIEWER_WIDGET_LOADED,
            () => this.onWidgetLoadedEvent(numberOfWidgets, this.props.dashboardId));
        goldenLayout.on('initialised', () => {
            // Set default theme
            this.triggerThemeChangeEvent(this.props.theme);
        });
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

    onGoldenLayoutComponentCreateEvent(component) {
        const exportButton = document.createElement('i');
        exportButton.title = 'Generate Report';
        exportButton.className = 'fw fw-export widget-report-generation-button';
        exportButton.addEventListener('click', () => {
            DashboardReportGenerator.generateWidgetPdf(component.element[0], component.config.title, true, true,
                this.props.theme.name, this.props.dashboardName, this.handleReportGenerationError);
        });
        component.parent.header.controlsContainer.prepend(exportButton);
    }

    handleReportGenerationError() {
        this.setState({ showWidgetReportGenerationError: true });
    }

    renderReportGenerationErrorSnackBar() {
        return (
            <Snackbar
                message={'Error occured while capturing the widget snapshot'}
                open={this.state.showWidgetReportGenerationError}
                autoHideDuration="4000"
                onRequestClose={() => this.setState({ showWidgetReportGenerationError: false })}
            />
        );
    }
}

DashboardRenderer.propTypes = {
    dashboardId: PropTypes.string.isRequired,
    dashboardName: PropTypes.string.isRequired,
    dashboardPageContents: PropTypes.arrayOf({}).isRequired,
    dashboardPageHeight: PropTypes.number.isRequired,
    theme: PropTypes.shape({}).isRequired,
};
