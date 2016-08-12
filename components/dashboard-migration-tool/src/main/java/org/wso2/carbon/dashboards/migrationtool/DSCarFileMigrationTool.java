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
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.wso2.carbon.dashboards.migrationtool.utils.Constants;
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
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import java.util.zip.ZipOutputStream;

public class DSCarFileMigrationTool extends DSMigrationTool {
    private static final Logger log = Logger.getLogger(DSCarFileMigrationTool.class);
    private static String srcCarDir = null;
    private static String destCarDir = null;
    private static String tempDir;

    public static void main(String arg[]) {
        srcCarDir = arg[0];
        destCarDir = arg[1];
        tempDir = srcCarDir.substring(0, srcCarDir.lastIndexOf(File.separator)) + File.separator + Constants.TEMP;
        File inputFile = new File(srcCarDir);
        if (inputFile.isDirectory()) {
            File[] listOfCARFiles = inputFile.listFiles();
            for (int carFileCount = 0; carFileCount < listOfCARFiles.length; carFileCount++) {
                if (listOfCARFiles[carFileCount].getName().contains(Constants.CARFILE_EXTENSION)) {
                    processCarFile(listOfCARFiles[carFileCount].getAbsolutePath(),
                            destCarDir + File.separator + Constants.MODIFIED + listOfCARFiles[carFileCount].getName());
                }
            }
        } else {
            if (inputFile.getName().contains(Constants.CARFILE_EXTENSION)) {
                processCarFile(srcCarDir, destCarDir + File.separator + Constants.MODIFIED + inputFile.getName());
            }
        }

    }

    /**
     * Process CAR file and put the modified CAR file in destination directory
     *
     * @param sourceDir      source directory of car files
     * @param destinationDir destination directory to copy modified files
     */
    private static void processCarFile(String sourceDir, String destinationDir) {
        DSCarFileMigrationTool dsMigrationTool = new DSCarFileMigrationTool();
        try {
            ZipFile srcCARFile = new ZipFile(sourceDir);
            File tempDirectory = new File(tempDir);
            dsMigrationTool.extractCARFile(srcCARFile, tempDirectory);
            dsMigrationTool.migrateUnZippedCARFile(tempDirectory);
            dsMigrationTool.generateModifiedCARFile(destinationDir);
            FileUtils.cleanDirectory(tempDirectory);
            log.info(srcCARFile.getName() + " - Car file migration is completed successfully !");
        } catch (IOException e) {
            log.error("Error in opening car file in " + sourceDir, e);
        }
    }

    /**
     * Extract given CAR file into temporary directory for processing
     *
     * @param zipFile       CAR File Directory
     * @param tempDirectory temp directory to extract the CAR file
     */
    private void extractCARFile(ZipFile zipFile, File tempDirectory) {
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
    private void migrateUnZippedCARFile(File tempDirectory) {
        for (int i = 0; i < tempDirectory.listFiles().length; i++) {
            File[] listOfFiles = tempDirectory.listFiles();
            File artifactPath = listOfFiles[i];
            File artifactXML = new File(artifactPath.getPath() + File.separator + Constants.ARTIFACT_XML);
            if (listOfFiles[i].isDirectory() && artifactXML.exists()) {
                try {
                    DocumentBuilderFactory docFactory = DocumentBuilderFactory.newInstance();
                    DocumentBuilder docBuilder = docFactory.newDocumentBuilder();
                    Document doc = docBuilder.parse(artifactXML);
                    doc.getDocumentElement().normalize();

                    if (doc.getFirstChild().getAttributes().getNamedItem("type").getTextContent()
                            .equals(Constants.GADGET_ARTIFACT)) {
                        Node file = doc.getElementsByTagName("file").item(0);
                        file.setTextContent(file.getTextContent().toLowerCase());
                        saveArtifactXML(doc, artifactXML);
                        gadgetJSONUpdater(artifactPath);
                    } else if (doc.getFirstChild().getAttributes().getNamedItem("type").getTextContent()
                            .equals(Constants.DASHBOARD_ARTIFACT)) {
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
     * Update dahboard json in the ds dashboard in order to compatible with carbon-dashboards version 1.0.15+
     *
     * @param artifactPath artifact path which consists the dashboard folders
     */
    private void dashboardUpdater(File artifactPath) {
        try {
            File[] dashboardsList = artifactPath.listFiles();
            JSONParser parser = new JSONParser();
            for (int i = 0; i < dashboardsList.length; i++) {
                if (!dashboardsList[i].getAbsolutePath().contains(Constants.JSON_EXTENSION)) {
                    continue;
                }
                Object obj = parser.parse(new FileReader(dashboardsList[i].getAbsolutePath()));
                JSONObject dashboardJSONObject = (JSONObject) obj;
                obj = dashboardJSONObject.get(Constants.PAGES);
                JSONArray pagesJSONArray = (JSONArray) obj;
                for (int pageCount = 0; pageCount < pagesJSONArray.size(); pageCount++) {
                    JSONObject pageObj = ((JSONObject) pagesJSONArray.get(pageCount));
                    JSONArray blocksArray = ((JSONArray) ((JSONObject) ((JSONObject) ((JSONObject) pageObj
                            .get(Constants.LAYOUT)).get(Constants.CONTENT)).get(Constants.LOGGED_IN))
                            .get(Constants.BLOCKS));
                    JSONObject gadgetSet = ((JSONObject) ((JSONObject) pageObj.get(Constants.CONTENT))
                            .get(Constants.DEFAULT));
                    Object[] keySet = ((JSONObject) ((JSONObject) pageObj.get(Constants.CONTENT))
                            .get(Constants.DEFAULT)).keySet().toArray();
                    for (int gadgetCount = 0; gadgetCount < keySet.length; gadgetCount++) {
                        dashboardGadgetUpdater((JSONArray) gadgetSet.get(keySet[gadgetCount]));
                    }
                    updateDashboardBlocks(blocksArray);
                }
                FileWriter file = new FileWriter(dashboardsList[i].getAbsolutePath());
                file.write(dashboardJSONObject.toJSONString());
                file.flush();
                file.close();
                log.info("Dashboard " + dashboardJSONObject.get(Constants.ID) + " is successfully updated !");
            }
        } catch (ParseException e) {
            log.error("Error in parsing json file in " + artifactPath, e);
        } catch (IOException e) {
            log.error("Error in writing/saving json file in " + artifactPath, e);
        }
    }

    /**
     * Save artifact.xml after the modification
     *
     * @param doc         xml content as document
     * @param artifactXML artifact.xml file to be saved
     */
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
     * Generate modified car file to deploy with relevant changes
     *
     * @param destinationFilePath destination directory of modified CAR files
     */
    private void generateModifiedCARFile(String destinationFilePath) {
        ZipOutputStream zip = null;
        try {
            FileOutputStream fos = new FileOutputStream(destinationFilePath);
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

