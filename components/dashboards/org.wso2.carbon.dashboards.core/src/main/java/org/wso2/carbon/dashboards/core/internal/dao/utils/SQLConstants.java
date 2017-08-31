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
package org.wso2.carbon.dashboards.core.internal.dao.utils;

/**
 * Class to define SQL queries and constants
 */
public class SQLConstants {

    public static final String ADD_DASHBOARD_CONTENT_QUERY = "add_dashboard";
    public static final String GET_DASHBOARD_METADATA_LIST_QUERY = "get_dashboard_metadata_list";
    public static final String GET_DASHBOARD_BY_URL_QUERY = "get_dashboard_by_url";
    public static final String DELETE_DASHBOARD_BY_URL_QUERY = "delete_dashboard_by_url";
    public static final String UPDATE_DASHBOARD_CONTENT_QUERY = "update_dashboard_content";

    public static final String DASHBOARD_URL = "DASHBOARD_URL";
    public static final String DASHBOARD_NAME = "DASHBOARD_NAME";
    public static final String DASHBOARD_DESCRIPTION = "DASHBOARD_DESCRIPTION";
    public static final String DASHBOARD_CONTENT = "DASHBOARD_CONTENT";
    public static final String DASHBOARD_PARENT_ID = "DASHBOARD_PARENT_ID";
    public static final String DASHBOARD_ID = "DASHBOARD_ID";
    public static final String DASHBOARD_LANDING_PAGE = "DASHBOARD_LANDING_PAGE";
}
