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
import org.wso2.carbon.dashboards.core.WidgetInfoProvider;
import org.wso2.carbon.dashboards.core.bean.widget.WidgetMetaInfo;
import org.wso2.carbon.dashboards.core.exception.DashboardRuntimeException;
import org.wso2.carbon.dashboards.core.internal.io.WidgetConfigurationReader;
import org.wso2.carbon.uis.api.App;
import org.wso2.carbon.uis.spi.Server;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Default widget info provider.
 *
 * @since 4.0.0
 */
@Component(service = WidgetInfoProvider.class, immediate = true)
public class WidgetInfoProviderImpl implements WidgetInfoProvider {

    private static final Logger LOGGER = LoggerFactory.getLogger(WidgetInfoProviderImpl.class);
    private static final String APP_NAME_DASHBOARD = "portal";
    private static final String EXTENSION_TYPE_WIDGETS = "widgets";

    private final WidgetConfigurationReader widgetConfigurationReader;
    private Server uiServer;

    /**
     * Creates a new widget info provider.
     */
    public WidgetInfoProviderImpl() {
        this(new WidgetConfigurationReader());
    }

    WidgetInfoProviderImpl(WidgetConfigurationReader widgetConfigurationReader) {
        this.widgetConfigurationReader = widgetConfigurationReader;
    }

    @Activate
    protected void activate(BundleContext bundleContext) {
        LOGGER.debug("{} activated.", this.getClass().getName());
    }

    @Deactivate
    protected void deactivate(BundleContext bundleContext) {
        LOGGER.debug("{} deactivated.", this.getClass().getName());
    }

    @Reference(service = Server.class,
               cardinality = ReferenceCardinality.MANDATORY,
               policy = ReferencePolicy.DYNAMIC,
               unbind = "unsetCarbonUiServer")
    protected void setCarbonUiServer(Server server) {
        this.uiServer = server;
    }

    protected void unsetCarbonUiServer(Server server) {
        this.uiServer = null;
    }

    @Override
    public Optional<WidgetMetaInfo> getWidgetConfiguration(String widgetName) throws DashboardRuntimeException {
        return getDashboardApp().getExtension(EXTENSION_TYPE_WIDGETS, widgetName)
                .map(widgetConfigurationReader::getConfiguration);
    }

    @Override
    public Set<WidgetMetaInfo> getAllWidgetConfigurations() throws DashboardRuntimeException {
        return getDashboardApp().getExtensions(EXTENSION_TYPE_WIDGETS).stream()
                .map(widgetConfigurationReader::getConfiguration)
                .collect(Collectors.toSet());
    }

    private App getDashboardApp() {
        return uiServer.getApp(APP_NAME_DASHBOARD)
                .orElseThrow(() -> new DashboardRuntimeException(
                        "Cannot find dashboard web app named '" + APP_NAME_DASHBOARD + "'."));
    }
}
