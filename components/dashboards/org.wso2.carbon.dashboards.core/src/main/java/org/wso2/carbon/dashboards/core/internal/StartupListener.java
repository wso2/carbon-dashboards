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

import org.osgi.framework.BundleContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.carbon.analytics.idp.client.core.api.IdPClient;
import org.wso2.carbon.analytics.permissions.PermissionManager;
import org.wso2.carbon.analytics.permissions.PermissionProvider;
import org.wso2.carbon.config.ConfigurationException;
import org.wso2.carbon.config.provider.ConfigProvider;
import org.wso2.carbon.dashboards.core.DashboardMetadataProvider;
import org.wso2.carbon.dashboards.core.bean.DashboardConfigurations;
import org.wso2.carbon.datasource.core.api.DataSourceService;

/**
 * aas
 */
@Component(immediate = true)
public class StartupListener {

    private static final Logger LOGGER = LoggerFactory.getLogger(StartupListener.class);

    private DataSourceService dataSourceService;
    private DashboardConfigurations dashboardConfigurations;
    private PermissionProvider permissionProvider;
    private IdPClient idPClient;

    @Reference(service = DataSourceService.class,
               cardinality = ReferenceCardinality.AT_LEAST_ONE,
               policy = ReferencePolicy.DYNAMIC,
               unbind = "unsetDataSourceService")
    protected void setDataSourceService(DataSourceService dataSourceService) {
        this.dataSourceService = dataSourceService;
    }

    protected void unsetDataSourceService(DataSourceService dataSourceService) {
        this.dataSourceService = null;
    }

    @Reference(service = ConfigProvider.class,
               cardinality = ReferenceCardinality.MANDATORY,
               policy = ReferencePolicy.DYNAMIC,
               unbind = "unsetConfigProvider")
    protected void setConfigProvider(ConfigProvider configProvider) {
        try {
            this.dashboardConfigurations = configProvider.getConfigurationObject(DashboardConfigurations.class);
        } catch (ConfigurationException e) {
            LOGGER.error("Cannot load dashboard configurations from 'deployment.yaml'. Falling-back to defaults.", e);
            this.dashboardConfigurations = new DashboardConfigurations();
        }
    }

    protected void unsetConfigProvider(ConfigProvider configProvider) {
        LOGGER.debug("An instance of class '{}' unregistered as a config provider.",
                     configProvider.getClass().getName());
    }

    @Reference(service = PermissionManager.class,
               cardinality = ReferenceCardinality.MANDATORY,
               policy = ReferencePolicy.DYNAMIC,
               unbind = "unsetPermissionManager"
    )
    protected void setPermissionManager(PermissionManager permissionManager) {
        this.permissionProvider = permissionManager.getProvider();
    }

    protected void unsetPermissionManager(PermissionManager permissionManager) {
        this.permissionProvider = null;
    }

    @Reference(
            service = IdPClient.class,
            cardinality = ReferenceCardinality.MANDATORY,
            policy = ReferencePolicy.DYNAMIC,
            unbind = "unsetIdPClient"
    )
    protected void setIdPClient(IdPClient client) {
        this.idPClient = client;
    }

    protected void unsetIdPClient(IdPClient client) {
        this.idPClient = null;
    }

    @Activate
    protected void activate(BundleContext bundleContext) {
        DashboardMetadataProvider dashboardMetadataProvider = new DashboardMetadataProviderImpl(dataSourceService,
                dashboardConfigurations, permissionProvider, idPClient);
        bundleContext.registerService(DashboardMetadataProvider.class, dashboardMetadataProvider, null);
        LOGGER.debug("{} activated.", this.getClass().getName());
    }

    @Deactivate
    protected void deactivate() {
        LOGGER.debug("{} deactivated.", this.getClass().getName());
    }
}
