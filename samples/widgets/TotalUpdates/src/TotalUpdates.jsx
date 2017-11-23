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

import React, { Component } from 'react';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';
import Widget from '@wso2-dashboards/widget';

var data = [
    {server: 'Server 1', updates: 40},
    {server: 'Server 2', updates: 65},
    {server: 'Server 3', updates: 37}
];

class TotalUpdates extends Widget {
    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            width: props.glContainer.width,
            height: props.glContainer.height
        };
        this.handleResize = this.handleResize.bind(this);
        this.props.glContainer.on('resize', this.handleResize);
    }

    render () {
        let styles = {
            font: '11px Roboto, sans-serif',
            color: '#fff'
        };
        return (
                <section style={styles}>
                    <BarChart width={this.state.width} height={this.state.height} data={data} layout="vertical" 
                        margin={{top: 30, right: 30, left: 20, bottom: 10}}>
                        <XAxis type="number"/>
                        <YAxis type="category" dataKey="server"/>
                        <CartesianGrid strokeDasharray="10 10" horizontal={false}/>
                        <Tooltip/>
                        <Legend />
                        <Bar dataKey="updates" name="No. of Updates" fill="#20388e" />
                    </BarChart>
                </section>
        );
    }

    handleResize() {
        this.setState({width: this.props.glContainer.width, height: this.props.glContainer.height});
    }
};

global.dashboard.registerWidget("TotalUpdates", TotalUpdates);