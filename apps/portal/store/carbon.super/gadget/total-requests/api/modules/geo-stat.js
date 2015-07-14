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
    'country': {
        'table': 'COUNTRY',
        'field': 'country'
    },
    'language': {
        'table': 'LANGUAGE',
        'field': 'language'
    }
};

function buildGeoSql(dbEntries, whereClause) {
    return 'SELECT ' + dbEntries.field + ' as name, ' +
           'sum(averageRequestCount) as request_count, ' +
           'round((sum(averageRequestCount)*100/(select sum(averageRequestCount) ' +
           'FROM ' + dbEntries.table + ' ' + whereClause + ')),2) as percentage_request_count ' +
           'FROM ' + dbEntries.table + ' ' + whereClause +
           ' GROUP BY ' + dbEntries.field +
           ' ORDER BY percentage_request_count DESC;';
}

function getGeoStatData(conditions, type) {
    var dbEntry = dbMapping[type];
    var sql = buildGeoSql(dbEntry, conditions.sql);
    return executeQuery(sql, conditions.params);
}

function getLanguageStat(conditions) {
    var dataArray = [];
    var ticks = [];
    var i, len;
    var row;
    var languageCode;
    var results = getGeoStatData(conditions, 'language');
    var languageCodeLookup = require('/languages.json');
    var chartOptions;

    for (i = 0, len = results.length; (i < len) && (i < 5); i++) {
        row = results[i];
        languageCode = results[i]['name'];
        dataArray.push([i, row['request_count']]);
        ticks.push([i, languageCodeLookup[row['name']] || languageCode]);
    }

    chartOptions = {
        'xaxis': {
            'ticks': ticks,
            'axisLabel': 'Top 5 Languages'
        },
        'yaxis': {
            'axisLabel': 'Number of requests'
        }
    };

    print([
        {'series1': {'label': 's', 'data': dataArray}}, chartOptions
    ]);
}

function getLanguageTabularStat(conditions, tableHeadings, sortColumn) {
    var i, len;
    var results = getGeoStatData(conditions, 'language');
    var languageCode;
    var languageCodeLookup = require('/languages.json');

    for (i = 0, len = results.length; i < len; i++) {
        languageCode = results[i]['name'];
        results[i]['name'] = languageCodeLookup[languageCode] || languageCode;
    }
    print(helper.getTabularData(results, tableHeadings, sortColumn));
}

function getCountryStat(conditions) {
    var dataObject = {};
    var i, len;
    var row;
    var results = getGeoStatData(conditions, 'country');

    for (i = 0, len = results.length; i < len; i++) {
        row = results[i];
        dataObject[row['name']] = row['request_count'];
    }
    print(dataObject);

}

function getCountryTabularStat(conditions, tableHeadings, sortColumn) {
    var i, len;
    var countryCode;
    var results = getGeoStatData(conditions, 'country');
    var countryCodeLookup = require('/countries.json');

    for (i = 0, len = results.length; i < len; i++) {
        countryCode = results[i]['name'];
        results[i]['name'] = countryCodeLookup[countryCode] || countryCode;
    }
    print(helper.getTabularData(results, tableHeadings, sortColumn));

}