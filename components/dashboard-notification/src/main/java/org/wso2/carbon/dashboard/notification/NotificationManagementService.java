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

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Path("/notificationApi")
@Produces(MediaType.APPLICATION_JSON)
public interface NotificationManagementService {


    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/notifications/")
    Response addNotification(
            Notification notif, @QueryParam("UUID") String UUID,@QueryParam("username") String username
    ) throws NotificationManagementException;

    /*@GET
    @Path("/notifications/notificationList/{username}")
    Response getNotificationListOfUser(@PathParam("username")String username
    ) throws NotificationManagementException;*/


    @GET
    @Consumes("text/plain")
    @Path("/notifications/detail/")
    Response getNotificationDetails(@QueryParam("UUID") String UUID, @QueryParam("username") String username
    ) throws NotificationManagementException;


    @PUT
    @Path("/notifications/upadate/")
    @Consumes("text/plain")
    Response updateStatusOfNotification(@QueryParam("UUID") String UUID,@QueryParam("notificationId") String notificationId, @QueryParam("username") String username
    ) throws NotificationManagementException;

    @GET
    @Path("/notifications/newnotification/count/")
    @Consumes("text/plain")
    Response getUnreadNotificationCount( @QueryParam("UUID") String UUID, @QueryParam("username") String username
    ) throws NotificationManagementException;

    @POST
    @Produces("text/plain")
    @Path("/notifications/login/")
    @HeaderParam("encoded")
    String login(@HeaderParam("encoded") String encoded, @QueryParam("tenantId") String tenantId) throws NotificationManagementException;

}
