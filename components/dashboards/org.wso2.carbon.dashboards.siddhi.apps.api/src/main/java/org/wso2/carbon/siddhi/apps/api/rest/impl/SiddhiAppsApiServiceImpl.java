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

package org.wso2.carbon.siddhi.apps.api.rest.impl;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.carbon.analytics.permissions.PermissionProvider;
import org.wso2.carbon.analytics.permissions.bean.Permission;
import org.wso2.carbon.siddhi.apps.api.rest.SiddhiAppsApiService;
import org.wso2.carbon.siddhi.apps.api.rest.bean.SiddhiAppContent;
import org.wso2.carbon.siddhi.apps.api.rest.bean.SiddhiStoreElement;
import org.wso2.carbon.siddhi.apps.api.rest.internal.SiddhiAppsDataHolder;
import org.wso2.carbon.siddhi.apps.api.rest.worker.WorkerServiceFactory;
import org.wso2.msf4j.Request;
import org.wso2.siddhi.query.api.SiddhiApp;
import org.wso2.siddhi.query.compiler.SiddhiCompiler;
import java.io.IOException;
import java.io.Reader;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import javax.ws.rs.core.Response;

import static org.wso2.carbon.siddhi.apps.api.rest.utils.Constants.AGGREGATION;
import static org.wso2.carbon.siddhi.apps.api.rest.utils.Constants.PROTOCOL;
import static org.wso2.carbon.siddhi.apps.api.rest.utils.Constants.STORE_ANNOTATION;
import static org.wso2.carbon.siddhi.apps.api.rest.utils.Constants.TABLE;
import static org.wso2.carbon.siddhi.apps.api.rest.utils.Constants.WINDOW;

/**
 * Implementation of SiddhiApps REST API
 */
@javax.annotation.Generated(value = "io.swagger.codegen.languages.JavaMSF4JServerCodegen",
        date = "2017-11-01T11:26:25.925Z")
public class SiddhiAppsApiServiceImpl extends SiddhiAppsApiService {

    private static final Logger log = LoggerFactory.getLogger(SiddhiAppsApiServiceImpl.class);
    private static final String PERMISSION_APP_NAME = "DASH";
    private static final String VIEW_SIDDHI_APP_PERMISSION_STRING = "DASH.siddhiApp.viewer";
    private static final Type listType = new TypeToken<List<String>>() { }.getType();
    private Gson gson = new Gson();
    private PermissionProvider permissionProvider;

    public SiddhiAppsApiServiceImpl() {
        permissionProvider = SiddhiAppsDataHolder.getInstance().getPermissionProvider();
    }

    @Override
    public Response getSiddhiAppStoreElements(Request request, String appName) {
        if (getUserName(request) != null && !permissionProvider.hasPermission(getUserName(request), new Permission
                (PERMISSION_APP_NAME, VIEW_SIDDHI_APP_PERMISSION_STRING))) {
            return Response.status(Response.Status.UNAUTHORIZED).entity("Insufficient permissions to view Siddhi " +
                    "Apps for user " + getUserName(request)).build();
        }

        if (SiddhiAppsDataHolder.getInstance().getSiddhiAppMap().isEmpty()) {
            getSiddhiAppsFromWorkers();
        }

        List<SiddhiStoreElement> storeElementsList = SiddhiAppsDataHolder.getInstance().getSiddhiAppMap().get(appName);
        if (storeElementsList != null) {
            String jsonString = new Gson().toJson(storeElementsList);
            return Response.ok().entity(jsonString).build();
        }
        return Response.status(Response.Status.NOT_FOUND).entity("Siddhi App not found").build();
    }

    @Override
    public Response getSiddhiApps(Request request) {
        if (getUserName(request) != null && !permissionProvider.hasPermission(getUserName(request), new
                Permission(PERMISSION_APP_NAME, VIEW_SIDDHI_APP_PERMISSION_STRING))) {
            return Response.status(Response.Status.UNAUTHORIZED).entity("Insufficient permissions to view Siddhi Apps" +
                    "for user " + getUserName(request))
                    .build();
        }

        getSiddhiAppsFromWorkers();
        List<String> siddhiAppList = SiddhiAppsDataHolder.getInstance().getSiddhiAppMap().keySet().stream().sorted()
                .collect(Collectors.toList());
        String jsonString = new Gson().toJson(siddhiAppList);
        return Response.ok().entity(jsonString).build();
    }

    private static String getUserName(Request request) {
        Object username = request.getProperty("username");
        return username != null ? username.toString() : null;
    }

