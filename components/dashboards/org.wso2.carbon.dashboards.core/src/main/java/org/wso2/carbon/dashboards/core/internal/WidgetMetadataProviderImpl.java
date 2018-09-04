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
package org.wso2.carbon.dashboards.core.internal;

import org.osgi.framework.BundleContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.carbon.config.provider.ConfigProvider;
import org.wso2.carbon.dashboards.core.WidgetMetadataProvider;
import org.wso2.carbon.dashboards.core.bean.importer.WidgetType;
import org.wso2.carbon.dashboards.core.bean.widget.GeneratedWidgetConfigs;
import org.wso2.carbon.dashboards.core.bean.widget.WidgetConfigs;
import org.wso2.carbon.dashboards.core.bean.widget.WidgetMetaInfo;
import org.wso2.carbon.dashboards.core.exception.DashboardException;
import org.wso2.carbon.dashboards.core.internal.database.WidgetMetadataDao;
import org.wso2.carbon.dashboards.core.internal.database.WidgetMetadataDaoFactory;
import org.wso2.carbon.dashboards.core.internal.io.WidgetConfigurationReader;
import org.wso2.carbon.datasource.core.api.DataSourceService;
import org.wso2.carbon.uiserver.api.App;
import org.wso2.carbon.utils.Utils;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashSet;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Default widget info provider.
 *
 * @since 4.0.0
 */
@Component(service = WidgetMetadataProvider.class,
           immediate = true)
public class WidgetMetadataProviderImpl implements WidgetMetadataProvider {

    private static final Logger LOGGER = LoggerFactory.getLogger(WidgetMetadataProviderImpl.class);
    private static final String APP_NAME_DASHBOARD = "portal";
    private static final String EXTENSION_TYPE_WIDGETS = "widgets";

    private WidgetMetadataDao widgetMetadataDao;
    private DataSourceService dataSourceService;
    private ConfigProvider configProvider;
    private boolean isDaoInitialized = false;

    private App dashboardApp;

    @Activate
    protected void activate(BundleContext bundleContext) {
        try {
            if (dataSourceService != null && configProvider != null) {
                this.widgetMetadataDao = WidgetMetadataDaoFactory.createDao(dataSourceService, configProvider);
                this.widgetMetadataDao.initWidgetTable();
                this.isDaoInitialized = true;
            }
        } catch (DashboardException e) {
            //ignore as its required to start with default widget extension loading.
            LOGGER.debug("Error in activating widget DAO {}", e.getMessage());
        }
        LOGGER.debug("{} activated.", this.getClass().getName());
    }

    @Deactivate
    protected void deactivate(BundleContext bundleContext) {
        LOGGER.debug("{} deactivated.", this.getClass().getName());
    }

    @Override
    public Optional<WidgetMetaInfo> getWidgetConfiguration(String widgetId) throws DashboardException {
        GeneratedWidgetConfigs generatedWidgetConfigs = isDaoInitialized ? widgetMetadataDao
                .getGeneratedWidgetConfigsForId(widgetId) : null;
        if (generatedWidgetConfigs != null) {
            WidgetMetaInfo widgetMetaInfo = new WidgetMetaInfo();
            WidgetConfigs widgetConfigs = new WidgetConfigs();
            widgetConfigs.setChartConfig(generatedWidgetConfigs.getChartConfig());
            widgetConfigs.setProviderConfig(generatedWidgetConfigs.getProviderConfig());
            widgetConfigs.setPubsub(generatedWidgetConfigs.getPubsub());
            widgetConfigs.setGenerated(true);
            widgetConfigs.setMetadata(generatedWidgetConfigs.getMetadata());
            widgetMetaInfo.setVersion(generatedWidgetConfigs.getVersion());
            widgetMetaInfo.setId(generatedWidgetConfigs.getId());
            widgetMetaInfo.setName(generatedWidgetConfigs.getName());
            widgetMetaInfo.setConfigs(widgetConfigs);
            return Optional.ofNullable(widgetMetaInfo);
        } else {
            return dashboardApp.getExtension(EXTENSION_TYPE_WIDGETS, widgetId)
                    .map(WidgetConfigurationReader::getConfiguration);
        }
    }

