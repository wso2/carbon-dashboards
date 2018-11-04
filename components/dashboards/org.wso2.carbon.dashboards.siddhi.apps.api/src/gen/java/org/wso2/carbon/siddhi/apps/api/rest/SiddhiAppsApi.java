/*
 *   Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.carbon.analytics.msf4j.interceptor.common.AuthenticationInterceptor;
import org.wso2.carbon.siddhi.apps.api.rest.factories.AppsApiServiceFactory;
import org.wso2.msf4j.Microservice;

import javax.ws.rs.*;
import javax.ws.rs.core.Response;
import org.wso2.msf4j.interceptor.annotation.RequestInterceptor;


@RequestInterceptor(AuthenticationInterceptor.class)
@javax.annotation.Generated(value = "io.swagger.codegen.languages.JavaMSF4JServerCodegen",
        date = "2018-08-01T11:26:25.925Z")
public class SiddhiAppsApi implements Microservice {
    public static final String API_CONTEXT_PATH = "/apis/datasearch";
    private Logger log = LoggerFactory.getLogger(SiddhiAppsApi.class);
    private final SiddhiAppsApiService delegate = AppsApiServiceFactory.getSiddhiAppsApi();

    /**
     * Returns list of @store annotated Aggregations,Tables,Windows from a siddhi app
     *
     * @param id worker id
     * @param appName siddhi app name
     * @return response
     */
    @OPTIONS
    @Path("/{id}/{appName}")
    @GET
    @Produces({ "application/json" })
    public Response getSiddhiAppDefinitions(
         @PathParam("id") String id, @PathParam("appName") String appName) {
        return delegate.getSiddhiAppDefinitions(id,appName);
    }

    /**
     * Returns list of siddhi apps which contain @store annotated Aggregations,Tables,Windows
     *
     * @return
     */
    @Path("/siddhi-apps")
    @GET
    @Produces({ "application/json" })
    public Response getAllSiddhiApps(){
        return delegate.getAllSiddhiApps();
    }

}