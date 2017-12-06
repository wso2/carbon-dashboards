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

class TotalRevenueByCountry extends Widget {
    constructor(props) {
        super(props);
        this.state = {
            data: [
                ['Afghanistan', 'AFG', 'Middle East', 315036.08, 39, 22],
                ['Argentina', 'ARG', 'LATAM', 461427.43, 46, 25],
                ['Australia', 'AUS', 'ROW', 728088.56, 72, 42],
                ['Belgium', 'BEL', 'Europe', 343761.75, 36, 21],
                ['Brazil', 'BRA', 'LATAM', 254735.75, 29, 13],
                ['Canada', 'CAN', 'North America', 363571.08, 41, 25],
                ['China', 'CHN', 'Asia', 600103.12, 65, 35],
                ['Colombia', 'COL', 'LATAM', 964275, 29, 16],
                ['Czech Republic', 'CZE', 'Europe', 374559.69, 45, 23],
                ['Denmark', 'DNK', 'Europe', 677372.05, 58, 38],
                ['Finland', 'FIN', 'Europe', 526447.05, 51, 41],
                ['France', 'FRA', 'Europe', 933473.4, 83, 51],
                ['Germany', 'DEU', 'Europe', 855833.36, 64, 42],
                ['Greece', 'GRC', 'Europe', 443568.42, 42, 25],
                ['India', 'IND', 'Asia', 639140.48, 52, 32],
                ['Iran', 'IRN', 'Middle East', 527686.35, 51, 31],
                ['Italy', 'ITA', 'Europe', 770326.32, 78, 45],
                ['Japan', 'JPN', 'Asia', 930328.6, 103, 56],
                ['Korea', 'KOR', 'Asia', 453025.8, 59, 37],
                ['Mexico', 'MEX', 'North America', 1104274.36, 37, 20],
                ['Netherlands', 'NLD', 'Europe', 407367.63, 35, 20],
                ['Norway', 'NOR', 'Europe', 273676.63, 27, 9],
                ['Pakistan', 'PAK', 'Middle East', 574418.73, 52, 30],
                ['Poland', 'POL', 'Europe', 494275.75, 47, 28],
                ['Portugal', 'PRT', 'Europe', 298704.81, 26, 13],
                ['Russian Federation', 'RUS', 'Europe', 813585.28, 56, 32],
                ['South Africa', 'ZAF', 'Africa', 397275.75, 28, 16],
                ['Spain', 'ESP', 'Europe', 479287, 39, 22],
                ['Sweden', 'SWE', 'Europe', 549013.08, 45, 24],
                ['Switzerland', 'CHE', 'Europe', 615575.16, 52, 32],
                ['United Arab Emirates', 'ARE', 'Middle East', 537542.36, 62, 39],
                ['United Kingdom', 'GBR', 'Europe', 731890.48, 77, 44],
                ['United States', 'USA', 'North America', 1156942.04, 99, 58]
            ],
            selectedCountry: "All Countries"
        };
        this.setSelectedCountry = this.setSelectedCountry.bind(this);
        this.mapConfig = {
            x: 'Country',
            charts: [{type: 'map', y: 'Revenue', mapType: 'world', colorScale: ['#9E9E9E', '#000080']}],
            width: this.state.width,
            height: this.state.height
        };

        this.metadata = {
            names: ['Country', 'Country Code', 'Region', 'Revenue', 'Orders', 'Customers'],
            types: ['ordinal', 'ordinal', 'ordinal', 'linear', 'linear', 'linear']
        };

    }

    setSelectedCountry(selected) {
        super.publish({"CountryName": selected.givenName, "CountryCode": selected.x, "revenue": selected.y});
        this.setState({selectedCountry: selected.givenName});
    }

    render() {
        return (
            <section>
                <div style={{marginTop: "5px", width: "60%", float: "left"}}>
                    <VizG config={this.mapConfig} metadata={this.metadata} data={this.state.data}
                          onClick={this.setSelectedCountry}/>
                </div>
                <div style={{float: "right", color: "#EEEEEE", marginRight: "5%"}}>
                    <h1>Pick a Country to view stats</h1>
                    <div>Selected Country</div>
                    <h2>{this.state.selectedCountry}</h2>
                </div>
            </section>

        );
    }
}

global.dashboard.registerWidget("TotalRevenueByCountry", TotalRevenueByCountry);
