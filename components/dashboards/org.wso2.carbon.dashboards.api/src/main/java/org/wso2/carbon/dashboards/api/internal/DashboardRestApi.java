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

import com.google.gson.Gson;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.carbon.analytics.idp.client.core.models.Role;
import org.wso2.carbon.analytics.msf4j.interceptor.common.AuthenticationInterceptor;
import org.wso2.carbon.analytics.msf4j.interceptor.common.util.InterceptorConstants;
import org.wso2.carbon.dashboards.core.DashboardMetadataProvider;
import org.wso2.carbon.dashboards.core.bean.DashboardMetadata;
import org.wso2.carbon.dashboards.core.bean.importer.DashboardArtifact;
import org.wso2.carbon.dashboards.core.exception.DashboardException;
import org.wso2.carbon.dashboards.core.exception.UnauthorizedException;
import org.wso2.msf4j.Microservice;
import org.wso2.msf4j.Request;
import org.wso2.msf4j.interceptor.annotation.RequestInterceptor;

import java.util.List;
import java.util.Map;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import static javax.ws.rs.core.Response.Status.CONFLICT;
import static javax.ws.rs.core.Response.Status.CREATED;
import static javax.ws.rs.core.Response.Status.FORBIDDEN;
import static javax.ws.rs.core.Response.Status.NOT_FOUND;

/**
 * REST API for dashboard related operations.
 *
 * @since 4.0.0
 */
@RequestInterceptor(AuthenticationInterceptor.class)
public class DashboardRestApi implements Microservice {

    public static final String API_CONTEXT_PATH = "/apis/dashboards";
    private static final Logger LOGGER = LoggerFactory.getLogger(DashboardRestApi.class);
    private static final Gson GSON = new Gson();

    private final DashboardMetadataProvider dashboardDataProvider;

