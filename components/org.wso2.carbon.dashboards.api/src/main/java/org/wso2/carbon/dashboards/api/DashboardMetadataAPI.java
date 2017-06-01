package org.wso2.carbon.dashboards.api;
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

import org.wso2.carbon.dashboards.core.bean.DashboardMetadata;
import org.wso2.carbon.dashboards.core.bean.PaginationContext;
import org.wso2.carbon.dashboards.core.bean.Query;
import org.wso2.carbon.dashboards.core.exception.DashboardException;
import org.wso2.carbon.dashboards.core.provider.DashboardMetadataProvider;
import org.wso2.msf4j.Microservice;

import java.util.List;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 * This is the API implementation for the meta data backend service.
 */
public class DashboardMetadataAPI implements Microservice {

    /**
     * Get list of dashboards available.
     *
     * @return List of dashboards
     * @throws DashboardException
     */
    @GET
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/")
    public Response list() throws DashboardException {
        DashboardMetadataProvider provider = DataHolder.getInstance().getDashboardMetadataProvider();
        if (provider != null) {
            List<DashboardMetadata> dashboards = provider.list(new Query(getUsername()), new PaginationContext());
            return Response.ok().entity(dashboards).build();
        }
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
    }

    /**
     * Get a particular dashboard selected by the ID.
     *
     * @param id Dashboard ID
     * @return Dashboard metadata
     * @throws DashboardException
     */
    @GET
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/{id}")
    public Response get(@PathParam("id") String id) throws DashboardException {
        DashboardMetadataProvider provider = DataHolder.getInstance().getDashboardMetadataProvider();
        if (provider != null) {
            DashboardMetadata metadata = provider.get(new Query(getUsername(), id));
            if (metadata == null) {
                Response.status(Response.Status.NOT_FOUND).build();
            }
            return Response.ok().entity(metadata).build();
        }
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
    }

    /**
     * Create a new dashboard
     *
     * @param dashboardMetadata Dashboard metadata
     * @return Status
     * @throws DashboardException
     */
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/")
    public Response create(DashboardMetadata dashboardMetadata) throws DashboardException {
        DashboardMetadataProvider provider = DataHolder.getInstance().getDashboardMetadataProvider();
        if (provider != null) {
            provider.add(dashboardMetadata);
            return Response.status(Response.Status.CREATED).build();
        }
        // TODO: Check the correct status code based on the exception.
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
    }

    /**
     * Update a particular dashboard.
     *
     * @param id                Dashboard ID
     * @param dashboardMetadata Dashboard metadata
     * @return Status
     * @throws DashboardException
     */
    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/{id}")
    public Response update(@PathParam("id") String id, DashboardMetadata dashboardMetadata) throws DashboardException {
        DashboardMetadataProvider provider = DataHolder.getInstance().getDashboardMetadataProvider();
        if (provider != null) {
            provider.update(dashboardMetadata);
            return Response.ok().build();
        }
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
    }

    /**
     * Delete a particular dashboard.
     *
     * @param id Dashboard ID
     * @return Status
     * @throws DashboardException
     */
    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") String id) throws DashboardException {
        DashboardMetadataProvider provider = DataHolder.getInstance().getDashboardMetadataProvider();
        if (provider != null) {
            provider.delete(new Query(getUsername(), id));
            return Response.ok().build();
        }
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
    }

    /**
     * Get username from the authentication headers.
     *
     * @return Username
     */
    private String getUsername() {
        // TODO: Get the username from the authentication headers
        return "admin";
    }
}
