/*
 * Copyright (c) 2014, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

include('../db.jag');
var helper = require('as-data-util.js');

// type: select statement
var parameterMapping = {
    'request': 'avg(averageRequestCount)',
    'response': 'avg(averageResponseTime)',
    'error': 'sum(httpErrorCount)'
};

function buildTimeVaryingSql(selectStatement, whereClause) {
    return 'SELECT ' + selectStatement + ' as value, ' +
           'UNIX_TIMESTAMP(STR_TO_DATE(substring(time,1,13), \'%Y-%m-%d %H:\')) * 1000 as time ' +
           'FROM REQUESTS_SUMMARY_PER_MINUTE ' + whereClause +
           ' GROUP BY substring(time,1,13);';
}

function getTimeVaryingStatData(conditions, type) {
    var selectStatement = parameterMapping[type];
    var sql = buildTimeVaryingSql(selectStatement, conditions.sql);
    return executeQuery(sql, conditions.params);
}

function getTimeVaryingStat(conditions, type, color) {
    var dataArray = [];
    var i, len;
    var row;
    var results = getTimeVaryingStatData(conditions, type);
    var chartOptions = {};

    for (i = 0, len = results.length; i < len; i++) {
        row = results[i];
        dataArray.push([row['time'], row['value']]);
    }

    if (color != null) {
        chartOptions = {
            'colors': [color]
        }
    }

    print([
        {'series1': {'label': 's', 'data': dataArray}}, chartOptions
    ]);
}