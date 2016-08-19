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

var insertOrUpdateGadgetUsage, deleteGadgetUsage, getGadgetUsage, updateGadgetState;

(function () {
    var DataBaseHandler = Packages.org.wso2.carbon.dashboard.portal.core.datasource.DataBaseHandler;
    var databaseHandler = DataBaseHandler.getInstance();
    var log = new Log();
    var usr = require('/modules/user.js');
    var carbon = require('carbon');
    var tenantId = carbon.server.tenantId();
    var user = usr.current();

    insertOrUpdateGadgetUsage = function (dashboardId, gadgetID, usageData, state) {
        if (log.isDebugEnabled()) {
            log.debug('Usage data for gadget id - ' + gadgetID + ', dashboard id - ' +
                dashboardId + ',tenantId -' + tenantId + ':' + stringify(usageData))
        }
        if (dashboardId.indexOf('$') > 0) {
            dashboardId = dashboardId + user.username;
        }
        databaseHandler.updateOrInsertGadgetUsageInfo(tenantId, dashboardId, gadgetID, state,
            stringify(usageData));
    };

    deleteGadgetUsage = function (dashboardId, gadgetID) {
        if (log.isDebugEnabled()) {
            log.debug('Deleteing the usage data for gadget id - ' + gadgetID + ', dashboard id - ' +
                dashboardId + ',tenantId -' + tenantId);
        }
        if (dashboardId.indexOf('$') > 0) {
            dashboardId = dashboardId + user.username;
        }
        databaseHandler.deleteGadgetUsageInformation(tenantId, dashboardId, gadgetID);
    };

    getGadgetUsage = function (gadgetId) {
        var gadgetUsage = databaseHandler.getDashboardUsingGadget(tenantId, gadgetId);
        var usage = {dashboards: []};
        for (var index = 0; index < gadgetUsage.size(); index++) {
            usage.dashboards.push(gadgetUsage.get(index));
        }
        return usage;
    };

    updateGadgetState = function (gadgetId, gadgetState) {
        databaseHandler.updateGadgetStateInformation(tenantId, gadgetId, gadgetState.newState);
    }
}());