/*
 *   Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *   WSO2 Inc. licenses this file to you under the Apache License,
 *   Version 2.0 (the "License"); you may not use this file except
 *   in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing,
 *   software distributed under the License is distributed on an
 *   "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *   KIND, either express or implied.  See the License for the
 *   specific language governing permissions and limitations
 *   under the License.
 *
 */

package org.wso2.carbon.siddhi.apps.api.rest;

import org.wso2.carbon.analytics.msf4j.interceptor.common.AuthenticationInterceptor;
import org.wso2.carbon.siddhi.apps.api.rest.factories.SiddhiAppsApiServiceFactory;
import org.wso2.msf4j.interceptor.annotation.RequestInterceptor;
import org.wso2.msf4j.Microservice;
import org.wso2.msf4j.Request;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;


/**
 * REST API to get deployed siddhi apps related data
 */
@RequestInterceptor(AuthenticationInterceptor.class)
@javax.annotation.Generated(value = "io.swagger.codegen.languages.JavaMSF4JServerCodegen",
        date = "2018-08-01T11:26:25.925Z")
public class SiddhiAppsApi implements Microservice {
    public static final String API_CONTEXT_PATH = "/apis/datasearch";
    private final SiddhiAppsApiService delegate = SiddhiAppsApiServiceFactory.getSiddhiAppsApi();

    /**
     * Returns list of siddhi apps which contain @store annotated elements (Aggregations,Tables,Windows)
     *
     * @return response
     */
    @Path("/siddhi-apps")
    @GET
    @Produces({ MediaType.APPLICATION_JSON })
    public Response getAllSiddhiApps(@Context Request request){
        return delegate.getSiddhiApps(request);
    }

    /**
     * Returns list of @store annotated elements from a siddhi app
     *
     * @param appName siddhi app name
     *
     * @return response
     */
    @OPTIONS
    @Path("/siddhi-apps/{appName}")
    @GET
    @Produces({ MediaType.APPLICATION_JSON })
    public Response getSiddhiAppStoreElements(@Context Request request, @PathParam("appName") String appName) {
        return delegate.getSiddhiAppStoreElements(request, appName);
    }
}
