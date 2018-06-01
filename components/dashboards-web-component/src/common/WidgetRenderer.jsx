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
import Axios from 'axios';

import { LinearProgress, Paper, RaisedButton } from 'material-ui';
import { darkBaseTheme, getMuiTheme, MuiThemeProvider } from 'material-ui/styles';
import { NavigationRefresh } from 'material-ui/svg-icons';

import WidgetClassRegistry from '../utils/WidgetClassRegistry';
import GoldenLayoutContentUtils from '../utils/GoldenLayoutContentUtils';
import { Event } from '../utils/Constants';

const widgetScriptUrlPrefix = `${window.location.origin}${window.contextPath}/public/extensions/widgets`;
const WidgetLoadingStatus = {
    INIT: 'init',
    FETCHING: 'fetching',
    FETCHING_FAIL: 'fetching-fail',
    LOADING: 'loading',
    LOADING_FAIL: 'loading-fail',
    LOADED: 'loaded'
};

export default class WidgetRenderer extends Component {

    constructor(props) {
        super(props);
        this.widgetUUID = props.id;
        this.widgetName = props.widgetID;
        if (!this.widgetName) {
            const goldenLayout = props.glContainer.layoutManager;
            const config = GoldenLayoutContentUtils.getWidgetContent(this.widgetUUID, goldenLayout.config.content);
            this.widgetName = config.component;
        }
        this.widgetClassName = (props.configs && props.configs.isGenerated) ? 'UniversalWidget' : this.widgetName;
        this.widgetClass = null;
        this.state = {
            currentTheme: getMuiTheme(darkBaseTheme),
            widgetLoadingStatus: WidgetLoadingStatus.INIT,
            widgetFetchingProgress: -1,
        };

        this.getWidgetClass = this.getWidgetClass.bind(this);
        this.loadWidgetClass = this.loadWidgetClass.bind(this);
        this.fetchWidget = this.fetchWidget.bind(this);
        this.updateWidgetLoadingStatus = this.updateWidgetLoadingStatus.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.triggerEvent = this.triggerEvent.bind(this);

        props.glContainer.on('resize', this.handleResize);
        props.glEventHub.on(Event.DASHBOARD_VIEW_THEME_CHANGE, newTheme => this.setState({ currentTheme: newTheme }));
        props.glEventHub.on(Event.DASHBOARD_DESIGNER_WIDGET_CONFIG_UPDATE, (newConfig)=>{
            this.forceUpdate();
        });
    }

    componentDidMount() {
        const goldenLayout = this.props.glContainer.layoutManager;
        if (goldenLayout.isInitialised) {
            this.loadWidgetClass();
        } else {
            goldenLayout.on('initialised', () => this.loadWidgetClass());
        }
    }

    getWidgetClass() {
        if (!this.widgetClass) {
            this.widgetClass = WidgetClassRegistry.getWidgetClass(this.widgetClassName);
        }
        return this.widgetClass;
    }

    loadWidgetClass() {
        if (this.getWidgetClass()) {
            this.updateWidgetLoadingStatus(WidgetLoadingStatus.LOADED);
        } else {
            this.fetchWidget();
        }
    }

    fetchWidget() {
        this.updateWidgetLoadingStatus(WidgetLoadingStatus.FETCHING);
        Axios.create({
            baseURL: widgetScriptUrlPrefix,
            timeout: 10000,
            onDownloadProgress: (progressEvent) => {
                let progress = progressEvent.lengthComputable ?
                    ((progressEvent.loaded / progressEvent.total) * 100) : -1;
                this.updateWidgetLoadingStatus(WidgetLoadingStatus.FETCHING, progress);
            }
        })
            .get(`/${this.widgetClassName}/${this.widgetClassName}.js`)
            .then(response => {
                this.updateWidgetLoadingStatus(WidgetLoadingStatus.LOADING);
                window.eval(response.data);
                if (this.getWidgetClass()) {
                    this.updateWidgetLoadingStatus(WidgetLoadingStatus.LOADED);
                    this.triggerEvent(Event.DASHBOARD_VIEW_WIDGET_LOADED, this.widgetName);
                } else {
                    this.updateWidgetLoadingStatus(WidgetLoadingStatus.FETCHING_FAIL);
                }
            })
            .catch(error => {
                console.warn(`Fetching widget '${this.widgetName}' failed.` + error.message);
                this.updateWidgetLoadingStatus(WidgetLoadingStatus.FETCHING_FAIL);
            });
    }

    updateWidgetLoadingStatus(state, progress = -1) {
        this.setState({
            widgetLoadingStatus: state,
            widgetFetchingProgress: progress
        });
    }

    handleResize() {
        this.triggerEvent(Event.DASHBOARD_DESIGNER_WIDGET_RESIZE, this.widgetName);
    }

    triggerEvent(name, parameter) {
        this.props.glContainer.layoutManager.eventHub.trigger(name, parameter);
    }

    renderWidgetLoadingStatus(message, isErrorMessage = false) {
        const theme = this.state.currentTheme;
        const paperStyles = {
            margin: 0,
            padding: 0,
            border: 0,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,
        };
        const titleStyles = {
            fontWeight: 500,
            fontSize: '18px',
            color: theme.palette.textColor,
            backgroundColor: theme.palette.canvasColor,
            fontFamily: theme.fontFamily
        };
        const messageStyles = {
            marginTop: 20,
            marginBottom: 10,
            color: (isErrorMessage ? theme.textField.errorColor : theme.palette.textColor)
        };

        return (
            <MuiThemeProvider muiTheme={theme}>
                <Paper style={paperStyles} zDepth={0}>
                    <div style={titleStyles}>{this.widgetName}</div>
                    <div style={messageStyles}>{message}</div>
                    {isErrorMessage ? this.renderReloadButton() : this.renderProgressBar()}
                </Paper>
            </MuiThemeProvider>
        );
    }

    renderProgressBar() {
        const progressBarStyles = {
            marginLeft: 20,
            marginRight: 20
        };
        const progress = this.state.widgetFetchingProgress;

        if (progress === -1) {
            return <div style={progressBarStyles}><LinearProgress mode='indeterminate' /></div>;
        } else {
            return (
                <div style={progressBarStyles}>
                    <LinearProgress mode='determinate' min={0} max={100} value={progress} />
                </div>
            );
        }
    }

    renderReloadButton() {
        return (
            <div>
                <RaisedButton label='Retry' primary={true} icon={<NavigationRefresh />}
                              onClick={() => this.loadWidgetClass()} />
            </div>
        );
    }

    render() {
        if (this.state.widgetLoadingStatus === WidgetLoadingStatus.LOADED) {
            const widgetProps = {
                ...this.props,
                width: this.props.glContainer.width,
                height: this.props.glContainer.height,
                muiTheme: this.state.currentTheme
            };
            return React.createElement(this.widgetClass, widgetProps);
        } else {
            let message = null, isErrorMessage = false;
            switch (this.state.widgetLoadingStatus) {
                case WidgetLoadingStatus.INIT:
                    message = 'Initializing ...';
                    break;
                case WidgetLoadingStatus.FETCHING:
                    message = 'Fetching ...';
                    break;
                case WidgetLoadingStatus.FETCHING_FAIL:
                    message = 'Fetching failed!';
                    isErrorMessage = true;
                    break;
                case WidgetLoadingStatus.LOADING:
                    message = 'Loading ...';
                    break;
                case WidgetLoadingStatus.LOADING_FAIL:
                    message = 'Loading failed!';
                    isErrorMessage = true;
                    break;
            }
            return this.renderWidgetLoadingStatus(message, isErrorMessage);
        }
    }
}
