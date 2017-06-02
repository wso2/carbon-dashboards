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
function onGet(env) {
    'use strict'
    var id = env.pathParams['id'];
    var MetadataProviderImpl = Java.type("org.wso2.carbon.dashboards.core.internal.provider.impl.DashboardMetadataProviderImpl");
    var Query = Java.type("org.wso2.carbon.dashboards.core.bean.Query");
    var metadataProviderImpl = new MetadataProviderImpl();
    var user = getSession().getUser();
    var query = new Query(user.getUsername(), id);

    var metadata = metadataProviderImpl.get(query);
    if (!metadata) {
        sendError(404, 'Dashboard not found');
    }
    return {
        dashboard: metadata.getContent()
    };
}