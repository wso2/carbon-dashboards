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

import org.wso2.carbon.dashboards.core.bean.importer.WidgetType;
import org.wso2.carbon.dashboards.core.bean.widget.GeneratedWidgetConfigs;
import org.wso2.carbon.dashboards.core.bean.widget.WidgetMetaInfo;
import org.wso2.carbon.dashboards.core.exception.DashboardException;

import java.util.Optional;
import java.util.Set;

/**
 * Provider for widget related information.
 *
 * @since 4.0.0
 */
public interface WidgetMetadataProvider {

    /**
     * Returns the configuration of the specified widget.
     *
     * @param widgetId id of the widget
     * @return configuration of the widget
     * @throws DashboardException if an error occurred when reading or processing configuration of the widget
     */
    Optional<WidgetMetaInfo> getWidgetConfiguration(String widgetId) throws DashboardException;

    /**
     * Add the configuration of the specified generated widget.
     *
     * @param generatedWidgetConfigs configurations of the generated widget
     * @throws DashboardException if an error occurred when reading or processing configuration of the widget
     */
    void addGeneratedWidgetConfigs(GeneratedWidgetConfigs generatedWidgetConfigs) throws DashboardException;

    /**
     * Update the configuration of the specified generated widget.
     *
     * @param generatedWidgetConfigs configurations of the generated widget
     * @throws DashboardException if an error occurred when reading or processing configuration of the widget
     */
    void updateGeneratedWidgetConfigs(GeneratedWidgetConfigs generatedWidgetConfigs) throws DashboardException;

    /**
     * Returns configurations of al available widgets.
     *
     * @return configurations of the widgets
     * @throws DashboardException if an error occurred when reading or processing configurations
     */
    Set<WidgetMetaInfo> getAllWidgetConfigurations() throws DashboardException;

    /**
     * Get generated widget configurations.
     *
     * @since 4.0.29
     *
     * @param widgetIds List og widget Ids
     * @return Set of widget configurations
     * @throws DashboardException
     */
    Set<GeneratedWidgetConfigs> getGeneratedWidgetConfigs(Set<String> widgetIds) throws DashboardException;

    /**
     * Delete the configuration of the specified widget.
     *
     * @param widgetId id of the widget
     * @throws DashboardException if an error occurred when reading or processing configuration of the widget
     */
    void delete(String widgetId) throws DashboardException;

    /**
     * Check for widget already present in database.
     *
     * @return is widget present condition.
     * @throws DashboardException if an error occurred when reading or processing configurations
     */
    boolean isWidgetPresent(String widgetName) throws DashboardException;

    /**
     * Check if the given widget is present in the filesystem.
     *
     * @since 4.0.29
     *
     * @param widgetName Name fo the widget
     * @param widgetType Type of the widget
     * @return Status
     * @throws DashboardException
     */
    boolean isWidgetPresent(String widgetName, WidgetType widgetType) throws DashboardException;
}
