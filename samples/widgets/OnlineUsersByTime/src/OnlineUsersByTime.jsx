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
import VizG from './chart-lib/VizG';
import Widget from '@wso2-dashboards/widget';

class OnlineUsersByTime extends Widget {

    constructor(props) {
        super(props);
        this.lineConfig = {
            x: 'Time',
            charts: [
                {type: 'line', y: 'Analytics', fill: 'blue'},
                {type: 'line', y: 'APIManager', fill: 'red'},
                {type: 'line', y: 'ESB', fill: 'green'},
                {type: 'line', y: 'IdentityServer', fill: 'orange'},
                {type: 'line', y: 'IOTServer', fill: 'steelblue'}
            ],
            maxLength:10,
            width: props.glContainer.width,
            height: props.glContainer.height,
            legend: true,
            animate:true
        };

        this.metadata = {
            names: ['Time', 'Analytics', 'APIManager', 'ESB', 'IdentityServer', 'IOTServer'],
            types: ['time', 'linear', 'linear', 'linear', 'linear', 'linear']
        };

        this.data = {
            productAUsers: 458,
            productBUsers: 212,
            productCUsers: 342,
            productDUsers: 124,
            productEUsers: 56
        };

        this.state = {
            id: props.id,
            width: props.glContainer.width,
            height: props.glContainer.height,
            data: [
                [OnlineUsersByTime._formatDateLabel(new Date(Date.now()-1000)),458,212,342,124,56],
                [OnlineUsersByTime._formatDateLabel(new Date(Date.now()-2000)),408,181,302,104,76],
                [OnlineUsersByTime._formatDateLabel(new Date(Date.now()-3000)),468,222,312,104,86],
                [OnlineUsersByTime._formatDateLabel(new Date(Date.now()-4000)),508,252,352,114,96],
                [OnlineUsersByTime._formatDateLabel(new Date(Date.now()-5000)),522,225,372,120,84],
                [OnlineUsersByTime._formatDateLabel(new Date(Date.now()-6000)),482,269,392,124,88],
                [OnlineUsersByTime._formatDateLabel(new Date(Date.now()-7000)),508,292,342,134,96],
                [OnlineUsersByTime._formatDateLabel(new Date(Date.now()-8000)),558,322,352,124,86],
                [OnlineUsersByTime._formatDateLabel(new Date(Date.now()-9000)),508,282,342,117,76],
                [OnlineUsersByTime._formatDateLabel(new Date(Date.now()-10000)),465,272,342,128,80]
            ]
        };

        this.handleResize = this.handleResize.bind(this);
        this.props.glContainer.on('resize', this.handleResize);
        this.publishData = this.publishData.bind(this);
        this.generateData = this.generateData.bind(this);
        this.publishData();
    }

    static _formatDateLabel(dt) {
        let h = dt.getHours();
        let m = dt.getMinutes();
        let s = dt.getSeconds();
        return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    }

    generateData() {
        let productAUsers = this.data.productAUsers + (Math.floor(Math.random() * 50) - 25);
        let productBUsers = this.data.productBUsers + (Math.floor(Math.random() * 50) - 25);
        let productCUsers = this.data.productCUsers + (Math.floor(Math.random() * 50) - 25);
        let productDUsers = this.data.productDUsers + (Math.floor(Math.random() * 50) - 25);
        let productEUsers = this.data.productEUsers + (Math.floor(Math.random() * 50) - 25);

        return {
            productAUsers: productAUsers < 0 ? productAUsers/-1 : productAUsers,
            productBUsers: productBUsers < 0 ? productBUsers/-1 : productBUsers,
            productCUsers: productCUsers < 0 ? productCUsers/-1 : productCUsers,
            productDUsers: productDUsers < 0 ? productDUsers/-1 : productDUsers,
            productEUsers: productEUsers < 0 ? productEUsers/-1 : productEUsers
        }
    }

    publishData() {
        let generatedData = this.generateData();
        let dataArray = [];
        this.data.productAUsers = generatedData.productAUsers;
        this.data.productBUsers = generatedData.productBUsers;
        this.data.productCUsers = generatedData.productCUsers;
        this.data.productDUsers = generatedData.productDUsers;
        this.data.productEUsers = generatedData.productEUsers;

        dataArray.push([
            OnlineUsersByTime._formatDateLabel(new Date()),
            generatedData.productAUsers,
            generatedData.productBUsers,
            generatedData.productCUsers,
            generatedData.productDUsers,
            generatedData.productEUsers
        ]);
        this.setState({
            data: dataArray
        });
        setTimeout(this.publishData, 2000);
    }

    render() {
        return (
            <section>
                <div style={{margin: "5px", width: this.state.width, height: this.state.height}}>
                    <VizG config={this.lineConfig} metadata={this.metadata} data={this.state.data} />
                </div>
            </section>
        );
    }

    handleResize() {
        this.setState({width: this.props.glContainer.width, height: this.props.glContainer.height});
    }
}

global.dashboard.registerWidget("OnlineUsersByTime", OnlineUsersByTime);
