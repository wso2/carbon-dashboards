/**
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 * <p>
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 * <p>
 * http://www.apache.org/licenses/LICENSE-2.0
 * <p>
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
package org.wso2.carbon.dashboards.migrationtool;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.log4j.BasicConfigurator;
import org.apache.log4j.Logger;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class DSMigrationTool {
    private static final Logger log = Logger.getLogger(DSMigrationTool.class);
    private static final String GADGET_JSON = "gadget.json";
    private static String tenantDomain = null;

    /**
     * Update the gadgetJSON in the gadgets folders.iterate through all the gadgets and update the gadget jsons
     *
     * @param artifactPath artifact path which consists the gadgets folders
     */
    protected void gadgetJSONUpdater(File artifactPath) {
        File[] listOfFiles = artifactPath.listFiles();
        String modifiedGadgetID;
        JSONObject gadgetJSONObject = null, gadgetDataObj;
        String thumbnail;
        String url;
        for (int i = 0; i < listOfFiles.length; i++) {
            if (listOfFiles[i].isDirectory()) {
                try {
                    JSONParser jsonParser = new JSONParser();
                    Object obj = jsonParser.parse(new FileReader(
                            artifactPath + File.separator + listOfFiles[i].getName() + File.separator + GADGET_JSON));
                    gadgetJSONObject = (JSONObject) obj;
                    modifiedGadgetID = listOfFiles[i].getName().toLowerCase();
                    gadgetJSONObject.put("id", modifiedGadgetID);
                    thumbnail = (String) gadgetJSONObject.get("thumbnail");
                    gadgetDataObj = (JSONObject) gadgetJSONObject.get("data");
                    url = (String) (gadgetDataObj).get("url");
                    if ((thumbnail).contains(modifiedGadgetID)) {
                        gadgetJSONObject.remove("thumbnail");
                        gadgetJSONObject.put("thumbnail", replace(thumbnail, modifiedGadgetID, modifiedGadgetID));
                    }
                    gadgetDataObj.remove("url");
                    if (url.toLowerCase().contains("local")) {
                        url = replace(url, "gadget", "fs/gadget");
                    }
                    gadgetDataObj.put("url", replace(url, modifiedGadgetID, modifiedGadgetID));
                    FileWriter file = new FileWriter(
                            artifactPath + File.separator + listOfFiles[i].getName() + File.separator + GADGET_JSON);
                    file.write(gadgetJSONObject.toJSONString());
                    file.flush();
                    file.close();
                    listOfFiles[i].renameTo(new File(artifactPath + File.separator + modifiedGadgetID));
                    if(tenantDomain==null){
                        log.info("Store - Gadget "+gadgetJSONObject.get("id")+" is updated successfully !");
                    } else {
                        log.info("Store - Gadget "+gadgetJSONObject.get("id")+" in "+tenantDomain+" tenant Domain is updated successfully !");
                    }
                } catch (IOException e) {
                    log.error("Error in reading the gadget json "+gadgetJSONObject.get("id"));
                } catch (ParseException e) {
                    log.error("Error in parsing the gadget json "+gadgetJSONObject.get("id"));
                }
            }
        }
    }

    /**
     * Replace a specific word from specific text using given replacement text
     * @param srcWord original string
     * @param toReplace text to be replaced
     * @param replacement replacement text
     * @return modified text
     */
    protected String replace(String srcWord, String toReplace, String replacement) {
        Pattern pattern = Pattern.compile(toReplace, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(srcWord);
        String result = matcher.replaceFirst(replacement);
        return result;
    }

    /**
     * update the blocks section of dashboard json in order to compatible with carbon-dashboards version 1.0.15+
     *
     * @param blocksArray blocks array dashboard json
     */
    protected void updateDashboardBlocks(JSONArray blocksArray) {
        JSONObject block = null;
        long col;
        long row;
        long size_y;
        long size_x;

        for (int i = 0; i < blocksArray.size(); i++) {
            block = (JSONObject) blocksArray.get(i);
            if (block.containsKey("col")) {
                col = (Long) block.get("col");
                block.put("x", col - 1);
                block.remove("col");
            }
            if (block.containsKey("row")) {
                row = (Long) block.get("row");
                block.put("y", row - 1);
                block.remove("row");
            }
            if (block.containsKey("size_x")) {
                size_x = (Long) block.get("size_x");
                block.put("width", size_x);
                block.remove("size_x");
            }
            if (block.containsKey("size_y")) {
                size_y = (Long) block.get("size_y");
                block.put("height", size_y);
                block.remove("size_y");
            }
        }
    }

    /**
     * update the gadgetId of gadgets in the dashboard json with the modified gadgetID
     *
     * @param gadgetArr gadgets Array to update
     */
    protected void dashboardGadgetUpdater(JSONArray gadgetArr) {
        JSONObject gadgetContentObj;
        String thumbnail, url;
        String gadgetID;
        JSONObject gadgetDataObj;
        for (int i = 0; i < gadgetArr.size(); i++) {
            gadgetContentObj = (JSONObject) ((JSONObject) gadgetArr.get(i)).get("content");
            gadgetDataObj = (JSONObject) gadgetContentObj.get("data");
            url = (String) (gadgetDataObj).get("url");
            gadgetID = getGadgetID(url);
            gadgetContentObj.remove("id");
            gadgetContentObj.put("id", gadgetID);
            thumbnail = (String) gadgetContentObj.get("thumbnail");
            if ((thumbnail).contains(gadgetID)) {
                gadgetContentObj.remove("thumbnail");
                gadgetContentObj.put("thumbnail", replace(thumbnail, gadgetID, gadgetID));
            }
            gadgetDataObj.remove("url");
            if (url.toLowerCase().contains("local")) {
                url = replace(url, "gadget", "fs/gadget");
            }
            gadgetDataObj.put("url", replace(url, gadgetID, gadgetID));
            if(tenantDomain==null){
                log.info("Dashboard - Gadget "+gadgetContentObj.get("id")+" is successfully updated !");
            } else {
                log.info("Store - Gadget "+gadgetContentObj.get("id")+" in "+tenantDomain+" tenant Domain is updated successfully !");
            }
        }
    }

    /**
     * get the modified gadgetID using thumbnail URL
     *
     * @param url data URL of gadget
     * @return gadgetID
     */
    private String getGadgetID(String url) {
        String[] splittedArray = url.split("/");
        String gadgetID = splittedArray[splittedArray.length - 2];
        return gadgetID.toLowerCase();
    }

    /**
     * set tenant domain in portal app migration for logging purposes
     * @param tenantDomain given tenantId
     */
    public void setTenantDomain(String tenantDomain){
        this.tenantDomain = tenantDomain;
    }

}
