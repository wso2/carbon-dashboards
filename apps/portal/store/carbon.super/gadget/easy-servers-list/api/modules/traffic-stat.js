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

var dbMapping = {
    'context': {
        'table': 'WEBAPP_CONTEXT',
        'field': 'webappcontext'
    },
    'referral': {
        'table': 'REFERRER',
        'field': 'referrer'
    }
};

function buildTrafficSql(dbEntry, whereClause) {
    return 'SELECT sum(averageRequestCount) as request_count, ' +
           'round((sum(averageRequestCount) *100/(select sum(averageRequestCount) ' +
           'FROM ' + dbEntry.table + ' ' + whereClause + ')),2) as percentage_request_count, ' +
           dbEntry.field + ' as name ' +
           'FROM ' + dbEntry.table + ' ' + whereClause +
           ' GROUP BY ' + dbEntry.field + ';';
}

function getTrafficStatData(conditions, type) {
    var dbEntry = dbMapping[type];
    var sql = buildTrafficSql(dbEntry, conditions.sql);
    return executeQuery(sql, conditions.params);
}

function getTrafficStat(conditions, type, tableHeadings, sortColumn) {
    var dataArray = [];
    var i, len;
    var row;
    var results = getTrafficStatData(conditions, type);

    for (i = 0, len = results.length; i < len; i++) {
        row = results[i];
        dataArray.push([row['name'], row['request_count'], row['percentage_request_count']]);
    }
    print({
        'data': dataArray,
        'headings': tableHeadings,
        'orderColumn': [sortColumn, 'desc']
    });
}