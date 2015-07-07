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

function buildPastStatSql(whereClause, endTime, timeUnit) {
    return 'SELECT webappName, ' +
           'round(avg(averageRequestCount)) as averageRequestCount ' +
           'FROM REQUESTS_SUMMARY_PER_MINUTE ' + whereClause + ' ' +
           'AND time  > (STR_TO_DATE(\'' + endTime + '\', \'%Y-%m-%d %H:%i\') - INTERVAL 1 ' + timeUnit + ') GROUP BY webappName;';
}

function getPastStat(conditions, endTime, timeUnit) {
    var sql = buildPastStatSql(conditions.sql, endTime, timeUnit);
    return executeQuery(sql, conditions.params);
}

function matchPastStatWithApp(webappName, pastDataArray) {
    var i, len;
    for (i = 0, len = pastDataArray.length; i < len; i++) {
        if (pastDataArray[i]['webappName'] == webappName) {
            return pastDataArray[i]['averageRequestCount'];
        }
    }
    return '-';
}

function getTableHeadings() {
    return [
        'Application / Service',
        'Type',
        {
            'parent': 'Average request count',
            'sub': ['Last minute', 'Last hour', 'Last day']
        },
        'Total number of requests',
        'Percentage error'
    ];
}

function buildAppsSql(whereClause) {
    return 'SELECT webappName, webappType, sum(averageRequestCount) as total_requests, ' +
           'sum(httpSuccessCount) as total_http_success, sum(httpErrorCount) as total_http_error ' +
           'FROM REQUESTS_SUMMARY_PER_MINUTE ' + whereClause +
           ' GROUP BY webappName ORDER BY webappName;'
}

function getAppsStat(conditions, endTime) {
    var appList = [];
    var tempArray = [];
    var i, len;
    var lastMinute, lastHour, lastDay, apps;
    var app = {};
    var webappName;
    var key;
    var sql;

    sql = buildAppsSql(conditions.sql);

    lastMinute = getPastStat(conditions, endTime, 'MINUTE');
    lastHour = getPastStat(conditions, endTime, 'HOUR');
    lastDay = getPastStat(conditions, endTime, 'DAY');

    apps = executeQuery(sql, conditions.params);

    for (i = 0, len = apps.length; i < len; i++) {
        webappName = apps[i]['webappName'];

        app['webappName'] = webappName;
        app['webappType'] = apps[i]['webappType'];
        app['lastMinute'] = matchPastStatWithApp(webappName, lastMinute);
        app['lastHour'] = matchPastStatWithApp(webappName, lastHour);
        app['lastDay'] = matchPastStatWithApp(webappName, lastDay);
        app['totalRequests'] = apps[i]['total_requests'];
        app['percentageError'] = (apps[i]['total_http_error'] / apps[i]['total_requests']).toFixed(2);

        tempArray = [];
        for (key in app) {
            if (app.hasOwnProperty(key)) {
                tempArray.push(app[key]);
            }
        }
        appList.push(tempArray);
    }

    print({
        'data': appList,
        'headings': getTableHeadings(),
        'orderColumn': ['1'],
        'applist': 'true'
    });

}