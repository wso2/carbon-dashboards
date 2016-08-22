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

import org.apache.log4j.Logger;
import org.json.simple.JSONObject;
import org.json.simple.parser.ParseException;
import org.wso2.carbon.context.PrivilegedCarbonContext;
import org.wso2.carbon.dashboard.deployment.internal.ServiceHolder;
import org.wso2.carbon.registry.core.Registry;
import org.wso2.carbon.registry.core.Resource;
import org.wso2.carbon.registry.core.exceptions.RegistryException;

import java.io.*;
import java.util.Enumeration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

/**
 * Utility methods used at Dashboard CApp deployment process
 */
public class DeploymentUtil {

    private static final Logger log = Logger.getLogger(DeploymentUtil.class);

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
     * Extract given CAR file into temporary directory for processing
     *
     * @param zipFile       zip File Directory
     * @param tempDirectory temp directory to extract the CAR file
     */
    public static void extractCARFile(ZipFile zipFile, File tempDirectory) {
        Enumeration files = zipFile.entries();
        File file;
        FileOutputStream fos = null;

        while (files.hasMoreElements()) {
            try {
                ZipEntry entry = (ZipEntry) files.nextElement();
                InputStream eis = zipFile.getInputStream(entry);
                byte[] buffer = new byte[1024];
                int bytesRead;
                file = new File(tempDirectory.getAbsolutePath() + File.separator + entry.getName());

                if (entry.isDirectory()) {
                    file.mkdirs();
                    continue;
                } else {
                    file.getParentFile().mkdirs();
                    file.createNewFile();
                }
                fos = new FileOutputStream(file);
                while ((bytesRead = eis.read(buffer)) != -1) {
                    fos.write(buffer, 0, bytesRead);
                }
            } catch (IOException e) {
                log.error("Error while extracting the " + zipFile.getName() + ".car File", e);
            } finally {
                if (fos != null) {
                    try {
                        fos.flush();
                        fos.close();
                    } catch (IOException e) {
                        log.error("Error in closing FileOutputStream", e);
                    }
                }
            }
        }
    }

    /**
     * Get the dashboard ID from dashboard json
     *
     * @param jsonFile dashboard json
     * @return String dashboard ID
     */
    public static String getDashboardID(File jsonFile) {
        org.json.simple.parser.JSONParser parser = new org.json.simple.parser.JSONParser();
        JSONObject dashboardJSONObject = null;
        try {
            Object obj = parser.parse(new FileReader(jsonFile.getAbsolutePath()));
            dashboardJSONObject = (JSONObject) obj;
            return (String) dashboardJSONObject.get("id");
        } catch (ParseException e) {
            log.error("Error in parsing the json file " + jsonFile.getName());
        } catch (IOException e) {
            log.error("Error in opening the json file " + jsonFile.getName());
        }
        return null;
    }
}
