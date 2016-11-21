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

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.collections.map.HashedMap;
import org.wso2.carbon.dashboard.authorization.util.AuthorizationUtil;
import org.wso2.carbon.dashboard.notification.utils.UserStoreUtil;
import org.wso2.carbon.dashboard.portal.core.DashboardPortalException;
import org.wso2.carbon.dashboard.portal.core.datasource.DSDataSourceManager;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.wso2.carbon.context.PrivilegedCarbonContext;
import org.wso2.carbon.registry.core.exceptions.RegistryException;
import org.wso2.carbon.user.api.UserStoreException;
import org.wso2.carbon.user.api.UserStoreManager;

import javax.servlet.http.HttpServletRequest;
//import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpSession;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import java.util.*;

import static com.sun.corba.se.impl.util.RepositoryId.cache;
import static java.lang.Integer.parseInt;

@Path("/notificationApi")
public class NotificationManagementServiceImpl implements NotificationManagementService {
    private long loggedInTimestamp;
    private long updatedTimesstamp;
    private long presentAccessTimstamp;

    private Map<String, HashMap> hashmap = new HashMap<String, HashMap>();
    private static Log log = LogFactory.getLog(NotificationManagementServiceImpl.class);
    private UserStoreManager userStoreManager;
    private DSDataSourceManager dsDataSourceManager = DSDataSourceManager.getInstance();

    public NotificationManagementServiceImpl() throws DashboardPortalException, UserStoreException {

    }

    private void setLoggedInTimestamp(long timestamp) {
        this.loggedInTimestamp = timestamp;
    }

    private void setUpdatedTimesstamp(long timesstamp) {
        this.updatedTimesstamp = timesstamp;
    }

    private void setPresentAccessTimstamp(long timstamp) {
        this.presentAccessTimstamp = timstamp;
    }


    /**
     * This is used to authenticate user and provide a uuid for each user
     *
     * @param encoded  username and password
     * @param tenantId
     * @return UUID
     * @throws NotificationManagementException
     */
    @POST
    @Path("/notifications/login/")
    @HeaderParam("encoded")
    public String login(@HeaderParam("encoded") String encoded,
                        @QueryParam("tenantId") String tenantId
    ) throws NotificationManagementException {
        String permission = "/permission/admin/manage/portal/login";
        String UUIDa = null;
        String decodedCredentials = new String(new Base64().decode(encoded.getBytes()));
        String userName = decodedCredentials.split(":")[0];
        String password = decodedCredentials.split(":")[1];
        Map<String, String> cache = new HashMap<String, String>();
        String username;
        if (userName != null && password != null) {
            try {
                if (AuthorizationUtil.isUserAuthenticated(userName, password, tenantId)) {
                    if (AuthorizationUtil.isUserAuthorized(parseInt(tenantId), userName, permission)) {
                        if (hashmap.get(userName) == null) {
                            UUIDa = UUID.randomUUID().toString();
                            setLoggedInTimestamp(System.currentTimeMillis());
                            setUpdatedTimesstamp(System.currentTimeMillis());
                            PrivilegedCarbonContext.startTenantFlow();
                            PrivilegedCarbonContext.getThreadLocalCarbonContext().setTenantId(parseInt(tenantId), true);
                            PrivilegedCarbonContext.getThreadLocalCarbonContext().setUsername(userName);
                            userStoreManager = UserStoreUtil.getUserStoreManager();
                            username = UserStoreUtil.getAuthenticatedUser();

                            cache.put("UUID", UUIDa);
                            cache.put("loggedTime", String.valueOf(loggedInTimestamp));
                            cache.put("updatedTime", String.valueOf(updatedTimesstamp));
                            hashmap.put(username, (HashMap) cache);

                        } else {
                            UUIDa = (String) (hashmap.get(userName)).get("UUID");
                        }
                    } else {
                        log.info("the user can not be authorized");
                    }
                } else {
                    log.info("Problem in Authenticating the user");
                }
            } catch (UserStoreException e) {
                log.error(e);
            } catch (RegistryException e) {
                log.info(e);
            }
        } else {
            log.error("Authentication required for this resource. " +
                    "Username or password not provided.");
        }
        return UUIDa;
    }

    /**
     * This is to validate user when accessing each methods
     *
     * @param uuid uuid for a particular user to validate the user
     * @param username username user name of the user to validate user
     * @return true or false whether the user is validated before accessing every method
     */
    private boolean validateUser(String uuid, String username) {
        System.out.println(((hashmap.get(username)).get("UUID")));
        System.out.println(uuid);
        try {
            if (uuid.equals((hashmap.get(username)).get("UUID"))) {
                long updatesTime = Long.parseLong(String.valueOf((hashmap.get(username)).get("updatedTime")));
                long timePassed = presentAccessTimstamp - updatesTime;
                System.out.println(timePassed);
                System.out.println(((hashmap.get(username)).get("UUID")));
                if (timePassed < 180000) {
                    setUpdatedTimesstamp(System.currentTimeMillis());
                    hashmap.get(username).put("updatedTime", String.valueOf(updatedTimesstamp));
                    System.out.println(cache + "  cache");
                    return true;
                } else {
                    log.info("Time out. please login");
                    return false;
                }
            } else {
                log.info("UUID is different");
                return false;
            }
        } catch (Exception e) {
            log.error(e);
            return false;
        }
    }

