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
package org.wso2.carbon.dashboards.core;

import org.wso2.carbon.analytics.permissions.bean.Role;
import org.wso2.carbon.dashboards.core.bean.DashboardMetadata;
import org.wso2.carbon.dashboards.core.exception.DashboardException;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * Provider for dashboards related information.
 *
 * @since 4.0.0
 */
public interface DashboardMetadataProvider {

    /**
     * Returns the dashboard for the given URL.
     *
     * @param dashboardUrl URL of the dahsboard
     * @return dashboard
     * @throws DashboardException
     */
    Optional<DashboardMetadata> get(String dashboardUrl) throws DashboardException;

    Set<DashboardMetadata> getAll() throws DashboardException;

    void add(DashboardMetadata dashboardMetadata) throws DashboardException;

    void update(DashboardMetadata dashboardMetadata) throws DashboardException;

    void delete(String dashboardUrl) throws DashboardException;

    Map<String, List<Role>> getDashboardRoles(String dashboardUrl);

    List<org.wso2.carbon.analytics.idp.client.core.models.Role> getAllRoles() throws DashboardException;

    List<org.wso2.carbon.analytics.idp.client.core.models.Role> getRolesByUsername(String username)
            throws DashboardException;

    void updateDashboardRoles(String dashboardUrl, Map<String, List<String>> roles) throws DashboardException;
}
