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

import org.apache.axis2.client.Options;
import org.apache.commons.io.FileUtils;
import org.apache.log4j.Logger;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.wso2.carbon.authenticator.stub.LoginAuthenticationExceptionException;
import org.wso2.carbon.dashboards.migrationtool.utils.Constants;
import org.wso2.carbon.dashboards.migrationtool.utils.LoginAdminServiceClient;
import org.wso2.carbon.tenant.mgt.stub.TenantMgtAdminServiceExceptionException;
import org.wso2.carbon.tenant.mgt.stub.TenantMgtAdminServiceStub;
import org.wso2.carbon.tenant.mgt.stub.beans.xsd.TenantInfoBean;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.rmi.RemoteException;
import java.util.ArrayList;

public class DSPortalAppMigrationTool extends DSMigrationTool {
    private static final Logger log = Logger.getLogger(DSPortalAppMigrationTool.class);
    static String productHome;
    static String destPath;
    static String tempDir;

    public static void main(String arg[]) {
        productHome = arg[0];
        destPath = arg[1];
        String sourceURL = arg[2];
        String sourceUsername = arg[3];
        String sourcePassword = arg[4];
        String destinationURL = arg[5];
        String destinationUsername = arg[6];
        String destinationPassword = arg[7];
        String tenantDomains = arg[8];
        ArrayList<String> listOfTenantDomains = null;
        String[] tenantDomain = new String[0];
        tempDir = productHome + File.separator + Constants.TEMP_DIR;

        System.setProperty(Constants.TRUSTED_STORE, arg[9]);
        System.setProperty(Constants.TRUSTED_STORE_PASSWORD, arg[10]);

        DSPortalAppMigrationTool dsPortalAppMigrationTool = new DSPortalAppMigrationTool();
        if (productHome.equals("notDefined")) {
            log.error("Please specify your Product Home as source directory");
        }
        if (!destPath.equals(Constants.NOT_DEFINED)) {
            try {
                FileUtils.copyDirectory(new File(productHome + Constants.STOREPATH), new File(tempDir));
                dsPortalAppMigrationTool.migrateArtifactsInStore();
                FileUtils.copyDirectory(new File(tempDir), new File(destPath + File.separator + Constants.STORE));
                dsPortalAppMigrationTool
                        .updateMigratedStoreWithStoreType(new File(destPath + File.separator + Constants.STORE));
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        if (!sourceURL.equals(Constants.NOT_DEFINED)) {
            String srcSessionId = dsPortalAppMigrationTool
                    .loginToPortal(sourceURL + Constants.LOGIN_URI_EXTENSTION, sourceUsername, sourcePassword);
            String destSessionId = dsPortalAppMigrationTool
                    .loginToPortal(destinationURL + Constants.LOGIN_URI_EXTENSTION, destinationUsername,
                            destinationPassword);

            if (tenantDomains.equals(Constants.NOT_DEFINED)) {
                try {
                    LoginAdminServiceClient loginAdminServiceClient = new LoginAdminServiceClient(sourceURL);
                    listOfTenantDomains = dsPortalAppMigrationTool.getAllTenantDomains(sourceURL,
                            loginAdminServiceClient.authenticate(sourceUsername, sourcePassword));
                    tenantDomain = listOfTenantDomains.toArray(new String[listOfTenantDomains.size()]);

                } catch (RemoteException e) {
                    log.error("Error in authenticating to the Login Admin Service", e);
                } catch (LoginAuthenticationExceptionException e) {
                    log.error("Error in authenticating to the Login Admin Service", e);
                }
            } else {
                tenantDomain = tenantDomains.split(",");
            }

            JSONArray responseArr;
            for (int i = 0; i < tenantDomain.length; i++) {
                responseArr = dsPortalAppMigrationTool
                        .getDashboardJSONs(sourceURL + Constants.DASHBOARD_URI_EXTENSTION, srcSessionId,
                                tenantDomain[i]);
                for (int dashboardCount = 0; dashboardCount < responseArr.size(); dashboardCount++) {
                    JSONObject updatedDashboardJSONobj = dsPortalAppMigrationTool
                            .dashboardUpdater((JSONObject) responseArr.get(dashboardCount));
                    dsPortalAppMigrationTool
                            .copyModifiedDashboardIntoDestination(updatedDashboardJSONobj, tenantDomain[i]);
                    if (!destinationURL.equals(Constants.NOT_DEFINED)) {
                        dsPortalAppMigrationTool
                                .updateDestinationRegistry(destinationURL + Constants.DASHBOARD_URI_EXTENSTION,
                                        destinationUsername, destinationPassword, updatedDashboardJSONobj,
                                        destSessionId, tenantDomain[i]);
                    }
                }
            }

        }
        log.info("Portal Migration is completed successfully !");
    }

    /**
     * Update the given modified directory adding store type as fs
     *
     * @param migratedDir migrated directory
     */
    private void updateMigratedStoreWithStoreType(File migratedDir) {
        File[] tenantStores = migratedDir.listFiles();
        for (int i = 0; i < tenantStores.length; i++) {
            if (tenantStores[i].isDirectory()) {
                File fsStoreTemp = new File(
                        tempDir + File.separator + Constants.STORE + File.separator + tenantStores[i].getName()
                                + File.separator + Constants.FS_STORE);
                try {
                    FileUtils.copyDirectory(tenantStores[i], fsStoreTemp);
                    FileUtils.deleteDirectory(tenantStores[i]);
                    FileUtils.copyDirectory(new File(tempDir + File.separator + Constants.STORE),
                            new File(destPath + File.separator + Constants.STORE));
                    FileUtils.deleteDirectory(new File(tempDir));
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }

    }

    /**
     * Migrate the different types of artifacts such as gadgets,widgets and layouts into newer version
     */
    private void migrateArtifactsInStore() {
        File store = new File(tempDir);
        File[] tenantStores = store.listFiles();
        for (int i = 0; i < tenantStores.length; i++) {
            if (tenantStores[i].isDirectory()) {
                File[] artifactTypes = tenantStores[i].listFiles();
                setTenantDomain(tenantStores[i].getName());
                for (int artifactCount = 0; artifactCount < artifactTypes.length; artifactCount++) {
                    if (artifactTypes[artifactCount].getName().equalsIgnoreCase(Constants.GADGET)
                            || artifactTypes[artifactCount].getName().equalsIgnoreCase(Constants.WIDGET)) {
                        new DSPortalAppMigrationTool().gadgetJSONUpdater(artifactTypes[artifactCount]);
                    } else if (artifactTypes[artifactCount].getName().equalsIgnoreCase(Constants.LAYOUT)) {
                        migrateLayoutsInStore(artifactTypes[artifactCount]);
                    }
                }
                setTenantDomain(null);
            }
        }
    }

    /**
     * Migrate layouts into newer version
     *
     * @param layouts file path of the layouts directory
     */
    private void migrateLayoutsInStore(File layouts) {
        File[] listOflayouts = layouts.listFiles();
        JSONParser parser = new JSONParser();
        for (int layoutCount = 0; layoutCount < listOflayouts.length; layoutCount++) {
            try {
                JSONObject layoutObj = (JSONObject) parser.parse(new FileReader(
                        listOflayouts[layoutCount].getAbsolutePath() + File.separator + Constants.INDEX_JSON));
                updateDashboardBlocks(((JSONArray) layoutObj.get(Constants.BLOCKS)));
                FileWriter file = new FileWriter(
                        listOflayouts[layoutCount].getAbsolutePath() + File.separator + Constants.INDEX_JSON);
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

    /**
     * Login to the portal of given url and return the session id
     *
     * @param url      url of the server
     * @param username username for login to the portal
     * @param password password for login to the portal
     * @return String session id
     */
    private String loginToPortal(String url, String username, String password) {
        String response = invokeRestAPI(url + Constants.USERNAME_QUERY + username + Constants.PASSWORD_QUREY + password,
                Constants.POST_REQUEST, null, null);
        try {
            JSONObject responseObj = (JSONObject) new JSONParser().parse(response.toString());
            String sessionId = (String) responseObj.get(Constants.SESSION_ID);
            return sessionId;
        } catch (ParseException e) {
            log.error("Error in getting dashboards from Portal", e);
        }
        return null;
    }

    /**
     * Get all the dashboards from given tenant domain
     *
     * @param url          source url of the server
     * @param sessionId    session id for authentication
     * @param tenantDomain tenant domain to get dashboards
     * @return JSONArray of dashboards
     */
    private JSONArray getDashboardJSONs(String url, String sessionId, String tenantDomain) {
        try {
            String response = invokeRestAPI(url + tenantDomain, Constants.GET_REQUEST, sessionId, null);
            JSONArray responseArr = (JSONArray) new JSONParser().parse(response.toString());
            return responseArr;
        } catch (ParseException e) {
            log.error("Error in getting dashboards from Portal", e);
        }
        return null;
    }

    /**
     * Invoke rest apis according to the given parameter
     *
     * @param requestURL  rest api request url
     * @param requestType request type ex:- POST,PUT,DELETE,GET
     * @param sessionId   session id to authenticate
     * @param content     content of the request
     * @return String response of the rest api
     */
    private String invokeRestAPI(String requestURL, String requestType, String sessionId, String content) {
        try {
            URL url = new URL(requestURL);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod(requestType);

            if (sessionId != null) {
                conn.setRequestProperty(Constants.COOKIE, Constants.JSESSION_ID + sessionId);
            }
            if (content != null) {
                conn.setDoOutput(true);
                conn.setRequestProperty(Constants.CONTENT_TYPE, Constants.APPLICATION_JSON);
                OutputStreamWriter writer = new OutputStreamWriter(conn.getOutputStream());
                writer.write(content);
                writer.flush();
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
     * Update dashboard json in the ds dashboard in order to compatible with carbon-dashboards version 1.0.15+
     *
     * @param dashboardJSONObject dashboardJSON to be updated
     */
    private JSONObject dashboardUpdater(JSONObject dashboardJSONObject) {
        Object obj = dashboardJSONObject.get(Constants.PAGES);
        JSONArray pagesJSONArray = (JSONArray) obj;
        for (int pageCount = 0; pageCount < pagesJSONArray.size(); pageCount++) {
            JSONObject pageObj = ((JSONObject) pagesJSONArray.get(pageCount));
            JSONArray blocksArray = ((JSONArray) ((JSONObject) ((JSONObject) ((JSONObject) pageObj
                    .get(Constants.LAYOUT)).get(Constants.CONTENT)).get(Constants.LOGGED_IN)).get(Constants.BLOCKS));
            JSONObject gadgetSet = ((JSONObject) ((JSONObject) pageObj.get(Constants.CONTENT)).get(Constants.DEFAULT));
            Object[] keySet = ((JSONObject) ((JSONObject) pageObj.get(Constants.CONTENT)).get(Constants.DEFAULT))
                    .keySet().toArray();
            for (int gadgetCount = 0; gadgetCount < keySet.length; gadgetCount++) {
                dashboardGadgetUpdater(((JSONArray) gadgetSet.get(keySet[gadgetCount])));
            }
            updateDashboardBlocks(blocksArray);
        }
        return dashboardJSONObject;
    }

    /**
     * Copy modified dashboard jsons into destination folder with the relevant tenant Domain
     *
     * @param dashboardObj
     * @param tenantDomain
     */
    private void copyModifiedDashboardIntoDestination(JSONObject dashboardObj, String tenantDomain) {
        try {
            File file = new File(
                    destPath + File.separator + Constants.DASHBOARDS + File.separator + tenantDomain + File.separator
                            + dashboardObj.get(Constants.ID) + Constants.JSON_EXTENSION);
            file.getParentFile().getParentFile().mkdir();
            file.getParentFile().mkdir();
            file.createNewFile();
            FileWriter filew = new FileWriter(
                    destPath + File.separator + Constants.DASHBOARDS + File.separator + tenantDomain + File.separator
                            + dashboardObj.get(Constants.ID) + Constants.JSON_EXTENSION);
            filew.write(dashboardObj.toJSONString());
            filew.flush();
            filew.close();
        } catch (IOException e) {
            log.error("Error in writing dashboard " + dashboardObj.get(Constants.ID) + " into destination path", e);
        }
    }

    /**
     * Put the modified dashboard.json into registry
     *
     * @param dashboardObj dashboard json object
     * @param sessionId    relevant session ID
     */
    private void updateDestinationRegistry(String url, String username, String password, JSONObject dashboardObj,
            String sessionId, String tenantDomain) {
        String response = invokeRestAPI(url + tenantDomain, Constants.POST_REQUEST, sessionId,
                dashboardObj.toJSONString());
    }

    /**
     * Get all the tenant domains from the server
     *
     * @param url           source url of the server
     * @param sessionCookie session cookie to invoke the admin service
     * @return list tenant domains
     */
    private ArrayList<String> getAllTenantDomains(String url, String sessionCookie) {
        try {
            TenantMgtAdminServiceStub adminServiceStub = new TenantMgtAdminServiceStub(
                    url + Constants.TENANT_MANAGEMENT_ENDPOINT_EXTENSION);
            Options option = adminServiceStub._getServiceClient().getOptions();
            option.setManageSession(true);
            option.setProperty(org.apache.axis2.transport.http.HTTPConstants.COOKIE_STRING, sessionCookie);
            TenantInfoBean[] tenantInfoBeen = adminServiceStub.retrieveTenants();
            ArrayList<String> tenantDomains = new ArrayList<String>();
            if(tenantInfoBeen!=null) {
                for (int tenantCount = 0; tenantCount < tenantInfoBeen.length; tenantCount++) {
                    tenantDomains.add(tenantInfoBeen[tenantCount].getTenantDomain());
                }
            }
            tenantDomains.add(Constants.CARBON_SUPER);
            return tenantDomains;
        } catch (RemoteException e) {
            log.error("Error in using Tenant Management Admin Service ", e);
        } catch (TenantMgtAdminServiceExceptionException e) {
            log.error("Error in using Tenant Management Admin Service ", e);
        }
        return null;
    }
}