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
var getConfig, validate, getMode, getSchema, getData, registerCallBackforPush;

(function () {

    var PROVIDERS_LOCATION = '/extensions/providers/';

    /**
     * require the existing config.json and push any dynamic fields that needs to be populated in the UI
     */
    getConfig = function (){
        var formConfig = require(PROVIDERS_LOCATION + '/rdbms/config.json');
        /*
         dynamic logic goes here
         */
        return formConfig;
    }

    /**
     * validate the user input of provider configuration
     * @param providerConfig
     */
    validate = function (providerConfig){
        return true;
    }

    /**
     * returns the data mode either push or pull
     */
    getMode = function (){

    }

    /**
     * returns an array of column names & types
     * @param providerConfig
     */
    getSchema = function (providerConfig) {


        /*
         accepting data format

         {
         fieldName : aaa
         FieldValue : bbb
         },
         {
         fieldName : ccc
         FieldValue : ddd
         }
         */
    };

    /**
     * returns the actual data
     * @param providerConfig
     * @param schemaPropertyList
     */
    getData = function (providerConfig,schemaPropertyList) {

        /*
         schemaPropertyList - an array of column names
         */
    };

    /**
     *
     * @param providerConfig
     * @param schema
     */
    registerCallBackforPush = function (providerConfig, schema){

    }

}());