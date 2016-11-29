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
    public boolean isExists(String uuid) throws MetadataException {
        return metadataDAO.isExists(uuid);
    }

    @Override
    public boolean isExistsByVersion(String name, String version) throws MetadataException {
        return metadataDAO.isExistsByVersion(name, version);
    }

    @Override
    public boolean isExistsOwner(String owner, String name) throws MetadataException {
        return metadataDAO.isExistsOwner(owner, name);
    }

    @Override
    public boolean isExists(String owner, String name, String version) throws MetadataException {
        return metadataDAO.isExists(owner, name, version);
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
    public void delete(String uuid) throws MetadataException {
        metadataDAO.delete(uuid);
    }

    @Override
    public void delete(String owner, String name) throws MetadataException {
        metadataDAO.delete(owner, name);
    }

    @Override
    public void delete(String owner, String name, String version) throws MetadataException {
        metadataDAO.delete(owner, name, version);
    }

    @Override
    public Metadata get(String uuid) throws MetadataException {
        return metadataDAO.get(uuid);
    }

    @Override
    public List<Metadata> list(String name, String version, PaginationContext paginationContext)
            throws MetadataException {
        return metadataDAO.list(name, version, paginationContext);
    }

    @Override
    public List<Metadata> listByOwner(String owner, String name, PaginationContext paginationContext)
            throws MetadataException {
        return metadataDAO.listByOwner(owner, name, paginationContext);
    }

    @Override
    public List<Metadata> list(String owner, String name, String version, PaginationContext paginationContext)
            throws MetadataException {
        return metadataDAO.list(owner, name, version, paginationContext);
    }

    @Override
    public List<Metadata> listByName(String name, PaginationContext paginationContext) throws MetadataException {
        return metadataDAO.listByName(name, paginationContext);
    }
}
