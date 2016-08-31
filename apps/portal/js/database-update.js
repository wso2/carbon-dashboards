/*
 * Copyright (c) 2015, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

(function () {
    var DATABASE_API = ues.utils.tenantPrefix() + 'apis/database';
    var ASSET_API = ues.utils.tenantPrefix() + 'apis/assets/publicAssets/';

    /* To create usage data for the particular gadget in this dashboard
     * @param id ID of the gadget
     * @param dahshboard which the gadget belongs to
     * @returns {Array} Usage data as a JSON object
     */
    var createUsageData = function (dashboard, id) {
        var usageData = [];
        var area;
        var components;
        var length;
        var component;
        if (dashboard.pages) {
            for (var i = 0; i < dashboard.pages.length; i++) {
                var pageViewCount = 0;
                var pageUsageData = {};
                pageUsageData[dashboard.pages[i].id] = {};
                var views = Object.keys(dashboard.pages[i].content);
                for (var j = 0; j < views.length; j++) {
                    var content = dashboard.pages[i].content[views[j]];
                    var count = 0;
                    for (area in content) {
                        if (content.hasOwnProperty(area)) {
                            components = content[area];
                            length = components.length;
                            for (var k = 0; k < length; k++) {
                                component = components[k];
                                if (component.content.id === id) {
                                    count++;
                                }
                            }
                        }
                    }
                    if (count > 0) {
                        pageUsageData[dashboard.pages[i].id][views[j]] = count;
                        pageViewCount += count;
                    }
                }
                if (pageViewCount > 0) {
                    usageData.push(clone(pageUsageData));
                }
            }
        }
        return usageData;
    };

    /**
     * To re-create the new usage data for the particular gadget based on the user activity
     * @param usageData Usage Data of the gadget that need to be updated
     * @param pageId Id of the page which the gadget belongs to
     * @param viewId Id of the view which the gadget belongs to
     * @param isAdd true if it is a addition activity , unless false
     * @returns the new usage data for the particular gadget
     */
    var manipulateUsageData = function (usageData, pageId, viewId, isAdd) {
        var currentUsageValue = 0;
        usageData = JSON.parse(usageData);
        var usageDataLength = usageData.length;
        if (usageDataLength > 0) {
            for (var index = 0; index < usageDataLength; index++) {
                if (Object.keys(usageData[index]).indexOf(pageId) > -1) {
                    if (Object.keys(usageData[index][pageId]).indexOf(viewId) > -1) {
                        currentUsageValue = usageData[index][pageId][viewId];
                        if (isAdd) {
                            currentUsageValue = currentUsageValue + 1;
                            usageData[index][pageId][viewId] = currentUsageValue;
                        } else {
                            currentUsageValue = currentUsageValue - 1;
                            usageData[index][pageId][viewId] = currentUsageValue;

                            if (currentUsageValue === 0) {
                                delete usageData[index][pageId][viewId];

                                if (Object.keys(usageData[index][pageId]).length === 0) {
                                    usageData.splice(index, 1);
                                }
                            }
                        }
                        return usageData;
                    }
                    if (isAdd) {
                        usageData[index][pageId][viewId] = 1;
                        return usageData;
                    }
                }
            }
            if (isAdd) {
                var pageUsageData = {};
                pageUsageData[pageId] = {};
                pageUsageData[pageId][viewId] = 1;
                usageData.push(pageUsageData);
                return usageData;
            }
        } else {
            if (isAdd) {
                var pageUsageData = {};
                pageUsageData[pageId] = {};
                pageUsageData[pageId][viewId] = 1;
                usageData.push(pageUsageData);
                return usageData;
            }
        }
    };

    /**
     * To update the usage data
     * @param dashboard which the component belongs to
     * @param id Id of the component id
     * @param pageId Id of the page to change the usage
     * @param viewId Id of the view with the change usage
     * @param isAdd is it a addiion of gadget usage or delete of gadget usage
     */
    var updateUsageData = function (dashboard, id, pageId, viewId, isAdd) {
        var usageData = getGadgetUsageInfo(dashboard, id);
        if (usageData) {
            var updatedUsageInfo = manipulateUsageData(usageData, pageId, viewId, isAdd);
            if (updatedUsageInfo && updatedUsageInfo.length > 0) {
                return sendUsageData(dashboard, updatedUsageInfo, id);
            } else if (updatedUsageInfo) {
                return deleteUsageData(dashboard, id);
            } else {
                return true;
            }
        }
    };

    /**
     * When we do not know count of the gadget id. This is mainly used for creating views by copying views
     * @param dashboard Dashboard which the specific data should be updated
     * @param gadgetId Id of the gadget for which the usage data to be updated
     */
    var updateUsageDataInMultipleViews = function (dashboard, gadgetId) {
        var usageData = createUsageData(dashboard, gadgetId);
        if (usageData.length > 0) {
            return sendUsageData(dashboard, usageData, gadgetId);
        } else {
            return deleteUsageData(dashboard, gadgetId);
        }
    };

    /**
     * To get the gadget usage information of the particular gadget in a dashboard
     * @param dashboard Dashboard which the gadget belongs to
     * @param gadgetId Id of the gadget
     * @returns {*} gadget usage info for the particular dashboard
     */
    var getGadgetUsageInfo = function (dashboard, gadgetId) {
        var gadgetUsageInfo = null;
        var dashboardID = dashboard.id;
        if (dashboard.isUserCustom) {
            dashboardID = dashboardID + '$'
        }
        $.ajax({
            url: DATABASE_API + '/' + dashboardID + '/' + gadgetId,
            method: "GET",
            contentType: "application/json",
            async: false,
            success: function (usageData) {
                gadgetUsageInfo = usageData;
            },
            error: function () {
                gadgetUsageInfo = null;
            }
        });

        return gadgetUsageInfo;
    };
    /**
     * To send the usage data to back end
     * @param dashboard
     * @param usageData Usage data to be send to back end
     * @param id ID of the gadget
     */
    var sendUsageData = function (dashboard, usageData, id) {
        var dashboardID = dashboard.id;
        var isSuccess = false;
        if (dashboard.isUserCustom) {
            dashboardID = dashboardID + '$'
        }
        var state = isGadgetExist(id);
        $.ajax({
            url: DATABASE_API + '/' + dashboardID + '/' + id + '?task=insert&state=' + state,
            method: "POST",
            data: JSON.stringify(usageData),
            contentType: "application/json",
            async: false,
            success: function () {
                isSuccess = true
            },
            error: function () {
                isSuccess = false;
            }
        });
        return isSuccess;
    };

    /**
     * To delete the usage data in the back end when the relevant gadget is deleted
     * @param id ID of the gadget
     * @param dashboard which the gadget belongs to
     */
    var deleteUsageData = function (dashboard, id) {
        var dashboardID = dashboard.id;
        var isSuccess = false;
        if (dashboard.isUserCustom) {
            dashboardID = dashboardID + '$'
        }
        $.ajax({
            url: DATABASE_API + '/' + dashboardID + '/' + id + '?task=delete',
            method: "DELETE",
            contentType: "application/json",
            async: false,
            success: function () {
                isSuccess = true;
            },
            error: function () {
                isSuccess = false;
            }
        });
        return isSuccess;
    };

    /**
     * To check whether gadget exist in the store
     * @param id
     * @returns {string}
     */
    var isGadgetExist = function (id) {
        var status = 'ACTIVE';
        $.ajax({
            url: ASSET_API + id + '?type=gadget',
            method: 'GET',
            async: false,
            contentType: 'application/json'
        }).error(function (xhr) {
            if (xhr.status === 404) {
                status = 'DELETED';
            }
        });
        return status;
    };

    /**
     * Clone JSON object.
     * @param {Object} o    Object to be cloned
     * @return {Object}
     * @private
     */
    var clone = function (o) {
        return JSON.parse(JSON.stringify(o));
    };

    ds.database = {
        updateUsageData: updateUsageData,
        updateUsageDataInMultipleViews: updateUsageDataInMultipleViews
    };
}());