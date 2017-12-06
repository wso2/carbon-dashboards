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
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.owasp.encoder.Encode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.carbon.analytics.msf4j.interceptor.common.AuthenticationInterceptor;
import org.wso2.carbon.dashboards.core.WidgetInfoProvider;
import org.wso2.carbon.dashboards.core.bean.widget.GeneratedWidgetConfigs;
import org.wso2.carbon.dashboards.core.exception.DashboardException;
import org.wso2.msf4j.Microservice;
import org.wso2.msf4j.interceptor.annotation.RequestInterceptor;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import static javax.ws.rs.core.Response.Status.CONFLICT;
import static javax.ws.rs.core.Response.Status.CREATED;
import static javax.ws.rs.core.Response.Status.NOT_FOUND;
import static javax.ws.rs.core.Response.Status.OK;

/**
 * REST API for widget related operations.
 *
 * @since 4.0.0
 */
@Component(name = "org.wso2.carbon.dashboards.api.WidgetApi",
        service = Microservice.class,
        immediate = true)
@Path("/portal/apis/widgets")
@RequestInterceptor(AuthenticationInterceptor.class)
public class WidgetRestApi implements Microservice {

    private static final Logger LOGGER = LoggerFactory.getLogger(WidgetRestApi.class);

    private WidgetInfoProvider widgetInfoProvider;

    @Activate
    protected void activate(BundleContext bundleContext) {
        LOGGER.debug("{} activated.", this.getClass().getName());
    }

    @Deactivate
    protected void deactivate(BundleContext bundleContext) {
        LOGGER.debug("{} deactivated.", this.getClass().getName());
    }

    @Reference(service = WidgetInfoProvider.class,
            cardinality = ReferenceCardinality.MANDATORY,
            policy = ReferencePolicy.DYNAMIC,
            unbind = "unsetWidgetInfoProvider")
    protected void setWidgetInfoProvider(WidgetInfoProvider widgetInfoProvider) {
        this.widgetInfoProvider = widgetInfoProvider;
    }

    protected void unsetWidgetInfoProvider(WidgetInfoProvider widgetInfoProvider) {
        this.widgetInfoProvider = null;
    }

    /**
     * Returns a list of widget configurations.
     *
     * @return response that carries list of widget configurations
     */
    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getWidgetsMetaInfo() {
        try {
            return okResponse(widgetInfoProvider.getAllWidgetConfigurations());
        } catch (DashboardException e) {
            LOGGER.error("An error occurred when listing widget configurations.", e);
            return serverErrorResponse("Cannot list widget configurations.");
        }
    }

    /**
     * This method return the configuration of given widget.
     *
     * @param widgetId widget id
     * @return widget configuration
     */
    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getWidgetConf(@PathParam("id") String widgetId) {
        try {
            return widgetInfoProvider.getWidgetConfiguration(widgetId)
                    .map(WidgetRestApi::okResponse)
                    .orElse(Response.status(NOT_FOUND).entity("Cannot find widget '" + widgetId + "'.").build());
        } catch (DashboardException e) {
            LOGGER.error("An error occurred when retrieving configuration of widget '{}'.",
                         getEncodedString(widgetId), e);
            return serverErrorResponse("Cannot retrieve configuration of widget '" + widgetId + "'.");
        }
    }

    /**
     * This method provides thumbnail of given widget.
     *
     * @param widgetId widget id
     * @return thumbnail of given widget
     */
    @GET
    @Path("/{id}/thumbnail")
    public Response getThumbnail(@PathParam("id") String widgetId) {
        // TODO: 11/8/17 Implement
        return Response.ok().build();
    }

    private static Response okResponse(Object content) {
        return Response.ok().entity(content).build();
    }

    private static Response serverErrorResponse(String message) {
        return Response.serverError().entity(message).build();
    }

    /**
     * Validate widget name.
     *
     * @param widgetName data for the validate widget name.
     * @return response
     */
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("{widgetName}/validate")
    public Response validateWidgetName(@PathParam("widgetName") String widgetName) {
        try {
            if (!widgetInfoProvider.isWidgetPresent(widgetName)) {
                return Response.status(OK).build();
            } else {
                return Response.status(CONFLICT).build();
            }
        } catch (DashboardException e) {
            LOGGER.error("An error occurred when validating the widget name: " +
                         getEncodedString(widgetName) + ".", e);
            return Response.serverError()
                    .entity("An error occurred when validating the widget name: " + widgetName + ".").build();
        }
    }

    /**
     * Create a generated widget.
     *
     * @param generatedWidgetConfigs data for the creating widget.
     * @return response
     */
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/")
    public Response create(GeneratedWidgetConfigs generatedWidgetConfigs) {
        try {
            widgetInfoProvider.addGeneratedWidgetConfigs(generatedWidgetConfigs);
            return Response.status(CREATED).build();
        } catch (DashboardException e) {
            LOGGER.error("An error occurred when creating a new gadget from {} data.",
                         getEncodedString(generatedWidgetConfigs.toString()), e);
            return Response.serverError()
                    .entity("Cannot create a new gadget from '" + generatedWidgetConfigs + "'.").build();
        }
    }

    private String getEncodedString(String str) {
        String cleanedString = str.replace('\n', '_').replace('\r', '_');
        cleanedString = Encode.forHtml(cleanedString);
        if (!cleanedString.equals(str)) {
            cleanedString += " (Encoded)";
        }
        return cleanedString;
    }
}
