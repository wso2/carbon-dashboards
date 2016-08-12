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
var carbon = require('carbon');
var utils = require('/modules/utils.js');
var constants = require('/modules/constants.js');

/**
 * get all the dashboards of a given tenant
 * @param tenantDomain tenant Domain of the tenant
 * @returns {Array} dashboards of the tenant
 */
var getTenantDashboards = function (tenantDomain) {
    var server = new carbon.server.Server();
    var alldashboards = [];
    var id = carbon.server.tenantId({domain: tenantDomain});
    utils.startTenantFlow(id);
    var tenantRegistry = new carbon.registry.Registry(server, {
        system: true,
        tenantId: id
    });
    var tenantDashboards = tenantRegistry.content(registryPath());

    for (var dashboardCount = 0; dashboardCount < tenantDashboards.length; dashboardCount++) {
        alldashboards.push(JSON.parse(tenantRegistry.content(tenantDashboards[dashboardCount])));
    }
    utils.endTenantFlow();
    return alldashboards;
};

/**
 * update and create the dashboards with given tenant
 * @param tenantDomain tenant domain of the tenant
 * @param dashboard dashboard to be updated
 */
var updateTenantDashboards = function (tenantDomain, dashboard) {
    var server = new carbon.server.Server();
    var alldashboards = [];
    var tenantId = carbon.server.tenantId({domain: tenantDomain});
    utils.startTenantFlow(tenantId);
    var tenantRegistry = new carbon.registry.Registry(server, {
        system: true,
        tenantId: tenantId
    });
    tenantRegistry.put(registryPath() + '/' + dashboard.id, {
        content: JSON.stringify(dashboard),
        mediaType: 'application/json'
    });
    utils.endTenantFlow();
};

/**
 * Get the registry path for the id.
 * @param {String} id Id of the dashboard
 * @return {String} Registry Path to dashboard
 * */
var registryPath = function (id) {
    return id ? constants.DASHBOARD_REGISTRY_PATH + '/' + id : constants.DASHBOARD_REGISTRY_PATH;
};
