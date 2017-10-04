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

import org.osgi.service.component.annotations.Component;
import org.wso2.carbon.dashboards.core.widget.info.WidgetInfoProviderImpl;
import org.wso2.msf4j.Microservice;

import java.util.Set;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;


/**
 * This is the back-end api to get the widget related information.
 */
@Component(
        name = "org.wso2.carbon.dashboards.api.WidgetInfoProviderAPI",
        service = Microservice.class,
        immediate = true
)
@Path("/apis/widgets")
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
        WidgetInfoProviderImpl widgetInfoProvider = new WidgetInfoProviderImpl();
        Set extensions = widgetInfoProvider.getWidgetsMetaInfo().get();
        return Response.ok().entity(extensions).build();
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
        return Response.ok().build();
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
        return Response.ok().build();
    }
}
