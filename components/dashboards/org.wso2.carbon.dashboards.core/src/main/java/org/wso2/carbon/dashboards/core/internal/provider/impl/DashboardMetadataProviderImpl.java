/*
 *  Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import org.wso2.carbon.dashboards.core.bean.DashboardContent;
import org.wso2.carbon.dashboards.core.bean.DashboardMetadata;
import org.wso2.carbon.dashboards.core.bean.PaginationContext;
import org.wso2.carbon.dashboards.core.bean.Query;
import org.wso2.carbon.dashboards.core.exception.DashboardException;
import org.wso2.carbon.dashboards.core.internal.dao.DashboardMetadataDAO;
import org.wso2.carbon.dashboards.core.internal.dao.impl.DashboardMetadataDAOImpl;
import org.wso2.carbon.dashboards.core.internal.dao.utils.DAOUtils;
import org.wso2.carbon.dashboards.core.provider.DashboardMetadataProvider;
import org.wso2.carbon.datasource.core.api.DataSourceService;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

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
    public void update(DashboardMetadata dashboardMetadata) throws DashboardException {
        dashboardMetadata.setLastUpdatedTime((new Date()).getTime());
        dao.update(dashboardMetadata);
    }

    @Override
    public void delete(Query query) throws DashboardException {
        validateQuery(query);
        if (query.getOwner() != null && query.getUrl() != null) {
            dao.delete(query.getOwner(), query.getUrl());
        } else {
            throw new DashboardException("Insufficient parameters supplied to the command");
        }
    }

    @Override
    public DashboardMetadata get(Query query) throws DashboardException {
        validateQuery(query);
        if (query.getUrl() != null) {
            DashboardMetadata dashboard = dao.get(query.getUrl());
            if (dashboard == null) {
                dashboard = getDashboardFromFilesystem(query);
            }
            return dashboard;
        } else {
            throw new DashboardException("Insufficient parameters supplied to the command");
        }
    }

    @Override
    public List<DashboardMetadata> list(Query query, PaginationContext paginationContext) throws DashboardException {
        validateQuery(query);
        if (query.getOwner() != null) {
            Map<String, DashboardMetadata> dashboards = dao.list(query.getOwner(), paginationContext).stream()
                    .collect(Collectors.toMap(DashboardMetadata::getUrl, Function.identity()));
            getDashboardsFromFilesystem().stream()
                    .filter(dashboard -> !dashboards.containsKey(dashboard.getId()))
                    .forEach(dashboard -> {
                        dashboards.put(dashboard.getId(), dashboard);
                    });
            return dashboards.entrySet()
                    .stream()
                    .map(e -> e.getValue())
                    .collect(Collectors.toList());
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

    /**
     * Get dashboard from a file system.
     *
     * @param query
     * @return
     * @throws DashboardException
     */
    private DashboardMetadata getDashboardFromFilesystem(Query query) throws DashboardException {
        DashboardMetadata dashboard = null;
        String path = System.getProperty("carbon.home") + "/deployment/dashboards/" + query.getUrl() + ".json";
        File dashboardJson = new File(path);
        if (dashboardJson.exists()) {
            try {
                String content = new String(Files.readAllBytes(Paths.get(path)), StandardCharsets.UTF_8);
                DashboardContent dashboardContent = new Gson().fromJson(content, DashboardContent.class);

                dashboard = new DashboardMetadata();
                dashboard.setId(dashboardContent.getId());
                dashboard.setUrl((dashboardContent.getId()));
                dashboard.setName(dashboardContent.getName());
                dashboard.setDescription(dashboardContent.getDescription());
                dashboard.setVersion(dashboardContent.getVersion());
                dashboard.setOwner("admin");
                dashboard.setLastUpdatedBy("admin");
                dashboard.setShared(false);

                dashboard.setContent(content);
                byte[] contentBytes = content.getBytes(Charset.defaultCharset());
                ByteArrayInputStream inputStream = new ByteArrayInputStream(contentBytes);
                dashboard.setContent(inputStream);
            } catch (IOException e) {
                throw new DashboardException("Unable to read the dashboard from the file system.");
            }
        }
        return dashboard;
    }

    /**
     * Get dashboards from the file system.
     *
     * @return Dashboard metadata
     * @throws DashboardException
     */
    private List<DashboardMetadata> getDashboardsFromFilesystem() throws DashboardException {
        List<DashboardMetadata> dashboards = new ArrayList<>();
        String path = System.getProperty("carbon.home") + "/deployment/dashboards/";
        File dashboardsDir = new File(path);
        if (!dashboardsDir.exists()) {
            return dashboards;
        }
        File[] files = dashboardsDir.listFiles((dir, name) -> {
            return name.endsWith(".json");
        });

        if (files != null) {
            for (File dashboardJson : files) {
                try {
                    String content = new String(Files.readAllBytes(Paths.get(dashboardJson.getAbsolutePath())),
                            StandardCharsets.UTF_8);
                    DashboardContent dashboardContent = new Gson().fromJson(content, DashboardContent.class);

                    DashboardMetadata metadata = new DashboardMetadata();
                    metadata.setId(dashboardContent.getId());
                    metadata.setUrl((dashboardContent.getId()));
                    metadata.setName(dashboardContent.getName());
                    metadata.setDescription(dashboardContent.getDescription());
                    metadata.setVersion(dashboardContent.getVersion());
                    metadata.setOwner("admin");
                    metadata.setLastUpdatedBy("admin");
                    metadata.setShared(false);
                    metadata.setContent(content);
                    dashboards.add(metadata);
                } catch (IOException e) {
                    throw new DashboardException("Unable to read dashboards from the file system.");
                }
            }
        }
        return dashboards;
    }
}
