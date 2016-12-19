package org.wso2.carbon.dashboards.metadata.api;
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

import org.wso2.carbon.dashboards.metadata.bean.Metadata;
import org.wso2.carbon.dashboards.metadata.bean.Query;
import org.wso2.carbon.dashboards.metadata.exception.MetadataException;
import org.wso2.carbon.dashboards.metadata.provider.MetadataProvider;
import org.wso2.msf4j.Microservice;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

/**
 * This is the API implementation for the meta data backend service.
 */
public class MetadataProviderAPI implements Microservice {

    @POST
    @Path("/add")
    @Consumes("application/json")
    @Produces("application/json")
    public void add(Metadata metadata) throws MetadataException {
        MetadataProvider metadataProvider = DataHolder.getMetadataProvider();
        if (metadataProvider != null) {
            metadataProvider.add(metadata);
        }
    }

    @PUT
    @Path("/update")
    @Consumes("application/json")
    @Produces("application/json")
    public void update(Metadata metadata) throws MetadataException {
        MetadataProvider metadataProvider = DataHolder.getMetadataProvider();
        if (metadataProvider != null) {
            metadataProvider.update(metadata);
        }
    }

    @DELETE
    @Path("/delete")
    @Consumes("application/json")
    @Produces("application/json")
    public void delete(Query query) throws MetadataException {
        MetadataProvider metadataProvider = DataHolder.getMetadataProvider();
        if (metadataProvider != null) {
            metadataProvider.delete(query);
        }
    }

    @POST
    @Consumes("application/json")
    @Produces("application/json")
    @Path("/get")
    public Metadata get(Query query) throws MetadataException {
        MetadataProvider metadataProvider = DataHolder.getMetadataProvider();
        if (metadataProvider != null) {
            return metadataProvider.get(query);
        }
        return null;
    }


    // todo: Remove this resource, this is just for testing
    @GET
    @Path("/sayHello")
    public String sayHello() {
        return "Hello!";
    }
}
