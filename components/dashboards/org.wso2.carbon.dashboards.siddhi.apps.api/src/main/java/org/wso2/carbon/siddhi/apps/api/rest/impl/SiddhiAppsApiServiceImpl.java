/*
 *   Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import org.wso2.carbon.siddhi.apps.api.rest.ApiResponseMessage;
import org.wso2.carbon.siddhi.apps.api.rest.SiddhiAppsApiService;
import org.wso2.carbon.siddhi.apps.api.rest.bean.SiddhiAppContent;
import org.wso2.carbon.siddhi.apps.api.rest.bean.SiddhiAppWorker;
import org.wso2.carbon.siddhi.apps.api.rest.bean.SiddhiDefinition;
import org.wso2.carbon.siddhi.apps.api.rest.config.ConfigReader;
import org.wso2.carbon.siddhi.apps.api.rest.worker.WorkerServiceFactory;
import org.wso2.siddhi.query.api.SiddhiApp;
import org.wso2.siddhi.query.api.definition.AggregationDefinition;
import org.wso2.siddhi.query.api.definition.TableDefinition;
import org.wso2.siddhi.query.api.definition.WindowDefinition;
import org.wso2.siddhi.query.compiler.SiddhiCompiler;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.io.Reader;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@javax.annotation.Generated(value = "io.swagger.codegen.languages.JavaMSF4JServerCodegen",
        date = "2017-11-01T11:26:25.925Z")
public class SiddhiAppsApiServiceImpl extends SiddhiAppsApiService {

    private static final Logger log = LoggerFactory.getLogger(SiddhiAppsApiServiceImpl.class);
    private Gson gson = new Gson();

    @Override
    public Response getSiddhiAppDefinitions(String id,String appName) {
        String[] hostPort = id.split("_");
        String workerURI = generateURLHostPort(hostPort[0],hostPort[1]);
        ConfigReader cf = new ConfigReader();
        String username = cf.getUserName();
        String password = cf.getPassword();

        try{

            feign.Response workerResponse = WorkerServiceFactory.getWorkerHttpsClient(
                    "https://"+workerURI,username,password).getSiddhiAppContent(appName);

            //Get App Content
            SiddhiAppContent siddhiAppContent = gson.fromJson(workerResponse.body().toString(),SiddhiAppContent.class);
            String siddhiAppText = siddhiAppContent.getContent();

            //Compile and get Siddhi App
            SiddhiApp siddhiApp = SiddhiCompiler.parse(siddhiAppText);

            //ArrayList to store definitions
            List<SiddhiDefinition> siddhiDefinitions = new ArrayList<>();

            //Getting definitions from siddhi app
            Map<String, TableDefinition> tableDefinitionMap = siddhiApp.getTableDefinitionMap();
            Map<String, WindowDefinition> windowDefinitionMap = siddhiApp.getWindowDefinitionMap();
            Map<String, AggregationDefinition> aggregationDefinitionMap = siddhiApp.getAggregationDefinitionMap();

            //Get Aggregation defintions with @store annotations
            for(Map.Entry<String, AggregationDefinition> entry : aggregationDefinitionMap.entrySet()){
                if(entry.getValue().toString().contains("@store")){

                    //Get Attribute list
                    StringBuilder attributes  = new StringBuilder(entry.getValue().getAttributeList().get(0).getName()+
                            " "+entry.getValue().getAttributeList().get(0).getType());
                    for(int i=1;i<entry.getValue().getAttributeList().size();i++){
                        attributes.append(", "+entry.getValue().getAttributeList().get(i).getName()+" "+
                                entry.getValue().getAttributeList().get(i).getType());
                    }
                    SiddhiDefinition siddhiDefinition = new SiddhiDefinition(entry.getKey(),entry.getValue().toString(),"Aggregation",attributes.toString());
                    siddhiDefinitions.add(siddhiDefinition);
                }
            }

            //Get Table defintions with @store annotations
            for(Map.Entry<String, TableDefinition> entry : tableDefinitionMap.entrySet()){
                if(entry.getValue().toString().contains("@store")){

                    //Get Attribute list
                    StringBuilder attributes  = new StringBuilder(entry.getValue().getAttributeList().get(0).getName()+
                            " "+entry.getValue().getAttributeList().get(0).getType());
                    for(int i=1;i<entry.getValue().getAttributeList().size();i++){
                        attributes.append(", "+entry.getValue().getAttributeList().get(i).getName()+" "+
                                entry.getValue().getAttributeList().get(i).getType());
                    }
                    SiddhiDefinition siddhiDefinition = new SiddhiDefinition(entry.getKey(),entry.getValue().toString(),"Table",attributes.toString());
                    siddhiDefinitions.add(siddhiDefinition);
                }
            }

            //Get Window defintions with @store annotations
            for(Map.Entry<String, WindowDefinition> entry : windowDefinitionMap.entrySet()){
                if(entry.getValue().toString().contains("@store")){
                    //Get attribute list
                    StringBuilder attributes  = new StringBuilder(entry.getValue().getAttributeList().get(0).getName()+
                            " "+entry.getValue().getAttributeList().get(0).getType());
                    for(int i=1;i<entry.getValue().getAttributeList().size();i++){
                        attributes.append(", "+entry.getValue().getAttributeList().get(i).getName()+" "+
                                entry.getValue().getAttributeList().get(i).getType());
                    }
                    SiddhiDefinition siddhiDefinition = new SiddhiDefinition(entry.getKey(),entry.getValue().toString(),"Window",attributes.toString());
                    siddhiDefinitions.add(siddhiDefinition);
                }
            }
            Collections.sort(siddhiDefinitions);
            String jsonString = new Gson().toJson(siddhiDefinitions);
            return Response.ok().entity(jsonString).build();
        }catch(feign.RetryableException e){
            log.warn("Unable to reach the worker "+workerURI);
        }catch (Exception e){
            log.warn("Error occured while getting response from worker "+workerURI+e.getMessage());
        }
        return Response.ok(new ApiResponseMessage(ApiResponseMessage.ERROR, "Error occured while getting the response from "+workerURI)).build();
    }

    @Override
    public Response getAllSiddhiApps() {
        ConfigReader cf = new ConfigReader();
        String username = cf.getUserName();
        String password = cf.getPassword();
        ArrayList<String> workerList =  cf.getWorkerList();//list of worker urls

        //Map to store siddhi apps from all the workers
        Map<String,String> siddhiApps = new ConcurrentHashMap<>();

        workerList.parallelStream().forEach(worker ->{
            try {
                feign.Response workerResponse = WorkerServiceFactory.getWorkerHttpsClient(
                        "https://" + worker, username, password).getSiddhiAppNames();
                if (workerResponse != null && workerResponse.status() == 200) {
                    Reader inputStream = workerResponse.body().asReader();

                    //list of siddhi apps in the worker
                    List<String> siddhiAppList = gson.fromJson(inputStream, new TypeToken<List<String>>() {
                    }.getType());
                    //Collections.sort(siddhiAppList);
                    ArrayList<String> removeList = new ArrayList<String>();
                    siddhiAppList.parallelStream().forEach(siddhiApp -> {
                        try {

                            feign.Response response = WorkerServiceFactory.getWorkerHttpsClient(
                                    "https://" + worker, username, password).getSiddhiAppContent(siddhiApp);

                            //Get App Content
                            SiddhiAppContent siddhiAppContent = gson.fromJson(response.body().toString(), SiddhiAppContent.class);
                            String siddhiAppText = siddhiAppContent.getContent();

                            //Compile and get Siddhi App
                            SiddhiApp s = SiddhiCompiler.parse(String.valueOf(siddhiAppText));

                            //ArrayList to store definitions in the siddhi app
                            List<SiddhiDefinition> siddhiDefinitions = new ArrayList<>();

                            //Getting defintion maps from the siddhi app
                            Map<String, TableDefinition> tableDefinitionMap = s.getTableDefinitionMap();
                            Map<String, WindowDefinition> windowDefinitionMap = s.getWindowDefinitionMap();
                            Map<String, AggregationDefinition> aggregationDefinitionMap = s.getAggregationDefinitionMap();


                            //Add definitions to list if they contain store anotation
                            for (Map.Entry<String, AggregationDefinition> entry : aggregationDefinitionMap.entrySet()) {
                                if (entry.getValue().toString().contains("@store")) {
                                    SiddhiDefinition siddhiDefinition = new SiddhiDefinition(entry.getKey(), entry.getValue().toString(), "Aggregation");
                                    siddhiDefinitions.add(siddhiDefinition);
                                }
                            }

                            for (Map.Entry<String, TableDefinition> entry : tableDefinitionMap.entrySet()) {
                                if (entry.getValue().toString().contains("@store")) {
                                    SiddhiDefinition siddhiDefinition = new SiddhiDefinition(entry.getKey(), entry.getValue().toString(), "Table");
                                    siddhiDefinitions.add(siddhiDefinition);
                                }
                            }

                            for (Map.Entry<String, WindowDefinition> entry : windowDefinitionMap.entrySet()) {
                                if (entry.getValue().toString().contains("@store")) {
                                    SiddhiDefinition siddhiDefinition = new SiddhiDefinition(entry.getKey(), entry.getValue().toString(), "Window");
                                    siddhiDefinitions.add(siddhiDefinition);
                                }
                            }

                            //Remove siddhiApp from the list if there are no definitions
                            if (siddhiDefinitions.isEmpty()) {
                                removeList.add(siddhiApp);
                            }
                        }catch(feign.RetryableException e){
                            log.warn("Unable to reach the worker "+worker);
                        }catch (Exception e){
                            log.warn("Error occured while getting response from worker "+worker+e.getMessage());
                        }
                    });
                    siddhiAppList.removeAll(removeList);

                    if (!siddhiAppList.isEmpty()) {
                        String[] hostPort = worker.split(":");
                        String workerId = generateWorkerKey(hostPort[0], hostPort[1]);

                        for (String appName : siddhiAppList) {
                            if (!siddhiApps.containsKey(appName)) {
                                siddhiApps.put(appName, workerId);
                            }
                        }
                    }
                }
            }catch(feign.RetryableException e){
                log.warn("Unable to reach the worker "+worker);
            }catch(IOException e){
                log.warn("Error occured while getting the response from worker "+worker+e.getMessage());
            }catch (Exception e){
                log.warn("Error occured while getting response from worker "+worker+e.getMessage());
            }
        });

        List<SiddhiAppWorker> siddhiAppList = new ArrayList<>();
        for(Map.Entry<String, String> entry : siddhiApps.entrySet()){
            siddhiAppList.add(new SiddhiAppWorker(entry.getKey(),entry.getValue()));
        }

        Collections.sort(siddhiAppList);
        String jsonString = new Gson().toJson(siddhiAppList);
        return Response.ok().entity(jsonString).build();
    }

    private String generateURLHostPort(String host, String port) {
        return host + ":" + port;
    }

    private String generateWorkerKey(String host, String port) {
        return host + "_" + port;
    }
}
