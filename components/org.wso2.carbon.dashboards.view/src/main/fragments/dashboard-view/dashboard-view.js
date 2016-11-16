/**
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
function onRequest(env) {
    'use strict';
    // Get dashboard by ID.
    var system = Java.type('java.lang.System');
    //construct dashboard.json path
    var path = system.getProperty('carbon.home') + '/deployment/dashboards/' + env.params.id + '.json';
    var string = Java.type('java.lang.String');
    var files = Java.type('java.nio.file.Files');
    var paths = Java.type('java.nio.file.Paths');

    try{
        var content = JSON.parse(new string(files.readAllBytes(paths.get(path))));
    } catch(Exception) {
        Log.error(Exception);
        sendError(500, "Something went wrong!");
    }
    // Send the dashboard to client
    sendToClient("dashboard", content);
    return {
        dashboard: content
    };
}