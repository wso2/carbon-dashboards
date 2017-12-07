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

class CustomersPerYear extends Widget {
    constructor(props) {
        super(props);
        this.totalCustomerData = [
            ['2013', 'ALL', 'ALL', 182, 106],
            ['2014', 'ALL', 'ALL', 578, 354],
            ['2015', 'ALL', 'ALL', 334, 211],
            ['2016', 'ALL', 'ALL', 341, 226],
            ['2017', 'ALL', 'ALL', 388, 173]
        ];

        this.lineConfig = {
            x: 'Year',
            charts: [{type: 'line', y: 'Orders', fill: 'blue'}, {type: 'line', y: 'Customers', fill: 'red'}],
            width: this.state.width,
            height: this.state.height,
            legend: true,
            animate: true,
        };

        this.rowData = [
            ['2013', 'Africa', 45235, 9, 5],
            ['2014', 'Africa', 85689, 12, 8],
            ['2015', 'Africa', 125483, 25, 18],
            ['2016', 'Africa', 67485, 11, 11],
            ['2017', 'Africa', 73383.75, 28, 16],
            ['2013', 'Asia', 245896, 25, 15],
            ['2014', 'Asia', 1025489, 115, 69],
            ['2015', 'Asia', 458789, 51, 32],
            ['2016', 'Asia', 515892, 53, 35],
            ['2017', 'Asia', 917586.25, 80, 30],
            ['2013', 'Europe', 737688, 75, 45],
            ['2014', 'Europe', 3076467, 345, 207],
            ['2015', 'Europe', 1376367, 153, 96],
            ['2016', 'Europe', 1547676, 159, 105],
            ['2017', 'Europe', 2850519.86, 129, 57],
            ['2013', 'LATAM', 122948, 13, 6],
            ['2014', 'LATAM', 512744.5, 35, 15],
            ['2015', 'LATAM', 229394.5, 22, 13],
            ['2016', 'LATAM', 257945, 19, 11],
            ['2017', 'LATAM', 557406.18, 11, 9],
            ['2013', 'Middle East', 245896, 25, 14],
            ['2014', 'Middle East', 845789, 60, 48],
            ['2015', 'Middle East', 125489, 13, 12],
            ['2016', 'Middle East', 154893, 18, 15],
            ['2017', 'Middle East', 582616.52, 88, 33],
            ['2013', 'North America', 458789, 30, 18],
            ['2014', 'North America', 125486, 9, 6],
            ['2015', 'North America', 845963, 60, 35],
            ['2016', 'North America', 458952, 31, 19],
            ['2017', 'North America', 735597.48, 47, 25],
            ['2013', 'ROW', 45896, 5, 3],
            ['2014', 'ROW', 21458, 2, 1],
            ['2015', 'ROW', 159872, 10, 5],
            ['2016', 'ROW', 458963, 50, 30],
            ['2017', 'ROW', 41899.56, 5, 3]
        ];

        this.metadata = {
            names: ['Year', 'Region', 'Revenue', 'Orders', 'Customers'],
            types: ['ordinal', 'ordinal', 'linear', 'linear', 'linear']
        };

        this.state = {
            data: this.totalCustomerData,
            width: this.props.glContainer.width,
            height: this.props.glContainer.height
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
        if (receivedMsg.selectedRegion === "ALL") {
            this.setState({data: this.totalCustomerData});
        } else {

            let array = [];
            this.rowData.map(dataElement => {
                if (dataElement[1] === receivedMsg.selectedRegion) {
                    array.push(dataElement);
                }
            });
            this.setState({data: array});
        }
    }

    render() {
        return (
            <section>
                <div style={{margin: "5px", width: this.state.width, height: this.state.height}}>
                    <VizG config={this.lineConfig} metadata={this.metadata} data={this.state.data} append={false}/>
                </div>
            </section>

        );
    }
}

global.dashboard.registerWidget("CustomersPerYear", CustomersPerYear);