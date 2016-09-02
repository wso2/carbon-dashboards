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

import org.apache.log4j.Logger;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.wso2.carbon.dashboards.migrationtool.utils.Constants;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class DSMigrationTool {
    private static final Logger log = Logger.getLogger(DSMigrationTool.class);
    private static String tenantDomain = null;

    /**
     * Update the gadgetJSON in the gadgets folders.iterate through all the gadgets and update the gadget jsons
     *
     * @param artifactPath artifact path which consists the gadgets folders
     */
    protected void gadgetJSONUpdater(File artifactPath) {
        File[] listOfFiles = artifactPath.listFiles();
        String modifiedGadgetID = null;
        JSONObject gadgetJSONObject = null, gadgetDataObj;
        String thumbnail;
        String url;
        FileWriter file = null;
        for (int i = 0; i < listOfFiles.length; i++) {
            if (listOfFiles[i].isDirectory()) {
                try {
                    JSONParser jsonParser = new JSONParser();
                    Object obj = jsonParser.parse(new FileReader(
                            artifactPath + File.separator + listOfFiles[i].getName() + File.separator
                                    + Constants.GADGET_JSON));
                    gadgetJSONObject = (JSONObject) obj;
                    modifiedGadgetID = listOfFiles[i].getName().toLowerCase();
                    gadgetJSONObject.put(Constants.ID, modifiedGadgetID);
                    thumbnail = (String) gadgetJSONObject.get(Constants.THUMBNAIL);
                    gadgetDataObj = (JSONObject) gadgetJSONObject.get(Constants.DATA);
                    url = (String) (gadgetDataObj).get(Constants.URL);
                    if ((thumbnail).contains(modifiedGadgetID)) {
                        gadgetJSONObject.remove(Constants.THUMBNAIL);
                        gadgetJSONObject
                                .put(Constants.THUMBNAIL, replace(thumbnail, modifiedGadgetID, modifiedGadgetID));
                    }
                    thumbnail = (String) gadgetJSONObject.get(Constants.THUMBNAIL);
                    if (thumbnail.contains(Constants.IMAGE_PATH_OLDER)) {
                        String modifiedThumbnail = thumbnail
                                .replaceFirst(Constants.IMAGE_PATH_OLDER, Constants.IMAGE_PATH_NEWER);
                        gadgetJSONObject.remove(Constants.THUMBNAIL);
                        gadgetJSONObject.put(Constants.THUMBNAIL, modifiedThumbnail);
                    } else {
                        int index = thumbnail.indexOf(Constants.GADGET);
                        String currentStore = thumbnail.substring(0, index);
                        String modifiedThumbnail = thumbnail.replaceFirst(currentStore, "");
                        gadgetJSONObject.remove(Constants.THUMBNAIL);
                        gadgetJSONObject.put(Constants.THUMBNAIL, modifiedThumbnail);
                    }
                    gadgetDataObj.remove(Constants.URL);
                    if (url.toLowerCase().contains(Constants.LOCAL)) {
                        url = replace(url, url.substring(0, url.indexOf(Constants.GADGET + File.separator)), "");
                    }
                    gadgetDataObj.put(Constants.URL, replace(url, modifiedGadgetID, modifiedGadgetID));
                    file = new FileWriter(artifactPath + File.separator + listOfFiles[i].getName() + File.separator
                            + Constants.GADGET_JSON);
                    file.write(gadgetJSONObject.toJSONString());
                    file.flush();
                    file.close();
                    listOfFiles[i].renameTo(new File(artifactPath + File.separator + modifiedGadgetID));
                    if (tenantDomain == null) {
                        log.info("Store - Gadget " + gadgetJSONObject.get(Constants.ID) + " is updated successfully !");
                    } else {
                        log.info("Store - Gadget " + gadgetJSONObject.get(Constants.ID) + " in " + tenantDomain
                                + " tenant Domain is updated successfully !");
                    }
                } catch (IOException e) {
                    log.error("Error in reading the gadget json " + gadgetJSONObject.get("id"));
                } catch (ParseException e) {
                    log.error("Error in parsing the gadget json " + gadgetJSONObject.get("id"));
                }
            }
        }
    }

    /**
     * Replace a specific word from specific text using given replacement text
     *
     * @param srcWord     original string
     * @param toReplace   text to be replaced
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
            if (block.containsKey(Constants.COL)) {
                col = (Long) block.get(Constants.COL);
                block.put(Constants.X, col - 1);
                block.remove(Constants.COL);
            }
            if (block.containsKey(Constants.ROW)) {
                row = (Long) block.get(Constants.ROW);
                block.put(Constants.Y, row - 1);
                block.remove(Constants.ROW);
            }
            if (block.containsKey(Constants.SIZE_X)) {
                size_x = (Long) block.get(Constants.SIZE_X);
                block.put(Constants.WIDTH, size_x);
                block.remove(Constants.SIZE_X);
            }
            if (block.containsKey(Constants.SIZE_Y)) {
                size_y = (Long) block.get(Constants.SIZE_Y);
                block.put(Constants.HEIGHT, size_y);
                block.remove(Constants.SIZE_Y);
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
            gadgetContentObj = (JSONObject) ((JSONObject) gadgetArr.get(i)).get(Constants.CONTENT);
            gadgetDataObj = (JSONObject) gadgetContentObj.get(Constants.DATA);
            url = (String) (gadgetDataObj).get(Constants.URL);
            gadgetID = getGadgetID(url);
            gadgetContentObj.remove(Constants.ID);
            gadgetContentObj.put(Constants.ID, gadgetID);
            thumbnail = (String) gadgetContentObj.get(Constants.THUMBNAIL);
            if ((thumbnail).contains(gadgetID)) {
                gadgetContentObj.remove(Constants.THUMBNAIL);
                gadgetContentObj.put(Constants.THUMBNAIL, replace(thumbnail, gadgetID, gadgetID));
            }
            thumbnail = (String) gadgetContentObj.get(Constants.THUMBNAIL);
            if (thumbnail.contains(Constants.IMAGE_PATH_OLDER)) {
                String modifiedThumbnail = thumbnail
                        .replaceFirst(Constants.IMAGE_PATH_OLDER, Constants.IMAGE_PATH_NEWER);
                gadgetContentObj.remove(Constants.THUMBNAIL);
                gadgetContentObj.put(Constants.THUMBNAIL, modifiedThumbnail);
            } else {
                int index = thumbnail.indexOf(Constants.GADGET);
                String currentStore = thumbnail.substring(0, index);
                String modifiedThumbnail = thumbnail.replaceFirst(currentStore, "");
                gadgetContentObj.remove(Constants.THUMBNAIL);
                gadgetContentObj.put(Constants.THUMBNAIL, modifiedThumbnail);
            }
            gadgetDataObj.remove(Constants.URL);
            if (url.toLowerCase().contains(Constants.LOCAL)) {
                url = replace(url, Constants.GADGET, Constants.FS_STORE + File.separator + Constants.GADGET);
            }
            gadgetDataObj.put(Constants.URL, replace(url, gadgetID, gadgetID));
            if (tenantDomain == null) {
                log.info("Dashboard - Gadget " + gadgetContentObj.get(Constants.ID) + " is successfully updated !");
            } else {
                log.info("Store - Gadget " + gadgetContentObj.get(Constants.ID) + " in " + tenantDomain
                        + " tenant Domain is updated successfully !");
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
     *
     * @param tenantDomain given tenantId
     */
    public void setTenantDomain(String tenantDomain) {
        this.tenantDomain = tenantDomain;
    }

}
