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

import React from 'react';
import VizG from 'react-vizgrammar';
import Widget from '@wso2-dashboards/widget';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RevertIcon from 'material-ui/svg-icons/action/cached';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';

class RevenueByRegion extends Widget {
    constructor(props) {
        super(props);

        this.rowdata = [
            ['Singapore', 'SGP', 'Asia', 'Analytics', 195684.75, 20, 10],
            ['Japan', 'JPN', 'Asia', 'APIManager', 142582.15, 18, 8],
            ['China', 'CHN', 'Asia', 'APIManager', 110025.78, 15, 9],
            ['Korea', 'KOR', 'Asia', 'ESB', 98256.45, 14, 11],
            ['India', 'IND', 'Asia', 'ESB', 114785.12, 13, 7],
            ['Iran', 'IRN', 'Middle East', 'IdentityServer', 275895.45, 27, 20],
            ['United Arab Emirates', 'ARE', 'Middle East', 'IdentityServer', 312514.12, 35, 24],
            ['Afghanistan', 'AFG', 'Middle East', 'IdentityServer', 148345.36, 19, 12],
            ['Pakistan', 'PAK', 'Middle East', 'IOTServer', 91472.91, 14, 8],
            ['Belgium', 'BEL', 'Europe', 'Analytics', 114587.25, 12, 8],
            ['Czech Republic', 'CZE', 'Europe', 'Analytics', 124853.23, 15, 11],
            ['Denmark', 'DNK', 'Europe', 'APIManager', 132457.35, 16, 12],
            ['Finland', 'FIN', 'Europe', 'ESB', 175482.35, 17, 18],
            ['France', 'FRA', 'Europe', 'Analytics', 458368.35, 37, 31],
            ['Germany', 'DEU', 'Europe', 'APIManager', 378958.34, 27, 20],
            ['Greece', 'GRC', 'Europe', 'Analytics', 247856.14, 24, 17],
            ['Italy', 'ITA', 'Europe', 'ESB', 417581.58, 27, 20],
            ['Netherlands', 'NLD', 'Europe', 'ESB', 215789.21, 20, 14],
            ['Norway', 'NOR', 'Europe', 'Analytics', 147892.21, 11, 4],
            ['Poland', 'POL', 'Europe', 'APIManager', 91425.25, 8, 2],
            ['Portugal', 'PRT', 'Europe', 'ESB', 99568.27, 8, 3],
            ['Russian Federation', 'RUS', 'Europe', 'ESB', 345896.32, 20, 15],
            ['Spain', 'ESP', 'Europe', 'APIManager', 214571.75, 15, 9],
            ['Sweden', 'SWE', 'Europe', 'APIManager', 199253.27, 14, 8],
            ['Switzerland', 'CHE', 'Europe', 'Analytics', 253893.79, 20, 14],
            ['United Kingdom', 'GBR', 'Europe', 'Analytics', 215472.62, 19, 11],
            ['Canada', 'CAN', 'North America', 'ESB', 145892.77, 14, 8],
            ['Mexico', 'MEX', 'North America', 'Analytics', 114758.12, 11, 6],
            ['United States', 'USA', 'North America', 'APIManager', 514235.51, 45, 30],
            ['Argentina', 'ARG', 'LATAM', 'ESB', 210475.81, 20, 10],
            ['Brazil', 'BRA', 'LATAM', 'APIManager', 98245.25, 11, 5],
            ['Colombia', 'COL', 'LATAM', 'APIManager', 81425, 9, 4],
            ['South Africa', 'ZAF', 'Africa', 'Analytics', 71425.25, 6, 3],
            ['Australia', 'AUS', 'ROW', 'Analytics', 114522.14, 13, 8],
            ['Singapore', 'SGP', 'Asia', 'APIManager', 95684.75, 10, 6],
            ['Japan', 'JPN', 'Asia', 'ESB', 242582.15, 25, 14],
            ['China', 'CHN', 'Asia', 'ESB', 210025.78, 21, 11],
            ['Korea', 'KOR', 'Asia', 'APIManager', 198256.45, 24, 17],
            ['India', 'IND', 'Asia', 'APIManager', 314785.12, 23, 17],
            ['Iran', 'IRN', 'Middle East', 'ESB', 175895.45, 17, 10],
            ['United Arab Emirates', 'ARE', 'Middle East', 'ESB', 212514.12, 25, 14],
            ['Afghanistan', 'AFG', 'Middle East', 'ESB', 48345.36, 9, 2],
            ['Pakistan', 'PAK', 'Middle East', 'IdentityServer', 191472.91, 14, 8],
            ['Belgium', 'BEL', 'Europe', 'APIManager', 214587.25, 22, 12],
            ['Czech Republic', 'CZE', 'Europe', 'APIManager', 24853.23, 5, 1],
            ['Denmark', 'DNK', 'Europe', 'Analytics', 332457.35, 26, 18],
            ['Finland', 'FIN', 'Europe', 'APIManager', 275482.35, 27, 21],
            ['France', 'FRA', 'Europe', 'APIManager', 258368.35, 27, 11],
            ['Germany', 'DEU', 'Europe', 'Analytics', 178958.34, 17, 10],
            ['Greece', 'GRC', 'Europe', 'APIManager', 147856.14, 14, 7],
            ['Italy', 'ITA', 'Europe', 'APIManager', 117581.58, 17, 10],
            ['Netherlands', 'NLD', 'Europe', 'APIManager', 115789.21, 10, 4],
            ['Norway', 'NOR', 'Europe', 'APIManager', 47892.21, 7, 2],
            ['Poland', 'POL', 'Europe', 'ESB', 191425.25, 18, 12],
            ['Portugal', 'PRT', 'Europe', 'APIManager', 149568.27, 14, 9],
            ['Russian Federation', 'RUS', 'Europe', 'IdentityServer', 145896.32, 10, 5],
            ['Spain', 'ESP', 'Europe', 'IdentityServer', 114571.75, 10, 6],
            ['Sweden', 'SWE', 'Europe', 'IdentityServer', 99253.27, 10, 5],
            ['Switzerland', 'CHE', 'Europe', 'APIManager', 153893.79, 10, 7],
            ['United Kingdom', 'GBR', 'Europe', 'APIManager', 115472.62, 22, 14],
            ['Canada', 'CAN', 'North America', 'APIManager', 45892.77, 7, 5],
            ['Mexico', 'MEX', 'North America', 'APIManager', 214758.12, 18, 9],
            ['United States', 'USA', 'North America', 'Analytics', 114235.51, 15, 9],
            ['Argentina', 'ARG', 'LATAM', 'APIManager', 110475.81, 12, 7],
            ['Brazil', 'BRA', 'LATAM', 'Analytics', 118245.25, 14, 7],
            ['Colombia', 'COL', 'LATAM', 'Analytics', 111425, 11, 8],
            ['South Africa', 'ZAF', 'Africa', 'APIManager', 171425.25, 12, 7],
            ['Australia', 'AUS', 'ROW', 'APIManager', 214522.14, 19, 10],
            ['Singapore', 'SGP', 'Asia', 'ESB', 249684.75, 15, 8],
            ['Japan', 'JPN', 'Asia', 'Analytics', 322582.15, 35, 20],
            ['China', 'CHN', 'Asia', 'Analytics', 190025.78, 18, 10],
            ['Korea', 'KOR', 'Asia', 'Analytics', 118256.45, 14, 7],
            ['India', 'IND', 'Asia', 'Analytics', 154785.12, 13, 7],
            ['Iran', 'IRN', 'Middle East', 'APIManager', 75895.45, 7, 1],
            ['United Arab Emirates', 'ARE', 'Middle East', 'Analytics', 12514.12, 2, 1],
            ['Afghanistan', 'AFG', 'Middle East', 'Analytics', 118345.36, 11, 8],
            ['Pakistan', 'PAK', 'Middle East', 'APIManager', 291472.91, 24, 14],
            ['Belgium', 'BEL', 'Europe', 'APIManager', 14587.25, 2, 1],
            ['Czech Republic', 'CZE', 'Europe', 'APIManager', 224853.23, 25, 11],
            ['Denmark', 'DNK', 'Europe', 'Analytics', 212457.35, 16, 8],
            ['Finland', 'FIN', 'Europe', 'Analytics', 75482.35, 7, 2],
            ['France', 'FRA', 'Europe', 'ESB', 58368.35, 7, 2],
            ['Germany', 'DEU', 'Europe', 'ESB', 78958.34, 7, 4],
            ['Greece', 'GRC', 'Europe', 'APIManager', 47856.14, 4, 1],
            ['Italy', 'ITA', 'Europe', 'Analytics', 217581.58, 27, 14],
            ['Netherlands', 'NLD', 'Europe', 'Analytics', 75789.21, 5, 2],
            ['Norway', 'NOR', 'Europe', 'APIManager', 77892.21, 9, 3],
            ['Poland', 'POL', 'Europe', 'Analytics', 211425.25, 21, 14],
            ['Portugal', 'PRT', 'Europe', 'Analytics', 49568.27, 4, 1],
            ['Russian Federation', 'RUS', 'Europe', 'APIManager', 245896.32, 15, 7],
            ['Spain', 'ESP', 'Europe', 'Analytics', 99571.75, 8, 4],
            ['Sweden', 'SWE', 'Europe', 'Analytics', 175253.27, 12, 7],
            ['Switzerland', 'CHE', 'Europe', 'ESB', 53893.79, 8, 3],
            ['United Kingdom', 'GBR', 'Europe', 'ESB', 315472.62, 28, 16],
            ['Canada', 'CAN', 'North America', 'Analytics', 95892.77, 11, 8],
            ['Mexico', 'MEX', 'North America', 'ESB', 774758.12, 8, 5],
            ['United States', 'USA', 'North America', 'ESB', 214235.51, 18, 11],
            ['Argentina', 'ARG', 'LATAM', 'Analytics', 140475.81, 14, 8],
            ['Brazil', 'BRA', 'LATAM', 'ESB', 38245.25, 4, 1],
            ['Colombia', 'COL', 'LATAM', 'ESB', 771425, 9, 4],
            ['South Africa', 'ZAF', 'Africa', 'ESB', 154425.25, 10, 6],
            ['Australia', 'AUS', 'ROW', 'ESB', 174522.14, 15, 7],
            ['Japan', 'JPN', 'Asia', 'IOTServer', 222582.15, 25, 14],
            ['China', 'CHN', 'Asia', 'IOTServer', 90025.78, 11, 5],
            ['Korea', 'KOR', 'Asia', 'IOTServer', 38256.45, 7, 2],
            ['India', 'IND', 'Asia', 'IOTServer', 54785.12, 3, 1],
            ['France', 'FRA', 'Europe', 'IdentityServer', 158368.35, 12, 7],
            ['Germany', 'DEU', 'Europe', 'IdentityServer', 218958.34, 13, 8],
            ['Italy', 'ITA', 'Europe', 'IdentityServer', 17581.58, 7, 1],
            ['Russian Federation', 'RUS', 'Europe', 'Analytics', 75896.32, 11, 5],
            ['Spain', 'ESP', 'Europe', 'ESB', 50571.75, 6, 3],
            ['Sweden', 'SWE', 'Europe', 'ESB', 75253.27, 9, 4],
            ['Switzerland', 'CHE', 'Europe', 'IdentityServer', 153893.79, 14, 8],
            ['United Kingdom', 'GBR', 'Europe', 'IdentityServer', 85472.62, 8, 3],
            ['Canada', 'CAN', 'North America', 'IdentityServer', 75892.77, 9, 4],
            ['United States', 'USA', 'North America', 'IdentityServer', 314235.51, 21, 8],
            ['Australia', 'AUS', 'ROW', 'IdentityServer', 224522.14, 25, 17]
        ];

        this.configPieRegion = {
            charts: [{
                type: 'arc',
                x: 'Revenue',
                color: 'Region',
                mode: 'pie',
                colorScale: ['#4659f9', '#00dffc ', '#00b1e1', '#6f2e71', '#c43a5d', '#303869', '#3847c3']
            }],
            width: props.glContainer.width,
            height: props.glContainer.height,
            animate: true,
            style: {legendTitleColor: "#5d6e77", legendTextColor: "#5d6e77", legendTextSize: 14}
        };

        this.configPieProduct = {
            charts: [{
                type: 'arc',
                x: 'Revenue',
                color: 'Product',
                mode: 'pie',
                colorScale: ['#4659f9', '#00dffc ', '#00b1e1', '#6f2e71', '#c43a5d', '#303869', '#3847c3']
            }],
            width: props.glContainer.width,
            height: props.glContainer.height,
            animate: true,
            style: {legendTitleColor: "#5d6e77", legendTextColor: "#5d6e77", legendTextSize: 14}
        };

        this.aggregatedData = [
            ['ALL', 'ALL', 'Africa', 'ALL', 397275.75, 28, 16],
            ['ALL', 'ALL', 'Asia', 'ALL', 3163652.25, 324, 184],
            ['ALL', 'ALL', 'Europe', 'ALL', 9588717.86, 861, 510],
            ['ALL', 'ALL', 'LATAM', 'ALL', 1680438.18, 104, 54],
            ['ALL', 'ALL', 'Middle East', 'ALL', 1954683.52, 204, 122],
            ['ALL', 'ALL', 'North America', 'ALL', 2624787.48, 177, 103],
            ['ALL', 'ALL', 'ROW', 'ALL', 728088.56, 72, 42]
        ];

        this.state = {
            data: this.aggregatedData,
            config: this.configPieRegion,
            isDrillDowned: false
        };

        this.metadata = {
            names: ['Country', 'Country Code', 'Region', 'Product', 'Revenue', 'Downloads', 'Customers'],
            types: ['ordinal', 'ordinal', 'ordinal', 'ordinal', 'linear', 'linear', 'linear']
        };

        this.handleClickEvent = this.handleClickEvent.bind(this);
        this.handleResize = this.handleResize.bind(this);
        props.glContainer.on('resize', this.handleResize);
    }

