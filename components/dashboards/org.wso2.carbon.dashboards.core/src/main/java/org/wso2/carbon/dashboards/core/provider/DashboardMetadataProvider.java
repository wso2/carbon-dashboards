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
package org.wso2.carbon.dashboards.core.provider;

import org.wso2.carbon.dashboards.core.bean.DashboardMetadata;
import org.wso2.carbon.dashboards.core.bean.PaginationContext;
import org.wso2.carbon.dashboards.core.bean.Query;
import org.wso2.carbon.dashboards.core.exception.DashboardException;

import java.util.List;

/**
 * Interface for DashboardMetadata related business logic
 */
public interface DashboardMetadataProvider {

    /**
     * DashboardMetadata add operation.
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
     * DashboardMetadata delete operation.
     *
     * @param query query parameters
     * @throws DashboardException if an error occurs
     */
    void delete(Query query) throws DashboardException;

    /**
     * DashboardMetadata get operation.
     *
     * @param query query parameters
     * @return DashboardMetadata instance
     * @throws DashboardException if an error occurs
     */
    // TODO: 11/8/17 Since null can be returned, the return type should be changed to Optional<DashboardMetadata>
    DashboardMetadata get(Query query) throws DashboardException;

    /**
     * DashboardMetadata list operation.
     *
     * @param query             query parameters
     * @param paginationContext to paginate results based on the start and end index
     * @return list of DashboardMetadata found for given query
     * @throws DashboardException if an error occurs
     */
    List<DashboardMetadata> list(Query query, PaginationContext paginationContext) throws DashboardException;
}
