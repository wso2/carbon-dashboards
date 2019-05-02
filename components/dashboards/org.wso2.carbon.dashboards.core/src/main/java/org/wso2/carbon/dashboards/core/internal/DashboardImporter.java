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

package org.wso2.carbon.dashboards.core.internal;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.carbon.dashboards.core.DashboardMetadataProvider;
import org.wso2.carbon.dashboards.core.WidgetMetadataProvider;
import org.wso2.carbon.dashboards.core.bean.DashboardMetadata;
import org.wso2.carbon.dashboards.core.bean.importer.DashboardArtifact;
import org.wso2.carbon.dashboards.core.bean.importer.WidgetType;
import org.wso2.carbon.dashboards.core.bean.widget.GeneratedWidgetConfigs;
import org.wso2.carbon.dashboards.core.exception.DashboardException;
import org.wso2.carbon.dashboards.core.internal.io.DashboardArtifactHandler;
import org.wso2.carbon.utils.Utils;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

/**
 * Dashboard importer component. This is used to import dashboards in {DASHBOARD_RUNTIME}/resources/dashboards directory
 * when server starts.
 *
 * @since 4.2.8
 */
public class DashboardImporter {

    private static final Logger LOGGER = LoggerFactory.getLogger(DashboardImporter.class);

    private final DashboardMetadataProvider dashboardMetadataProvider;
    private final WidgetMetadataProvider widgetMetadataProvider;

    public DashboardImporter(DashboardMetadataProvider dashboardMetadataProvider,
                             WidgetMetadataProvider widgetMetadataProvider) {
        this.dashboardMetadataProvider = dashboardMetadataProvider;
        this.widgetMetadataProvider = widgetMetadataProvider;
    }

    public void importDashboards() {
        Path path = Utils.getRuntimePath().resolve(Paths.get("resources", "dashboards"));
        Map<String, DashboardArtifact> dashboardArtifacts;
        try {
            dashboardArtifacts = DashboardArtifactHandler.readArtifactsIn(path);
        } catch (DashboardException e) {
            LOGGER.error("Cannot read dashboard artifacts in '{}' to import.", path, e);
            return;
        }

        for (Map.Entry<String, DashboardArtifact> entry : dashboardArtifacts.entrySet()) {
            DashboardArtifact dashboardArtifact = entry.getValue();
            DashboardMetadata dashboard = dashboardArtifact.getDashboard();
            String dashboardArtifactPath = entry.getKey();
            boolean importedSuccessfully = true;

            // Save the dashboard to DB.
            try {
                if (dashboardMetadataProvider.get(dashboard.getUrl()).isPresent()) {
                    dashboardMetadataProvider.update(dashboard);
                } else {
                    dashboardMetadataProvider.add(dashboard);
                }
            } catch (DashboardException e) {
                LOGGER.warn("Cannot save dashboard importing from '{}' to the database.", dashboardArtifactPath, e);
                continue;
            }

            // Notify missing custom widgets.
            for (String widgetId : dashboardArtifact.getWidgets().getCustom()) {
                try {
                    if (!widgetMetadataProvider.isWidgetPresent(widgetId, WidgetType.ALL)) {
                        LOGGER.warn(
                                "Widget '{}' does not exists. Please copy the widget to " +
                                "'deployment/web-ui-apps/portal/extensions/widgets/' directory.",
                                widgetId);
                    }
                } catch (DashboardException e) {
                    LOGGER.warn(
                            "Cannot check existence of custom widget '{}' which is included in the importing " +
                            "dashboard '{}'.",
                            widgetId, dashboardArtifactPath, e);
                    importedSuccessfully = false;
                }
            }

            // Deploy generated widgets if not available.
            for (GeneratedWidgetConfigs widgetConfigs : dashboardArtifact.getWidgets().getGenerated()) {
                String widgetConfigsId = widgetConfigs.getId();
                try {
                    if (!widgetMetadataProvider.isWidgetPresent(widgetConfigsId, WidgetType.GENERATED)) {
                        widgetMetadataProvider.addGeneratedWidgetConfigs(widgetConfigs);
                    } else {
                        widgetMetadataProvider.updateGeneratedWidgetConfigs(widgetConfigs);
                    }
                    LOGGER.debug("Successfully imported generated widget '{}' from dashboard '{}'.", widgetConfigsId,
                            dashboardArtifactPath);
                } catch (DashboardException e) {
                    LOGGER.warn(
                            "Cannot load generated widget '{}' which is included in the importing dashboard '{}'. " +
                            "Hence, dashboard will be imported partially.",
                            widgetConfigsId, dashboardArtifactPath, e);
                    importedSuccessfully = false;
                }
            }

            DashboardArtifactHandler.markArtifactAsImported(dashboardArtifactPath);
            LOGGER.info("{} imported dashboard '{}' from '{}'.", (importedSuccessfully ? "Successfully" : "Partially"),
                        dashboard.getUrl(), dashboardArtifactPath);
        }
    }
}
