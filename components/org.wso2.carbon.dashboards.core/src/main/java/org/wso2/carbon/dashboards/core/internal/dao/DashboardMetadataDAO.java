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
package org.wso2.carbon.dashboards.core.internal.dao;

import org.wso2.carbon.dashboards.core.bean.DashboardMetadata;
import org.wso2.carbon.dashboards.core.bean.PaginationContext;
import org.wso2.carbon.dashboards.core.exception.DashboardException;

import java.util.List;

/**
 * Interface of DashboardMetadata DAO.
 */
public interface DashboardMetadataDAO {

    /**
     * DashboardMetadata add operation
     *
     * @param dashboardMetadata Instance of new DashboardMetadata
     * @throws DashboardException if an error occurs
     */
    void add(DashboardMetadata dashboardMetadata) throws DashboardException;

    /**
     * DashboardMetadata update operation.
     *
     * @param dashboardMetadata Updated instance of existing DashboardMetadata
     * @throws DashboardException if an error occurs
     */
    void update(DashboardMetadata dashboardMetadata) throws DashboardException;

    /**
     * DashboardMetadata delete operation using Owner and Name.
     *
     * @param owner Owner of the DashboardMetadata instance
     * @param url  Name of the DashboardMetadata instance
     * @throws DashboardException if an error occurs
     */
    void delete(String owner, String url) throws DashboardException;

    /**
     * DashboardMetadata get using URL
     * @param url query parameters
     * @return DashboardMetadata instance
     * @throws DashboardException if an error occurs
     */
    DashboardMetadata get(String url) throws DashboardException;

    /**
     * DashboardMetadata listing using Name and Version .
     *
     * @param owner             Owner of the DashboardMetadata instance
     * @param paginationContext to paginate results based on the start and end index
     * @return list of DashboardMetadata found for given query
     * @throws DashboardException if an error occurs
     */
    List<DashboardMetadata> list(String owner, PaginationContext paginationContext) throws DashboardException;
}
