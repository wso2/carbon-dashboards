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

    var MetadataProviderImpl = Java.type("org.wso2.carbon.dashboards.metadata.internal.provider.impl.MetadataProviderImpl");
    var Query = Java.type("org.wso2.carbon.dashboards.metadata.bean.Query");

    var dashboardContent;
    var dashboardMetaData;
    var dashboardExistance;

    var metadataProviderImpl = new MetadataProviderImpl();
    var query = new Query();
    query.setUrl(env.params.id);
    //TODO: Need to update the hardcoded values with logged in user
    query.setOwner("admin");

    try {
        dashboardExistance = metadataProviderImpl.isExists(query);
    } catch (e) {
        Log.error(e);
        sendError(500, "Error in accessing dashboard DB !");
    }

    if (!dashboardExistance) {
        try {
            dashboardMetaData = null;
            dashboardContent = JSON.parse(new string(files.readAllBytes(paths.get(path))));
            if (Log.isDebugEnabled) {
                Log.debug("Dashboard is retrieved from File system");
            }
        } catch (e) {
            //TODO: change this to log.error(message,e) when the UUF provides the support
            Log.error(e);
            sendError(500, "Error in reading dashboard JSON file !");
        }
    } else {
        dashboardMetaData = metadataProviderImpl.get(query);
        dashboardContent = JSON.parse(dashboardMetaData.getContent());
        if (Log.isDebugEnabled) {
            Log.debug("Dashboard is retrieved from DB");
        }
    }

    // Send the dashboard and metadata to client
    sendToClient("dashboardMetadata", {dashboard: dashboardContent, metadata: dashboardMetaData});
    return {
        dashboard: dashboardContent,
        metadata: dashboardMetaData
    };
}