/*
 * Copyright (c) 2005-2014, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

var pref = new gadgets.Prefs();
var values = null;
var node = pref.getString('node') || undefined;
var start = '2015-06-07 18:24';
var end  = '2015-07-06 18:24';

function fetchData() {
    var url = '/portal/store/carbon.super/gadget/response-time/api/as-data.jag';

    var data = {
        start_time: start,
        end_time: end,
        action: 'country'
    };
    if(node) {
        data.node = node;
    }
    var appname = pref.getString('appname');
    if (appname != '') {
        data.appname = appname;
    }
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        data: data,
        success: onDataReceived
    });
}

function onDataReceived(data) {
    values = data;

    if ($.isEmptyObject(data)) {
        $('#world-map').html("<div class='no-data'>No data available for selected options..!</div>");
        return;
    }

    $('#world-map').vectorMap({
        map: 'world_mill_en',
        series: {
            regions: [{
                          values: null,
                          scale: ['#C8EEFF', '#0071A4'],
                          normalizeFunction: 'polynomial'
                      }]
        },
        onRegionLabelShow: function (e, el, code) {
            var request_count_tooltip = 0;

            if (values[code]) {
                request_count_tooltip = values[code];
            }
            el.html('Country: ' + el.html() + ' (total request count: ' + request_count_tooltip + ')');
        }
    });

    var map = $('#world-map').vectorMap('get', 'mapObject');
    map.series.regions[0].clear();
    map.series.regions[0].setValues(values);

    if ($.isEmptyObject(values)) {
        map.series.regions[0].clear();
    }
}

gadgets.HubSettings.onConnect = function () {

    gadgets.Hub.subscribe('date-selected', function(topic, date, subscriberData) {
        start = moment(date.from).format('YYYY-MM-DD HH:mm');
        end = moment(date.to).format('YYYY-MM-DD HH:mm');
        fetchData();
    });

    gadgets.Hub.subscribe('server-selected', function(topic, server, subscriberData) {
        node = server;
        fetchData();
    });
};

