/**
 * Copyright (c) 2005 - 2013, WSO2 Inc. (http://www.wso2.com) All Rights Reserved.
 * <p/>
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * <p/>
 * http://www.apache.org/licenses/LICENSE-2.0
 * <p/>
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.wso2.carbon.dashboard.deployment.util;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.wso2.carbon.dashboard.deployment.DashboardDeploymentException;
import org.wso2.carbon.dashboard.deployment.internal.ServiceHolder;
import org.wso2.carbon.context.PrivilegedCarbonContext;
import org.wso2.carbon.dashboard.portal.core.DashboardPortalException;
import org.wso2.carbon.registry.core.Registry;
import org.wso2.carbon.registry.core.Resource;
import org.wso2.carbon.registry.core.exceptions.RegistryException;

import java.io.*;

/**
 * Utility methods used at Dashboard CApp deployment process
 */
public class DeploymentUtil {
    private static final Log log = LogFactory.getLog(DeploymentUtil.class);

    public static void createRegistryResource(String url, Object content) throws RegistryException {
        int tenantId = PrivilegedCarbonContext.getThreadLocalCarbonContext().getTenantId();
        Registry registry = ServiceHolder.getRegistryService().getConfigSystemRegistry(tenantId);
        Resource resource = registry.newResource();
        resource.setContent(content);
        resource.setMediaType("application/json");
        registry.put(url, resource);
    }

    public static void removeRegistryResource(String resourcePath) throws RegistryException {
        int tenantId = PrivilegedCarbonContext.getThreadLocalCarbonContext().getTenantId();
        Registry registry = ServiceHolder.getRegistryService().getConfigSystemRegistry(tenantId);
        if (registry.resourceExists(resourcePath)) {
            Resource resource = registry.get(resourcePath);
            registry.delete(resourcePath);
        }
    }

    public static void copyFolder(File src, File dest) throws IOException {
        if (src.isDirectory()) {
            //if directory not exists, create it
            if (!dest.exists()) {
                dest.mkdir();
            }
            String files[] = src.list();
            for (String file : files) {
                //construct the src and dest file structure
                File srcFile = new File(src, file);
                File destFile = new File(dest, file);
                //recursive copy
                copyFolder(srcFile, destFile);
            }
        } else {
            //if file, then copy it
            //Use bytes stream to support all file types
            InputStream in = new FileInputStream(src);
            OutputStream out = new FileOutputStream(dest);
            byte[] buffer = new byte[1024];
            int length;
            //copy the file content in bytes
            while ((length = in.read(buffer)) > 0) {
                out.write(buffer, 0, length);
            }
            in.close();
            out.close();
        }
    }

    public static String readFile(File file) throws IOException {
        BufferedReader reader = new BufferedReader(new FileReader(file));
        String line = null;
        StringBuilder stringBuilder = new StringBuilder();
        String ls = System.getProperty("line.separator");
        while ((line = reader.readLine()) != null) {
            stringBuilder.append(line);
            stringBuilder.append(ls);
        }
        return stringBuilder.toString();
    }

    /**
     * To update the database when dashboard is added through car file
     *
     * @param path Path of the dashboard.json
     * @throws DashboardDeploymentException
     */
    public static void updateDatabase(String path) throws DashboardDeploymentException {
        JSONParser jsonParser = new JSONParser();
        try {
            JSONObject dashboardConfig = (JSONObject) jsonParser.parse(new FileReader(path));

            JSONArray pages = (JSONArray) dashboardConfig.get("pages");
            log.error(pages);
            log.info(pages.size());

        } catch (IOException e) {
            throw new DashboardDeploymentException("Error in reading dashboard json ", e);
        } catch (ParseException e) {
            throw new DashboardDeploymentException("Error in parsing dashboard json ", e);
        }

    }
}
