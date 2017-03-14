/**
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
function onGet(env) {
    'use strict';
    var dashboardContent;
    var dashboardMetaData = null;
    var isDashboardExistsInDB;

    var MetadataProviderImpl = Java.type("org.wso2.carbon.dashboards.core.internal.provider.impl.DashboardMetadataProviderImpl");
    var Query = Java.type("org.wso2.carbon.dashboards.core.bean.Query");

    var metadataProviderImpl = new MetadataProviderImpl();
    var query = new Query();
    //var user = getSession().getUser();
    query.setUrl(env.params.id);
    query.setOwner("admin");

    // try {
    //     isDashboardExistsInDB = metadataProviderImpl.isExists(query);
    // } catch (e) {
    //     sendError(401, "Error in accessing dashboard DB.");
    // }
    //
    // if(isDashboardExistsInDB){
    //     dashboardMetaData = metadataProviderImpl.get(query);
    //     dashboardContent = JSON.parse(dashboardMetaData.getContent());
    // } else {
    //     sendError(401, "No dashboards found !");
    // }

    var system = Java.type('java.lang.System');
    //construct dashboard.json path
    var path = system.getProperty('carbon.home') + '/deployment/dashboards/' + env.params.id + '.json';
    var string = Java.type('java.lang.String');
    var files = Java.type('java.nio.file.Files');
    var paths = Java.type('java.nio.file.Paths');

    dashboardContent = JSON.parse(new string(files.readAllBytes(paths.get(path))));

    // Send the dashboard and metadata to client
    sendToClient("dashboardMetadata", {dashboard: dashboardContent, metadata: dashboardMetaData});
    return {
        dashboard: dashboardContent,
        metadata: dashboardMetaData
    };

}