/*
*  Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*  http://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License.
*/

import React from 'react';
import ExtendedWidget from "./ExtendedWidget";
import VizG from 'react-vizgrammar';
import Axios from 'axios';
import AuthManager from '../../dashboards-web-component/src/auth/utils/AuthManager';

export default class UniversalWidget extends ExtendedWidget {

    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            width: props.glContainer.width,
            height: props.glContainer.height,
            metadata: null,
            data: null,
            config: null,
        };
        this.handleResize = this.handleResize.bind(this);
        this.props.glContainer.on('resize', this.handleResize);
        this.handleWidgetData = this.handleWidgetData.bind(this);
    }

    componentDidMount() {
        this.handleWidgetData = this.handleWidgetData.bind(this);
        this.getHTTPClient()
            .get(`apis/widgets/${this.props.widgetID}`)
            .then((message) => {
                if (message.data.configs.version !== "1.0.0") {
                    let providerConfiguration = message.data.configs.providerConfig;
                    providerConfiguration.configs.config.queryData = {};
                    providerConfiguration.configs.config.queryData.query = providerConfiguration.configs.config.query;
                    delete providerConfiguration.configs.config.query;
                }
                super.getWidgetChannelManager().subscribeWidget(this.props.widgetID, this.handleWidgetData, providerConfiguration);
                this.setState({config: message.data.configs.chartConfig});
            })
            .catch((error) => {
                // TODO: Handle error
            });
    }

    componentWillUnmount() {
        super.getWidgetChannelManager().unsubscribeWidget(this.props.id);
    }

    handleWidgetData(data) {
        this.setState({
            metadata: data.metadata,
            data: data.data
        })
    }

    render() {
        return (
            <div style={{width: this.props.glContainer.width, height: this.props.glContainer.height}}>
                <VizG
                    config={this.state.config}
                    metadata={this.state.metadata}
                    data={this.state.data}
                    height={this.props.glContainer.height}
                    width={this.props.glContainer.width}
                />
            </div>
        )
    }

    handleResize() {
        this.setState({width: this.props.glContainer.width, height: this.props.glContainer.height});
    }

    getHTTPClient() {
        let httpClient = Axios.create({
            baseURL: window.location.origin + window.contextPath,
            timeout: 2000,
            headers: {"Authorization": "Bearer " + AuthManager.getUser().SDID},
        });
        httpClient.defaults.headers.post['Content-Type'] = 'application/json';
        return httpClient;
    }
}

global.dashboard.registerWidget("UniversalWidget", UniversalWidget);
