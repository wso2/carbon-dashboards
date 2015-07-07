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

function formatDate(d) {
    var date = new Date(d);
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2);
    var day = ('0' + date.getDate()).slice(-2);
    var hour = ('0' + date.getHours()).slice(-2);
    var minute = ('0' + date.getMinutes()).slice(-2);
    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
}

/*
 This method returns the most significant results of the resultset.
 "significantRecordCount" is the number of most significant results to be returned.
 The rest, if any, will be aggregated under the name "groupName".
 */
function getShrinkedResultset(resultset, significantRecordCount, groupName) {
    var shrinkedResultset;
    var total = 0;
    var percentage = 0;
    var i;

    if (significantRecordCount >= resultset.length) {
        return resultset;
    }

    shrinkedResultset = resultset.slice(0, significantRecordCount);

    for (i = significantRecordCount; i < resultset.length; i++) {
        total = total + resultset[i]['request_count'];
        percentage = percentage + resultset[i]['percentage_request_count'];
    }

    shrinkedResultset.push({
        'request_count': total,
        'percentage_request_count': percentage.toFixed(2),
        'name': groupName
    });
    return shrinkedResultset;
}

/*
 This method returns the dataset to suit to be displayed in a datatable.
 */
function getTabularData(dataSet, columns, sortColumn) {
    var i, len;
    var key;
    var dataArray = [];
    var row;
    if (dataSet == null) {
        return;
    }

    for (i = 0, len = dataSet.length; i < len; i++) {
        row = [];
        for (key in dataSet[i]) {
            if (dataSet[i].hasOwnProperty(key)) {
                row.push(dataSet[i][key]);
            }
        }
        dataArray.push(row);
    }
    return {'data': dataArray, 'headings': columns, 'orderColumn': [sortColumn, 'desc']};
}

function parseDate(input) {
    var parts;
    if (!input) {
        return;
    }
    var p = input.split(' ');
    input = p[0];
    parts = input.split('-');

    // new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
    return new Date(parts[0], parts[1] - 1, parts[2]); // Note: months are 0-based
}
