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
function onGet(){
    var userDomain = "admin";
    var superDomain = "admin";

    // TODO Need to move following section to the client side.

    var MetadataProviderImpl = Java.type("org.wso2.carbon.dashboards.core.internal.provider.impl.DashboardMetadataProviderImpl");
    var Query = Java.type("org.wso2.carbon.dashboards.core.bean.Query");
    var PaginationContext = Java.type('org.wso2.carbon.dashboards.core.bean.PaginationContext');
    var metadataProviderImpl = new MetadataProviderImpl();
    var dashboards = metadataProviderImpl.list(new Query('admin'), new PaginationContext());

    var data = {
        userDomain: userDomain,
        superDomain: superDomain,
        isSuperDomain: userDomain !== superDomain,
        isNoMobileDevice: true,
        dashboards: []
    };

    for (var i = 0; i < dashboards.length; i++) {
        data.dashboards.push({
            defective: false,
            description: dashboards[i].description,
            editable: true,
            id: dashboards[i].url,
            owner: true,
            pagesAvailable: true,
            shared: false,
            sharedAcrossTenants: false,
            title: dashboards[i].name
        });
    }
    return data;
}