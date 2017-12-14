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
import VizG from 'react-vizgrammar';
import WidgetChannelManager from '../../../utils/dashboard-channel/WidgetChannelManager';

export default class PreviewerWidget extends React.Component {

    constructor(props) {
        super(props);
        this.channelManager = new WidgetChannelManager();
        this.state = {
            data: [],
            metadata: null,
        }
        this._handleDataReceived = this._handleDataReceived.bind(this);
    }

    componentDidMount() {
        let { config } = this.props;
        this.channelManager.subscribeWidget(config.id, this._handleDataReceived, config.configs.providerConfig);
    }

    componentWillUnmount() {
        let { config } = this.props;
        this.channelManager.unsubscribeWidget(config.id);
    }

    _handleDataReceived(data) {
        this.setState({
            metadata: data.metadata,
            data: data.data,
        });
        window.dispatchEvent(new Event('resize'));
    }

    render() {
        return (
            <VizG config={this.props.config.configs.chartConfig} metadata={this.state.metadata} data={this.state.data} />
        );
    }
}