    @Override
    public void addGeneratedWidgetConfigs(GeneratedWidgetConfigs generatedWidgetConfigs) throws DashboardException {
        widgetMetadataDao.addGeneratedWidgetConfigs(generatedWidgetConfigs);
    }

    @Override
    public boolean isWidgetPresent(String widgetName) throws DashboardException {
        return isWidgetPresent(widgetName, WidgetType.CUSTOM);
    }

    @Override
    public boolean isWidgetPresent(String widgetName, WidgetType widgetType) throws DashboardException {
        if (widgetType == WidgetType.GENERATED || widgetType == WidgetType.ALL) {
            if (isDaoInitialized) {
                Set<GeneratedWidgetConfigs> generatedWidgetConfigsSet = widgetMetadataDao.getGeneratedWidgetIdSet();
                for (GeneratedWidgetConfigs generatedWidgetConfigs : generatedWidgetConfigsSet) {
                    if (generatedWidgetConfigs.getName().equals(widgetName)) {
                        return true;
                    }
                }
            }
        }
        return (widgetType == WidgetType.CUSTOM || widgetType == WidgetType.ALL) && isWidgetInFilesystem(widgetName);
    }

    /**
     * Check whether the widget is in the file system.
     *
     * @param widgetName Name of the widget
     * @return
     */
    private boolean isWidgetInFilesystem(String widgetName) {
        // The following line doesn't work, since getDashboardApp() returns null.
        // return getDashboardApp().getExtension(EXTENSION_TYPE_WIDGETS, widgetName).isPresent();
        Path widgetsDirectory = Utils.getRuntimePath().resolve(
                Paths.get("deployment", "web-ui-apps", "portal", "extensions", "widgets"));
        String[] widgets = widgetsDirectory.toFile().list((current, name) -> new File(current, name).isDirectory());
        if (widgets != null) {
            for (String widget : widgets) {
                if (widgetName.equals(widget)) {
                    return true;
                }
            }
        }
        return false;
    }

    @Override
    public Set<WidgetMetaInfo> getAllWidgetConfigurations() throws DashboardException {
        Set<WidgetMetaInfo> widgetMetaInfoSet = dashboardApp.getExtensions(EXTENSION_TYPE_WIDGETS).stream()
                .map(WidgetConfigurationReader::getConfiguration)
                .collect(Collectors.toSet());
        if (isDaoInitialized) {
            Set<GeneratedWidgetConfigs> generatedWidgetConfigsSet = widgetMetadataDao.getGeneratedWidgetIdSet();
            for (GeneratedWidgetConfigs generatedWidgetConfigs : generatedWidgetConfigsSet) {
                WidgetMetaInfo widgetMetaInfo = new WidgetMetaInfo();
                WidgetConfigs widgetConfigs = new WidgetConfigs();
                widgetMetaInfo.setId(generatedWidgetConfigs.getId());
                widgetMetaInfo.setName(generatedWidgetConfigs.getName());
                widgetConfigs.setPubsub(generatedWidgetConfigs.getPubsub());
                widgetConfigs.setMetadata(generatedWidgetConfigs.getMetadata());
                widgetConfigs.setGenerated(true);
                widgetMetaInfo.setVersion(generatedWidgetConfigs.getVersion());
                widgetMetaInfo.setConfigs(widgetConfigs);
                widgetMetaInfoSet.add(widgetMetaInfo);
            }
        }
        return widgetMetaInfoSet;
    }

    @Override
    public Set<GeneratedWidgetConfigs> getGeneratedWidgetConfigs(Set<String> widgetIds) throws DashboardException {
        Set<GeneratedWidgetConfigs> generatedWidgetIdSet = widgetMetadataDao.getGeneratedWidgetIdSet();
        return generatedWidgetIdSet.stream().filter(w -> widgetIds.contains(w.getId())).collect(Collectors.toSet());
    }

    @Override
    public void delete(String widgetId) throws DashboardException {
        widgetMetadataDao.delete(widgetId);
    }
}
