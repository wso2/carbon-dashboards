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

class RevenueByProduct extends Widget {
    constructor(props) {
        super(props);
        this.overallProductData = [
            ['ALL', 'ALL', 'ALL', 'E', 497122.41, 60, 30],
            ['ALL', 'ALL', 'ALL', 'D', 2536874.28, 234, 136],
            ['ALL', 'ALL', 'ALL', 'C', 5914330.13, 412, 243],
            ['ALL', 'ALL', 'ALL', 'B', 5928778.57, 564, 321],
            ['ALL', 'ALL', 'ALL', 'A', 2575573.16, 254, 141]
        ];

        this.rowData = [
            ['ALL', 'ALL', 'Africa', 'A', 71425.25, 6, 3],
            ['ALL', 'ALL', 'Africa', 'B', 171425.25, 12, 7],
            ['ALL', 'ALL', 'Africa', 'C', 154425.25, 10, 6],
            ['ALL', 'ALL', 'Asia', 'A', 981334.25, 100, 54],
            ['ALL', 'ALL', 'Asia', 'B', 861334.25, 90, 57],
            ['ALL', 'ALL', 'Asia', 'C', 915334.25, 88, 51],
            ['ALL', 'ALL', 'Europe', 'A', 3267364.63, 292, 181],
            ['ALL', 'ALL', 'Europe', 'B', 3249096.11, 310, 172],
            ['ALL', 'ALL', 'Europe', 'C', 2078261.1, 175, 114],
            ['ALL', 'ALL', 'Europe', 'D', 993996.02, 84, 43],
            ['ALL', 'ALL', 'LATAM', 'A', 370146.06, 39, 23],
            ['ALL', 'ALL', 'LATAM', 'B', 290146.06, 32, 16],
            ['ALL', 'ALL', 'LATAM', 'C', 1020146.06, 33, 15],
            ['ALL', 'ALL', 'Middle East', 'A', 130859.48, 13, 9],
            ['ALL', 'ALL', 'Middle East', 'B', 367368.36, 31, 15],
            ['ALL', 'ALL', 'Middle East', 'C', 436754.93, 51, 26],
            ['ALL', 'ALL', 'Middle East', 'D', 928227.84, 95, 64],
            ['ALL', 'ALL', 'Middle East', 'E', 91472.91, 14, 8],
            ['ALL', 'ALL', 'North America', 'A', 324886.4, 37, 23],
            ['ALL', 'ALL', 'North America', 'B', 774886.4, 70, 44],
            ['ALL', 'ALL', 'North America', 'C', 1134886.4, 40, 24],
            ['ALL', 'ALL', 'North America', 'D', 390128.28, 30, 12],
            ['ALL', 'ALL', 'ROW', 'A', 114522.14, 13, 8],
            ['ALL', 'ALL', 'ROW', 'B', 214522.14, 19, 10],
            ['ALL', 'ALL', 'ROW', 'C', 174522.14, 15, 7],
            ['ALL', 'ALL', 'ROW', 'D', 224522.14, 25, 17]
        ];

        this.state = {data: this.overallProductData};

        this.metadata = {
            names: ['Country', 'Country Code', 'Region', 'Product', 'Revenue', 'Orders', 'Customers'],
            types: ['ordinal', 'ordinal', 'ordinal', 'ordinal', 'linear', 'linear', 'linear']
        };
        this.setReceivedMsg = this.setReceivedMsg.bind(this);

        this.barChartConfig = {
            x: 'Product',
            charts: [{type: 'bar', y: 'Revenue'}],
            maxLength: 5,
            width: props.glContainer.width,
            height: props.glContainer.height,

        };
    }

    componentWillMount() {
        super.subscribe(this.setReceivedMsg);
    }

    setReceivedMsg(receivedMsg) {
        let array = [];
        this.rowData.map(dataElement => {
            if (dataElement[2] === receivedMsg.selectedRegion) {
                array.push(dataElement);
            }
        });
        this.setState({data: array});
    }

    render() {
        return (
            <div
                style={{marginTop: "25px", width: this.props.glContainer.width, height: this.props.glContainer.height}}>
                <VizG config={this.barChartConfig} metadata={this.metadata} data={this.state.data}/>
            </div>
        );
    }
}

global.dashboard.registerWidget("RevenueByProduct", RevenueByProduct);
