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
import VizG from 'react-vizgrammar';
import Widget from '@wso2-dashboards/widget';

class CustomersByProduct extends Widget {
    constructor(props) {
        super(props);
        this.totalPerProduct = [
            ['Analytics', 500, 301],
            ['APIManager', 564, 321],
            ['ESB', 412, 243],
            ['IdentityServer', 234, 136],
            ['IOTServer', 14, 8]
        ];

        this.stackedBarChartConfig = {
            x: 'Product',
            charts: [{type: 'bar', y: 'Downloads', fill: '#4659f9'},
                {type: 'bar', y: 'Customers', fill: '#00b7ee'}],
            maxLength: 6,
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,
            animate: true,
            legend: true,
            style: {
                legendTitleColor: "#5d6e77",
                legendTextColor: "#5d6e77",
                tickLabelColor: "#5d6e77",
                axisLabelColor: "#5d6e77",
                legendTextSize: 14,
            },
            gridColor: "#5d6e77"
        };

        this.metadata = {
            names: ['Product', 'Downloads', 'Customers'],
            types: ['ordinal', 'linear', 'linear']
        };

        this.africaData = [
            ["Analytics", 6, 3],
            ["APIManager", 12, 7],
            ["ESB", 10, 6],
            ['IdentityServer', 0, 0],
            ['IOTServer', 0, 0]
        ];

        this.asiaData = [
            ['Analytics', 100, 54],
            ['APIManager', 90, 57],
            ['ESB', 88, 51],
            ['IdentityServer', 0, 0],
            ['IOTServer', 0, 0]
        ];

        this.europeData = [
            ['Analytics', 292, 181],
            ['APIManager', 310, 172],
            ['ESB', 175, 114],
            ['IdentityServer', 84, 43],
            ['IOTServer', 0, 0]
        ];

        this.latAmData = [
            ['Analytics', 39, 23],
            ['APIManager', 32, 16],
            ['ESB', 33, 15],
            ['IdentityServer', 0, 0],
            ['IOTServer', 0, 0]
        ];

        this.midEastData = [
            ['Analytics', 13, 9],
            ['APIManager', 31, 15],
            ['ESB', 51, 26],
            ['IdentityServer', 95, 64],
            ['IOTServer', 14, 8],
        ];

        this.northAmData = [
            ['Analytics', 37, 23],
            ['APIManager', 70, 44],
            ['ESB', 40, 24],
            ['IdentityServer', 30, 12],
            ['IOTServer', 0, 0]
        ];

        this.rowData = [
            ["Analytics", 13, 8],
            ["APIManager", 19, 10],
            ["ESB", 15, 7],
            ["IdentityServer", 25, 17],
            ['IOTServer', 0, 0]

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
            <div
                style={{
                    marginTop: "5px",
                    width: this.props.glContainer.width,
                    height: this.props.glContainer.height,
                }}
            >
                <VizG
                    config={this.stackedBarChartConfig}
                    metadata={this.metadata}
                    data={this.state.data}
                    append={false}
                    height={this.props.glContainer.height}
                    width={this.props.glContainer.width}
                />
            </div>
        );
    }
}

global.dashboard.registerWidget("CustomersByProduct", CustomersByProduct);