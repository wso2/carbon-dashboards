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
import VizG from './chart-lib/VizG';
import Widget from '@wso2-dashboards/widget';

class CustomersByProduct extends Widget {
    constructor(props) {
        super(props);
        this.totalPerProduct = [
            ['A', 500, 301],
            ['B', 564, 321],
            ['C', 412, 243],
            ['D', 234, 136],
            ['E', 14, 8]
        ];

        this.stackedBarChartConfig = {
            x: 'Product',
            charts: [{type: 'bar', y: 'Orders', fill: 'steelblue'},
                {type: 'bar', y: 'Customers', fill: '#80ccff'}],
            maxLength: 6,
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,
            animate: true,
            legend: true,
            style: {legendTitleColor: "", legendTextColor: "",}
        };

        this.metadata = {
            names: ['Product', 'Orders', 'Customers'],
            types: ['ordinal', 'linear', 'linear']
        };

        this.africaData = [
            ["A", 6, 3],
            ["B", 12, 7],
            ["C", 10, 6],
            ['D', 0, 0],
            ['E', 0, 0]
        ];

        this.asiaData = [
            ['A', 100, 54],
            ['B', 90, 57],
            ['C', 88, 51],
            ['D', 0, 0],
            ['E', 0, 0]
        ];

        this.europeData = [
            ['A', 292, 181],
            ['B', 310, 172],
            ['C', 175, 114],
            ['D', 84, 43],
            ['E', 0, 0]
        ];

        this.latAmData = [
            ['A', 39, 23],
            ['B', 32, 16],
            ['C', 33, 15],
            ['D', 0, 0],
            ['E', 0, 0]
        ];

        this.midEastData = [
            ['A', 13, 9],
            ['B', 31, 15],
            ['C', 51, 26],
            ['D', 95, 64],
            ['E', 14, 8],
        ];

        this.northAmData = [
            ['A', 37, 23],
            ['B', 70, 44],
            ['C', 40, 24],
            ['D', 30, 12],
            ['E', 0, 0]
        ];

        this.rowData = [
            ["A", 13, 8],
            ["B", 19, 10],
            ["C", 15, 7],
            ["D", 25, 17],
            ['E', 0, 0]

        ];

        this.state = {
            data: this.totalPerProduct,
            width: props.glContainer.width,
            height: props.glContainer.height
        };

        this.handleResize = this.handleResize.bind(this);
        this.props.glContainer.on('resize', this.handleResize);
        this.setReceivedMsg = this.setReceivedMsg.bind(this);
    }

    handleResize() {
        this.setState({width: this.props.glContainer.width, height: this.props.glContainer.height});
    }

    componentWillMount() {
        super.subscribe(this.setReceivedMsg);
    }

    setReceivedMsg(receivedMsg) {
        switch (receivedMsg.selectedRegion) {
            case "Africa":
                this.setState({data: this.africaData});
                break;
            case "Asia":
                this.setState({data: this.asiaData});
                break;
            case "Europe":
                this.setState({data: this.europeData});
                break;
            case "LATAM":
                this.setState({data: this.latAmData});
                break;
            case "Middle East":
                this.setState({data: this.midEastData});
                break;
            case "North America":
                this.setState({data: this.northAmData});
                break;
            case "ROW":
                this.setState({data: this.rowData});
                break;
            default:
                this.setState({data: this.totalPerProduct});
        }
    }

    render() {
        return (
            <section>
                <div style={{marginTop: "5px", width: this.state.width, height: this.state.height}}>
                    <VizG config={this.stackedBarChartConfig} metadata={this.metadata} data={this.state.data}
                          append={false}/>
                </div>
            </section>
        );
    }
}

global.dashboard.registerWidget("CustomersByProduct", CustomersByProduct);