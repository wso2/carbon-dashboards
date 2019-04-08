/*
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package org.wso2.carbon.dashboards.core.internal.io;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonSyntaxException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.carbon.dashboards.core.bean.importer.DashboardArtifact;
import org.wso2.carbon.dashboards.core.exception.DashboardException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Handles dashboard JSON files.
 *
 * @since 4.0.32
 */
public class DashboardArtifactHandler {

    private static final String ARTIFACT_EXTENSION = ".json";
    private static final Gson GSON = new Gson();
    private static final Logger LOGGER = LoggerFactory.getLogger(DashboardArtifactHandler.class);

    /**
     * Loads dashboard artifacts in the given directory.
     *
     * @param directory path to directory
     * @return loaded dashboards
     * @throws DashboardException if cannot read files from the directory
     */
    public static Map<String, DashboardArtifact> readArtifactsIn(Path directory) throws DashboardException {
        Set<Path> filePaths;
        try {
            filePaths = Files.list(directory)
                    .filter(DashboardArtifactHandler::isValidArtifact)
                    .collect(Collectors.toSet());
        } catch (IOException e) {
            throw new DashboardException("Cannot list dashboard artifacts in '" + directory + "'.", e);
        }

        Map<String, DashboardArtifact> dashboardArtifacts = new HashMap<>();
        for (Path filePath : filePaths) {
            try {
                String fileContent = new String(Files.readAllBytes(filePath), StandardCharsets.UTF_8);
                DashboardArtifact dashboardArtifact = GSON.fromJson(fileContent, DashboardArtifact.class);

                // If the $.dashboard.content.pages is null, check for $.dashboard.pages
                if (dashboardArtifact.getDashboard().getContent().getPages() == null) {
                    JsonObject root = GSON.fromJson(fileContent, JsonObject.class);
                    JsonArray pages = root.getAsJsonObject("dashboard").getAsJsonArray("pages");
                    if (!pages.isJsonNull()) {
                        dashboardArtifact.getDashboard().getContent().setPages(pages);
                    }
                }
                dashboardArtifacts.put(filePath.toAbsolutePath().toString(), dashboardArtifact);
            } catch (IOException e) {
                throw new DashboardException("Cannot read dashboard artifact '" + filePath + "'.", e);
            } catch (JsonSyntaxException e) {
                LOGGER.warn("Dashboard artifact '{}' is invalid and is ignored.", filePath, e);
            }
        }
        return dashboardArtifacts;
    }

    private static boolean isValidArtifact(Path filePath) {
        return Files.isRegularFile(filePath) && getFileName(filePath).endsWith(ARTIFACT_EXTENSION);
    }

    private static String getFileName(Path filePath) {
        Path fileName = filePath.getFileName();
        return (fileName == null) ? "" : fileName.toString();
    }

    /**
     * Marks the given dashboard artifact as 'imported'.
     *
     * @param artifactFilePath path to dashboard artifact
     */
    public static void markArtifactAsImported(String artifactFilePath) {
        Path artifactPath = Paths.get(artifactFilePath);
        try {
            Files.move(artifactPath, artifactPath.resolveSibling(getFileName(artifactPath) + ".imported"));
        } catch (IOException e) {
            LOGGER.warn("Cannot mark dashboard artifact '{}' as imported. Hence, it will be re-imported in next " +
                        "server startup.", artifactFilePath, e);
        }
    }
}
