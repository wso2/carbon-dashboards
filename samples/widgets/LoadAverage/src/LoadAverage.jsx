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
import {CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis} from 'recharts';
import Widget from '@wso2-dashboards/widget';

var data = [];
const DATA_POINT_COUNT = 25;
const REFRESH_RATE = 1;

class LoadAverage extends Widget {

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
            self.publishData(data.timestamp, data.system.average);
        };
    }

    static _formatDateLabel(dt) {
        let h = dt.getHours();
        let m = dt.getMinutes();
        let s = dt.getSeconds();
        return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    }

    publishData(timestamp, systemLoadAvg) {
        data.push({
            timestamp: LoadAverage._formatDateLabel(new Date(timestamp)),
            la1m: systemLoadAvg
        });

        let arr = [];
        for (let i = 0; i < data.length; i++) {
            arr.push(data[i]);
        }

        if (arr.length < DATA_POINT_COUNT) {
            let idx = arr.length + 1;
            for (let i = idx; i <= DATA_POINT_COUNT; i++) {
                arr.push({timestamp: '', la1m: null});
            }
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
                <LineChart width={this.state.width} height={this.state.height} data={this.state.data}
                           margin={{top: 30, right: 30, left: 20, bottom: 10}}>
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <Legend />
                    <Line name="Load Average 1m" type='monotone' dataKey='la1m' stroke='#9C27B0' fill='#9C27B0'
                          isAnimationActive={false} dot={false}/>
                </LineChart>
            </section>
        );
    }

    handleResize() {
        this.setState({width: this.props.glContainer.width, height: this.props.glContainer.height});
    }
}

global.dashboard.registerWidget("LoadAverage", LoadAverage);