    handleResize() {
        this.setState({width: this.props.glContainer.width, height: this.props.glContainer.height});
    }

    handleClickEvent(event) {
        let key = Object.keys(event)[0];
        if (!this.state.isDrillDowned) {
            let array = [];
            this.rowdata.map(data => {
                if (data[2] === key) {
                    array.push(data)
                }
            });
            super.publish({selectedRegion: key});
            this.setState({config: this.configPieProduct, data: array, isDrillDowned: true});
        } else {
            super.publish({selectedRegion: "ALL"});
            this.setState({config: this.configPieRegion, data: this.aggregatedData, isDrillDowned: false});
        }
    }

    render() {
        return (
            <MuiThemeProvider>
                <IconButton
                    onClick={this.handleClickEvent}
                    disabled={!this.state.isDrillDowned}
                    iconStyle={{
                        color: '#fff',
                        cursor: 'default',
                        fill: '#fff',
                    }}
                >
                    <RevertIcon />
                </IconButton>
                <div
                    style={{
                        width: this.props.glContainer.width,
                        height: this.props.glContainer.height,
                        marginBottom: 10
                    }}
                >
                    <VizG
                        config={this.state.config}
                        metadata={this.metadata}
                        data={this.state.data}
                        append={false}
                        onClick={this.handleClickEvent}
                        height={this.props.glContainer.height}
                        width={this.props.glContainer.width}
                    />
                </div>
            </MuiThemeProvider>
        );
    }
}

global.dashboard.registerWidget("RevenueByRegion", RevenueByRegion);
