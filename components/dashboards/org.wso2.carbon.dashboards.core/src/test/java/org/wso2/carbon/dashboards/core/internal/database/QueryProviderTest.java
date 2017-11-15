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

import static org.wso2.carbon.dashboards.core.internal.database.QueryProvider.DEFAULT_DB_TYPE;
import static org.wso2.carbon.dashboards.core.internal.database.QueryProvider.DEFAULT_DB_VERSION;

/**
 * Test cases for {@link QueryProvider} class.
 *
 * @since 4.0.0
 */
public class QueryProviderTest {

    @Test
    void testGetQueryWithInvalidParams() {
        QueryProvider queryProvider = new QueryProvider(new DashboardConfigurations());
        Assertions.assertThrows(DashboardRuntimeException.class, () -> queryProvider.getQuery("foo", null, null));
        Assertions.assertThrows(DashboardRuntimeException.class,
                                () -> queryProvider.getQuery(DEFAULT_DB_TYPE, "1.0.0", null));
        Assertions.assertThrows(DashboardRuntimeException.class,
                                () -> queryProvider.getQuery(DEFAULT_DB_TYPE, DEFAULT_DB_VERSION, "bar"));
    }

    @Test
    void testGetQueryWithParams() {
        QueryProvider queryProvider = new QueryProvider(new DashboardConfigurations());
        String query = queryProvider.getQuery(DEFAULT_DB_TYPE, DEFAULT_DB_VERSION, "add_dashboard");
        Assertions.assertNotNull(query, "SQL query cannot be null");
    }

    @Test
    void testGetQuery() {
        QueryProvider queryProvider = new QueryProvider(new DashboardConfigurations());
        String query = queryProvider.getQuery("add_dashboard");
        Assertions.assertNotNull(query, "SQL query cannot be null");
    }
}
