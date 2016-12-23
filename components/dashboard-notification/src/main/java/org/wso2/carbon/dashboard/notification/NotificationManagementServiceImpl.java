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

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.apache.commons.codec.binary.Base64;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.wso2.carbon.dashboard.authorization.util.AuthorizationUtil;
import org.wso2.carbon.dashboard.notification.utils.UserStoreUtil;
import org.wso2.carbon.dashboard.portal.core.DashboardPortalException;
import org.wso2.carbon.dashboard.portal.core.PortalUtils;
import org.wso2.carbon.dashboard.portal.core.datasource.DSDataSourceManager;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.wso2.carbon.context.PrivilegedCarbonContext;
import org.wso2.carbon.registry.core.exceptions.RegistryException;
import org.wso2.carbon.user.api.UserStoreException;
import org.wso2.carbon.user.api.UserStoreManager;
import org.wso2.carbon.utils.multitenancy.MultitenantUtils;

import javax.ws.rs.*;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.sql.SQLException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

import static java.lang.Integer.parseInt;

/**
 * REST api for the notification feature
 */
@Path("/notificationApi")
public class NotificationManagementServiceImpl implements NotificationManagementService {
    private long maxTime = 60 * 30 * 1000;
    private static ConcurrentHashMap<String, UserCache> userHash = new ConcurrentHashMap<String, UserCache>();
    private static Log log = LogFactory.getLog(NotificationManagementServiceImpl.class);
    private DSDataSourceManager dsDataSourceManager;
    private final Object lock = new Object();

    public NotificationManagementServiceImpl() throws DashboardPortalException, UserStoreException {
    }

    /**
     * This is used to authenticate user and provide a uuid for each user
     *
     * @param encoded  username and password
     * @param tenantId tenant id of the user
     * @return uuid random string to each user to identify validation
     * @throws NotificationManagementException exception handling
     */
    @Override
    public Response login(String encoded, String tenantId
    ) throws NotificationManagementException {
        try {
            dsDataSourceManager = DSDataSourceManager.getInstance();
        } catch (DashboardPortalException e) {
            log.error(e);
        }
        String permission = NotificationConstants.PERMISSION;
        String uuid;
        String decodedCredentials = new String(new Base64().decode(encoded.getBytes()));
        String userName = decodedCredentials.split(NotificationConstants.COLON)[0];
        String password = decodedCredentials.split(NotificationConstants.COLON)[1];
        String username;
        String tenantDomain;
        log.info(tenantId);
        if (userName != null && password != null) {
            try {
                if (AuthorizationUtil.isUserAuthenticated(userName, password, tenantId)) {
                    if (AuthorizationUtil.isUserAuthorized(parseInt(tenantId), userName, permission)) {
                        if (userHash.get(userName) == null) {
                            synchronized (lock) {
                                if (userHash.get(userName) == null) {
                                    UserCache usercache = new UserCache();
                                    uuid = UUID.randomUUID().toString();
                                    usercache.setLoggedInTimestamp(System.currentTimeMillis());
                                    usercache.setUpdatedTimesstamp(System.currentTimeMillis());
                                    PrivilegedCarbonContext.startTenantFlow();
                                    PrivilegedCarbonContext.getThreadLocalCarbonContext().setTenantId(parseInt(tenantId), true);
                                    PrivilegedCarbonContext.getThreadLocalCarbonContext().setUsername(userName);
                                    username = UserStoreUtil.getAuthenticatedUser();
                                    PrivilegedCarbonContext.endTenantFlow();
                                    tenantDomain = UserStoreUtil.getUserTenantDomain(tenantId);
                                    usercache.setUuid(uuid);
                                    userHash.put(username + NotificationConstants.AT + tenantDomain, usercache);
                                    return Response.status(Response.Status.OK).entity(uuid).build();
                                } else {
                                    return Response.status(Response.Status.CONFLICT).build();
                                }
                            }
                        } else {
                            return Response.status(Response.Status.CONFLICT).build();
                        }
                    } else {
                        log.error("the user can not be authorized");
                        return Response.status(Response.Status.UNAUTHORIZED).build();
                    }
                } else {
                    log.error("Problem in Authenticating the user");
                    return Response.status(Response.Status.PROXY_AUTHENTICATION_REQUIRED).build();
                }
            } catch (UserStoreException e) {
                log.error(e);
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();

            } catch (RegistryException e) {
                log.error(e);
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
            }
        } else {
            log.error("Authentication required for this resource. " +
                    "Username or password not provided.");
            return Response.status(Response.Status.PROXY_AUTHENTICATION_REQUIRED).build();
        }
    }