    /**
     * Creates a new dashboard REST API.
     *
     * @param dashboardDataProvider metadata provider for dhashboards
     */
    public DashboardRestApi(DashboardMetadataProvider dashboardDataProvider) {
        this.dashboardDataProvider = dashboardDataProvider;
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
    public Response get(@Context Request request) {
        try {
            return Response.ok().entity(dashboardDataProvider.getAllByUser(getUserName(request))).build();
        } catch (UnauthorizedException e) {
            return Response.status(FORBIDDEN).build();
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
    public Response get(@PathParam("id") String id, @Context Request request) {
        try {
            return dashboardDataProvider.getDashboardByUser(getUserName(request), id,
                                                            request.getHeader("X-Dashboard-Origin-Component")).map(
                    metadata ->
                            Response.ok().entity(metadata).build())
                    .orElse(Response.status(NOT_FOUND).entity("Cannot find a dashboard for ID '" + id + "'.").build());
        } catch (UnauthorizedException e) {
            return Response.status(FORBIDDEN).entity("Insufficient permissions to retrieve dashboard with ID : " +
                                                        id).build();
        } catch (DashboardException e) {
            LOGGER.error(String.format("An error occurred when retrieving" +
                                       " dashboard for ID %s.", replaceCRLFCharacters(id)), e);
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
    public Response create(@Context Request request, DashboardMetadata dashboardMetadata) {
        try {
            if (!dashboardDataProvider.get(dashboardMetadata.getUrl()).isPresent()) {
                dashboardDataProvider.add(getUserName(request), dashboardMetadata);
                return Response.status(CREATED).build();
            } else {
                return Response.status(CONFLICT)
                        .entity("Dashboard with URL " + dashboardMetadata.getUrl() + " already exists.")
                        .build();
            }
        } catch (UnauthorizedException e) {
            return Response.status(FORBIDDEN).entity("Insufficient permissions to create a dashboard").build();
        } catch (DashboardException e) {
            // TODO: 12/7/17
            LOGGER.error("An error occurred when creating a new dashboard from {} data.",
                         replaceCRLFCharacters(dashboardMetadata.toString()), e);
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
    public Response update(@PathParam("id") String id, DashboardMetadata dashboardMetadata, @Context Request request) {
        try {
            dashboardDataProvider.update(getUserName(request), dashboardMetadata);
            return Response.ok().build();
        } catch (UnauthorizedException e) {
            return Response.status(FORBIDDEN).entity("Insufficient permissions to update the dashboard with ID : " +
                                                        dashboardMetadata.getUrl()).build();
        } catch (DashboardException e) {
            LOGGER.error("An error occurred when updating dashboard '{}' with {} data.", id, dashboardMetadata, e);
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
    public Response delete(@PathParam("id") String id, @Context Request request) {
        try {
            dashboardDataProvider.delete(getUserName(request), id);
            return Response.ok().build();
        } catch (UnauthorizedException e) {
            return Response.status(FORBIDDEN).entity("Insufficient permissions to delete the dashboard with ID : "
                                                        + id).build();
        } catch (DashboardException e) {
            LOGGER.error(String.format("An error occurred when deleting dashboard %s",
                                       replaceCRLFCharacters(id)), e);
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
                    .build();
        } catch (DashboardException e) {
            LOGGER.error("Cannot retrieve user roles.", e);
            return Response.serverError()
                    .entity("Cannot retrieve user roles.")
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
                    .build();
        } catch (DashboardException e) {
            LOGGER.error("Cannot retrieve user roles for '" + replaceCRLFCharacters(username) + "'.", e);
            return Response.serverError()
                    .entity("Cannot retrieve user roles for '" + username + "'.")
                    .build();
        }
    }

    @GET
    @Path("/{url}/roles")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getDashboardRoles(@PathParam("url") String url) {
        try {
            return Response.ok()
                    .entity(dashboardDataProvider.getDashboardRoles(url))
                    .build();
        } catch (DashboardException e) {
            LOGGER.error("Cannot retrieve roles for dashboard '" + replaceCRLFCharacters(url) + "'", e);
            return Response.serverError()
                    .entity("Cannot retrieve roles for dashboard '" + url + "'")
                    .build();
        }
    }

    @POST
    @Path("/{url}/roles")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response updateDashboardRoles(@PathParam("url") String url, @Context Request request, Map<String,
            List<String>> roles) {
        try {
            dashboardDataProvider.updateDashboardRoles(getUserName(request), url, roles);
            return Response.ok().build();
        } catch (UnauthorizedException e) {
            return Response.status(FORBIDDEN).entity("Insufficient permissions to update the roles of dashboard " +
                                                        "with ID : " + url).build();
        } catch (DashboardException e) {
            LOGGER.error("Cannot update user roles of dashboard '" + replaceCRLFCharacters(url) + "'.", e);
            return Response.serverError()
                    .entity("Cannot update user roles of dashboard '" + url + "'.")
                    .build();
        }
    }

    /**
     * Get dashboard with widget definitions.
     * URL: https://localhost:9643/portal/apis/dashboards/<DASHBOARD_URL>/export
     *
     * To download the dashboard as an attachment,
     * URL: https://localhost:9643/portal/apis/dashboards/<DASHBOARD_URL>/export?download=true
     *
     * @since 4.0.29
     *
     * @param url Dashboard URL
     * @param download Flag to download as an attachment
     * @return Dashboard JSON
     */
    @GET
    @Path("/{url}/export")
    @Produces(MediaType.APPLICATION_JSON)
    public Response exportDashboard(@PathParam("url") String url, @QueryParam("download") boolean download) {

        try {
            DashboardArtifact artifact = dashboardDataProvider.exportDashboard(url);
            Response.ResponseBuilder responseBuilder = Response.ok(artifact);
            if (download) {
                responseBuilder.header("Content-Disposition", "attachment; filename=\""
                        + replaceCRLFCharacters(url) + ".json\"");
            }
            return responseBuilder.build();
        } catch (DashboardException e) {
            LOGGER.error("Cannot export dashboard '" + replaceCRLFCharacters(url) + "'.", e);
            return Response.serverError().entity("Cannot export dashboard '" + url + "'.").build();
        }
    }

    private static String getUserName(Request request) {
        return request.getProperty(InterceptorConstants.PROPERTY_USERNAME).toString();
    }

    private static String replaceCRLFCharacters(String str) {
        if (str != null) {
            str = str.replace('\n', '_').replace('\r', '_');
        }
        return str;
    }

    /**
     * Gets the configs for pdf
     *
     * @return response
     */
    @GET
    @Path("/report-config")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response getReportConfigs() {
        Map<String, Object> reportConfigurations = dashboardDataProvider.getReportGenerationConfigurations()
                                                                  .getReportConfigs();
        return Response.ok().entity(reportConfigurations).build();
    }
}
