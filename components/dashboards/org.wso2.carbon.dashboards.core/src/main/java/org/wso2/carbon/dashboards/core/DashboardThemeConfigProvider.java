/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package org.wso2.carbon.dashboards.core;

import org.wso2.carbon.dashboards.core.exception.DashboardException;

/**
 * Dashboard theme configuration interface.
 */
public interface DashboardThemeConfigProvider {

    /**
     * Prevents unauthorized access to data provider.
     *
     * @param username full username(ex: admin@carbon.super).
     * @return dashboard logo path.
     * @throws DashboardException if getting dashboard logo failed due to exception.
     */
    String getLogoPath(String username) throws DashboardException;
}