    /**
     * user logout, user details removes
     *
     * @param uuid     uuid of particular user
     * @param username username without domain name
     * @param tenantId tenantId of the user
     * @return response
     * @throws NotificationManagementException exception handling
     */
    @Override
    public Response logout(String uuid, String username, String tenantId) throws NotificationManagementException {
        if (validateUser(uuid, username, tenantId)) {
            String tenantDomain = UserStoreUtil.getUserTenantDomain(tenantId);
            String userName = username + NotificationConstants.AT + tenantDomain;
            userHash.remove(userName);
            return Response.status(Response.Status.OK).build();
        } else {
            log.error("User cannot be validated");
            return Response.status(Response.Status.REQUEST_TIMEOUT).entity(NotificationConstants.VALIDATION_ERROR).build();
        }
    }

    /**
     * This is to validate user when accessing each methods
     *
     * @param uuid     uuid for a particular user to validate the user
     * @param username username user name of the user to validate user
     * @return true or false whether the user is validated before accessing every method
     */
    private synchronized boolean validateUser(String uuid, String username, String tenantId) {
        String tenantDomain = UserStoreUtil.getUserTenantDomain(tenantId);
        UserCache usrname = userHash.get(username + NotificationConstants.AT + tenantDomain);
        try {
            JSONObject notificationApiConfig = PortalUtils.getConfiguration(NotificationConstants.NOTIFICATION_API_CONFIG);
            this.maxTime = Integer.parseInt(String.valueOf(notificationApiConfig.get(NotificationConstants.MAX_TIME)));
            if (uuid.equals(usrname.getUuid())) {
                long updatesTime = Long.parseLong(String.valueOf((userHash.get(username + NotificationConstants.AT + tenantDomain)).getUpdatedTimesstamp()));
                long presentAccessTimestamp = System.currentTimeMillis();
                long timePassed = presentAccessTimestamp - updatesTime;
                if (timePassed < maxTime) {
                    usrname.setUpdatedTimesstamp(System.currentTimeMillis());
                    return true;
                } else {
                    userHash.remove(username + NotificationConstants.AT + tenantDomain);
                    log.info("Time out. please login");
                }
            } else {
                log.info("UUID is different");
            }
        } catch (IOException e) {
            log.error(e);
        } catch (ParseException e) {
            log.error(e);
        } catch (NullPointerException e) {
            log.error(e);
        } catch (Exception e) {
            log.error(e);
        }
        return false;
    }

