/*
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var getConfig, validate, isProviderRequired, draw, update;

(function () {

    var CHART_LOCATION = '/extensions/chart-templates/';

    /**
     * return the config to be populated in the chart configuration UI
     * @param schema
     */
    getConfig = function (schema){
       var chartConf = require(CHART_LOCATION + '/bar-chart/config.json').config;
       return chartConf;

    };

    /**
     * validate the user inout for the chart configuration
     * @param chartConfig
     */
    validate = function (chartConfig){

    };

    /**
     * TO be used when provider configuration steps need to be skipped
     */
    isProviderRequired = function (){

    }


    /**
     * return the gadget content
     * @param chartConfig
     * @param schema
     * @param data
     */
    draw = function (chartConfig, schema, data) {

        /*
         chartConfig

         {
            "fieldName":"value",
            "fieldName":"value"
         }
         */

    };

    /**
     *
     * @param data
     */
    update = function (data){

    }
}());