    /**
     * This is used to call dssourcemanager to add notifications to the database
     *
     * @param notif uuid for a particular user sent from front end
     * @param UUID username user name of the user sent from front end
     * @param username
     * @return response status
     * @throws NotificationManagementException
     */
    public Response addNotification(Notification notif, String UUID, String username) throws NotificationManagementException {
        setPresentAccessTimstamp(System.currentTimeMillis());

        if (validateUser(UUID, username)) {
            String notificationId = notif.getNotificationId();
            String title = notif.getTitle();
            String message = notif.getMessage();
            String directUrl = notif.getDirectUrl();
            List<String> usersList = notif.getUsers();
            List<String> rolesList = notif.getRoles();
            try {
                dsDataSourceManager.insertIntoNotification(notificationId, title, message, directUrl);
                for (String role : rolesList) {
                    String[] usersOFRole = userStoreManager.getUserListOfRole(role);
                    if (usersOFRole != null) {
                        for (String user : usersOFRole) {
                            //noinspection JSAnnotator
                            if (usersList.indexOf(user) == -1) {
                                usersList.add(user);
                            }
                        }
                    }
                }
                dsDataSourceManager.insertIntoUserNotification(notificationId, usersList);
                dsDataSourceManager.insertIntoRoleNotification(notificationId, rolesList);
            } catch (DashboardPortalException e) {
                log.error(e);
            } catch (UserStoreException use) {
                log.error(use);
            }
            return Response.status(Response.Status.OK).build();
        } else {
            log.info("User cannot be validated");
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * This is used to get all the notifications of the particular logged in user
     *
     * @param UUID uuid for a particular user sent from front end
     * @param username user name of the user sent from front end
     * @return response status
     * @throws NotificationManagementException
     */
    public Response getNotificationDetails(String UUID, String username) throws NotificationManagementException {
        setPresentAccessTimstamp(System.currentTimeMillis());
        if (validateUser(UUID, username)) {
            try {
                List<String> notificationList = dsDataSourceManager.getNotificationsForUsername(username);
                List<Notification> notifcnList = new ArrayList<Notification>();
                for (String notification : notificationList) {
                    String[] details;
                    details = dsDataSourceManager.getNotificationDetails(notification);
                    Notification notifcn = new Notification();
                    notifcn.setNotificationId(notification);
                    notifcn.setTitle(details[0]);
                    notifcn.setMessage(details[1]);
                    notifcn.setDirectUrl(details[2]);
                    notifcnList.add(notifcn);
                }
                NotificationDetail notifcnDetail = new NotificationDetail();
                notifcnDetail.setNotificationDetail(notifcnList);
                return Response.status(Response.Status.OK).entity(notifcnDetail).build();
            } catch (DashboardPortalException e) {
                log.error(e);
                return Response.serverError().entity(e).build();
            }
        } else {
            log.info("User cannot be validated");
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * This is used to update the status of notification
     *
     * @param UUID uuid for a particular user sent from front end
     * @param notificatonId
     * @param username
     * @return
     * @throws NotificationManagementException
     */
    public Response updateStatusOfNotification(String UUID,String notificatonId, String username) throws NotificationManagementException {
        setPresentAccessTimstamp(System.currentTimeMillis());
        if(validateUser(UUID,username)){
            try{
                dsDataSourceManager.updateReadNotification(notificatonId,username);
                return Response.status(Response.Status.OK).build();
            } catch (DashboardPortalException e) {
                log.info(e);
                return Response.serverError().entity(e).build();
            }
        } else {
            log.info("User cannot be validated");
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * This is to get the count the unread notification of the particular logged in user.
     *
     * @param UUID uuid for a particular user sent from front end
     * @param username username user name of the user sent from front end
     * @return response status
     * @throws NotificationManagementException
     */
    public Response getUnreadNotificationCount(String UUID, String username) throws NotificationManagementException {
        int count = 0;
        setPresentAccessTimstamp(System.currentTimeMillis());
        if (validateUser(UUID, username)) {
            try {
                count = dsDataSourceManager.getUnreadNotificationCount(username);
            } catch (DashboardPortalException e) {
                log.error(e);
            }
            return Response.status(Response.Status.OK).entity(count).build();
        } else {
            log.info("User cannot be validated");
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    /*@GET
    @Path("/notifications/notificationList/")
    public Response getNotificationListOfUser() throws NotificationManagementException {
        try {
            List<String> notificationList = dsDataSourceManager.getNotificationsForUsername(username);
            NotificationList notifcnList = new NotificationList();
            notifcnList.setNotifications(notificationList);
            notifcnList.setCount(getNotificationCount(username));
            return Response.status(Response.Status.OK).entity(notifcnList).build();
        } catch (DashboardPortalException dpe) {
            log.error(dpe);
            return Response.serverError().entity(dpe).build();
        }
    }*/

}
