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
import VizG from './chart-lib/VizG';

class CustomersByProduct extends React.Component {
    constructor(props) {
        super(props);
        this.totalPerProduct = [
            ['A', 481, 290],
            ["A'", 19, 11],
            ['B', 533, 304],
            ["B'", 31, 17],
            ['C', 387, 230],
            ["C'", 25, 13],
            ['D', 209, 119],
            ["D'", 25, 17],
            ['E', 14, 8]
        ];
        this.state = {
            data: this.totalPerProduct,
            width: props.glContainer.width,
            height: props.glContainer.height,
            selectedCountry: "All Countries"
        };
        this.handleResize = this.handleResize.bind(this);
        this.setSelectedCountry = this.setSelectedCountry.bind(this);
        this.props.glContainer.on('resize', this.handleResize);
        this.lineConfig = {
            x: 'Product',
            charts: [{ type: 'line', y: 'Orders', fill: 'blue' }, { type: 'line', y: 'Customers', fill: 'red' }],
            width: this.state.width,
            height: this.state.height,
            animate: true,
        };

        this.metadata = {
            names: ['Product', 'Orders', 'Customers'],
            types: ['ordinal',  'linear', 'linear']
        };

        this.africaData = [
            ["A'", 6, 3],
            ["B'", 12, 7],
            ["C'", 10, 6],
        ];
        this.asiaData = [
            ['A', 100, 54],
            ['B', 90, 57],
            ['C', 88, 51],
        ];
        this.europeData = [
            ['A', 292, 181],
            ['B', 310, 172],
            ['C', 175, 114],
            ['D', 84, 43],
        ];
        this.latAmData = [
            ['A', 39, 23],
            ['B', 32, 16],
            ['C', 33, 15],
        ];
        this.midEastData = [
            ['A', 13, 9],
            ['B', 31, 15],
            ['C', 51, 26],
            ['D', 95, 64],
            ['E', 14, 8],
        ]
        this.northAmData = [
            ['A', 37, 23],
            ['B', 70, 44],
            ['C', 40, 24],
            ['D', 30, 12],
        ]
        this.rowData = [
            ["A'", 13, 8],
            ["B'", 19, 10],
            ["C'", 15, 7],
            ["D'", 25, 17],

        ]
    }

    handleResize() {
        this.setState({ width: this.props.glContainer.width, height: this.props.glContainer.height });
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
            <section>
                <div style={{ marginTop: "5px", width: this.props.glContainer.width, height: this.props.glContainer.height }}>
                    <VizG config={this.lineConfig} metadata={this.metadata} data={this.state.data} append={false} />
                </div>
            </section>

        );
    }
}

global.dashboard.registerWidget("CustomersByProduct", CustomersByProduct);