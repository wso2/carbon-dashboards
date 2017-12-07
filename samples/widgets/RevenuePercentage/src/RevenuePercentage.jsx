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

class RevenuePercentage extends Widget {
    constructor(props) {
        super(props);
        this.config = {
            charts: [{type: 'arc', x: 'Percentage', color: 'Percentage', colorScale: ['steelblue', '#80ccff']}],
            tooltip: {enabled: false},
            legend: false,
            percentage: true,
            animate: true,
            colorScale: ['steelblue', '#80ccff'],
            height: props.glContainer.height
        };

        this.state = {
            data: [[0]],
            config: this.config
        };

        this.data = [
            ['ALL', 'ALL', 'Africa', 'ALL', 397275.75, 28, 16],
            ['ALL', 'ALL', 'Asia', 'ALL', 3163652.25, 324, 184],
            ['ALL', 'ALL', 'Europe', 'ALL', 9588717.86, 861, 510],
            ['ALL', 'ALL', 'LATAM', 'ALL', 1680438.18, 104, 54],
            ['ALL', 'ALL', 'Middle East', 'ALL', 1954683.52, 204, 122],
            ['ALL', 'ALL', 'North America', 'ALL', 2624787.48, 177, 103],
            ['ALL', 'ALL', 'ROW', 'ALL', 728088.56, 72, 42]
        ];

        this.metadata = {
            names: ['Percentage'],
            types: ['linear']
        };

        this.setReceivedMsg = this.setReceivedMsg.bind(this);
        this.handleResize = this.handleResize.bind(this);
        props.glContainer.on('resize', this.handleResize);
    }

    setReceivedMsg(receivedMsg) {
        let totalRevenue = 0;
        let selectedRegionRevenue = 0;
        this.data.map(dataElement => {
            totalRevenue = totalRevenue + dataElement[4];
            if (dataElement[2] === receivedMsg.selectedRegion) {
                selectedRegionRevenue = dataElement[4];
            }
        });
        this.setState({data: [[selectedRegionRevenue * 100 / totalRevenue]]});
    }

    componentWillMount() {
        super.subscribe(this.setReceivedMsg);
    }

    handleResize() {
        this.setState({width: this.props.glContainer.width, height: this.props.glContainer.height});
    }

    render() {
        return (
            <section>
                <div style={{marginTop: "5px", width: this.state.width, height: this.state.height}}>
                    <VizG config={this.state.config} metadata={this.metadata} data={this.state.data} append={false}
                          onClick={this.handleClickEvent}/>
                </div>
            </section>
        );
    }
}

global.dashboard.registerWidget("RevenuePercentage", RevenuePercentage);
