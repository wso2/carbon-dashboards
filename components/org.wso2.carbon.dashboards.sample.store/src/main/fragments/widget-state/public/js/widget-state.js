/**
 * @license
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * This sample introduces the widget state persistent capabilities in the dashboard. This feature exposes the following
 * client side APIs to the widget to persist and retrieve state of a widget locally and globally. The local state
 * persistence allows only the gadget to access while the global state persistence allows gadgets to share the state
 * (ex: date picker gadget will persist the selected date in the global state map allowing other widgets to access the
 * data directly).
 *
 * APIs:
 *      portal.dashboards.api.state.setLocalState(containerId, key, value)
 *      portal.dashboards.api.state.getLocalState(containerId, key)
 *      portal.dashboards.api.state.setGlobalState(key, value)
 *      portal.dashboards.api.state.getGlobalState(key)
 */
(function () {
    "use strict";
    var data = [
        {
            metadata: {
                names: ['Brand', 'Share'],
                types: ['ordinal', 'linear']
            },
            data: [
                ['Toyota', 32],
                ['Nissan', 27],
                ['Honda', 21],
                ['Mitsubishi', 12],
                ['Other', 8]
            ]
        }
    ];

    /**
     * Renders the chart.
     * @param containerId Container ID
     */
    var renderChart = function (containerId) {
        var chartType = portal.dashboards.api.state.getLocalState(containerId.replace('widget_', ''), 'chartType')
            || 'pie';
        var width = document.getElementById(containerId).offsetWidth;
        var height = 270;
        var config;
        if (chartType === 'pie') {
            config = {
                charts: [
                    {type: "arc", x: "Share", mode: "pie", color: "Brand"}
                ],
                width: width,
                height: height
            };
        } else {
            config = {
                x: "Brand",
                charts: [
                    {type: "bar", range: "true", y: "Share", color: "Share"}
                ],
                maxLength: 50,
                width: width,
                height: height
            };
        }
        widget.renderer.setWidgetName(
            portal.dashboards.widgets['org.wso2.carbon.dashboards.sample.store.widget-state'].info.id,
            portal.dashboards.widgets['org.wso2.carbon.dashboards.sample.store.widget-state'].info.name);
        new vizg(data, config).draw('#chart-canvas');

        $('#chart-type').val(chartType);
    };

    /**
     * Renders the chart and bind the event handlers
     * @param containerId Container ID
     */
    var render = function (containerId) {
        renderChart(containerId);

        /**
         * Bind the click event handler to the button to draw the chart.
         */
        $('#' + containerId).on('click', '#btn-draw', function () {
            var chartType = $('#chart-type').val();
            portal.dashboards.api.state.setLocalState(containerId.replace('widget_', ''), 'chartType', chartType);
            renderChart(containerId);
        });
    };

    portal.dashboards.widgets['org.wso2.carbon.dashboards.sample.store.widget-state'].actions = {
        render: render
    };
}());