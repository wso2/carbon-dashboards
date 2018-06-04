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

/**
 * Configurations for different types of data providers and charts
 */
const Configurations = {
    dataProviders: {
        mysql: {
            datasourceName: '',
            tableName: '',
            query: '',
            incrementalColumn: '',
            publishingInterval: '',
            purgingInterval: '',
            publishingLimit: '',
            purgingLimit: '',
            isPurgingEnable: true,
        },
    },
    charts: {
        lineAreaBarChart: {
            x: '',
            charts: [
                {
                    type: '',
                    y: '',
                    color: '',
                    stacked: false,
                    fill: '',
                    style: {
                        strokeWidth: '',
                        fillOpacity: '',
                        markRadius: '',
                    },
                    colorScale: [],
                    colorDomain: [],
                },
            ],
            legend: false,
            maxLength: '',
            style: {
                axisLabelColor: '',
                legendTitleColor: '',
                legendTextColor: '',
                xAxisTickAngle: '',
                yAxisTickAngle: '',
            },
            xAxisLabel: '',
            yAxisLabel: '',
            disableVerticalGrid: false,
            disableHorizontalGrid: false,
            timeFormat: '',
            legendOrientation: '',
            append: true,
        },
        scatterChart: {
            type: 'scatter',
            charts: [
                {
                    type: 'scatter',
                    x: '',
                    y: '',
                    color: '',
                    size: '',
                    colorScale: [],
                    colorDomain: [],
                    fill: '',
                    maxLength: '',
                },
            ],
            style: {
                axisLabelColor: '',
                legendTitleColor: '',
                legendTextColor: '',
                xAxisTickAngle: '',
                yAxisTickAngle: '',
            },
            xAxisLabel: '',
            yAxisLabel: '',
            disableVerticalGrid: false,
            disableHorizontalGrid: false,
            timeFormat: '',
            legendOrientation: '',
            xAxisTickCount: '',
            yAxisTickCount: '',
            append: true,
        },
        pieChart: {
            charts: [
                {
                    x: '',
                    type: 'arc',
                    color: '',
                    colorScale: [],
                    colorDomain: [],
                },
            ],
            legend: false,
            style: {
                legendTitleColor: '',
                legendTextColor: '',
            },
            legendOrientation: '',
            append: true,
        },
        numberChart: {
            x: '',
            title: '',
            charts: [
                {
                    type: 'number',
                },
            ],
            showDifference: false,
            showPercentage: false,
        },
        geographicalChart: {
            x: '',
            legendTitleColor: '',
            legendTextColor: '',
            charts: [
                {
                    type: 'map',
                    y: '',
                    mapType: '',
                    colorScale: [],
                },
            ],
        },
        // tableChart: {
        //     charts: [
        //         {
        //             type: 'table',
        //             columns: [],
        //             columnTitles: [],
        //             filterColumn: [],
        //         },
        //     ],
        //     maxLength: '',
        //     colorBasedStyle: false,
        // },
        tableChart: {
            charts: [
                {
                    type: 'table',
                    columns: [
                        {
                            name: '',
                            title: '',
                            colorScale: '',
                            colorDomain: '',
                            timeFormat: '',
                            textColor: '',
                            colorBasedStyle: false,
                            isSelected: false,
                        }
                    ],
                },
            ],
            maxLength: '',
        },
    },
};

export default Configurations;