    /**
     * This is used to  add notifications to the database
     *
     * @param notification uuid for a particular user sent from front end
     * @param uuid         uuid  of the user sent from front end
     * @param username     username  of the user sent from front end
     * @return response status
     * @throws NotificationManagementException exception handling
     */
    @Override
    public Response addNotification(Notification notification, String tenantId, String uuid, String username) throws NotificationManagementException {
        synchronized (lock) {
            try {
                if (AuthorizationUtil.isUserAuthorized(parseInt(tenantId), username, NotificationConstants.ADD_NOTIFICATION_PERMISSION)) {
                    if (validateUser(uuid, username, tenantId)) {
                        String notificationId = notification.getNotificationId();
                        String title = notification.getTitle();
                        String message = notification.getMessage();
                        String directUrl = notification.getDirectUrl();
                        List<String> usersList = notification.getUsers();
                        if (usersList == null) {
                            usersList = new ArrayList<String>();
                        }
                        List<String> rolesList = notification.getRoles();
                        UserStoreManager userStoreManager = UserStoreUtil.getUserStoreManager(tenantId);
                        String tenantDomain = UserStoreUtil.getUserTenantDomain(tenantId);
                        try {
                            if (rolesList != null) {
                                for (String role : rolesList) {
                                    String[] usersOFRole = userStoreManager.getUserListOfRole(role);
                                    if (usersOFRole != null) {
                                        for (String user : usersOFRole) {
                                            //noinspection JSAnnotator
                                            String userOfRole = user + NotificationConstants.AT + tenantDomain;
                                            if (usersList.indexOf(userOfRole) == -1) {
                                                usersList.add(userOfRole);
                                            }
                                        }
                                    }
                                }
                            }
                            int userCount = usersList.size();
                            int readCount = 0;
                            dsDataSourceManager.insertIntoNotification(tenantDomain, notificationId, title, message, directUrl, userCount, readCount);
                            for (String user : usersList) {
                                if (tenantDomain.equals(MultitenantUtils.getTenantDomain(user))) {
                                    String notificationListOfUser = createNotificationListOfUser(user, notificationId);
                                    dsDataSourceManager.insertIntoUserNotificationTenantDomain(user, notificationListOfUser);
                                }
                            }
                            return Response.status(Response.Status.OK).build();
                        } catch (DashboardPortalException e) {
                            log.error(e);
                        } catch (UserStoreException e) {
                            log.error(e);
                        } catch (SQLException e) {
                            log.error(e);
                        } catch (NullPointerException e) {
                            log.error(e);
                        }
                    } else {
                        log.info("User cannot be validated");
                        return Response.status(Response.Status.REQUEST_TIMEOUT).entity(NotificationConstants.VALIDATION_ERROR).build();
                    }
                } else {
                    return Response.status(Response.Status.UNAUTHORIZED).build();
                }
            } catch (UserStoreException e) {
                log.error(e);
            } catch (RegistryException e) {
                log.error(e);
            }
        }
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
    }

