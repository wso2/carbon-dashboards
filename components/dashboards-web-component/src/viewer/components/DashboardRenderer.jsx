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

import jspdf from 'jspdf';
import html2cavas from 'html2canvas';
import { pdfConfig } from './JspdfConf.js';
import axios from 'axios';
import AuthManager from '../../auth/utils/AuthManager';
import ReportGeneration from '../../utils/ReportGeneration';

import { Dialog, FlatButton, Checkbox, CircularProgress } from 'material-ui';

import autoTable from 'jspdf-autotable';  //Need to work with report generation for tables (jspdf extension)

const glDarkThemeCss = glDarkTheme.toString();
const glLightThemeCss = glLightTheme.toString();
const dashboardContainerId = 'dashboard-container';

/**
 * App context sans starting forward slash.
 */
const appContext = window.contextPath.substr(1);

export default class DashboardRenderer extends Component {

    constructor(props) {
        super(props);
        this.goldenLayout = null;
        this.loadedWidgetsCount = 0;
        this.state = {
            height: window.innerHeight,
            completed:0
        };

        this.handleWindowResize = this.handleWindowResize.bind(this);
        this.renderGoldenLayout = this.renderGoldenLayout.bind(this);
        this.destroyGoldenLayout = this.destroyGoldenLayout.bind(this);
        this.triggerThemeChangeEvent = this.triggerThemeChangeEvent.bind(this);
        this.onWidgetLoadedEvent = this.onWidgetLoadedEvent.bind(this);
        this.onGoldenLayoutComponentAddEvent = this.onGoldenLayoutComponentAddEvent.bind(this);
        this.unmounted = false;

        this.handleClose = this.handleClose.bind(this);
        this.handleOpen = this.handleOpen.bind(this);
        this.handleIncludeGenerateTime = this.handleIncludeGenerateTime.bind(this);
        this.handleIncludeNoOfRecords = this.handleIncludeNoOfRecords.bind(this);
        this.handleReportStatusOpen=this.handleReportStatusOpen.bind(this);
        this.handleReportStatusClose=this.handleReportStatusClose.bind(this);
        this.generateWidgetReport=this.generateWidgetReport.bind(this);

    }

    handleWindowResize() {
        if (this.goldenLayout) {
            this.goldenLayout.updateSize();
        }
        this.setState({ height: window.innerHeight });
    }

    componentDidMount() {
        this.setState({ height: window.innerHeight });
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

        if (this.props.theme.name == 'light') {
            this.triggerThemeChangeEvent(nextProps.theme);
        }

        if (this.state.dialogOpen != nextState.dialogOpen) {
            return true;
        }
        if (this.state.reportStatusOpen != nextState.reportStatusOpen) {
            return true;
        }
        if (this.state.completed < nextState.completed & nextState.completed <= 100) {
            return true;
        }
        if (this.state.recordCountEnabled != nextState.recordCountEnabled) {
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

        const dialogActions = [
            <FlatButton
                label='Cancel'
                primary={true}
                onClick={this.handleClose}
            />,
            <FlatButton
                label='Export'
                primary={true}
                onClick={this.generateWidgetReport}
            />,
        ];

        const customStatusDailogStyle = {
            width: 400,
            maxWidth: 'none',
            position: 'relative'
        };

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
                        className='dashboard-view-container'
                        ref={() => {
                            if (!this.unmounted) {
                                this.renderGoldenLayout();
                            }
                        }}
                    />
                </div>
                <Dialog
                    title='Select PDF options'
                    actions={dialogActions}
                    modal={true}
                    open={this.state.dialogOpen}
                >
                    <Checkbox
                        label='Include report genetation time'
                        onClick={this.handleIncludeGenerateTime}
                    />

                    {(this.state.recordCountEnabled) && (
                        <Checkbox
                            label='Include number of records'
                            onClick={this.handleIncludeNoOfRecords}
                        />
                    )}
                </Dialog>

                <Dialog
                    title='Report is generating'
                    contentStyle={customStatusDailogStyle}
                    modal={true}
                    open={this.state.reportStatusOpen}
                >
                    <CircularProgress
                        mode='determinate'
                        value={this.state.completed}
                        size={80}
                        thickness={5}
                        style={{ marginLeft: '35%' }}
                    />
                </Dialog>
            </div>
        );
    }

    renderGoldenLayout() {
        if (this.goldenLayout) {
            return;
        }

        const goldenLayoutContents = this.props.goldenLayoutContents;
        const goldenLayout = GoldenLayoutFactory.createForViewer(dashboardContainerId, goldenLayoutContents);

        const numberOfWidgets = GoldenLayoutContentUtils.getReferredWidgetClassNames(goldenLayoutContents).length;
        goldenLayout.on('itemDropped', this.onGoldenLayoutComponentAddEvent);
        goldenLayout.on('componentCreated', this.onGoldenLayoutComponentAddEvent);
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

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async generateWidgetReport(){
        this.handleClose();
        this.handleReportStatusOpen();
        this.timer = setInterval(this.progress, 200);
        await this.sleep(2000);

        const element = this.state.widget;
        const docTitle = this.state.title;

        const pdf=ReportGeneration.exportWidget(element,docTitle,this.state.includeTime,this.state.includeRecords,
                                                this.props.theme.name);

        clearInterval(this.timer);
        this.handleReportStatusClose();
        this.state.completed = 0;
        this.state.includeRecords = false;
        this.state.includeTime = false;

    }

    onGoldenLayoutComponentAddEvent(component) {
        const settingsButton = document.createElement('i');
        settingsButton.title = 'settings';
        settingsButton.className = 'fw fw-export widget-export-button';
        settingsButton.addEventListener('click', () => {
            const selectedElement = component.element[0];
            if (selectedElement.innerHTML.search('rt-table') > -1) {
                this.setState({ recordCountEnabled: true });
            } else {
                this.setState({ recordCountEnabled: false });
            }
            this.handleOpen();
            this.state.widget = component.element[0];
            this.state.title = component.config.title;
        });

        component.parent.header.controlsContainer.prepend(settingsButton);
    }

    handleClose() {
        this.setState({ dialogOpen: false });
    }

    handleOpen() {
        this.setState({ dialogOpen: true });
    }

    handleIncludeGenerateTime() {
        this.setState({ includeTime: !this.state.includeTime });
    }

    handleIncludeNoOfRecords() {
        this.setState({ includeRecords: !this.state.includeRecords });
    }

    handleReportStatusClose() {
        this.setState({ reportStatusOpen: false });
    }

    handleReportStatusOpen() {
        this.setState({ reportStatusOpen: true });
    }

    progress = () => {
        let { completed } = this.state;
        this.setState({ completed: completed >= 100 ? 0 : completed + 10 });
    };
}

DashboardRenderer.propTypes = {
    dashboardId: PropTypes.string.isRequired,
    goldenLayoutContents: PropTypes.arrayOf({}).isRequired,
    theme: PropTypes.shape({}).isRequired,
};
