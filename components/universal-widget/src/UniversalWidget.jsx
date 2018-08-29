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
import Widget from '@wso2-dashboards/widget';
import VizG from 'react-vizgrammar';
import Axios from 'axios';
import AuthManager from '../../dashboards-web-component/src/auth/utils/AuthManager';

export default class UniversalWidget extends Widget {
    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            width: props.glContainer.width,
            height: props.glContainer.height,
            metadata: null,
            data: [],
            config: null,
            widgetInputs: [],
            systemInputs: [],
            providerConfigs: {},
        };
        this.handleResize = this.handleResize.bind(this);
        this.props.glContainer.on('resize', this.handleResize);
        this.handleWidgetData = this.handleWidgetData.bind(this);
        this.handleCustomWidgetInputs = this.handleCustomWidgetInputs.bind(this);
        this.publish = this.publish.bind(this);
        this.publishEvents = this.publishEvents.bind(this);
        this.state.systemInputs = this.props.systemInputs ? this.props.systemInputs : ["admin"];
    }

    componentDidMount() {
        this.handleWidgetData = this.handleWidgetData.bind(this);
        this.getHTTPClient()
            .get(`apis/widgets/${this.props.widgetID}`)
            .then((message) => {
                let providerConfiguration = message.data.configs.providerConfig;
                if (message.data.version !== "1.0.0") {
                    providerConfiguration.configs.config.queryData = {};
                    providerConfiguration.configs.config.queryData.query = providerConfiguration.configs.config.query;
                    delete providerConfiguration.configs.config.query;
                }
                this.state.providerConfigs = providerConfiguration;
                if (this.props.configs.pubsub.types.includes("subscriber")) {
                    this.handleCustomWidgetInputs(providerConfiguration.configs.config.queryData)
                }
                super.getWidgetChannelManager().
                    subscribeWidget(this.props.id, this.handleWidgetData, providerConfiguration);
                this.setState({ config: message.data.configs.chartConfig, metadata: message.data.configs.metadata });
            })
            .catch((error) => {
                // TODO: Handle error
            });
    }

    publishEvents(selectedData) {
        let data = {};
        this.state.config.widgetOutputConfigs.map(publishingAttribute => {
            data[publishingAttribute.publishedAsValue] = selectedData[publishingAttribute.publishingValue]
        });
        super.publish(data);
    }

    handleCustomWidgetInputs(queryData) {
        if (this.props.configs.pubsub.publishers) {
            this.props.configs.pubsub.publishers.map((publisherId) => {
                this.state.queryData = queryData;
                const subscriberWidgetInputMapping = this.props.configs.pubsub.widgetInputOutputMapping
                    .filter((widgetInputOutputMapping) => {
                        return widgetInputOutputMapping.publisherId === publisherId;
                    });
                let filteredWidgetInputOutputMapping = new Map();
                subscriberWidgetInputMapping.map((widgetInputOutputMapping) => {
                    const widgetInputOutput = {};
                    widgetInputOutput[widgetInputOutputMapping.subscriberWidgetInput]
                        = widgetInputOutputMapping.publisherWidgetOutput;
                    filteredWidgetInputOutputMapping.set(widgetInputOutputMapping.subscriberWidgetInput,
                        widgetInputOutputMapping.publisherWidgetOutput);
                });

                const subscriberCallbackContext = {};
                subscriberCallbackContext.widgetContext = this;
                subscriberCallbackContext.filteredWidgetInputOutputMapping = filteredWidgetInputOutputMapping;
                subscriberCallbackContext.getWidgetChannelManager = super.getWidgetChannelManager;
                super.subscribe(this.subscribeCallback, publisherId, subscriberCallbackContext);
            });
        }
    }

    subscribeCallback(receivedData) {
        const receivedKeys = new Set(Object.keys(receivedData));
        const widgetInputs = [];
        this.widgetContext.state.systemInputs.map((systemInput) => {
            widgetInputs.push(systemInput);
        });
        this.widgetContext.props.configs.pubsub.subscriberWidgetInputs.map((widgetInput) => {
                if (this.filteredWidgetInputOutputMapping.get(widgetInput)) {
                    if (receivedKeys.has(this.filteredWidgetInputOutputMapping.get(widgetInput))) {
                        this.widgetContext[widgetInput] =
                            receivedData[this.filteredWidgetInputOutputMapping.get(widgetInput)];
                        widgetInputs.push(receivedData[this.filteredWidgetInputOutputMapping.get(widgetInput)]);
                    }
                } else {
                    widgetInputs.push(this.widgetContext[widgetInput] ||
                        this.widgetContext.state.queryData.customWidgetInputs
                        .filter((customInput) => {
                            return customInput.name === widgetInput;
                        })[0].defaultValue);
                }
        });
        eval(this.widgetContext.state.queryData.queryFunction);
        this.widgetContext.state.providerConfigs.configs.config.queryData.query =
            this.getQuery.apply(this, widgetInputs);
        this.widgetContext.channelManager.unsubscribeWidget(this.widgetContext.props.id);
        this.widgetContext.channelManager.subscribeWidget(this.widgetContext.props.id,
            this.widgetContext.handleWidgetData, this.widgetContext.state.providerConfigs);
        this.widgetContext.setState({ config: this.widgetContext.state.config });
    }

    componentWillUnmount() {
        super.getWidgetChannelManager().unsubscribeWidget(this.props.id);
    }

    handleWidgetData(data) {
        if(data.data.length != 0){
            this.setState({
                metadata: data.metadata || this.state.metadata,
                data: data.data
            })
        }
    }

    render() {
        return (
            <div style={{ margin: 10, boxSizing: 'border-box' }}>
                <VizG
                    config={this.state.config}
                    metadata={this.state.metadata}
                    data={this.state.data}
                    height={this.props.glContainer.height}
                    width={this.props.glContainer.width}
                    onClick={this.state.config && this.state.config.widgetOutputConfigs ? this.publishEvents : ""}
                    theme={this.props.muiTheme.name}
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

global.dashboard.registerWidget('UniversalWidget', UniversalWidget);