    /**
     * This is used to get all the notifications of the particular logged in user
     *
     * @param uuid     uuid for a particular user sent from front end
     * @param username user name of the user sent from front end
     * @return response status
     * @throws NotificationManagementException exception handling
     */
    public Response getNotificationDetails(String uuid, String username, String tenantId) throws NotificationManagementException {
        if (validateUser(uuid, username, tenantId)) {
            try {
                String tenantDomain = UserStoreUtil.getUserTenantDomain(tenantId);
                String userName = username + NotificationConstants.AT + tenantDomain;
                JSONArray notificationList = getNotificationListOfUser(userName);
                JSONArray notifcnsDetail = new JSONArray();
                if (userHash.get(userName).getUserNotificationIdBackup() != null) {
                    List<String> notificationsFromBackup = userHash.get(userName).getUserNotificationIdBackup();
                    for (String notificationID : notificationsFromBackup) {
                        String[] details;
                        details = dsDataSourceManager.getNotificationDetails(notificationID, tenantDomain);
                        Notification notifcn = new Notification();
                        notifcn.setNotificationId(notificationID);
                        notifcn.setTitle(details[0]);
                        notifcn.setMessage(details[1]);
                        notifcn.setDirectUrl(details[2]);
                        notifcnsDetail.add(notifcn);
                    }
                }
                if (notificationList != null) {
                    for (Object notificationId : notificationList) {
                        String[] details;
                        details = dsDataSourceManager.getNotificationDetails(notificationId.toString(), tenantDomain);
                        Notification notifcn = new Notification();
                        notifcn.setNotificationId(notificationId.toString());
                        notifcn.setTitle(details[0]);
                        notifcn.setMessage(details[1]);
                        notifcn.setDirectUrl(details[2]);
                        notifcnsDetail.add(notifcn);
                    }
                }
                Gson gson = new GsonBuilder().setExclusionStrategies().create(); //.serializeNulls()
                String json = gson.toJson(notifcnsDetail);
                return Response.status(Response.Status.OK).entity(json).build();
            } catch (DashboardPortalException e) {
                log.error(e);
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e).build();
            } catch (SQLException e) {
                log.error(e);
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e).build();
            } catch (NullPointerException e) {
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e).build();
            }
        } else {
            log.info("User cannot be validated");
            return Response.status(Response.Status.REQUEST_TIMEOUT).entity(NotificationConstants.VALIDATION_ERROR).build();
        }
    }

    /**
     * update the list of notification ids in database
     *
     * @param notificationId id of the notification that user saw
     * @param username       username without tenantDomain
     * @param uuid           uuid of the particular user
     * @return response status after updating notificationlist of the user
     * @throws NotificationManagementException exception handling
     */
    @Override
    public Response updateNotificationsListOfUser(String notificationId, String username, String uuid, String tenantId) throws NotificationManagementException {
        if (validateUser(uuid, username, tenantId)) {
            String tenantDomain = UserStoreUtil.getUserTenantDomain(tenantId);
            String userName = username + NotificationConstants.AT + tenantDomain;
            JSONArray notificationsList = getNotificationListOfUser(userName);
            try {
                for (Object notification : notificationsList) {
                    if (notification.equals(notificationId)) {
                        if (userHash.get(userName).getUserNotificationIdBackup() == null) {
                            ArrayList<String> notificationIds = new ArrayList<String>();
                            notificationIds.add(notificationId);
                            userHash.get(userName).setUserNotificationIdBackup(notificationIds);
                        } else {
                            ArrayList<String> notificationIds = userHash.get(userName).getUserNotificationIdBackup();
                            notificationIds.add(notificationId);
                            userHash.get(userName).setUserNotificationIdBackup(notificationIds);
                        }
                        notificationsList.remove(notification);
                        dsDataSourceManager.updateNotificationListOfUser(notificationsList.toString(), userName);
                        dsDataSourceManager.updateNotificationTenantDomain(notificationId, tenantDomain);
                    }
                }
            } catch (SQLException e) {
                log.error(e);
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e).build();
            }
        } else {
            log.info("User cannot be validated");
            return Response.status(Response.Status.REQUEST_TIMEOUT).entity(NotificationConstants.VALIDATION_ERROR).build();
        }
        return Response.status(Response.Status.OK).build();
    }

    /**
     * add notification id to the list
     *
     * @param username       username with tenantDomain
     * @param notificationId notification id tobe added to the list
     * @return notification list with status
     */
    private String createNotificationListOfUser(String username, String notificationId) {
        JSONArray notificationList = getNotificationListOfUser(username);
        if (notificationList == null) {
            notificationList = new JSONArray();
            notificationList.add(notificationId);
            return notificationList.toString();
        } else {
            for (Object notification : notificationList) {
                if (notification.equals(notificationId)) {
                    return notificationList.toString();
                }
            }
            notificationList.add(notificationId);
        }
        return notificationList.toString();
    }

    /**
     * @param username username with tenantDomain
     * @return thr list of notifications saved in database with status
     */
    private JSONArray getNotificationListOfUser(String username) {
        JSONArray notifications = null;
        try {
            JSONParser parser = new JSONParser();
            notifications = (JSONArray) parser.parse(dsDataSourceManager.getNotificationListOfUser(username));
        } catch (SQLException e) {
            log.error(e);
        } catch (ParseException e) {
            log.error(e);
        } catch (NullPointerException e) {
            log.error(e);
        }
        return notifications;
    }

    public static ConcurrentHashMap<String, UserCache> getUserHash() {
        return userHash;
    }

}
