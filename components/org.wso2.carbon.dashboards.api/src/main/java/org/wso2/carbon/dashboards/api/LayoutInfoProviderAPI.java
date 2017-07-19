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

import org.wso2.carbon.dashboards.core.layout.info.LayoutDataHolder;
import org.wso2.carbon.dashboards.core.layout.info.LayoutInfoProvider;
import org.wso2.msf4j.Microservice;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;


/**
 * This is the back-end api to get the layout related information.
 */
public class LayoutInfoProviderAPI implements Microservice {
    /**
     * This method returns a list of meta information of layouts.
     *
     * @return List of layout related meta information
     */
    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Response list() {
        List<LayoutInfoProvider> layoutInfoProviderImplList = LayoutDataHolder.getInstance().getLayoutInfoProviders();
        List list = layoutInfoProviderImplList.stream().map(layout -> layout.getLayoutsMetaInfo())
                .filter(Objects::nonNull).collect(Collectors.toList());
        return Response.ok().entity(list).build();
    }
}
