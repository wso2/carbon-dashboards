/*
 *  Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */

import React, {Component} from 'react';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';

var data = [];
const DATA_POINT_COUNT = 25;
const REFRESH_RATE = 1;

class LoadAverage extends Component {
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
        this.publishData();
    }

    formatDateLabel(h, m, s) {
        return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    }

    publishData() {
        let dt = new Date();
        let randomVal = Math.random();
        let dataArray = [4, 3.5, 3];

        data.push({
            timestamp: this.formatDateLabel(dt.getHours(), dt.getMinutes(), dt.getSeconds()),
            la1m: Math.round((randomVal * dataArray[Math.floor((Math.random() * 100) % 3)])*100)/100,
            la5m:  Math.round((randomVal * dataArray[(Math.floor((Math.random() * 100) % 3))])*100)/100,
            la15m: Math.round((randomVal * dataArray[Math.floor((Math.random() * 100) % 3)])*100)/100
        });

        let arr = [];
        for (let i = 0; i < data.length; i++) {
            arr.push(data[i]);
        }

        if (arr.length < DATA_POINT_COUNT) {
            let idx = arr.length + 1;
            for (let i = idx; i <= DATA_POINT_COUNT; i++) {
                arr.push({timestamp: '', cpu1: null, cpu2: null});
            }
        }

        if (arr.length > DATA_POINT_COUNT) {
            arr = arr.slice(arr.length - DATA_POINT_COUNT);
        }

        this.setState({
            data: arr
        });
        setTimeout(this.publishData, Math.round(1000 / REFRESH_RATE));
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
                    <XAxis dataKey="timestamp"/>
                    <YAxis />
                    <Tooltip/>
                    <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                    <Legend />
                    <Line name="Load Average 1m" type='monotone' dataKey='la1m' stroke='#9C27B0' fill='#9C27B0'
                          isAnimationActive={false} dot={false}/>
                    <Line name="Load Average 5m" type='monotone' dataKey='la5m' stroke='#2196F3' fill='#2196F3'
                          isAnimationActive={false} dot={false}/>
                    <Line name="Load Average 15m" type='monotone' dataKey='la15m' stroke='#FF9800' fill='#FF9800'
                          isAnimationActive={false} dot={false}/>
                </LineChart>
            </section>
        );
    }

    handleResize() {
        this.setState({width: this.props.glContainer.width, height: this.props.glContainer.height});
    }
}
;

global.dashboard.registerWidget("LoadAverage", LoadAverage);