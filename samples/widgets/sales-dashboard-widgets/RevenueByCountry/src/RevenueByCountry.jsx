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

class RevenueByCountry extends Widget {
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
            selectedCountry: "All",
            selectedRev: 19596589.35
        };

        this.mapConfig = {
            x: 'Country',
            charts: [{type: 'map', y: 'Revenue', mapType: 'world', colorScale: ['#ccc', '#0082ea']}],
            width: this.state.width,
            height: this.state.height,
            style: {
                legendTitleColor: '#5d6e77',
                legendTextColor: '#5d6e77',
            },
        };

        this.metadata = {
            names: ['Country', 'Country Code', 'Region', 'Revenue', 'Orders', 'Customers'],
            types: ['ordinal', 'ordinal', 'ordinal', 'linear', 'linear', 'linear']
        };

        this.setSelectedCountry = this.setSelectedCountry.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.props.glContainer.on('resize', this.handleResize);
    }

    setSelectedCountry(selected) {
        let key = Object.keys(selected)[0];
        super.publish({"CountryCode": key, "revenue": selected[key]});
        this.setState({selectedCountry: key, selectedRev: selected[key]});
    }

    handleResize() {
        this.setState({width: this.props.glContainer.width, height: this.props.glContainer.height});
    }

    render() {
        return (
            <div className="sample-dashboard-content" style={{height: this.props.glContainer.height}}>
                <div className="sample-dashboard-content-rev-text" style={{height: '100%', color: '#5d6e77'}}  >
                    <div style={{marginTop: 5, fontSize: '1.8em'}}>Pick a Country to view stats</div>
                    <div style={{margin: 'auto', textAlign:'center', fontSize: '1.2em', overflow: 'hidden', paddingTop:15}}>
                        <div style={{width: '50%', display: 'inline-block', float: 'left'}}>
                            <strong style={{display: 'block'}}>Country</strong>
                            <span style={{display: 'block'}}>{this.state.selectedCountry}</span>
                        </div>
                        <div style={{width: '50%', display: 'inline-block'}}>
                            <strong style={{display: 'block'}}>Revenue</strong>
                            <span style={{display: 'block'}}>{`$ ${this.state.selectedRev}`}</span>
                        </div>
                    </div>
                </div>
                <div className="sample-dashboard-content-map" style={{height: '100%'}}>
                    <VizG
                        config={this.mapConfig}
                        metadata={this.metadata}
                        data={this.state.data}
                        onClick={this.setSelectedCountry}
                    />
                </div>
            </div>
        );
    }
}

global.dashboard.registerWidget("RevenueByCountry", RevenueByCountry);
