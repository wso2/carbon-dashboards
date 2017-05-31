/*
 *  Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */
package org.wso2.carbon.dashboards.core.internal.provider.impl;


import org.osgi.framework.BundleContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.carbon.dashboards.core.bean.DashboardMetadata;
import org.wso2.carbon.dashboards.core.bean.PaginationContext;
import org.wso2.carbon.dashboards.core.bean.Query;
import org.wso2.carbon.dashboards.core.internal.dao.utils.DAOUtils;
import org.wso2.carbon.dashboards.core.provider.DashboardMetadataProvider;
import org.wso2.carbon.dashboards.core.exception.DashboardException;
import org.wso2.carbon.dashboards.core.internal.dao.DashboardMetadataDAO;
import org.wso2.carbon.dashboards.core.internal.dao.impl.DashboardMetadataDAOImpl;
import org.wso2.carbon.datasource.core.api.DataSourceService;

import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * This is a core class of the DashboardMetadata business logic implementation.
 */
@Component(name = "org.wso2.carbon.dashboards.core.internal.provider.impl.DashboardMetadataProviderImpl",
           service = DashboardMetadataProvider.class,
           immediate = true)
public class DashboardMetadataProviderImpl implements DashboardMetadataProvider {

    private static final Logger log = LoggerFactory.getLogger(DashboardMetadataProviderImpl.class);

    private DashboardMetadataDAO dao;

    public DashboardMetadataProviderImpl(DashboardMetadataDAO dao) {
        this.dao = dao;
    }

    public DashboardMetadataProviderImpl() {
        this(new DashboardMetadataDAOImpl());
    }

    /**
     * Get called when this osgi component get registered.
     *
     * @param bundleContext Context of the osgi component.
     */
    @Activate
    protected void activate(BundleContext bundleContext) {
        //TODO: Since this affects to server startup, We will move this db initialization at the first request in future
        log.info("ServiceComponent activated.");
    }

    /**
     * Get called when this osgi component get unregistered.
     */
    @Deactivate
    protected void deactivate() {
        log.info("ServiceComponent deactivated.");
    }

    @Override
    public boolean isExists(Query query) throws DashboardException {
        validateQuery(query);
        if (query.getOwner() != null && query.getUrl() != null && query.getVersion() != null) {
            return dao.isExists(query.getOwner(), query.getUrl(), query.getVersion());
        } else if (query.getOwner() != null && query.getUrl() != null) {
            return dao.isExistsOwner(query.getOwner(), query.getUrl());
        } else if (query.getUrl() != null && query.getVersion() != null) {
            return dao.isExistsByVersion(query.getUrl(), query.getVersion());
        } else if (query.getUrl() != null) {
            return dao.isExists(query.getUrl());
        } else {
            throw new DashboardException("Insufficient parameters supplied to the command");
        }
    }

    @Override
    public void update(DashboardMetadata dashboardMetadata) throws DashboardException {
        dashboardMetadata.setLastUpdatedTime((new Date()).getTime());
        dao.update(dashboardMetadata);
    }

    @Override
    public void add(DashboardMetadata dashboardMetadata) throws DashboardException {
        if (dashboardMetadata.getOwner() != null) {
            dashboardMetadata.setLastUpdatedBy(dashboardMetadata.getOwner());
        }
        long currentTime = (new Date()).getTime();
        if (dashboardMetadata.getLastUpdatedTime() == 0L) {
            dashboardMetadata.setLastUpdatedTime(currentTime);
        }
        if (dashboardMetadata.getCreatedTime() == 0L) {
            dashboardMetadata.setCreatedTime(currentTime);
        }
        dao.add(dashboardMetadata);
    }

    @Override
    public void delete(Query query) throws DashboardException {
        validateQuery(query);
        if (query.getOwner() != null && query.getUrl() != null && query.getVersion() != null) {
            dao.delete(query.getOwner(), query.getUrl(), query.getVersion());
        } else if (query.getOwner() != null && query.getUrl() != null) {
            dao.delete(query.getOwner(), query.getUrl());
        } else if (query.getUrl() != null) {
            dao.delete(query.getUrl());
        } else {
            throw new DashboardException("Insufficient parameters supplied to the command");
        }
    }

    @Override
    public DashboardMetadata get(Query query) throws DashboardException {
        validateQuery(query);
        if (query.getUrl() != null) {
            return dao.get(query.getUrl());
        } else {
            throw new DashboardException("Insufficient parameters supplied to the command");
        }
    }

    @Override
    public List<DashboardMetadata> get(Query query, PaginationContext paginationContext) throws DashboardException {
        validateQuery(query);
        if (query.getOwner() != null && query.getName() != null && query.getVersion() != null) {
            return dao.list(query.getOwner(), query.getName(), query.getVersion(), paginationContext);
        } else if (query.getOwner() != null && query.getName() != null) {
            return dao.listByOwner(query.getOwner(), query.getName(), paginationContext);
        } else if (query.getName() != null && query.getVersion() != null) {
            return dao.list(query.getName(), query.getVersion(), paginationContext);
        } else if (query.getName() != null) {
            return dao.listByURL(query.getName(), paginationContext);
        } else {
            throw new DashboardException("Insufficient parameters supplied to the command");
        }
    }

    private void validateQuery(Query query) throws DashboardException {
        if (query == null) {
            throw new DashboardException("Unable to find DashboardMetadata. The query is empty");
        }
    }

    @Reference(
            name = "org.wso2.carbon.datasource.DataSourceService",
            service = DataSourceService.class,
            cardinality = ReferenceCardinality.AT_LEAST_ONE,
            policy = ReferencePolicy.DYNAMIC,
            unbind = "unregisterDataSourceService"
    )
    protected void registerDataSourceService(DataSourceService service, Map<String, String> properties) {

        if (service == null) {
            log.error("Data source service is null. Registering data source service is unsuccessful.");
            return;
        }

        DAOUtils.setDataSourceService(service);

        if (log.isInfoEnabled()) {
            log.info("Data source service registered successfully.");
        }
    }

    protected void unregisterDataSourceService(DataSourceService service) {

        if (log.isInfoEnabled()) {
            log.info("Data source service unregistered.");
        }
        DAOUtils.setDataSourceService(null);
    }
}
