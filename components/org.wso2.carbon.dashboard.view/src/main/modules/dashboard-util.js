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
var dashboardUtil = {};
(function () {
    'use strict';

    /**
     * Get the dashboard using dashboard id.
     * @param id {string} dashboard id.
     * @return {object} dashboard json
     * */
    function getDashboard(id) {
        //TODO: Get the dashboard from file system or DB using the ID.
        if (id === "test") {
            return {
                "name": "Test Dashboard",
                "id": id,
                "version": "1.0.2",
                "description": "",
                "blocks": [{
                    "height": 3,
                    "id": "a",
                    "width": 12,
                    "x": 0,
                    "y": 0
                }, {
                    "height": 3,
                    "id": "b",
                    "width": 12,
                    "x": 0,
                    "y": 3
                }, {
                    "height": 3,
                    "id": "c",
                    "width": 12,
                    "x": 0,
                    "y": 6
                }],
                "widgets": {
                    "a": {
                        "id": "bar-chart",
                        "url": "/portal/fragments/org.wso2.carbon.dashboards.portal.feature.bar-chart",
                        "permission": []
                    },
                    "b": {
                        "id": "pie-chart",
                        "url": "/portal/fragments/org.wso2.carbon.dashboards.portal.feature.pie-chart",
                        "permission": []
                    }
                },
                "permission": {
                    "editor": [],
                    "viewer": [],
                    "owner": []
                }
            };
        } else {
            return {
                "name": "Sample Dashboard",
                "id": id,
                "version": "1.0.2",
                "description": "",
                "blocks": [{
                    "height": 3,
                    "id": "a",
                    "width": 12,
                    "x": 0,
                    "y": 0
                }, {
                    "height": 3,
                    "id": "b",
                    "width": 12,
                    "x": 0,
                    "y": 3
                }, {
                    "height": 3,
                    "id": "c",
                    "width": 12,
                    "x": 0,
                    "y": 6
                }],
                "widgets": {
                    "a": {
                        "id": "bar-chart",
                        "url": "/portal/fragments/org.wso2.carbon.dashboards.portal.feature.bar-chart",
                        "permission": []
                    },
                    "b": {
                        "id": "pie-chart",
                        "url": "/portal/fragments/org.wso2.carbon.dashboards.portal.feature.pie-chart",
                        "permission": []
                    },
                    "c": {
                        "id": "publisher",
                        "url": "/portal/fragments/org.wso2.carbon.dashboards.portal.feature.publisher",
                        "permission": []
                    }
                },
                "permission": {
                    "editor": [],
                    "viewer": [],
                    "owner": []
                }
            };
        }
    }

    /**
     * Save the changes happens to the dashboard.
     * @return {boolean} success state
     * */
    function saveDashboard(dashboard) {
        return true;
    }

    dashboardUtil = {
        getDashboard: getDashboard,
        saveDashboard: saveDashboard
    };
}());