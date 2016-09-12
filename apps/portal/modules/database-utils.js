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

var insertOrUpdateGadgetUsage;
var deleteGadgetUsage;
var getGadgetUsage;
var updateGadgetState;
var updateAfterDeletingDashboard;
var isDashboardExistInDatabase;
var checkDefectiveDashboard;
var checkDefectivePages;
var getGadgetUsageInfoOfADashboard;
(function () {
    var DSDataSourceManager = Packages.org.wso2.carbon.dashboard.portal.core.datasource.DSDataSourceManager;
    var dsDataSourceManager = DSDataSourceManager.getInstance();
    var log = new Log("database-utils.js");
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
        dsDataSourceManager.updateOrInsertGadgetUsageInfo(tenantId, dashboardId, gadgetID, state,
            stringify(usageData));
    };

    deleteGadgetUsage = function (dashboardId, gadgetID) {
        if (log.isDebugEnabled()) {
            log.debug('Deleteing the usage data for gadget id - ' + gadgetID + ', dashboard id - ' +
                dashboardId + ',tenantId -' + tenantId);
        }
        dashboardId = updateDashboardIdForPersonalizedDashboards(dashboardId);
        dsDataSourceManager.deleteGadgetUsageInformation(tenantId, dashboardId, gadgetID);
    };

    getGadgetUsage = function (gadgetId) {
        var gadgetUsage = dsDataSourceManager.getDashboardUsingGadget(tenantId, gadgetId);
        var usage = {dashboards: []};
        var gadgetUsageSize = gadgetUsage.size();
        for (var index = 0; index < gadgetUsageSize; index++) {
            usage.dashboards.push(gadgetUsage.get(index));
        }
        return usage;
    };

    getGadgetUsageInfoOfADashboard = function (dashboardId, gadgetId) {
        dashboardId = updateDashboardIdForPersonalizedDashboards(dashboardId);
        var gadgetUsageInfoForDashboard = dsDataSourceManager.getGadgetUsageInfo(tenantId, dashboardId, gadgetId);
        return gadgetUsageInfoForDashboard ? gadgetUsageInfoForDashboard : [];
    };

    updateGadgetState = function (gadgetId, gadgetState) {
        dsDataSourceManager.updateGadgetStateInformation(tenantId, gadgetId, gadgetState.newState);
    };

    updateAfterDeletingDashboard = function (dashboardId) {
        dashboardId = updateDashboardIdForPersonalizedDashboards(dashboardId);
        dsDataSourceManager.updateAfterDeletingDashboard(tenantId, dashboardId);
    };


    isDashboardExistInDatabase = function (dashboardId) {
        dashboardId = updateDashboardIdForPersonalizedDashboards(dashboardId);
        return dsDataSourceManager.checkDashboard(tenantId, dashboardId);
    };

    checkDefectiveDashboard = function (dashboardId, isUserCustom) {
        if (isUserCustom){
            dashboardId = updateDashboardIdForPersonalizedDashboards(dashboardId + '$');
        }
        return dsDataSourceManager.isDashboardDefective(tenantId, dashboardId);
    };
    
    checkDefectivePages = function (dashboardId) {
        dashboardId = updateDashboardIdForPersonalizedDashboards(dashboardId);
        var usageData = dsDataSourceManager.getDefectiveUsageData(tenantId, dashboardId);
        var usage = {data: []};
        var usageDataSize = usageData.size();
        for (var index = 0; index < usageDataSize; index++) {
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