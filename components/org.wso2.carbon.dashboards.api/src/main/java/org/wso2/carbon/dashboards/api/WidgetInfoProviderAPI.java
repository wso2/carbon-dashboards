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
package org.wso2.carbon.dashboards.api;

import org.wso2.carbon.dashboards.core.widget.info.WidgetDataHolder;
import org.wso2.carbon.dashboards.core.widget.info.WidgetInfoProvider;
import org.wso2.msf4j.Microservice;

import java.nio.file.Files;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 * This is the back-end api to get the widget related information.
 */
public class WidgetInfoProviderAPI implements Microservice {

    /**
     * This method returns a list of meta information of widgets.
     *
     * @return List of widget related meta information
     */
    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getWidgetsMetaInfo() {
        List<WidgetInfoProvider> widgetInfoProviderImplList = WidgetDataHolder.getInstance().getWidgetInfoProviders();
        List list = widgetInfoProviderImplList.stream()
                .map(widget -> widget.getWidgetsMetaInfo())
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        return Response.ok().entity(list).build();
    }

    /**
     * This method return the configuration of given widget.
     *
     * @param widgetId widget id
     * @return widget configuration
     */
    @GET
    @Path("/{id}/conf")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getWidgetConf(@PathParam("id") String widgetId) {
        List<WidgetInfoProvider> widgetInfoProviderImplList = WidgetDataHolder.getInstance().getWidgetInfoProviders();
        String widgetConf = widgetInfoProviderImplList.stream()
                .map(widget -> widget.getWidgetConf(widgetId).orElse(null))
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(null);
        if (widgetConf != null) {
            return Response.ok().entity(widgetConf).build();
        }
        return Response.status(Response.Status.NOT_FOUND).build();
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
        List<WidgetInfoProvider> widgetInfoProviderImplList = WidgetDataHolder.getInstance().getWidgetInfoProviders();
        java.nio.file.Path path = widgetInfoProviderImplList.stream()
                .map(widget -> widget.getThumbnail(widgetId).orElse(null))
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(null);
        if (path != null && Files.exists(path)) {
            return Response.ok(path.toFile()).build();
        }
        return Response.status(Response.Status.NOT_FOUND).entity("Error in retrieving widget thumbnail").build();
    }
}