    private void getSiddhiAppsFromWorkers() {
        String username = SiddhiAppsDataHolder.getInstance().getUsername();
        String password = SiddhiAppsDataHolder.getInstance().getPassword();
        List<String> workerList = SiddhiAppsDataHolder.getInstance().getWorkerList();
        Map<String, List<SiddhiStoreElement>> siddhiAppsMap = new ConcurrentHashMap<>();

        if (workerList != null) {
            workerList.parallelStream().forEach(worker -> {
                try {
                    feign.Response workerResponse = WorkerServiceFactory.getWorkerHttpsClient(PROTOCOL + worker,
                            username, password).getSiddhiAppNames();
                    if (workerResponse == null) {
                        log.warn("Requested Response is null from worker " + worker);
                    } else {
                        if (workerResponse.status() == 200) {
                            Reader inputStream = workerResponse.body().asReader();

                            //list of siddhi apps in the worker
                            List<String> siddhiAppList = gson.fromJson(inputStream, listType);
                            siddhiAppList.parallelStream().forEach(appName -> {
                                try {
                                    feign.Response response = WorkerServiceFactory.getWorkerHttpsClient(
                                            PROTOCOL + worker, username, password).getSiddhiAppContent(appName);

                                    //Get App Content
                                    SiddhiAppContent siddhiAppContent = gson.fromJson(response.body().toString(),
                                            SiddhiAppContent.class);
                                    String siddhiAppText = siddhiAppContent.getContent();

                                    //Compile and get Siddhi App
                                    SiddhiApp siddhiApp = SiddhiCompiler.parse(String.valueOf(siddhiAppText));
                                    List<SiddhiStoreElement> storeElementList = new ArrayList<>();

                                    //Add aggregations to list if they contain store anotation
                                    siddhiApp.getAggregationDefinitionMap().entrySet().stream().forEach(entry -> {
                                        if (entry.getValue().toString().toLowerCase().contains(STORE_ANNOTATION)) {
                                            SiddhiStoreElement siddhiStoreElement = new SiddhiStoreElement(entry
                                                    .getKey(), entry.getValue().toString(), AGGREGATION,
                                                    entry.getValue().getAttributeList());
                                            storeElementList.add(siddhiStoreElement);
                                        }
                                    });

                                    //Add tables to list if they contain store anotation
                                    siddhiApp.getTableDefinitionMap().entrySet().stream().forEach(entry -> {
                                        if (entry.getValue().toString().toLowerCase().contains(STORE_ANNOTATION)) {
                                            SiddhiStoreElement siddhiStoreElement = new SiddhiStoreElement(entry
                                                    .getKey(), entry.getValue().toString(), TABLE,
                                                    entry.getValue().getAttributeList());
                                            storeElementList.add(siddhiStoreElement);
                                        }
                                    });

                                    //Add windows to list if they contain store anotation
                                    siddhiApp.getWindowDefinitionMap().entrySet().stream().forEach(entry -> {
                                        if (entry.getValue().toString().toLowerCase().contains(STORE_ANNOTATION)) {
                                            SiddhiStoreElement siddhiStoreElement = new SiddhiStoreElement(entry
                                                    .getKey(), entry.getValue().toString(), WINDOW,
                                                    entry.getValue().getAttributeList());
                                            storeElementList.add(siddhiStoreElement);
                                        }
                                    });

                                    //Add siddhiApp to the map if it has store elements
                                    if (!storeElementList.isEmpty()) {
                                        Collections.sort(storeElementList);
                                        siddhiAppsMap.put(appName, storeElementList);
                                    }

                                } catch (feign.RetryableException e) {
                                    log.warn("Unable to reach the worker " + worker + e.getMessage(), e);
                                }
                            });

                        } else if (workerResponse.status() == 401) {
                            log.warn("Unauthorized to get reponse from worker " + worker);
                        } else {
                            log.warn("Unknown Error occured while getting response from worker " + worker);
                        }
                    }
                } catch (feign.RetryableException e) {
                    log.warn("Unable to reach the worker " + worker + e.getMessage(), e);
                } catch (IOException e) {
                    log.warn("Error occured while reading the response from worker " + worker + e.getMessage(), e);
                }
            });
        } else {
            log.warn("No workers are configured for Data Search Feature");
        }

        if (!siddhiAppsMap.isEmpty()) {
            SiddhiAppsDataHolder.getInstance().setSiddhiAppMap(siddhiAppsMap);
        }
    }
}
