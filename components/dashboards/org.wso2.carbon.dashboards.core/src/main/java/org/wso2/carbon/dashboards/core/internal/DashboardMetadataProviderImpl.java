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
import org.wso2.carbon.dashboards.core.DashboardMetadataProvider;
import org.wso2.carbon.dashboards.core.bean.DashboardMetadata;
import org.wso2.carbon.dashboards.core.exception.DashboardException;
import org.wso2.carbon.dashboards.core.exception.DashboardRuntimeException;
import org.wso2.carbon.dashboards.core.internal.database.DashboardMetadataDao;
import org.wso2.carbon.dashboards.core.internal.database.DashboardMetadataDaoFactory;
import org.wso2.carbon.datasource.core.api.DataSourceService;

import java.util.Optional;
import java.util.Set;

/**
 * Default dashboard metadata provider.
 *
 * @since 4.0.0
 */
@Component(service = DashboardMetadataProvider.class, immediate = true)
public class DashboardMetadataProviderImpl implements DashboardMetadataProvider {

    private static final Logger LOGGER = LoggerFactory.getLogger(DashboardMetadataProviderImpl.class);

    private DashboardMetadataDao dao;
    private DataSourceService dataSourceService;
    private ConfigProvider configProvider;

    @Activate
    protected void activate(BundleContext bundleContext) {
        try {
            this.dao = DashboardMetadataDaoFactory.createDao(dataSourceService, configProvider);
        } catch (DashboardException e) {
            throw new DashboardRuntimeException("Cannot create DAO for DB access.", e);
        }
        LOGGER.debug("{} activated.", this.getClass().getName());
    }

    @Deactivate
    protected void deactivate(BundleContext bundleContext) {
        LOGGER.debug("{} deactivated.", this.getClass().getName());
    }

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
        this.configProvider = configProvider;
    }

    protected void unsetConfigProvider(ConfigProvider configProvider) {
        this.configProvider = null;
    }

    @Override
    public Optional<DashboardMetadata> get(String dashboardUrl) throws DashboardException {
        // TODO: 11/10/17 validate parameters
        return dao.get(dashboardUrl);
    }

    @Override
    public Set<DashboardMetadata> getAll() throws DashboardException {
        return dao.getAll();
    }

    @Override
    public void add(DashboardMetadata dashboardMetadata) throws DashboardException {
        // TODO: 11/10/17 validate parameters
        dao.add(dashboardMetadata);
    }

    @Override
    public void update(DashboardMetadata dashboardMetadata) throws DashboardException {
        // TODO: 11/10/17 validate parameters
        dao.update(dashboardMetadata);
    }

    @Override
    public void delete(String dashboardUrl) throws DashboardException {
        // TODO: 11/10/17 validate parameters
        dao.delete(dashboardUrl);
    }
}
