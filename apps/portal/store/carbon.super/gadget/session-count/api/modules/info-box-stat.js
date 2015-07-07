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

function buildInfoBoxGreaterThan1200DaysSql(selectStatement, type, whereClause) {
    return 'SELECT ' + selectStatement + '(' + type + ') as value, YEAR(time) as time ' +
           'FROM REQUESTS_SUMMARY_PER_MINUTE ' + whereClause + ' GROUP BY YEAR(time);';
}

function buildInfoBoxGreaterThan90Days(selectStatement, type, whereClause) {
    return 'SELECT ' + selectStatement + '(' + type + ') as value, ' +
           'DATE_FORMAT(time, \'%b %Y\') as time ' +
           'FROM REQUESTS_SUMMARY_PER_MINUTE ' + whereClause + ' GROUP BY MONTH(time);';
}

function buildInfoBoxGreaterThan30Days(selectStatement, type, whereClause) {
    return 'SELECT ' + selectStatement + '(' + type + ') as value, ' +
           'CONCAT(DATE_FORMAT(DATE_ADD(time, INTERVAL (1 - DAYOFWEEK(time)) DAY),\'%b %d %Y\'), \' - \', ' +
           'DATE_FORMAT(DATE_ADD(time, INTERVAL (7 - DAYOFWEEK(time)) DAY),\'%b %d %Y\')) as time ' +
           'FROM REQUESTS_SUMMARY_PER_MINUTE ' + whereClause + ' GROUP BY WEEK(time);';
}

function buildInfoBoxGreaterThan1Day(selectStatement, type, whereClause) {
    return 'SELECT ' + selectStatement + '(' + type + ') as value, ' +
           'DATE_FORMAT(time, \'%b %d %Y\') as time ' +
           'FROM REQUESTS_SUMMARY_PER_MINUTE ' + whereClause + ' GROUP BY DATE(time);';
}

function buildInfoBoxLessThan1Day(selectStatement, type, whereClause) {
    return 'SELECT ' + selectStatement + '(' + type + ') as value, ' +
           'DATE_FORMAT(time, \'%H:00\') as time ' +
           'FROM REQUESTS_SUMMARY_PER_MINUTE ' + whereClause + ' GROUP BY HOUR(time);';
}

function getDataForInfoBoxBarChart(type, conditions) {
    var startTime = helper.parseDate(request.getParameter('start_time'));
    var endTime = helper.parseDate(request.getParameter('end_time'));
    var timeDiff = 0;
    var i, len;
    var sql;
    var results;
    var arrList = [];

    if (request.getParameter('start_time') != null && request.getParameter('end_time') != null) {
        timeDiff = Math.abs((endTime.getTime() - startTime.getTime()) / 86400000);
    } else {
        timeDiff = 1;
    }

    var selectStatement = 'SUM';
    if (type == 'averageResponseTime') {
        selectStatement = 'AVG';
    }

    if (timeDiff > 1200) {
        sql = buildInfoBoxGreaterThan1200DaysSql(selectStatement, type, conditions.sql);
    } else if (timeDiff > 90) {
        sql = buildInfoBoxGreaterThan90Days(selectStatement, type, conditions.sql);
    } else if (timeDiff > 30) {
        sql = buildInfoBoxGreaterThan30Days(selectStatement, type, conditions.sql);
    } else if (timeDiff > 1) {
        sql = buildInfoBoxGreaterThan1Day(selectStatement, type, conditions.sql);
    } else if (timeDiff <= 1) {
        sql = buildInfoBoxLessThan1Day(selectStatement, type, conditions.sql);
    }

    results = executeQuery(sql, conditions.params);

    for (i = 0, len = results.length; i < len; i++) {
        var tempData = [];
        tempData[0] = i;
        tempData[1] = results[i]['value'];
        tempData[2] = results[i]['time'] + ' : ' + results[i]['value'];
        arrList.push(tempData);
    }
    return arrList;
}

function buildInfoBoxRequestSql(whereClause) {
    return 'SELECT sum(averageRequestCount) as totalRequest, ' +
           'max(averageRequestCount) as maxRequest, avg(averageRequestCount) as avgRequest, ' +
           'min(averageRequestCount) as minRequest FROM REQUESTS_SUMMARY_PER_MINUTE ' + whereClause + ';';
}

function getInfoBoxRequestStat(conditions) {
    var output = {};
    var sql = buildInfoBoxRequestSql(conditions.sql);
    var results = executeQuery(sql, conditions.params)[0];

    output['title'] = 'Total Requests';
    output['measure_label'] = 'Per min';

    if (results['totalRequest'] != null) {
        output['total'] = results['totalRequest'];
        output['max'] = results['maxRequest'];
        output['avg'] = Math.round(results['avgRequest']);
        output['min'] = results['minRequest']
    } else {
        output['total'] = output['max'] = output['avg'] = output['min'] = 'N/A';
    }
    output['graph'] = getDataForInfoBoxBarChart('averageRequestCount', conditions);
    print(output);
}

function buildInfoBoxResponseSql(whereClause) {
    return 'SELECT max(averageResponseTime) as maxResponse, ' +
           'avg(averageResponseTime) as avgResponse, min(averageResponseTime) as minResponse ' +
           'FROM REQUESTS_SUMMARY_PER_MINUTE ' + whereClause + ';';
}

function getInfoBoxResponseStat(conditions) {
    var output = {};

    var sql = buildInfoBoxResponseSql(conditions.sql);
    var results = executeQuery(sql, conditions.params)[0];
    output['title'] = 'Response Time';
    output['measure_label'] = 'ms';

    if (results['maxResponse'] != null) {
        output['max'] = results['maxResponse'];
        output['avg'] = Math.round(results['avgResponse']);
        output['min'] = results['minResponse'];
    } else {
        output['max'] = output['avg'] = output['min'] = 'N/A';
    }
    output['graph'] = getDataForInfoBoxBarChart('averageResponseTime', conditions);
    print(output);
}

function buildInfoBoxSessionSql(whereClause) {
    return 'SELECT sum(sessionCount) as totalSession, avg(sessionCount) as avgSession ' +
           'FROM REQUESTS_SUMMARY_PER_MINUTE ' + whereClause + ';';
}

function getInfoBoxSessionStat(conditions) {
    var output = {};

    var sql = buildInfoBoxSessionSql(conditions.sql);
    var results = executeQuery(sql, conditions.params)[0];
    output['title'] = 'Session';

    if (results['totalSession'] != null) {
        output['total'] = results['totalSession'];
        output['avg'] = Math.round(results['avgSession']);
    } else {
        output['total'] = output['avg'] = 'N/A';
    }
    print(output);
}

function buildInfoBoxErrorSql(whereClause) {
    return 'SELECT sum(httpErrorCount) as totalError, ' +
           '(sum(httpErrorCount)*100)/(sum(httpSuccessCount)+sum(httpErrorCount)) as percentageError ' +
           'FROM REQUESTS_SUMMARY_PER_MINUTE ' + whereClause + ';';
}

function getInfoBoxErrorStat(conditions) {
    var output = {};

    var sql = buildInfoBoxErrorSql(conditions.sql);
    var results = executeQuery(sql, conditions.params)[0];
    output['title'] = 'Errors';

    if (results['totalError'] != null) {
        output['total'] = results['totalError'];
        output['percentage'] = results['percentageError'].toFixed(2) + '\x25';
    } else {
        output['total'] = output['percentage'] = 'N/A';
    }
    print(output);
}