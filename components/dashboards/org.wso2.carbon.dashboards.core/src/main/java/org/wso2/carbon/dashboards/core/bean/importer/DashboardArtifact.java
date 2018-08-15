/*
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

package org.wso2.carbon.dashboards.core.bean.importer;

import org.wso2.carbon.dashboards.core.bean.DashboardMetadata;

/**
 * Defines a dashboard data format to import/export a dashboard.
 *
 * @since 4.0.29
 */
public class DashboardArtifact {
    private DashboardMetadata dashboard;
    private WidgetCollection widgets = new WidgetCollection();

    /**
     * Returns dashboard metadata object.
     *
     * @return Dashboard metadata
     */
    public DashboardMetadata getDashboard() {
        return dashboard;
    }

    /**
     * Set dashboard metadata object.
     *
     * @param dashboard Dashboard metadata
     */
    public void setDashboard(DashboardMetadata dashboard) {
        this.dashboard = dashboard;
    }

    /**
     * Returns widgets.
     *
     * @return Set of widgets
     */
    public WidgetCollection getWidgets() {
        return widgets;
    }

    /**
     * Set widgets.
     *
     * @param widgets Set of widgets
     */
    public void setWidgets(WidgetCollection widgets) {
        this.widgets = widgets;
    }
}
