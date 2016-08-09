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

import org.apache.commons.io.FileUtils;
import org.apache.log4j.Logger;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;

public class DSPortalAppMigrationTool extends DSMigrationTool {
    private static final Logger log = Logger.getLogger(DSPortalAppMigrationTool.class);
    private static final String GADGET = "gadget";
    private static final String WIDGET = "widget";
    private static final String LAYOUT = "layout";
    private static final String BLOCKS = "blocks";
    private static final String STORE = "store";
    private static final String INDEX_JSON = "index.json";
    private static String storePath = "/repository/deployment/server/jaggeryapps/portal/store";
    private static String username;
    private static String password;
    static String productHome;
    static String destPath;
    static String tempDir;

    public static void main(String arg[]) {
        productHome = arg[0];
        destPath = arg[1];
        username = arg[2];
        password = arg[3];
        tempDir = productHome + "/tempDir";
        // BasicConfigurator.configure();

        DSPortalAppMigrationTool dsPortalAppMigrationTool = new DSPortalAppMigrationTool();
        dsPortalAppMigrationTool.copyDirectory(new File(productHome + storePath), new File(tempDir));
        dsPortalAppMigrationTool.migrateArtifactsInStore();
        dsPortalAppMigrationTool.copyDirectory(new File(tempDir), new File(destPath + File.separator + STORE));
        dsPortalAppMigrationTool.updateMigratedStoreWithStoreType(new File(destPath + File.separator + STORE));
        dsPortalAppMigrationTool.updateDashboardJSON();
        log.info("Portal Migration is completed successfully !");
    }

