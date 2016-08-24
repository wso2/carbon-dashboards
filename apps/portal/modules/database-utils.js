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

var insertOrUpdateGadgetUsage, deleteGadgetUsage, getGadgetUsage, updateGadgetState, updateDeleteDashboard,
    isDashboardExistInDatabase, checkDefectiveDashboard, checkDefectivePages;

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
        dashboardId = updateDashboardIdForPersonalizedDashboards(dashboardId);
        databaseHandler.updateOrInsertGadgetUsageInfo(tenantId, dashboardId, gadgetID, state,
            stringify(usageData));
    };

    deleteGadgetUsage = function (dashboardId, gadgetID) {
        if (log.isDebugEnabled()) {
            log.debug('Deleteing the usage data for gadget id - ' + gadgetID + ', dashboard id - ' +
                dashboardId + ',tenantId -' + tenantId);
        }
        dashboardId = updateDashboardIdForPersonalizedDashboards(dashboardId);
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
    };

    updateDeleteDashboard = function (dashboardId) {
        dashboardId = updateDashboardIdForPersonalizedDashboards(dashboardId);
        databaseHandler.updateAfterDeletingDashboard(tenantId, dashboardId);
    };


    isDashboardExistInDatabase = function (dashboardId) {
        dashboardId = updateDashboardIdForPersonalizedDashboards(dashboardId);
        return databaseHandler.checkDashboard(tenantId, dashboardId);
    };

    checkDefectiveDashboard = function (dashboardId, isUserCustom) {
        if (isUserCustom){
            dashboardId = updateDashboardIdForPersonalizedDashboards(dashboardId + '$');
        }
        return databaseHandler.isDashboardDefective(tenantId, dashboardId);
    };
    
    checkDefectivePages = function (dashboardId) {
        dashboardId = updateDashboardIdForPersonalizedDashboards(dashboardId);
        var usageData = databaseHandler. getDefectiveUsageData(tenantId, dashboardId);
        var usage = {data: []};
        for (var index = 0; index < usageData.size(); index++) {
            usage.data.push(usageData.get(index));
        }
        return usage;
    };

    /**
     * Dashboard id for the personalized dashboards should be dashboard id + '$ + username
     * @param dashboardId Id of the original dashboard to be updated
     */
    var updateDashboardIdForPersonalizedDashboards = function (dashboardId) {
        if (dashboardId.indexOf('$') > -1) {
            dashboardId = dashboardId + user.username;
        }
        return dashboardId;
    };
}());