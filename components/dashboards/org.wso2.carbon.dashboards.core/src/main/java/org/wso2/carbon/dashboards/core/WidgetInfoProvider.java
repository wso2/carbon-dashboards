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

import org.wso2.carbon.dashboards.core.bean.widget.WidgetMetaInfo;
import org.wso2.carbon.dashboards.core.exception.DashboardRuntimeException;

import java.nio.file.Path;
import java.util.Optional;
import java.util.Set;

/**
 * Provider for widget related information.
 *
 * @since 4.0.0
 */
public interface WidgetInfoProvider {

    /**
     * Returns the configuration of the specified widget.
     *
     * @param widgetName name of the widget
     * @return configuration of the widget
     * @throws DashboardRuntimeException if an error occurred when reading or processing configuration of the widget
     */
    Optional<WidgetMetaInfo> getWidgetConfiguration(String widgetName) throws DashboardRuntimeException;

    /**
     * Returns configurations of al available widgets.
     *
     * @return configurations of the widgets
     * @throws DashboardRuntimeException if an error occurred when reading or processing configurations
     */
    Set<WidgetMetaInfo> getAllWidgetConfigurations() throws DashboardRuntimeException;

    @Deprecated
    Set<WidgetMetaInfo> getWidgetsMetaInfo();

    @Deprecated
    Optional<String> getWidgetConf(String widgetId);

    @Deprecated
    Optional<Path> getThumbnail(String widgetId);
}
