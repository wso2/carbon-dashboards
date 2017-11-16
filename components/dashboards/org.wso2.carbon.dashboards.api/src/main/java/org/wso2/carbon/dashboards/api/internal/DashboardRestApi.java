/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package org.wso2.carbon.dashboards.api.internal;

import org.osgi.framework.BundleContext;
import org.osgi.service.component.annotations.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.carbon.analytics.idp.client.core.models.Role;
import org.wso2.carbon.dashboards.core.DashboardMetadataProvider;
import org.wso2.carbon.dashboards.core.bean.DashboardMetadata;
import org.wso2.carbon.dashboards.core.exception.DashboardException;
import org.wso2.msf4j.Microservice;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.List;
import java.util.Map;

import static javax.ws.rs.core.Response.Status.CREATED;
import static javax.ws.rs.core.Response.Status.NOT_FOUND;

/**
 * REST API for dashboard related operations.
 *
 * @since 4.0.0
 */
@Component(name = "org.wso2.carbon.dashboards.api.DashboardApi",
        service = Microservice.class,
        immediate = true)
@Path("/apis/dashboards")
public class DashboardRestApi implements Microservice {

    private static final Logger LOGGER = LoggerFactory.getLogger(DashboardRestApi.class);

    private DashboardMetadataProvider dashboardDataProvider;

    @Activate
    protected void activate(BundleContext bundleContext) {
        LOGGER.debug("{} activated.", this.getClass().getName());
    }

    @Deactivate
    protected void deactivate(BundleContext bundleContext) {
        LOGGER.debug("{} deactivated.", this.getClass().getName());
    }

    @Reference(name = "dashboardMetadata",
            service = DashboardMetadataProvider.class,
            cardinality = ReferenceCardinality.MANDATORY,
            policy = ReferencePolicy.DYNAMIC,
            unbind = "unsetMetadataProvider")
    protected void setMetadataProvider(DashboardMetadataProvider dashboardDataProvider) {
        this.dashboardDataProvider = dashboardDataProvider;
    }

    protected void unsetMetadataProvider(DashboardMetadataProvider dashboardDataProvider) {
        this.dashboardDataProvider = null;
    }

    /**
     * Returns a list of available dashboards.
     *
     * @return response that carries list of available dashboards
     */
    @GET
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/")
    public Response get() {
        try {
            return Response.ok().entity(dashboardDataProvider.getAll()).build();
        } catch (DashboardException e) {
            LOGGER.error("An error occurred when listing dashboards.", e);
            return Response.serverError().entity("Cannot list dashboards.").build();
        }
    }

    /**
     * Returns the dashboard for the given ID.
     *
     * @param id dashboard ID
     * @return response that carries dashboard data
     */
    @GET
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/{id}")
    public Response get(@PathParam("id") String id) {
        try {
            return dashboardDataProvider.get(id)
                    .map(metadata -> Response.ok().entity(metadata).build())
                    .orElse(Response.status(NOT_FOUND).entity("Cannot find a dashboard for ID '" + id + "'.").build());
        } catch (DashboardException e) {
            LOGGER.error("An error occurred when retrieving dashboard for ID '{}'.", id, e);
            return Response.serverError().entity("Cannot retrieve dashboard for ID '" + id + "'.").build();
        }
    }

    /**
     * Creates a new dashboard.
     *
     * @param dashboardMetadata data for the creating dashboard
     * @return response
     */
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/")
    public Response create(DashboardMetadata dashboardMetadata) {
        try {
            dashboardDataProvider.add(dashboardMetadata);
            return Response.status(CREATED).build();
        } catch (DashboardException e) {
            LOGGER.error("An error occurred when creating a new dashboard from {} data.", dashboardMetadata, e);
            return Response.serverError()
                    .entity("Cannot create a new dashboard from '" + dashboardMetadata + "'.").build();
        }
    }

    /**
     * Updates the dashboard corresponding to the supplied ID with the supplied data.
     *
     * @param id                ID of the dashboard to update
     * @param dashboardMetadata updating data
     * @return response
     */
    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/{id}")
    public Response update(@PathParam("id") String id, DashboardMetadata dashboardMetadata) {
        try {
            dashboardDataProvider.update(dashboardMetadata);
            return Response.ok().build();
        } catch (DashboardException e) {
            LOGGER.error("Ann error occurred when updating dashboard '{}' with {} data.", id, dashboardMetadata, e);
            return Response.serverError().entity("Cannot update dashboard '" + id + "'.").build();
        }
    }

    /**
     * Deletes the dashboard corresponding to the supplied ID.
     *
     * @param id ID of the dashboard to delete
     * @return response
     */
    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") String id) {
        try {
            dashboardDataProvider.delete(id);
            return Response.ok().build();
        } catch (DashboardException e) {
            LOGGER.error("Ann error occurred when deleting dashboard '{}'.", id, e);
            return Response.serverError().entity("Cannot delete dashboard '" + id + "'.").build();
        }
    }

    @GET
    @Path("/roles")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getRoles() {
        try {
            List<Role> allRoles = dashboardDataProvider.getAllRoles();
            return Response.ok()
                    .entity(allRoles)
                    .type(MediaType.APPLICATION_JSON)
                    .build();
        } catch (DashboardException e) {
            LOGGER.error("An error occurred while retrieving roles.", e);
            return Response.serverError()
                    .entity("An error occurred while retrieving roles.")
                    .build();
        }
    }

    @GET
    @Path("/roles/{username}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getRolesByUsername(@PathParam("username") String username) {
        try {
            List<Role> roles = dashboardDataProvider.getRolesByUsername(username);
            return Response.ok()
                    .entity(roles)
                    .type(MediaType.APPLICATION_JSON)
                    .build();
        } catch (DashboardException e) {
            LOGGER.error("An error occurred while retrieving user roles.", e);
            return Response.serverError()
                    .entity("An error occurred while retrieving user roles.")
                    .build();
        }
    }

    @GET
    @Path("/{url}/roles")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getDashboardRoles(@PathParam("url") String url) {
        return Response.ok()
                .entity(dashboardDataProvider.getDashboardRoles(url))
                .type(MediaType.APPLICATION_JSON)
                .build();
    }

    @POST
    @Path("/{url}/roles")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response updateDashboardRoles(@PathParam("url") String url, Map<String, List<String>> roles) {
        try {
            dashboardDataProvider.updateDashboardRoles(url, roles);
            return Response.ok().build();
        } catch (DashboardException e) {
            LOGGER.error("An error occurred while updating dashboard roles.", e);
            return Response.serverError()
                    .entity("An error occurred while updating dashboard roles.")
                    .build();
        }
    }

}
