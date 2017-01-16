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
import org.wso2.carbon.dashboards.core.bean.Metadata;
import org.wso2.carbon.dashboards.core.bean.PaginationContext;
import org.wso2.carbon.dashboards.core.bean.Query;
import org.wso2.carbon.dashboards.core.exception.MetadataException;
import org.wso2.carbon.dashboards.core.internal.dao.MetadataDAO;
import org.wso2.carbon.dashboards.core.internal.dao.impl.MetadataDAOImpl;
import org.wso2.carbon.dashboards.core.internal.dao.utils.DAOUtils;
import org.wso2.carbon.dashboards.core.provider.MetadataProvider;
import org.wso2.carbon.datasource.core.api.DataSourceService;

import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * This is a core class of the Metadata business logic implementation.
 */
@Component(name = "org.wso2.carbon.dashboards.core.internal.provider.impl.MetadataProviderImpl",
           service = MetadataProvider.class,
           immediate = true)
public class MetadataProviderImpl implements MetadataProvider {

    private static final Logger log = LoggerFactory.getLogger(MetadataProviderImpl.class);

    private MetadataDAO dao;

    public MetadataProviderImpl(MetadataDAO dao) {
        this.dao = dao;
    }

    public MetadataProviderImpl() {
        this(new MetadataDAOImpl());
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
    public boolean isExists(Query query) throws MetadataException {
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
            throw new MetadataException("Insufficient parameters supplied to the command");
        }
    }

    @Override
    public void update(Metadata metadata) throws MetadataException {
        metadata.setLastUpdatedTime((new Date()).getTime());
        dao.update(metadata);
    }

    @Override
    public void add(Metadata metadata) throws MetadataException {
        if (metadata.getOwner() != null) {
            metadata.setLastUpdatedBy(metadata.getOwner());
        }
        long currentTime = (new Date()).getTime();
        if (metadata.getLastUpdatedTime() == 0l) {
            metadata.setLastUpdatedTime(currentTime);
        }
        if (metadata.getCreatedTime() == 0l) {
            metadata.setCreatedTime(currentTime);
        }
        dao.add(metadata);
    }

    @Override
    public void delete(Query query) throws MetadataException {
        validateQuery(query);
        if (query.getOwner() != null && query.getUrl() != null && query.getVersion() != null) {
            dao.delete(query.getOwner(), query.getUrl(), query.getVersion());
        } else if (query.getOwner() != null && query.getUrl() != null) {
            dao.delete(query.getOwner(), query.getUrl());
        } else if (query.getUrl() != null) {
            dao.delete(query.getUrl());
        } else {
            throw new MetadataException("Insufficient parameters supplied to the command");
        }
    }

    @Override
    public Metadata get(Query query) throws MetadataException {
        validateQuery(query);
        if (query.getUrl() != null) {
            return dao.get(query.getUrl());
        } else {
            throw new MetadataException("Insufficient parameters supplied to the command");
        }
    }

    @Override
    public List<Metadata> get(Query query, PaginationContext paginationContext) throws MetadataException {
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
            throw new MetadataException("Insufficient parameters supplied to the command");
        }
    }

    private void validateQuery(Query query) throws MetadataException {
        if (query == null) {
            throw new MetadataException("Unable to find Metadata. The query is empty");
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
