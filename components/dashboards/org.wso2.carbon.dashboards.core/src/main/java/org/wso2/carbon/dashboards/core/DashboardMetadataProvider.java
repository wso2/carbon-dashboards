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
import org.wso2.carbon.dashboards.core.bean.DashboardConfigurations;
import org.wso2.carbon.dashboards.core.bean.DashboardMetadata;
import org.wso2.carbon.dashboards.core.bean.importer.DashboardArtifact;
import org.wso2.carbon.dashboards.core.exception.DashboardException;
import org.wso2.carbon.uiserver.api.App;

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
     * Initializes dashboard provider. This should be invoked before any operations.
     *
     * @param dashboardApp dashboard portal app
     * @since 4.0.32
     */
    void init(App dashboardApp);

    /**
     * Returns the widget provider.
     *
     * @return widget provider.
     * @since 4.0.32
     */
    WidgetMetadataProvider getWidgetMetadataProvider();

    /**
     * Returns the dashboard for the given URL.
     *
     * @param dashboardUrl URL of the dahsboard
     * @return dashboard
     * @throws DashboardException
     */
    Optional<DashboardMetadata> get(String dashboardUrl) throws DashboardException;

    Optional<DashboardMetadata> getDashboardByUser(String user, String dashboardUrl, String originComponent) throws
            DashboardException;

    Set<DashboardMetadata> getAllByUser(String user) throws DashboardException;

    /**
     * Add dashboard without permission check.
     *
     * @since 4.0.29
     *
     * @param dashboardMetadata Dashboard metadata
     * @throws DashboardException
     */
    void add(DashboardMetadata dashboardMetadata) throws DashboardException;

    /**
     * Add dashboard with permission check for the given user.
     *
     * @param user Username
     * @param dashboardMetadata Dashboard metadata
     * @throws DashboardException
     */
    void add(String user, DashboardMetadata dashboardMetadata) throws DashboardException;

    /**
     * Update dashboard without permission check.
     *
     * @since 4.0.29
     *
     * @param dashboardMetadata Dashboard metadata
     * @throws DashboardException
     */
    void update(DashboardMetadata dashboardMetadata) throws DashboardException;

    /**
     * Update dashboard with permission check for the given user.
     *
     * @param user Username
     * @param dashboardMetadata Dashboard metadata
     * @throws DashboardException
     */
    void update(String user, DashboardMetadata dashboardMetadata) throws DashboardException;

    void delete(String user, String dashboardUrl) throws DashboardException;

    Map<String, List<Role>> getDashboardRoles(String dashboardUrl) throws DashboardException;

    List<org.wso2.carbon.analytics.idp.client.core.models.Role> getAllRoles() throws DashboardException;

    List<org.wso2.carbon.analytics.idp.client.core.models.Role> getRolesByUsername(String username)
            throws DashboardException;

    void updateDashboardRoles(String user, String dashboardUrl, Map<String, List<String>> roles) throws
            DashboardException;

    /**
     * Return exportable dashboard definition.
     *
     * @since 4.0.29
     *
     * @param dashboardUrl URL of the dashboard
     * @return Exportable dashboard definition
     * @throws DashboardException If an error occurred while reading or processing dashboards
     */
    DashboardArtifact exportDashboard(String dashboardUrl) throws DashboardException;

    DashboardConfigurations getReportGenerationConfigurations();

}
