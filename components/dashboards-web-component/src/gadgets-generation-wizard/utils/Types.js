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
 * Contains data types / modes
 */
const Types = {
    dataProvider: {
        mysql: 'mysql',
    },
    chart: {
        lineAreaBarChart: 'lineAreaBarChart',
        lineChart: 'line',
        areaChart: 'area',
        barChart: 'bar',
        scatterChart: 'scatterChart',
        pieChart: 'pieChart',
        pie: 'pie',
        donut: 'donut',
        gauge: 'gauge',
        numberChart: 'numberChart',
        number: 'number',
        geographicalChart: 'geographicalChart',
        map: 'map',
        world: 'world',
        europe: 'europe',
        usa: 'usa',
        tableChart: 'tableChart',
        table: 'table',
    },
    dataset: {
        metadata: {
            linear: 'LINEAR',
            ordinal: 'ORDINAL',
            time: 'TIME',
        },
    },
    // Some charts have the ability to be stacked
    chartStacking: {
        stacked: 'stacked',
    },
    // Provider configuration input fields
    inputFields: {
        TEXT_FIELD: 'TEXT_FIELD',
        TEXT_AREA: 'TEXT_AREA',
        NUMBER: 'NUMBER',
        SWITCH: 'SWITCH',
        SQL_CODE: 'SQL_CODE',
        DYNAMIC_SQL_CODE: 'DYNAMIC_SQL_CODE',
        SIDDHI_CODE: 'SIDDHI_CODE',
        DYNAMIC_SIDDHI_CODE: 'DYNAMIC_SIDDHI_CODE',
    }
};

export default Types;
