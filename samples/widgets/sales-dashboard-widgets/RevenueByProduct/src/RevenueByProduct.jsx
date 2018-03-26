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

class RevenueByProduct extends Widget {
    constructor(props) {
        super(props);
        this.overallProductData = [
            ['ALL', 'ALL', 'ALL', 'Analytics', 2575573.16, 254, 141],
            ['ALL', 'ALL', 'ALL', 'APIManager', 5928778.57, 564, 321],
            ['ALL', 'ALL', 'ALL', 'ESB', 5914330.13, 412, 243],
            ['ALL', 'ALL', 'ALL', 'IdentityServer', 2536874.28, 234, 136],
            ['ALL', 'ALL', 'ALL', 'IOTServer', 497122.41, 60, 30]
        ];

        this.rowData = [
            ['ALL', 'ALL', 'Africa', 'Analytics', 71425.25, 6, 3],
            ['ALL', 'ALL', 'Africa', 'APIManager', 171425.25, 12, 7],
            ['ALL', 'ALL', 'Africa', 'ESB', 154425.25, 10, 6],
            ['ALL', 'ALL', 'Africa', 'IdentityServer', 0, 0, 0],
            ['ALL', 'ALL', 'Africa', 'IOTServer', 0, 0, 0],
            ['ALL', 'ALL', 'Asia', 'Analytics', 981334.25, 100, 54],
            ['ALL', 'ALL', 'Asia', 'APIManager', 861334.25, 90, 57],
            ['ALL', 'ALL', 'Asia', 'ESB', 915334.25, 88, 51],
            ['ALL', 'ALL', 'Asia', 'IdentityServer', 0, 0, 0],
            ['ALL', 'ALL', 'Asia', 'IOTServer', 0, 0, 0],
            ['ALL', 'ALL', 'Europe', 'Analytics', 3267364.63, 292, 181],
            ['ALL', 'ALL', 'Europe', 'APIManager', 3249096.11, 310, 172],
            ['ALL', 'ALL', 'Europe', 'ESB', 2078261.1, 175, 114],
            ['ALL', 'ALL', 'Europe', 'IdentityServer', 993996.02, 84, 43],
            ['ALL', 'ALL', 'Europe', 'IOTServer', 0, 0, 0],
            ['ALL', 'ALL', 'LATAM', 'Analytics', 370146.06, 39, 23],
            ['ALL', 'ALL', 'LATAM', 'APIManager', 290146.06, 32, 16],
            ['ALL', 'ALL', 'LATAM', 'ESB', 1020146.06, 33, 15],
            ['ALL', 'ALL', 'LATAM', 'IdentityServer', 0, 0, 0],
            ['ALL', 'ALL', 'LATAM', 'IOTServer', 0, 0, 0],
            ['ALL', 'ALL', 'Middle East', 'Analytics', 130859.48, 13, 9],
            ['ALL', 'ALL', 'Middle East', 'APIManager', 367368.36, 31, 15],
            ['ALL', 'ALL', 'Middle East', 'ESB', 436754.93, 51, 26],
            ['ALL', 'ALL', 'Middle East', 'IdentityServer', 928227.84, 95, 64],
            ['ALL', 'ALL', 'Middle East', 'IOTServer', 91472.91, 14, 8],
            ['ALL', 'ALL', 'North America', 'Analytics', 324886.4, 37, 23],
            ['ALL', 'ALL', 'North America', 'APIManager', 774886.4, 70, 44],
            ['ALL', 'ALL', 'North America', 'ESB', 1134886.4, 40, 24],
            ['ALL', 'ALL', 'North America', 'IdentityServer', 390128.28, 30, 12],
            ['ALL', 'ALL', 'North America', 'IOTServer', 0, 0, 0],
            ['ALL', 'ALL', 'ROW', 'Analytics', 114522.14, 13, 8],
            ['ALL', 'ALL', 'ROW', 'APIManager', 214522.14, 19, 10],
            ['ALL', 'ALL', 'ROW', 'ESB', 174522.14, 15, 7],
            ['ALL', 'ALL', 'ROW', 'IdentityServer', 224522.14, 25, 17],
            ['ALL', 'ALL', 'ROW', 'IOTServer', 0, 0, 0]
        ];

        this.state = {
            data: this.overallProductData,
            width: props.glContainer.width,
            height: props.glContainer.height

        };

        this.metadata = {
            names: ['Country', 'Country Code', 'Region', 'Product', 'Revenue', 'Downloads', 'Customers'],
            types: ['ordinal', 'ordinal', 'ordinal', 'ordinal', 'linear', 'linear', 'linear']
        };

        this.barChartConfig = {
            x: 'Product',
            charts: [{type: 'bar', y: 'Revenue', fill: '#10c469'}],
            maxLength: 5,
            width: props.glContainer.width,
            height: props.glContainer.height,
            animate: true
        };

        this.setReceivedMsg = this.setReceivedMsg.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.props.glContainer.on('resize', this.handleResize);
    }

    handleResize() {
        this.setState({width: this.props.glContainer.width, height: this.props.glContainer.height});
    }

    componentWillMount() {
        super.subscribe(this.setReceivedMsg);
    }

    setReceivedMsg(receivedMsg) {
        if (receivedMsg.selectedRegion === 'ALL') {
            this.setState({data: this.overallProductData})
        } else {
            let array = [];
            this.rowData.map(dataElement => {
                if (dataElement[2] === receivedMsg.selectedRegion) {
                    array.push(dataElement);
                }
            });
            this.setState({data: array});
        }
    }

    render() {
        return (
            <div
                style={{ height: this.props.glContainer.height, width: this.props.glContainer.width, paddingBottom: 10 }}
            >
                <VizG
                    config={this.barChartConfig}
                    metadata={this.metadata}
                    data={this.state.data}
                    width={this.props.glContainer.width}
                    height={this.props.glContainer.height}
                />
            </div>
        );
    }
}

global.dashboard.registerWidget("RevenueByProduct", RevenueByProduct);
