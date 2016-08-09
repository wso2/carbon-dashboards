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
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.log4j.BasicConfigurator;
import org.apache.log4j.Logger;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.*;
import java.util.Enumeration;
import java.util.Scanner;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import java.util.zip.ZipOutputStream;

public class DSCarFileMigrationTool extends DSMigrationTool {
    private static final Logger log = Logger.getLogger(DSCarFileMigrationTool.class);
    private static final String ARTIFACT_XML = "artifact.xml";
    private static final String GADGET_ARTIFACT = "dashboards/gadget";
    private static final String DASHBOARD_ARTIFACT = "registry/resource";
    private static String srcCarDir = null;
    private static String destCarDir = null;
    private static String tempDir ;

    public static void main(String arg[]) {
      //  BasicConfigurator.configure();
        DSCarFileMigrationTool dsMigrationTool = new DSCarFileMigrationTool();
        srcCarDir = arg[0];
        destCarDir = arg[1];
        tempDir = srcCarDir.substring(0,srcCarDir.lastIndexOf(File.separator)) +File.separator+"Temp";
        try {
            dsMigrationTool.extractCarFile(new ZipFile(srcCarDir), new File(tempDir));
            dsMigrationTool.migrateUnZippedCarFile(new File(tempDir));
            dsMigrationTool.generateModifiedCarFile();
            FileUtils.cleanDirectory(new File(tempDir));
            log.info("Car file migration is completed successfully !");
        } catch (IOException e) {
            log.error("Error in opening car file in " + srcCarDir, e);
        }
    }