    /**
     * copy src directory to destination directory
     *
     * @param srcDir  source directory
     * @param destDir destination directory
     */
    public void copyDirectory(File srcDir, File destDir) {
        try {
            FileUtils.copyDirectory(srcDir, destDir);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * update the given modified directory adding store type as fs
     *
     * @param migratedDir
     */
    public void updateMigratedStoreWithStoreType(File migratedDir) {
        File[] tenantStores = migratedDir.listFiles();
        for (int i = 0; i < tenantStores.length; i++) {
            if (tenantStores[i].isDirectory()) {
                File fsStoreTemp = new File(
                        tempDir + File.separator + STORE + File.separator + tenantStores[i].getName() + File.separator
                                + "fs");
                try {
                    FileUtils.copyDirectory(tenantStores[i], fsStoreTemp);
                    FileUtils.deleteDirectory(tenantStores[i]);
                    FileUtils.copyDirectory(new File(tempDir + File.separator + STORE),
                            new File(destPath + File.separator + STORE));
                    FileUtils.deleteDirectory(new File(tempDir));
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }

    }

    /**
     * migrate the different types of artifacts such as gadgets,widgets and layouts into newer version
     */
    private void migrateArtifactsInStore() {
        File store = new File(tempDir);
        File[] tenantStores = store.listFiles();
        for (int i = 0; i < tenantStores.length; i++) {
            if (tenantStores[i].isDirectory()) {
                File[] artifactTypes = tenantStores[i].listFiles();
                setTenantDomain(tenantStores[i].getName());
                for (int artifactCount = 0; artifactCount < artifactTypes.length; artifactCount++) {
                    if (artifactTypes[artifactCount].getName().equalsIgnoreCase(GADGET) || artifactTypes[artifactCount]
                            .getName().equalsIgnoreCase(WIDGET)) {
                        new DSPortalAppMigrationTool().gadgetJSONUpdater(artifactTypes[artifactCount]);
                    } else if (artifactTypes[artifactCount].getName().equalsIgnoreCase(LAYOUT)) {
                        migrateLayoutsInStore(artifactTypes[artifactCount]);
                    }
                }
                setTenantDomain(null);
            }
        }
    }

    /**
     * migrate layouts into newer version
     *
     * @param layouts file path of the layouts directory
     */
    private void migrateLayoutsInStore(File layouts) {
        File[] listOflayouts = layouts.listFiles();
        JSONParser parser = new JSONParser();
        for (int layoutCount = 0; layoutCount < listOflayouts.length; layoutCount++) {
            try {
                JSONObject layoutObj = (JSONObject) parser.parse(new FileReader(
                        listOflayouts[layoutCount].getAbsolutePath() + File.separator + INDEX_JSON));
                updateDashboardBlocks(((JSONArray) layoutObj.get(BLOCKS)));
                FileWriter file = new FileWriter(
                        listOflayouts[layoutCount].getAbsolutePath() + File.separator + INDEX_JSON);
                file.write(layoutObj.toJSONString());
                file.flush();
                file.close();

            } catch (IOException e) {
                log.error("Error in opening the file " + listOflayouts[layoutCount].getName(), e);
            } catch (ParseException e) {
                log.error("Error in parsing the index.json file in " + listOflayouts[layoutCount].getAbsolutePath());
            }
        }
    }

    public void updateDashboardJSON() {
        String response = invokeRestAPI("https://localhost:9443/portal/apis/login?username=admin&password=admin",
                "POST", null, null);
        try {
            JSONObject responseObj = (JSONObject) new JSONParser().parse(response.toString());
            String sessionId = (String) responseObj.get("sessionId");
            response = invokeRestAPI("https://localhost:9443/portal/apis/dashboards", "GET", sessionId, null);
            JSONArray responseArr = (JSONArray) new JSONParser().parse(response.toString());
            for (int dashboardCount = 0; dashboardCount < responseArr.size(); dashboardCount++) {
                modifyDashboardJSON(dashboardUpdater((JSONObject) responseArr.get(dashboardCount)), sessionId);
            }
        } catch (ParseException e) {
            e.printStackTrace();
        }
    }

    public String invokeRestAPI(String requestURL, String requestType, String sessionId, String content) {
        try {
            System.setProperty("javax.net.ssl.trustStore",
                    productHome + "/repository/resources/security/wso2carbon.jks");
            System.setProperty("javax.net.ssl.trustStorePassword", "wso2carbon");

            URL url = new URL(requestURL);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod(requestType);

            if (sessionId != null) {
                conn.setRequestProperty("Cookie", "JSESSIONID=" + sessionId);
            }
            if (content != null) {
                conn.setDoOutput(true);
                conn.setRequestProperty("Content-Type", "application/json");
                OutputStreamWriter wr = new OutputStreamWriter(conn.getOutputStream());
                wr.write(content);
                wr.flush();
            }

            if (conn.getResponseCode() != 200) {
                throw new RuntimeException("Failed : HTTP error code : " + conn.getResponseCode());
            }
            BufferedReader br = new BufferedReader(new InputStreamReader((conn.getInputStream())));
            String output;
            StringBuilder buffer = new StringBuilder();
            while ((output = br.readLine()) != null) {
                buffer.append(output);
            }
            output = buffer.toString();
            conn.disconnect();
            return output;
        } catch (MalformedURLException e) {
            log.error("Error in rest api url " + requestURL, e);
        } catch (IOException e) {
            log.error("Error in calling rest api url : " + requestURL, e);
        }
        return null;
    }

    /**
     * update dahboard json in the ds dashboard in order to compatible with carbon-dashboards version 1.0.15+
     *
     * @param dashboardJSONObject dashboardJSON to be updated
     */
    private JSONObject dashboardUpdater(JSONObject dashboardJSONObject) {
        Object obj = dashboardJSONObject.get("pages");
        JSONArray pagesJSONArray = (JSONArray) obj;
        for (int pageCount = 0; pageCount < pagesJSONArray.size(); pageCount++) {
            JSONObject pageObj = ((JSONObject) pagesJSONArray.get(pageCount));
            JSONArray blocksArray = ((JSONArray) ((JSONObject) ((JSONObject) ((JSONObject) pageObj.get("layout"))
                    .get("content")).get("loggedIn")).get("blocks"));
            JSONObject gadgetSet = ((JSONObject) ((JSONObject) pageObj.get("content")).get("default"));
            Object[] keySet = ((JSONObject) ((JSONObject) pageObj.get("content")).get("default")).keySet().toArray();
            for (int gadgetCount = 0; gadgetCount < keySet.length; gadgetCount++) {
                dashboardGadgetUpdater(((JSONArray) gadgetSet.get(keySet[gadgetCount])));
            }
            updateDashboardBlocks(blocksArray);
        }
        return dashboardJSONObject;
    }

    /**
     * Put the modified dashboard.json into registry
     *
     * @param dashboardObj dashboard json object
     * @param sessionId    relevant session ID
     */
    private void modifyDashboardJSON(JSONObject dashboardObj, String sessionId) {
        //        String response = invokeRestAPI(
        //                "https://localhost:9443/portal/apis/dashboards/" + (String) dashboardObj.get("id"), "PUT", sessionId,
        //                dashboardObj.toJSONString());
        try {
            File file = new File(
                    destPath + File.separator + "Dashboards" + File.separator + dashboardObj.get("id") + ".json");
            file.getParentFile().mkdir();
            file.createNewFile();
            FileWriter filew = new FileWriter(
                    destPath + File.separator + "Dashboards" + File.separator + dashboardObj.get("id") + ".json");
            filew.write(dashboardObj.toJSONString());
            filew.flush();
            filew.close();
        } catch (IOException e) {
            log.error("Error in writing dashboard " + dashboardObj.get("id") + " into destination path", e);
        }
    }
}
