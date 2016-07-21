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

/**
 * Implements dashboard API get dashboard info.
 */
wso2.gadgets.dashboardInfo = (function () {

    /**
     * RPC service name of getting dashboard ID
     * @const
     * @private
     */
    var RPC_SERVICE_GETDASHBOARDID_CALL = 'RPC_SERVICE_GETDASHBOARDID_CALL';

    /**
     * RPC service name of getting dashboard ID
     * @const
     * @private
     */
    var RPC_SERVICE_GETDASHBOARDNAME_CALL = 'RPC_SERVICE_GETDASHBOARDNAME_CALL';

    /**
     * return  id of the dashboard
     * @return {dashboardID}
     */
    var getDashboardID = function (callback) {
        return wso2.gadgets.core.callContainerService(RPC_SERVICE_GETDASHBOARDID_CALL, null, function (dashboardID) {
            if (callback) {
                callback(dashboardID);
            }
        });
    };

    /**
     * return  id of the dashboard
     * @return {dashboardID}
     */
    var getDashboardName = function (callback) {
        return wso2.gadgets.core.callContainerService(RPC_SERVICE_GETDASHBOARDNAME_CALL, null, function (dashboardName) {
            if (callback) {
                callback(dashboardName);
            }
        });
    };

    return {
        getDashboardID: getDashboardID,
        getDashboardName: getDashboardName
    };
})();