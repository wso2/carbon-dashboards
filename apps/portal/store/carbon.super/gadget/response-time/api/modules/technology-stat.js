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

var dbMapping = {
    'browser': {
        'table': 'USER_AGENT_FAMILY',
        'field': 'userAgentFamily'
    },
    'os': {
        'table': 'OPERATING_SYSTEM',
        'field': 'operatingSystem'
    },
    'device-type': {
        'table': 'DEVICE_TYPE',
        'field': 'deviceCategory'
    }
};

function buildTechnologySql(dbEntry, whereClause) {
    return 'SELECT ' + dbEntry.field + ' as name, ' +
           'sum(averageRequestCount) as request_count, ' +
           'round((sum(averageRequestCount)*100/(select sum(averageRequestCount) ' +
           'FROM ' + dbEntry.table + ' ' + whereClause + ')), 2) as percentage_request_count ' +
           'FROM ' + dbEntry.table + ' ' + whereClause +
           ' GROUP BY ' + dbEntry.field +
           ' ORDER BY percentage_request_count DESC;';
}

function getTechnologyStatData(conditions, type) {
    var dbEntry = dbMapping[type];
    var sql = buildTechnologySql(dbEntry, conditions.sql);
    return executeQuery(sql, conditions.params);
}

function getTechnologyStat(conditions, type, visibleNumbers, groupName) {
    var dataObject = {};
    var i, len;
    var row;
    var series;
    var data;
    var chartOptions = {};

    var results = getTechnologyStatData(conditions, type);

    var shrinkedResults = helper.getShrinkedResultset(results, visibleNumbers, groupName);

    for (i = 0, len = shrinkedResults.length; i < len; i++) {
        row = shrinkedResults[i];
        series = 'series' + i;
        data = {'label': row['name'], 'data': row['request_count']};
        dataObject[series] = data;
    }

    print([dataObject, chartOptions]);
}

function getTechnologyTubularStat(conditions, type, tableHeadings, sortColumn) {
    print(helper.getTabularData(getTechnologyStatData(conditions, type), tableHeadings, sortColumn));
}

function buildHttpStatusSql(whereClause) {
    return 'SELECT responseHttpStatusCode as name, ' +
           'sum(averageRequestCount) as request_count, ' +
           'round((sum(averageRequestCount)*100/(select sum(averageRequestCount) ' +
           'FROM HTTP_STATUS ' + whereClause + ')),2) as percentage_request_count ' +
           'FROM HTTP_STATUS ' + whereClause +
           ' GROUP BY responseHttpStatusCode ' +
           'ORDER BY percentage_request_count DESC;';
}

function getHttpStatusStatData(conditions) {
    var sql = buildHttpStatusSql(conditions.sql);
    return executeQuery(sql, conditions.params);
}

function getHttpStatusStat(conditions) {
    var dataArray = [];
    var ticks = [];
    var i, len;
    var row;
    var opt;
    var results = getHttpStatusStatData(conditions);

    for (i = 0, len = results.length; (i < len) && (i < 5); i++) {
        row = results[i];
        dataArray.push([i, row['request_count']]);
        ticks.push([i, row['name']]);
    }

    opt = require('/gadgets/bar-chart/config/chart-options.json');
    opt.xaxis.ticks = ticks;
    opt.xaxis.axisLabel = 'Top 5 HTTP Response codes';
    opt.yaxis.axisLabel = 'Number of requests';
    print([
        {'series1': {'label': 's', 'data': dataArray}},
        opt
    ]);
}

function getHttpStatusTabularStat(conditions, tableHeadings, sortColumn) {
    print(helper.getTabularData(getHttpStatusStatData(conditions), tableHeadings, sortColumn));
}