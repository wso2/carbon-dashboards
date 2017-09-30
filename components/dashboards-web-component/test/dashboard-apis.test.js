/*
 *  Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */

import {describe, it} from "mocha";
import DashboardsAPIs from '../src/utils/apis/DashboardAPIs';
import {assert} from 'chai';
import TestUtils from './utils/test-utils';

TestUtils.setupMockEnvironment();

describe('Dashboard',
    function () {

        let sampleDashboardArray = [{
            "url": "sampledashboard",
            "name": "Sample Dashboard",
            "description": "Lorem ipsum dolor sit amet DAS",
            "landingPage": "page0",
            "parentId": "1",
            "pages": {}
        }, {
            "url": "sampledashboard2",
            "name": "Sample Dashboard 2",
            "description": "Lorem ipsum dolor sit amet DAS",
            "landingPage": "page0",
            "parentId": "1",
            "pages": {}
        }];

        let sampleDashboardJson = sampleDashboardArray[0];
        const HTTP_STATUS_CODE_OK = 200;
        const HTTP_STATUS_CODE_CREATED = 201;
        let dashboardsAPIs = new DashboardsAPIs();

        describe('#createDashboard()',
            function () {
                it('Should return HTTP 201 status code for newly created Dashboard',
                    function () {
                        sampleDashboardArray.forEach(dashboardJSON => {
                            let promised_create = dashboardsAPIs.createDashboard(dashboardJSON);
                            return promised_create.then((response) => {
                                assert.equal(response.status, HTTP_STATUS_CODE_CREATED, 'Error in creating the dashboard -' +
                                    ' Failed !');
                            });
                        });
                    }
                );
            }
        );
        describe('#getDashboardList()',
            function () {
                it('Should return HTTP 200 status code with dashboard list',
                    function () {
                        let promised_get_list = dashboardsAPIs.getDashboardList();
                        return promised_get_list.then((response) => {
                            assert.equal(response.status, HTTP_STATUS_CODE_OK, 'Error in retrieving dashboard list -' +
                                ' Failed !');
                            assert.equal(response.data.length, 2, 'Error in retrieving dashboard' +
                                ' list -' +
                                ' Failed !');
                            assert.equal(response.data[0].url, "sampledashboard2", 'Error in retrieving dashboard' +
                                ' list -' +
                                ' Failed !');
                            assert.equal(response.data[1].url, "sampledashboard", 'Error in retrieving dashboard' +
                                ' list -' +
                                ' Failed !');
                        });
                    }
                );
            }
        );
        describe('#getDashboardById()',
            function () {
                it('Should return HTTP 200 status code with dashboard content with given ID',
                    function () {
                        let promised_get_dashboard = dashboardsAPIs.getDashboardByID("sampledashboard");
                        return promised_get_dashboard.then((response) => {
                            assert.equal(response.status, HTTP_STATUS_CODE_OK, 'Error in retrieving dashboard list - ' +
                                'Failed !');
                            assert.equal(response.data.url, sampleDashboardJson.url, 'Dashboard content - URL is' +
                                ' different' +
                                ' - Failed !');
                            assert.equal(response.data.name, sampleDashboardJson.name, 'Dashboard content - Name is' +
                                ' different' +
                                ' - Failed !');
                            assert.equal(response.data.description, sampleDashboardJson.description, 'Dashboard content' +
                                ' Description is different - Failed !');
                            assert.equal(response.data.landingPage, sampleDashboardJson.landingPage, 'Dashboard content' +
                                ' LandingPage is different - Failed !');
                            assert.equal(response.data.parentId, sampleDashboardJson.parentId, 'Dashboard content' +
                                ' ParentId is different - Failed !');
                        });
                    }
                );
            }
        );
        describe('#updateDashboardByID()',
            function () {
                it('Should return HTTP 200 status code for given dashboard ID',
                    function () {
                        sampleDashboardJson.landingPage = "page1";
                        let promised_update_dashboard = dashboardsAPIs.updateDashboardByID(sampleDashboardJson.url,
                            sampleDashboardJson);
                        return promised_update_dashboard.then((response) => {
                            assert.equal(response.status, HTTP_STATUS_CODE_OK, 'Error in updating dashboard - Failed !');
                        });
                    }
                );
            }
        );
        describe('#deleteDashboardByID()',
            function () {
                it('Should return HTTP 200 status code by deleting the dashboard with given ID',
                    function () {
                        sampleDashboardArray.forEach(dashboardJSON => {
                            let promised_deleted = dashboardsAPIs.deleteDashboardByID(dashboardJSON.url);
                            return promised_deleted.then((response) => {
                                assert.equal(response.status, HTTP_STATUS_CODE_OK, 'Error in deleting the dashboard - ' +
                                    'Failed !');
                            });
                        });
                    }
                );
            }
        );
    }
);