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

class RevenueByRegion extends Widget {
    constructor(props) {
        super(props);

        this.rowdata = [
            ['Singapore', 'SGP', 'Asia', 'A', 195684.75, 20, 10],
            ['Japan', 'JPN', 'Asia', 'B', 142582.15, 18, 8],
            ['China', 'CHN', 'Asia', 'B', 110025.78, 15, 9],
            ['Korea', 'KOR', 'Asia', 'C', 98256.45, 14, 11],
            ['India', 'IND', 'Asia', 'C', 114785.12, 13, 7],
            ['Iran', 'IRN', 'Middle East', 'D', 275895.45, 27, 20],
            ['United Arab Emirates', 'ARE', 'Middle East', 'D', 312514.12, 35, 24],
            ['Afghanistan', 'AFG', 'Middle East', 'D', 148345.36, 19, 12],
            ['Pakistan', 'PAK', 'Middle East', 'E', 91472.91, 14, 8],
            ['Belgium', 'BEL', 'Europe', 'A', 114587.25, 12, 8],
            ['Czech Republic', 'CZE', 'Europe', 'A', 124853.23, 15, 11],
            ['Denmark', 'DNK', 'Europe', 'B', 132457.35, 16, 12],
            ['Finland', 'FIN', 'Europe', 'C', 175482.35, 17, 18],
            ['France', 'FRA', 'Europe', 'A', 458368.35, 37, 31],
            ['Germany', 'DEU', 'Europe', 'B', 378958.34, 27, 20],
            ['Greece', 'GRC', 'Europe', 'A', 247856.14, 24, 17],
            ['Italy', 'ITA', 'Europe', 'C', 417581.58, 27, 20],
            ['Netherlands', 'NLD', 'Europe', 'C', 215789.21, 20, 14],
            ['Norway', 'NOR', 'Europe', 'A', 147892.21, 11, 4],
            ['Poland', 'POL', 'Europe', 'B', 91425.25, 8, 2],
            ['Portugal', 'PRT', 'Europe', 'C', 99568.27, 8, 3],
            ['Russian Federation', 'RUS', 'Europe', 'C', 345896.32, 20, 15],
            ['Spain', 'ESP', 'Europe', 'B', 214571.75, 15, 9],
            ['Sweden', 'SWE', 'Europe', 'B', 199253.27, 14, 8],
            ['Switzerland', 'CHE', 'Europe', 'A', 253893.79, 20, 14],
            ['United Kingdom', 'GBR', 'Europe', 'A', 215472.62, 19, 11],
            ['Canada', 'CAN', 'North America', 'C', 145892.77, 14, 8],
            ['Mexico', 'MEX', 'North America', 'A', 114758.12, 11, 6],
            ['United States', 'USA', 'North America', 'B', 514235.51, 45, 30],
            ['Argentina', 'ARG', 'LATAM', 'C', 210475.81, 20, 10],
            ['Brazil', 'BRA', 'LATAM', 'B', 98245.25, 11, 5],
            ['Colombia', 'COL', 'LATAM', 'B', 81425, 9, 4],
            ['South Africa', 'ZAF', 'Africa', 'A', 71425.25, 6, 3],
            ['Australia', 'AUS', 'ROW', 'A', 114522.14, 13, 8],
            ['Singapore', 'SGP', 'Asia', 'B', 95684.75, 10, 6],
            ['Japan', 'JPN', 'Asia', 'C', 242582.15, 25, 14],
            ['China', 'CHN', 'Asia', 'C', 210025.78, 21, 11],
            ['Korea', 'KOR', 'Asia', 'B', 198256.45, 24, 17],
            ['India', 'IND', 'Asia', 'B', 314785.12, 23, 17],
            ['Iran', 'IRN', 'Middle East', 'C', 175895.45, 17, 10],
            ['United Arab Emirates', 'ARE', 'Middle East', 'C', 212514.12, 25, 14],
            ['Afghanistan', 'AFG', 'Middle East', 'C', 48345.36, 9, 2],
            ['Pakistan', 'PAK', 'Middle East', 'D', 191472.91, 14, 8],
            ['Belgium', 'BEL', 'Europe', 'B', 214587.25, 22, 12],
            ['Czech Republic', 'CZE', 'Europe', 'B', 24853.23, 5, 1],
            ['Denmark', 'DNK', 'Europe', 'A', 332457.35, 26, 18],
            ['Finland', 'FIN', 'Europe', 'B', 275482.35, 27, 21],
            ['France', 'FRA', 'Europe', 'B', 258368.35, 27, 11],
            ['Germany', 'DEU', 'Europe', 'A', 178958.34, 17, 10],
            ['Greece', 'GRC', 'Europe', 'B', 147856.14, 14, 7],
            ['Italy', 'ITA', 'Europe', 'B', 117581.58, 17, 10],
            ['Netherlands', 'NLD', 'Europe', 'B', 115789.21, 10, 4],
            ['Norway', 'NOR', 'Europe', 'B', 47892.21, 7, 2],
            ['Poland', 'POL', 'Europe', 'C', 191425.25, 18, 12],
            ['Portugal', 'PRT', 'Europe', 'B', 149568.27, 14, 9],
            ['Russian Federation', 'RUS', 'Europe', 'D', 145896.32, 10, 5],
            ['Spain', 'ESP', 'Europe', 'D', 114571.75, 10, 6],
            ['Sweden', 'SWE', 'Europe', 'D', 99253.27, 10, 5],
            ['Switzerland', 'CHE', 'Europe', 'B', 153893.79, 10, 7],
            ['United Kingdom', 'GBR', 'Europe', 'B', 115472.62, 22, 14],
            ['Canada', 'CAN', 'North America', 'B', 45892.77, 7, 5],
            ['Mexico', 'MEX', 'North America', 'B', 214758.12, 18, 9],
            ['United States', 'USA', 'North America', 'A', 114235.51, 15, 9],
            ['Argentina', 'ARG', 'LATAM', 'B', 110475.81, 12, 7],
            ['Brazil', 'BRA', 'LATAM', 'A', 118245.25, 14, 7],
            ['Colombia', 'COL', 'LATAM', 'A', 111425, 11, 8],
            ['South Africa', 'ZAF', 'Africa', 'B', 171425.25, 12, 7],
            ['Australia', 'AUS', 'ROW', 'B', 214522.14, 19, 10],
            ['Singapore', 'SGP', 'Asia', 'C', 249684.75, 15, 8],
            ['Japan', 'JPN', 'Asia', 'A', 322582.15, 35, 20],
            ['China', 'CHN', 'Asia', 'A', 190025.78, 18, 10],
            ['Korea', 'KOR', 'Asia', 'A', 118256.45, 14, 7],
            ['India', 'IND', 'Asia', 'A', 154785.12, 13, 7],
            ['Iran', 'IRN', 'Middle East', 'B', 75895.45, 7, 1],
            ['United Arab Emirates', 'ARE', 'Middle East', 'A', 12514.12, 2, 1],
            ['Afghanistan', 'AFG', 'Middle East', 'A', 118345.36, 11, 8],
            ['Pakistan', 'PAK', 'Middle East', 'B', 291472.91, 24, 14],
            ['Belgium', 'BEL', 'Europe', 'B', 14587.25, 2, 1],
            ['Czech Republic', 'CZE', 'Europe', 'B', 224853.23, 25, 11],
            ['Denmark', 'DNK', 'Europe', 'A', 212457.35, 16, 8],
            ['Finland', 'FIN', 'Europe', 'A', 75482.35, 7, 2],
            ['France', 'FRA', 'Europe', 'C', 58368.35, 7, 2],
            ['Germany', 'DEU', 'Europe', 'C', 78958.34, 7, 4],
            ['Greece', 'GRC', 'Europe', 'B', 47856.14, 4, 1],
            ['Italy', 'ITA', 'Europe', 'A', 217581.58, 27, 14],
            ['Netherlands', 'NLD', 'Europe', 'A', 75789.21, 5, 2],
            ['Norway', 'NOR', 'Europe', 'B', 77892.21, 9, 3],
            ['Poland', 'POL', 'Europe', 'A', 211425.25, 21, 14],
            ['Portugal', 'PRT', 'Europe', 'A', 49568.27, 4, 1],
            ['Russian Federation', 'RUS', 'Europe', 'B', 245896.32, 15, 7],
            ['Spain', 'ESP', 'Europe', 'A', 99571.75, 8, 4],
            ['Sweden', 'SWE', 'Europe', 'A', 175253.27, 12, 7],
            ['Switzerland', 'CHE', 'Europe', 'C', 53893.79, 8, 3],
            ['United Kingdom', 'GBR', 'Europe', 'C', 315472.62, 28, 16],
            ['Canada', 'CAN', 'North America', 'A', 95892.77, 11, 8],
            ['Mexico', 'MEX', 'North America', 'C', 774758.12, 8, 5],
            ['United States', 'USA', 'North America', 'C', 214235.51, 18, 11],
            ['Argentina', 'ARG', 'LATAM', 'A', 140475.81, 14, 8],
            ['Brazil', 'BRA', 'LATAM', 'C', 38245.25, 4, 1],
            ['Colombia', 'COL', 'LATAM', 'C', 771425, 9, 4],
            ['South Africa', 'ZAF', 'Africa', 'C', 154425.25, 10, 6],
            ['Australia', 'AUS', 'ROW', 'C', 174522.14, 15, 7],
            ['Japan', 'JPN', 'Asia', 'E', 222582.15, 25, 14],
            ['China', 'CHN', 'Asia', 'E', 90025.78, 11, 5],
            ['Korea', 'KOR', 'Asia', 'E', 38256.45, 7, 2],
            ['India', 'IND', 'Asia', 'E', 54785.12, 3, 1],
            ['France', 'FRA', 'Europe', 'D', 158368.35, 12, 7],
            ['Germany', 'DEU', 'Europe', 'D', 218958.34, 13, 8],
            ['Italy', 'ITA', 'Europe', 'D', 17581.58, 7, 1],
            ['Russian Federation', 'RUS', 'Europe', 'A', 75896.32, 11, 5],
            ['Spain', 'ESP', 'Europe', 'C', 50571.75, 6, 3],
            ['Sweden', 'SWE', 'Europe', 'C', 75253.27, 9, 4],
            ['Switzerland', 'CHE', 'Europe', 'D', 153893.79, 14, 8],
            ['United Kingdom', 'GBR', 'Europe', 'D', 85472.62, 8, 3],
            ['Canada', 'CAN', 'North America', 'D', 75892.77, 9, 4],
            ['United States', 'USA', 'North America', 'D', 314235.51, 21, 8],
            ['Australia', 'AUS', 'ROW', 'D', 224522.14, 25, 17]
        ];

        this.configPie = {
            charts: [{type: 'arc', x: 'Revenue', color: 'Region', mode: 'pie'}],
            width: props.glContainer.width,
            height: props.glContainer.height,
            animate:true
        };

        this.configPie2 = {
            charts: [{type: 'arc', x: 'Revenue', color: 'Product', mode: 'pie'}],
            width: props.glContainer.width,
            height: props.glContainer.height,
            animate:true
        };

        this.state = {
            data: [
                ['ALL', 'ALL', 'Africa', 'ALL', 397275.75, 28, 16],
                ['ALL', 'ALL', 'Asia', 'ALL', 3163652.25, 324, 184],
                ['ALL', 'ALL', 'Europe', 'ALL', 9588717.86, 861, 510],
                ['ALL', 'ALL', 'LATAM', 'ALL', 1680438.18, 104, 54],
                ['ALL', 'ALL', 'Middle East', 'ALL', 1954683.52, 204, 122],
                ['ALL', 'ALL', 'North America', 'ALL', 2624787.48, 177, 103],
                ['ALL', 'ALL', 'ROW', 'ALL', 728088.56, 72, 42]
            ],
            config:this.configPie
        };

        this.metadata = {
            names: ['Country', 'Country Code', 'Region', 'Product', 'Revenue', 'Orders', 'Customers'],
            types: ['ordinal', 'ordinal', 'ordinal', 'ordinal', 'linear', 'linear', 'linear']
        };
        this.isDrillDowned = false;
        this.handleClickEvent = this.handleClickEvent.bind(this);
    }

    handleClickEvent(event){
        if(!this.isDrillDowned) {
            let array = [];
            this.rowdata.map(data => {
                if (data[2] === event.datum.x) {
                    array.push(data)
                }
            });
            this.isDrillDowned = true;
            super.publish({selectedRegion:event.datum.x});
            this.setState({config: this.configPie2, data: array});
        }
    }

    render() {
        console.log(this)
        return (
            <section>
                <div style={{marginTop: "5px", width: this.props.glContainer.width, height: this.props.glContainer.height}}>
                    <VizG config={this.state.config} metadata={this.metadata} data={this.state.data} append={false} onClick={this.handleClickEvent}/>
                </div>
            </section>
        );
    }
}

global.dashboard.registerWidget("RevenueByRegion", RevenueByRegion);
