/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, {Component} from 'react';
import {Area, AreaChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis} from 'recharts';
import Widget from '@wso2-dashboards/widget';

let data = [];
const DATA_POINT_COUNT = 25;

class CpuUsage extends Widget {

    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            width: props.glContainer.width,
            height: props.glContainer.height,
            data: []
        };
        this.handleResize = this.handleResize.bind(this);
        this.props.glContainer.on('resize', this.handleResize);

        this.publishData = this.publishData.bind(this);
        const self = this;
        let protocol = (window.location.protocol === "https:") ? "wss" : "ws";
        let ws = new WebSocket(protocol + '://' + window.location.host + '/server-stats/cpu');
        ws.onmessage = function (event) {
            let data = JSON.parse(event.data);
            self.publishData(data.timestamp, data.process, data.system.load);
        };
    }

    static _formatDateLabel(dt) {
        let h = dt.getHours();
        let m = dt.getMinutes();
        let s = dt.getSeconds();
        return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    }

    publishData(timestamp, jvmCpuUsage, systemCpuUsage) {
        data.push({
            timestamp: CpuUsage._formatDateLabel(new Date(timestamp)),
            jvm: Math.round(jvmCpuUsage * 100),
            system: Math.round(systemCpuUsage * 100)
        });

        let arr = [];
        let count = data.length > DATA_POINT_COUNT ? data.length : DATA_POINT_COUNT;
        for (let i = 0; i < count; i++) {
            arr.push(data[i] || {timestamp: '', jvm: null, system: null});
        }

        if (arr.length > DATA_POINT_COUNT) {
            arr = arr.slice(arr.length - DATA_POINT_COUNT);
        }

        this.setState({
            data: arr
        });
    }

    render() {
        let styles = {
            font: '11px Roboto, sans-serif',
            color: '#fff'
        };
        return (
            <section style={styles}>
                <AreaChart width={this.state.width} height={this.state.height} data={this.state.data}
                           margin={{top: 30, right: 30, left: 20, bottom: 10}}>
                    <XAxis dataKey="timestamp"/>
                    <YAxis />
                    <CartesianGrid strokeDasharray="10 10" vertical={false}/>
                    <Tooltip />
                    <Legend />
                    <Area type='monotone' dataKey='system' name='System %' stroke='#FF9800' fill='#FF9800'
                          fillOpacity={0.6} isAnimationActive={false}/>
                    <Area type='monotone' dataKey='jvm' name='JVM %' stroke='#2196F3' fill='#2196F3'
                          fillOpacity={0.6} isAnimationActive={false}/>
                </AreaChart>
            </section>
        );
    }

    handleResize() {
        this.setState({width: this.props.glContainer.width, height: this.props.glContainer.height});
    }
}

global.dashboard.registerWidget("CpuUsage", CpuUsage);
