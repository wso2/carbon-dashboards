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
import WidgetClassRegistry from '../utils/WidgetClassRegistry';
import GoldenLayoutContentUtils from '../utils/GoldenLayoutContentUtils';

const widgetScriptUrlPrefix = `${window.location.origin}${window.contextPath}/public/extensions/widgets`;
const WidgetLoadingPhase = {
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
        let goldenLayout = props.glContainer.layoutManager;
        let config = GoldenLayoutContentUtils.getWidgetContent(this.widgetUUID, goldenLayout.config.content);
        this.widgetName = config.component;
        this.widgetClass = null;
        this.state = {
            widgetLoadingState: {phase: WidgetLoadingPhase.INIT, progress: -1}
        };

        this.getWidgetClass = this.getWidgetClass.bind(this);
        this.fetchWidget = this.fetchWidget.bind(this);
        this.updateWidgetLoadingState = this.updateWidgetLoadingState.bind(this);
        this.onGoldenLayoutInitialised = this.onGoldenLayoutInitialised.bind(this);
        goldenLayout.on('initialised', () => this.onGoldenLayoutInitialised());
    }

    getWidgetClass() {
        if (!this.widgetClass) {
            this.widgetClass = WidgetClassRegistry.getWidgetClass(this.widgetName);
        }
        return this.widgetClass;
    }

    onGoldenLayoutInitialised() {
        if (this.getWidgetClass()) {
            this.updateWidgetLoadingState(WidgetLoadingPhase.LOADED);
        } else {
            this.fetchWidget();
        }
    }

    fetchWidget() {
        this.updateWidgetLoadingState(WidgetLoadingPhase.FETCHING);
        Axios.create({
            baseURL: widgetScriptUrlPrefix,
            timeout: 4000,
            onDownloadProgress: (progressEvent) => {
                let progress = progressEvent.lengthComputable ?
                               (progressEvent.loaded / progressEvent.total) : -1;
                this.updateWidgetLoadingState(WidgetLoadingPhase.FETCHING, progress);
            }
        })
            .get(`/${this.widgetName}/${this.widgetName}.js`)
            .then(response => {
                this.updateWidgetLoadingState(WidgetLoadingPhase.LOADING);
                window.eval(response.data);
                if (this.getWidgetClass()) {
                    // TODO: 5/5/18 Wire pub/sub
                    this.updateWidgetLoadingState(WidgetLoadingPhase.LOADED);
                } else {
                    this.updateWidgetLoadingState(WidgetLoadingPhase.FETCHING_FAIL);
                }
            })
            .catch(error => {
                this.updateWidgetLoadingState(WidgetLoadingPhase.FETCHING_FAIL);
            });
    }

    updateWidgetLoadingState(state, progress = -1) {
        this.setState({widgetLoadingState: {phase: state, progress: progress}});
    }

    render() {
        if (this.state.widgetLoadingState.phase === WidgetLoadingPhase.LOADED) {
            return React.createElement(this.widgetClass, this.props);
        } else {
            // TODO: 5/9/18 render proper UI for following
            switch (this.state.widgetLoadingState.phase) {
                case WidgetLoadingPhase.INIT:
                    return <div>Initializing loading {this.widgetName}</div>;
                case WidgetLoadingPhase.FETCHING:
                    return <div>Fetching {this.widgetName}</div>;
                case WidgetLoadingPhase.FETCHING_FAIL:
                    return <div>Fetching {this.widgetName} failed</div>;
                case WidgetLoadingPhase.LOADING:
                    return <div>Loading {this.widgetName} ... {this.state.widgetLoadingState.progress}%</div>;
                case WidgetLoadingPhase.LOADING_FAIL:
                    return <div>Loading {this.widgetName} failed</div>;
            }
        }
    }
}

