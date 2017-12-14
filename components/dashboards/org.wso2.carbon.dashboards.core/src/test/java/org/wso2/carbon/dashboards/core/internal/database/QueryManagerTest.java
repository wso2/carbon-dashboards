/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package org.wso2.carbon.dashboards.core.internal.database;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.wso2.carbon.dashboards.core.bean.DashboardConfigurations;
import org.wso2.carbon.dashboards.core.exception.DashboardRuntimeException;

import static org.wso2.carbon.dashboards.core.internal.database.QueryManager.DEFAULT_DB_TYPE;
import static org.wso2.carbon.dashboards.core.internal.database.QueryManager.DEFAULT_DB_VERSION;

/**
 * Test cases for {@link QueryManager} class.
 *
 * @since 4.0.0
 */
public class QueryManagerTest {

    @Test
    void testGetQueryWithInvalidParams() {
        QueryManager queryManager = new QueryManager(new DashboardConfigurations());
        Assertions.assertThrows(DashboardRuntimeException.class, () -> queryManager.getQuery("foo", null, null));
        Assertions.assertThrows(DashboardRuntimeException.class,
                                () -> queryManager.getQuery(DEFAULT_DB_TYPE, "1.0.0", null));
        Assertions.assertThrows(DashboardRuntimeException.class,
                                () -> queryManager.getQuery(DEFAULT_DB_TYPE, DEFAULT_DB_VERSION, "bar"));
    }

    @Test
    void testGetQueryWithParams() {
        QueryManager queryManager = new QueryManager(new DashboardConfigurations());
        String query = queryManager.getQuery(DEFAULT_DB_TYPE, DEFAULT_DB_VERSION, "add_dashboard");
        Assertions.assertNotNull(query, "SQL query cannot be null");
    }

    @Test
    void testGetQuery() {
        QueryManager queryManager = new QueryManager(new DashboardConfigurations());
        String query = queryManager.getQuery("add_dashboard");
        Assertions.assertNotNull(query, "SQL query cannot be null");
    }
}
