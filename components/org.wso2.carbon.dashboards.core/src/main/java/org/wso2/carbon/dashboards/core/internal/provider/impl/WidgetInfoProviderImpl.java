/*
 *  Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */
package org.wso2.carbon.dashboards.core.internal.provider.impl;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.carbon.dashboards.core.widget.info.WidgetInfoProvider;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * This is the osgi service component to provide widget related information.
 */
@Component(
        name = "org.wso2.carbon.dashboards.widget.WidgetInfoImpl",
        service = WidgetInfoProvider.class,
        immediate = true)
public class WidgetInfoProviderImpl implements WidgetInfoProvider {

    public static final String APP_PATH = "deployment/uufapps/";
    public static final String CONF_FILE = "conf/widgetConf.json";
    public static final String INFO = "info";
    public static final String THUMBNAIL = "thumbnail";
    public static final String COMPONENTS = "components";
    public static final String FRAGMENTS = "fragments";

    private static final Logger log = LoggerFactory.getLogger(WidgetInfoProviderImpl.class);

    private JsonParser jsonParser = new JsonParser();

    private static Map<String, Path> widgetMap = new HashMap();

    @Override
    public List getWidgetsMetaInfo() {
        if (widgetMap.isEmpty()) {
            initializeWidgetMap();
        }
        List<JsonObject> metaInfoList = new ArrayList<>();
        widgetMap.forEach((widgetId, widgetPath) -> {
            metaInfoList.add(jsonParser.parse(readWidgetConf(widgetPath)).getAsJsonObject()
                    .getAsJsonObject(INFO));
        });
        return metaInfoList;
    }

    @Override
    public Optional<String> getWidgetConf(String widgetId) {
        if (widgetMap.isEmpty()) {
            initializeWidgetMap();
        }
        String widgetConfiguration = null;
        if (widgetMap.containsKey(widgetId)) {
            widgetConfiguration = readWidgetConf(widgetMap.get(widgetId));
        } else {
            log.error("Invalid widget ID !");
        }
        return Optional.ofNullable(widgetConfiguration);
    }

    @Override
    public Optional<Path> getThumbnail(String widgetId) {
        if (widgetMap.isEmpty()) {
            initializeWidgetMap();
        }
        Path thumbnailPath = null;
        if (widgetMap.containsKey(widgetId)) {
            JsonObject widgetConf = jsonParser.parse(readWidgetConf(widgetMap.get(widgetId))).getAsJsonObject()
                    .getAsJsonObject(INFO);
            thumbnailPath = Paths
                    .get(widgetMap.get(widgetId) + File.separator + widgetConf.get(THUMBNAIL).getAsString());
        } else {
            log.error("Invalid widget ID ! No widget thumbnail !");
        }
        return Optional.ofNullable(thumbnailPath);
    }

    /**
     * Check whether the given fragment/directory is a widget or not.
     *
     * @param widgetPath directory of the fragment
     * @return true if the given fragment is a widget.
     */
    private boolean isWidget(Path widgetPath) {
        return Files.exists(widgetPath.resolve(CONF_FILE), LinkOption.NOFOLLOW_LINKS);
    }

    /**
     * This method is used to read the widget configuration file of the given widget.
     *
     * @param widgetPath Widget directory location
     * @return widget configuration of the given widget.
     */
    private String readWidgetConf(Path widgetPath) {
        Path widgetConfPath = widgetPath.resolve(CONF_FILE);
        try {
            return new String(Files.readAllBytes(widgetConfPath), StandardCharsets.UTF_8);
        } catch (IOException ex) {
            log.error("Error in reading widgetConf file in " + widgetPath.getFileName());
        }
        return null;
    }

    //TODO Since this method goes through all fragments in all apps and get widgets, need to rethink about the logic

    /**
     * Go through all the fragments in the uufapps directory and insert into widget map.
     */
    private void initializeWidgetMap() {
        List<Path> uufAppsDirectories = null;
        List<Path> componentDirectories = null;
        List<Path> fragmentDirectories = null;
        try {
            uufAppsDirectories = Files.list(Paths.get(APP_PATH)).filter(Files::isDirectory)
                    .collect(Collectors.toList());
            for (Path path : uufAppsDirectories) {
                componentDirectories = Files.list(path.resolve(COMPONENTS)).filter(Files::isDirectory)
                        .collect(Collectors.toList());
                for (Path componentPath : componentDirectories) {
                    fragmentDirectories = Files.list(componentPath.resolve(FRAGMENTS))
                            .filter(Files::isDirectory).collect(Collectors.toList());
                    for (Path fragmentPath : fragmentDirectories) {
                        Path fragmentName = fragmentPath.getFileName();
                        if (isWidget(fragmentPath) && fragmentName != null) {
                            widgetMap.put(fragmentName.toString(), fragmentPath);
                        }
                    }
                }
            }
        } catch (IOException e) {
            log.error("Error in reading widgets directory !", e);
        }
    }
}
