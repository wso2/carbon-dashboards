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
import org.wso2.carbon.dashboards.core.layout.info.LayoutInfoProvider;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * This is the OSGI service component which provides layout related information.
 */
@Component(
        name = "org.wso2.carbon.dashboards.layout.LayoutInfoProviderImpl",
        service = LayoutInfoProvider.class,
        immediate = true)
public class LayoutInfoProviderImpl implements LayoutInfoProvider {

    public static final String LAYOUT_PATH = "deployment/layouts";
    private static final Logger log = LoggerFactory.getLogger(LayoutInfoProviderImpl.class);
    private static Map<String, Path> layoutMap = new HashMap<>();
    private JsonParser jsonParser = new JsonParser();

    @Override
    public List getLayoutsMetaInfo() {
        if (layoutMap.isEmpty()) {
            initializeLayoutMap();
        }
        List<JsonObject> layoutMetaInfoList = new ArrayList<>();
        layoutMap.forEach((layoutId, layoutPath) -> {
            layoutMetaInfoList.add(jsonParser.parse(readLayoutConf(layoutPath, layoutId)).getAsJsonObject());
        });
        return layoutMetaInfoList;
    }

    private String readLayoutConf(Path layoutPath, String layoutId) {
        try {
            return new String(Files.readAllBytes(layoutPath.resolve(layoutId + ".json")), StandardCharsets.UTF_8);
        } catch (IOException ex) {
            log.error("Error while reading the layoutConf file " + layoutPath.getFileName() + "/" + layoutId + ".json",
                    ex);
        }
        return null;
    }

    private void initializeLayoutMap() {
        File root = new File( LAYOUT_PATH );
        File[] list = root.listFiles();

        if (list == null) return;
        for ( File f : list ) {
            if ( f.isDirectory() ) {
                layoutMap.put(f.getName(), f.toPath());
            }
        }
    }
}
