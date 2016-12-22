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
package org.wso2.carbon.dashboards.metadata.internal.dao.impl;

import org.wso2.carbon.dashboards.metadata.bean.Metadata;
import org.wso2.carbon.dashboards.metadata.bean.PaginationContext;
import org.wso2.carbon.dashboards.metadata.exception.MetadataException;
import org.wso2.carbon.dashboards.metadata.internal.dao.MetadataDAO;

import java.util.List;

/**
 * This is a core class of the Metadata SOLR Based implementation.
 */
public class SolrBackedMetadataDAOImpl implements MetadataDAO {

    MetadataDAO metadataDAO;

    public SolrBackedMetadataDAOImpl(MetadataDAO metadataDAO) {
        this.metadataDAO = metadataDAO;
    }

    @Override
    public boolean isExists(String url) throws MetadataException {
        return metadataDAO.isExists(url);
    }

    @Override
    public boolean isExistsByVersion(String url, String version) throws MetadataException {
        return metadataDAO.isExistsByVersion(url, version);
    }

    @Override
    public boolean isExistsOwner(String owner, String url) throws MetadataException {
        return metadataDAO.isExistsOwner(owner, url);
    }

    @Override
    public boolean isExists(String owner, String url, String version) throws MetadataException {
        return metadataDAO.isExists(owner, url, version);
    }

    @Override
    public void update(Metadata metadata) throws MetadataException {
        metadataDAO.update(metadata);
    }

    @Override
    public void add(Metadata metadata) throws MetadataException {
        metadataDAO.add(metadata);
    }

    @Override
    public void delete(String url) throws MetadataException {
        metadataDAO.delete(url);
    }

    @Override
    public void delete(String owner, String url) throws MetadataException {
        metadataDAO.delete(owner, url);
    }

    @Override
    public void delete(String owner, String url, String version) throws MetadataException {
        metadataDAO.delete(owner, url, version);
    }

    @Override
    public Metadata get(String url) throws MetadataException {
        return metadataDAO.get(url);
    }

    @Override
    public List<Metadata> list(String url, String version, PaginationContext paginationContext)
            throws MetadataException {
        return metadataDAO.list(url, version, paginationContext);
    }

    @Override
    public List<Metadata> listByOwner(String owner, String url, PaginationContext paginationContext)
            throws MetadataException {
        return metadataDAO.listByOwner(owner, url, paginationContext);
    }

    @Override
    public List<Metadata> list(String owner, String url, String version, PaginationContext paginationContext)
            throws MetadataException {
        return metadataDAO.list(owner, url, version, paginationContext);
    }

    @Override
    public List<Metadata> listByURL(String url, PaginationContext paginationContext) throws MetadataException {
        return metadataDAO.listByURL(url, paginationContext);
    }
}
