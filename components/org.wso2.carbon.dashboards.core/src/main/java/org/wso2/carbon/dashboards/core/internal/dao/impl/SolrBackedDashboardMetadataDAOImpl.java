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
package org.wso2.carbon.dashboards.core.internal.dao.impl;

import org.wso2.carbon.dashboards.core.bean.DashboardMetadata;
import org.wso2.carbon.dashboards.core.bean.PaginationContext;
import org.wso2.carbon.dashboards.core.exception.DashboardException;
import org.wso2.carbon.dashboards.core.internal.dao.DashboardMetadataDAO;

import java.util.List;

/**
 * This is a core class of the DashboardMetadata SOLR Based implementation.
 */
public class SolrBackedDashboardMetadataDAOImpl implements DashboardMetadataDAO {

    DashboardMetadataDAO dashboardMetadataDAO;

    public SolrBackedDashboardMetadataDAOImpl(DashboardMetadataDAO dashboardMetadataDAO) {
        this.dashboardMetadataDAO = dashboardMetadataDAO;
    }

    @Override
    public boolean isExists(String url) throws DashboardException {
        return dashboardMetadataDAO.isExists(url);
    }

    @Override
    public boolean isExistsByVersion(String url, String version) throws DashboardException {
        return dashboardMetadataDAO.isExistsByVersion(url, version);
    }

    @Override
    public boolean isExistsOwner(String owner, String url) throws DashboardException {
        return dashboardMetadataDAO.isExistsOwner(owner, url);
    }

    @Override
    public boolean isExists(String owner, String url, String version) throws DashboardException {
        return dashboardMetadataDAO.isExists(owner, url, version);
    }

    @Override
    public void update(DashboardMetadata dashboardMetadata) throws DashboardException {
        dashboardMetadataDAO.update(dashboardMetadata);
    }

    @Override
    public void add(DashboardMetadata dashboardMetadata) throws DashboardException {
        dashboardMetadataDAO.add(dashboardMetadata);
    }

    @Override
    public void delete(String url) throws DashboardException {
        dashboardMetadataDAO.delete(url);
    }

    @Override
    public void delete(String owner, String url) throws DashboardException {
        dashboardMetadataDAO.delete(owner, url);
    }

    @Override
    public void delete(String owner, String url, String version) throws DashboardException {
        dashboardMetadataDAO.delete(owner, url, version);
    }

    @Override
    public DashboardMetadata get(String url) throws DashboardException {
        return dashboardMetadataDAO.get(url);
    }

    @Override
    public List<DashboardMetadata> list(String url, String version, PaginationContext paginationContext)
            throws DashboardException {
        return dashboardMetadataDAO.list(url, version, paginationContext);
    }

    @Override
    public List<DashboardMetadata> listByOwner(String owner, String url, PaginationContext paginationContext)
            throws DashboardException {
        return dashboardMetadataDAO.listByOwner(owner, url, paginationContext);
    }

    @Override
    public List<DashboardMetadata> list(String owner, String url, String version, PaginationContext paginationContext)
            throws DashboardException {
        return dashboardMetadataDAO.list(owner, url, version, paginationContext);
    }

    @Override
    public List<DashboardMetadata> listByURL(String url, PaginationContext paginationContext) throws
                                                                                              DashboardException {
        return dashboardMetadataDAO.listByURL(url, paginationContext);
    }
}
