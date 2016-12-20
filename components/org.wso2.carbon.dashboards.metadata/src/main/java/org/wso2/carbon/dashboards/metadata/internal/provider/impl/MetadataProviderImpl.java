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
package org.wso2.carbon.dashboards.metadata.internal.provider.impl;

import org.osgi.framework.BundleContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.carbon.dashboards.metadata.bean.Metadata;
import org.wso2.carbon.dashboards.metadata.bean.PaginationContext;
import org.wso2.carbon.dashboards.metadata.bean.Query;
import org.wso2.carbon.dashboards.metadata.exception.MetadataException;
import org.wso2.carbon.dashboards.metadata.internal.dao.MetadataDAO;
import org.wso2.carbon.dashboards.metadata.internal.dao.impl.MetadataDAOImpl;
import org.wso2.carbon.dashboards.metadata.internal.dao.utils.DAOUtils;
import org.wso2.carbon.dashboards.metadata.provider.MetadataProvider;
import org.wso2.carbon.datasource.core.api.DataSourceService;

import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * This is a core class of the Metadata business logic implementation.
 */
@Component(name = "org.wso2.carbon.dashboards.metadata.internal.provider.impl.MetadataProviderImpl",
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
        log.info("ServiceComponent activated.");
        try {
            test();
        } catch (Exception e) {
        }
    }

    /**
     * Get called when this osgi component get unregistered.
     */
    @Deactivate
    protected void deactivate() {
        log.info("ServiceComponent deactivated.");
    }

    private void test() throws MetadataException {
        log.info("test()");
        DAOUtils.getInstance().initialize("WSO2_DASHBOARD_DB");
        Metadata metadata = new Metadata();
        metadata.setName("Test");
        metadata.setContent("sdda fadsf dsf dsf dsaadsf1234353543b543 5");
        metadata.setDescription("fdsfsdfsdfsdfds");
        metadata.setOwner("Chandana");
        metadata.setLastUpdatedBy("Chandana");
        metadata.setLastUpdatedTime((new Date().getTime()));
        metadata.setCreatedTime((new Date().getTime()));
        metadata.setVersion("1.2.3");

        this.add(metadata);


        log.info("end test()");
    }

    @Override
    public boolean isExists(Query query) throws MetadataException {
        validateQuery(query);
        if (query.getUuid() != null) {
            return dao.isExists(query.getUuid());
        } else if (query.getOwner() != null && query.getName() != null && query.getVersion() != null) {
            return dao.isExists(query.getOwner(), query.getName(), query.getVersion());
        } else if (query.getOwner() != null && query.getName() != null) {
            return dao.isExistsOwner(query.getOwner(), query.getName());
        } else if (query.getName() != null && query.getVersion() != null) {
            return dao.isExistsByVersion(query.getName(), query.getVersion());
        } else {
            throw new MetadataException("Insufficient parameters supplied to the command");
        }
    }

    @Override
    public void update(Metadata metadata) throws MetadataException {
        dao.update(metadata);
    }

    @Override
    public void add(Metadata metadata) throws MetadataException {
        dao.add(metadata);
    }

    @Override
    public void delete(Query query) throws MetadataException {
        validateQuery(query);
        if (query.getUuid() != null) {
            dao.delete(query.getUuid());
        } else if (query.getOwner() != null && query.getName() != null && query.getVersion() != null) {
            dao.delete(query.getOwner(), query.getName(), query.getVersion());
        } else if (query.getOwner() != null && query.getName() != null) {
            dao.delete(query.getOwner(), query.getName());
        } else {
            throw new MetadataException("Insufficient parameters supplied to the command");
        }
    }

    @Override
    public Metadata get(Query query) throws MetadataException {
        validateQuery(query);
        if (query.getUuid() != null) {
            return dao.get(query.getUuid());
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
            return dao.listByName(query.getName(), paginationContext);
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

        DAOUtils.getInstance().setDataSourceService(service);

        if (log.isInfoEnabled()) {
            log.info("Data source service registered successfully.");
        }
    }

    protected void unregisterDataSourceService(DataSourceService service) {

        if (log.isInfoEnabled()) {
            log.info("Data source service unregistered.");
        }
        DAOUtils.getInstance().setDataSourceService(null);
    }
}
