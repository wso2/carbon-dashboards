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


import com.google.gson.Gson;
import org.osgi.framework.BundleContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.carbon.dashboards.core.DashboardMetadataProvider;
import org.wso2.carbon.dashboards.core.WidgetMetadataProvider;
import org.wso2.carbon.dashboards.core.bean.DashboardMetadata;
import org.wso2.carbon.dashboards.core.bean.importer.DashboardArtifact;
import org.wso2.carbon.dashboards.core.bean.importer.WidgetType;
import org.wso2.carbon.dashboards.core.bean.widget.GeneratedWidgetConfigs;
import org.wso2.carbon.dashboards.core.exception.DashboardDeploymentException;
import org.wso2.carbon.dashboards.core.exception.DashboardException;
import org.wso2.carbon.utils.Utils;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;

/**
 * Dashboard importer component. This is used to import dashboards in {DASHBOARD_RUNTIME}/resources/dashboards directory
 * when server starts.
 *
 * @since 4.2.8
 */
@Component(immediate = true)
public class DashboardImporter {
    private static final Logger log = LoggerFactory.getLogger(DashboardImporter.class);
    private static final String ARTIFACT_EXTENSION = "json";
    private DashboardMetadataProvider dashboardMetadataProvider;
    private WidgetMetadataProvider widgetMetadataProvider;

    @Activate
    protected void activate(BundleContext bundleContext) {
        log.info("Dashboard importer activated.");
        importDashboards();
    }

    @Deactivate
    protected void deactivate(BundleContext bundleContext) {
        log.info("Dashboard importer deactivated.");
    }

    /**
     * Import dashboard artifacts from {DASHBOARD_RUNTIME}/resources/dashboards directory.
     */
    private void importDashboards() {
        Path resourcesDir = Utils.getRuntimePath().resolve(Paths.get("resources", "dashboards"));
        File[] files = resourcesDir.toFile().listFiles(f -> ARTIFACT_EXTENSION.equals(getExtension(f.getName())));
        if (files != null) {
            for (File file : files) {
                try {
                    importDashboard(file);
                } catch (DashboardDeploymentException e) {
                    log.error(e.getMessage(), e);
                }
            }
        }
    }

    /**
     * Import single dashboard artifact from the given file.
     *
     * @param file Dashboard artifact
     * @throws DashboardDeploymentException
     */
    private void importDashboard(File file) throws DashboardDeploymentException {
        InputStream inputStream = null;
        try {
            inputStream = new FileInputStream(file);
            BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream,
                    Charset.forName("UTF-8")));
            DashboardArtifact dashboardArtifact = new Gson().fromJson(bufferedReader, DashboardArtifact.class);
            if (dashboardArtifact != null) {
                DashboardMetadata dashboard = dashboardArtifact.getDashboard();

                log.info("Deploying dashboard '" + dashboard.getName() + "'...");

                // Save the dashboard.
                if (dashboardMetadataProvider.get(dashboard.getUrl()).isPresent()) {
                    dashboardMetadataProvider.update(dashboard);
                } else {
                    dashboardMetadataProvider.add(dashboard);
                }

                // Notify missing custom widgets.
                for (String widgetId : dashboardArtifact.getWidgets().getCustom()) {
                    if (!widgetMetadataProvider.isWidgetPresent(widgetId, WidgetType.ALL)) {
                        log.info("Widget '" + widgetId + "' not found. Please copy the widget.");
                    }
                }

                // Deploy generated widgets if not available.
                for (GeneratedWidgetConfigs widgetConfigs : dashboardArtifact.getWidgets().getGenerated()) {
                    if (!widgetMetadataProvider.isWidgetPresent(widgetConfigs.getId(), WidgetType.ALL)) {
                        log.info("Deploying widget '" + widgetConfigs.getId() + "'...");
                        widgetMetadataProvider.addGeneratedWidgetConfigs(widgetConfigs);
                    } else {
                        log.info("Widget '" + widgetConfigs.getId() + "' is already deployed, hence skipping.");
                    }
                }

                // Rename the dashboard json to prevent future deployments.
                if (!file.renameTo(new File(file.getPath() + ".deployed"))) {
                    log.warn("Error while renaming the dashboard artifact. The artifact will re-import in the next " +
                            "server startup");
                }
            }
        } catch (DashboardException e) {
            throw new DashboardDeploymentException("Cannot import the dashboard.", e);
        } catch (FileNotFoundException e) {
            throw new DashboardDeploymentException("Cannot find the dashboard file.", e);
        } finally {
            if (inputStream != null) {
                try {
                    inputStream.close();
                } catch (IOException e) {
                    throw new DashboardDeploymentException("Error while closing the dashboard artifact.", e);
                }
            }
        }
    }

    /**
     * Get extension from the given file name.
     *
     * @param name Name of the file
     * @return Extension
     */
    private String getExtension(String name) {
        int pos = name.lastIndexOf('.');
        if (pos > 0 && pos < name.length()) {
            return name.toLowerCase(Locale.ROOT).substring(pos + 1);
        }
        return "";
    }

    @Reference(service = DashboardMetadataProvider.class,
            cardinality = ReferenceCardinality.MANDATORY,
            policy = ReferencePolicy.DYNAMIC,
            unbind = "unsetDashboardMetadataProvider")
    protected void setDashboardMetadataProvider(DashboardMetadataProvider dashboardMetadataProvider) {
        this.dashboardMetadataProvider = dashboardMetadataProvider;
        log.debug("DashboardMetadataProvider '{}' registered.", dashboardMetadataProvider.getClass().getName());
    }

    protected void unsetDashboardMetadataProvider(DashboardMetadataProvider dashboardMetadataProvider) {
        this.dashboardMetadataProvider = null;
        log.debug("DashboardMetadataProvider '{}' registered.", dashboardMetadataProvider.getClass().getName());
    }

    @Reference(service = WidgetMetadataProvider.class,
            cardinality = ReferenceCardinality.MANDATORY,
            policy = ReferencePolicy.DYNAMIC,
            unbind = "unsetWidgetMetadataProvider")
    protected void setWidgetMetadataProvider(WidgetMetadataProvider widgetMetadataProvider) {
        this.widgetMetadataProvider = widgetMetadataProvider;
        log.debug("WidgetMetadataProvider '{}' registered.", widgetMetadataProvider.getClass().getName());
    }

    protected void unsetWidgetMetadataProvider(WidgetMetadataProvider widgetMetadataProvider) {
        this.widgetMetadataProvider = null;
        log.debug("WidgetMetadataProvider '{}' registered.", widgetMetadataProvider.getClass().getName());
    }
}