    private void extractCarFile(ZipFile zipFile, File tempDirectory) {
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
     * Process unzipped car file in order to migrate to carbon-dashboards version 1.0.15+
     *
     * @param tempDirectory tempDirectory of unzipped car file directory
     */
    private void migrateUnZippedCarFile(File tempDirectory) {
        for (int i = 0; i < tempDirectory.listFiles().length; i++) {
            File[] listOfFiles = tempDirectory.listFiles();
            File artifactPath = listOfFiles[i];
            File artifactXML = new File(artifactPath.getPath() + File.separator + ARTIFACT_XML);
            if (listOfFiles[i].isDirectory() && artifactXML.exists()) {
                try {
                    DocumentBuilderFactory docFactory = DocumentBuilderFactory.newInstance();
                    DocumentBuilder docBuilder = docFactory.newDocumentBuilder();
                    Document doc = docBuilder.parse(artifactXML);
                    doc.getDocumentElement().normalize();

                    if (doc.getFirstChild().getAttributes().getNamedItem("type").getTextContent()
                            .equals(GADGET_ARTIFACT)) {
                        Node file = doc.getElementsByTagName("file").item(0);
                        file.setTextContent(file.getTextContent().toLowerCase());
                        saveArtifactXML(doc, artifactXML);
                        gadgetJSONUpdater(artifactPath);
                    } else if (doc.getFirstChild().getAttributes().getNamedItem("type").getTextContent()
                            .equals(DASHBOARD_ARTIFACT)) {
                        Node file = doc.getElementsByTagName("file").item(0);
                        if (isDashboardArtifact(artifactPath, file.getTextContent())) {
                            dashboardUpdater(new File(artifactPath.getPath() + "/resources"));
                        }
                    } else if (doc.getFirstChild().getAttributes().getNamedItem("type").getTextContent()
                            .equals("dashboards/dashboard")) {
                        dashboardUpdater(new File(artifactPath.getPath()));
                    }

                } catch (ParserConfigurationException e) {
                    log.error("Error in parsing artifact.xml of " + listOfFiles[i].getName(), e);
                } catch (IOException e) {
                    log.error("Error in opening artifact.xml of " + listOfFiles[i].getName(), e);
                } catch (SAXException e) {
                    log.error("Error in parsing artifact.xml of " + listOfFiles[i].getName(), e);
                }
            }
        }

    }

    /**
     * update dahboard json in the ds dashboard in order to compatible with carbon-dashboards version 1.0.15+
     *
     * @param artifactPath artifact path which consists the dashboard folders
     */
    private void dashboardUpdater(File artifactPath) {
        try {
            File[] dashboardsList = artifactPath.listFiles();
            JSONParser parser = new JSONParser();
            for (int i = 0; i < dashboardsList.length; i++) {
                if(!dashboardsList[i].getAbsolutePath().contains(".json")){
                    continue;
                }
                Object obj = parser.parse(new FileReader(dashboardsList[i].getAbsolutePath()));
                JSONObject dashboardJSONObject = (JSONObject) obj;
                obj = dashboardJSONObject.get("pages");
                JSONArray pagesJSONArray = (JSONArray) obj;
                for (int pageCount = 0; pageCount < pagesJSONArray.size(); pageCount++) {
                    JSONObject pageObj = ((JSONObject) pagesJSONArray.get(pageCount));
                    JSONArray blocksArray = ((JSONArray) ((JSONObject) ((JSONObject) ((JSONObject) pageObj
                            .get("layout")).get("content")).get("loggedIn")).get("blocks"));
                    JSONObject gadgetSet = ((JSONObject) ((JSONObject) pageObj.get("content")).get("default"));
                    Object[] keySet = ((JSONObject) ((JSONObject) pageObj.get("content")).get("default")).keySet()
                            .toArray();
                    for (int gadgetCount = 0; gadgetCount < keySet.length; gadgetCount++) {
                        dashboardGadgetUpdater((JSONArray) gadgetSet.get(keySet[gadgetCount]));
                    }
                    updateDashboardBlocks(blocksArray);
                }
                FileWriter file = new FileWriter(dashboardsList[i].getAbsolutePath());
                file.write(dashboardJSONObject.toJSONString());
                file.flush();
                file.close();
                log.info("Dashboard " + dashboardJSONObject.get("id") + " is successfully updated !");
            }
        } catch (ParseException e) {
              log.error("Error in parsing json file in "+artifactPath,e);
        } catch (IOException e) {
            log.error("Error in writing/saving json file in " + artifactPath, e);
        }
    }

    private void saveArtifactXML(Document doc, File artifactXML) {
        try {
            TransformerFactory transformerFactory = TransformerFactory.newInstance();
            Transformer transformer = transformerFactory.newTransformer();
            DOMSource source = new DOMSource(doc);
            StreamResult result = new StreamResult(artifactXML);
            transformer.transform(source, result);
        } catch (TransformerException e) {
            log.error("Error in saving artifact.xml of " + artifactXML.getAbsolutePath(), e);
        }
    }

    /**
     * Verify whether the given artifact is dashboard or not
     *
     * @param artifactPath artifact path
     * @param fileName     file name of the artifact
     * @return true, if artifact type is dashboard
     */
    private boolean isDashboardArtifact(File artifactPath, String fileName) {
        try {
            File file = new File(artifactPath.getPath() + "/" + fileName);
            DocumentBuilderFactory docFactory = DocumentBuilderFactory.newInstance();
            DocumentBuilder docBuilder = docFactory.newDocumentBuilder();
            Document doc = docBuilder.parse(file);
            doc.getDocumentElement().normalize();
            Node path = doc.getElementsByTagName("path").item(0);
            if (path.getTextContent().contains("dashboards")) {
                return true;
            }

        } catch (ParserConfigurationException e) {
            log.error("Error in parsing xml of " + fileName, e);
        } catch (IOException e) {
            log.error("Error in opening xml of " + fileName, e);
        } catch (SAXException e) {
            log.error("Error in parsing xml of " + fileName, e);
        }
        return false;

    }

    /**
     * generate modified car file to deploy with relevant changes
     */
    private void generateModifiedCarFile() {
        ZipOutputStream zip = null;
        try {
            FileOutputStream fos = new FileOutputStream(destCarDir);
            zip = new ZipOutputStream(fos);
            File folder = new File(tempDir);
            if (folder.list() != null) {
                for (String fileName : folder.list()) {
                    addFileToZip("", tempDir + File.separator + fileName, zip);
                }
            }
        } catch (IOException e) {
            log.error("Error in generating modified car file ", e);
        } finally {
            if (zip != null) {
                try {
                    zip.flush();
                    zip.close();
                } catch (IOException e) {
                    log.error("Unable to close the zip output stream ", e);
                }
            }
        }
    }

    /**
     * To add a file to zip
     *
     * @param path    Root path name
     * @param srcFile Source File that need to be added to zip
     * @param zip     ZipOutputStream
     * @throws IOException
     */
    private static void addFileToZip(String path, String srcFile, ZipOutputStream zip) throws IOException {
        FileInputStream in = null;
        try {
            File folder = new File(srcFile);
            if (folder.isDirectory()) {
                addFolderToZip(path, srcFile, zip);
            } else {
                byte[] buf = new byte[1024];
                int len;
                in = new FileInputStream(srcFile);
                zip.putNextEntry(new ZipEntry(path + File.separator + folder.getName()));
                while ((len = in.read(buf)) > 0) {
                    zip.write(buf, 0, len);
                }
            }
        } catch (IOException e) {
            log.error("Cannot add file to zip ", e);
            throw new IOException(e);
        } finally {
            if (in != null) {
                try {
                    in.close();
                } catch (IOException e) {
                    log.error("Unable to close file input stream. ", e);
                }
            }
        }
    }

    /**
     * To add a folder to zip
     *
     * @param path      Path of the file or folder from root directory of zip
     * @param srcFolder Source folder to be made as zip
     * @param zip       ZipOutputStream
     */
    private static void addFolderToZip(String path, String srcFolder, ZipOutputStream zip) throws IOException {
        File folder = new File(srcFolder);
        if (path.isEmpty()) {
            zip.putNextEntry(new ZipEntry(folder.getName() + File.separator));
        } else {
            zip.putNextEntry(new ZipEntry(path + File.separator + folder.getName() + File.separator));
        }
        for (String fileName : folder.list()) {
            if (path.isEmpty()) {
                addFileToZip(folder.getName(), srcFolder + File.separator + fileName, zip);
            } else {
                addFileToZip(path + File.separator + folder.getName(), srcFolder + File.separator + fileName, zip);
            }
        }
    }
}

