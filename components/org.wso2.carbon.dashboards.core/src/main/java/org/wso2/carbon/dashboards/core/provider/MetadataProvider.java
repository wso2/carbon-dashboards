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
package org.wso2.carbon.dashboards.core.provider;

import org.wso2.carbon.dashboards.core.bean.Metadata;
import org.wso2.carbon.dashboards.core.bean.PaginationContext;
import org.wso2.carbon.dashboards.core.bean.Query;
import org.wso2.carbon.dashboards.core.exception.MetadataException;

import java.util.List;

/**
 * Interface for Metadata related business logic
 */
public interface MetadataProvider {

    /**
     * Check whether a Metadata exists with given information
     *
     * @param query query parameters
     * @return true if a Metadata exists  with given information, false otherwise.
     * @throws MetadataException if an error occurs
     */
    boolean isExists(Query query) throws MetadataException;


    /**
     * Metadata add operation.
     * @param metadata Instance of new Metadata
     * @throws MetadataException if an error occurs
     */
    void add(Metadata metadata) throws MetadataException;

    /**
     * Metadata update operation.
     * @param metadata Updated instance of existing Metadata
     * @throws MetadataException if an error occurs
     */
    void update(Metadata metadata) throws MetadataException;


    /**
     * Metadata delete operation.
     *
     * @param query query parameters
     * @throws MetadataException if an error occurs
     */
    void delete(Query query) throws MetadataException;

    /**
     * Metadata get operation.
     *
     * @param query query parameters
     * @return Metadata instance
     * @throws MetadataException if an error occurs
     */
    Metadata get(Query query) throws MetadataException;

    /**
     * Metadata list operation.
     *
     * @param query             query parameters
     * @param paginationContext to paginate results based on the start and end index
     * @return list of Metadata found for given query
     * @throws MetadataException if an error occurs
     */
    List<Metadata> get(Query query, PaginationContext paginationContext) throws MetadataException;
}
