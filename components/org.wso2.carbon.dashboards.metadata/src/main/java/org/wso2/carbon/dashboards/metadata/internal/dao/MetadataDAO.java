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
package org.wso2.carbon.dashboards.metadata.internal.dao;

import org.wso2.carbon.dashboards.metadata.bean.Metadata;
import org.wso2.carbon.dashboards.metadata.bean.PaginationContext;
import org.wso2.carbon.dashboards.metadata.exception.MetadataException;

import java.util.List;

/**
 * Interface of Metadata DAO.
 */
public interface MetadataDAO {

    /**
     * Check whether a Metadata exists with given uuid
     *
     * @param uuid UUID of the Metadata instance
     * @return true if a Metadata exists  with given information, false otherwise.
     * @throws MetadataException if an error occurs
     */
    boolean isExists(String uuid) throws MetadataException;

    /**
     * Check whether a Metadata exists with given Name and Version
     *
     * @param name    Name of the Metadata instance
     * @param version Version of the Metadata instance
     * @return true if a Metadata exists  with given information, false otherwise.
     * @throws MetadataException if an error occurs
     */
    boolean isExistsByVersion(String name, String version) throws MetadataException;

    /**
     * Check whether a Metadata exists with given Owner and Name
     *
     * @param owner Owner of the Metadata instance
     * @param name  Name of the Metadata instance
     * @return true if a Metadata exists  with given information, false otherwise.
     * @throws MetadataException if an error occurs
     */
    boolean isExistsOwner(String owner, String name) throws MetadataException;

    /**
     * Check whether a Metadata exists with given Owner, Name and Version
     *
     * @param owner   Owner of the Metadata instance
     * @param name    Name of the Metadata instance
     * @param version Version of the Metadata instance
     * @return true if a Metadata exists  with given information, false otherwise.
     * @throws MetadataException if an error occurs
     */
    boolean isExists(String owner, String name, String version) throws MetadataException;

    /**
     * Metadata add operation
     *
     * @param metadata Instance of new Metadata
     * @throws MetadataException if an error occurs
     */
    void add(Metadata metadata) throws MetadataException;

    /**
     * Metadata update operation.
     *
     * @param metadata Updated instance of existing Metadata
     * @throws MetadataException if an error occurs
     */
    void update(Metadata metadata) throws MetadataException;

    /**
     * Metadata delete operation using uuid.
     *
     * @param uuid UUID of the Metadata instance
     * @throws MetadataException if an error occurs
     */
    void delete(String uuid) throws MetadataException;

    /**
     * Metadata delete operation using Owner and Name.
     *
     * @param owner Owner of the Metadata instance
     * @param name  Name of the Metadata instance
     * @throws MetadataException if an error occurs
     */
    void delete(String owner, String name) throws MetadataException;

    /**
     * Metadata delete operation using Owner, Name and Version.
     *
     * @param owner   Owner of the Metadata instance
     * @param name    Name of the Metadata instance
     * @param version Version of the Metadata instance
     * @throws MetadataException if an error occurs
     */
    void delete(String owner, String name, String version) throws MetadataException;

    /**
     * Metadata get using UUID.
     *
     * @param uuid query parameters
     * @return Metadata instance
     * @throws MetadataException if an error occurs
     */
    Metadata get(String uuid) throws MetadataException;

    /**
     * Metadata listing using Name and Version .
     *
     * @param name              Name of the Metadata instance
     * @param version           Version of the Metadata instance
     * @param paginationContext to paginate results based on the start and end index
     * @return list of Metadata found for given query
     * @throws MetadataException if an error occurs
     */
    List<Metadata> list(String name, String version, PaginationContext paginationContext) throws MetadataException;

    /**
     * Metadata listing using Owner and Name .
     *
     * @param owner             Owner of the Metadata instance
     * @param name              Name of the Metadata instance
     * @param paginationContext to paginate results based on the start and end index
     * @return list of Metadata found for given query
     * @throws MetadataException if an error occurs
     */
    List<Metadata> listByOwner(String owner, String name, PaginationContext paginationContext)
            throws MetadataException;

    /**
     * Metadata listing using Owner, Name and Version .
     *
     * @param owner             Owner of the Metadata instance
     * @param name              Name of the Metadata instance
     * @param version           Version of the Metadata instance
     * @param paginationContext to paginate results based on the start and end index
     * @return list of Metadata found for given query
     * @throws MetadataException if an error occurs
     */
    List<Metadata> list(String owner, String name, String version, PaginationContext paginationContext)
            throws MetadataException;

    /**
     * Metadata listing using Name.
     *
     * @param name              Name of the Metadata instance
     * @param paginationContext to paginate results based on the start and end index
     * @return list of Metadata found for given query
     * @throws MetadataException if an error occurs
     */
    List<Metadata> listByName(String name, PaginationContext paginationContext) throws MetadataException;

}
