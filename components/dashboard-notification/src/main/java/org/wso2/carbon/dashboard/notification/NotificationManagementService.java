/*
*  Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*  WSO2 Inc. licenses this file to you under the Apache License,
*  Version 2.0 (the "License"); you may not use this file except
*  in compliance with the License.
*  You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*
*/

package org.wso2.carbon.dashboard.notification;

import javax.servlet.annotation.HttpMethodConstraint;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Path("/notificationApi")
public interface NotificationManagementService {

    @POST
    @Produces("text/plain")
    @Path("/notifications/login/")
    @HeaderParam("encoded")
    public Response login(@HeaderParam("encoded") String encoded,
                          @QueryParam("tenantId") String tenantId) throws NotificationManagementException;

    @POST
    @Produces("text/plain")
    @Path("/notifications/logout/")
    @HeaderParam("encoded")
    public Response logout(@QueryParam("uuid") String uuid,
                           @QueryParam("username") String username,
                           @QueryParam("tenantId") String tenantId) throws NotificationManagementException;

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/notifications/")
    public Response addNotification(Notification notification,
                                    @QueryParam("tenantId") String tenantId,
                                    @QueryParam("uuid") String uuid,
                                    @QueryParam("username") String username) throws NotificationManagementException;

    @GET
    @Consumes("text/plain")
    @Produces("application/json")
    @Path("/notifications/detail/")
    public Response getNotificationDetails(@QueryParam("uuid") String uuid,
                                           @QueryParam("username") String username,
                                           @QueryParam("tenantId") String tenantId) throws NotificationManagementException;

    @PUT
    @Consumes("text/plain")
    @Path("notifications/update")
    public Response updateNotificationsListOfUser(@QueryParam("notificationId") String notificationId,
                                                  @QueryParam("username") String username,
                                                  @QueryParam("uuid") String uuid,
                                                  @QueryParam("tenantId") String tenantId) throws NotificationManagementException;

}
