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
package org.wso2.carbon.dashboards.core.widget.info;

import com.google.gson.Gson;
import org.wso2.carbon.dashboards.core.bean.widget.WidgetMetaInfo;
import org.wso2.carbon.dashboards.core.internal.DataHolder;
import org.wso2.carbon.uis.api.App;
import org.wso2.carbon.uis.api.Extension;
import org.wso2.carbon.uis.spi.Server;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Interface to for getting widget related information.
 */
public class WidgetInfoProviderImpl {

    private static final Gson GSON = new Gson();

    /**
     * List meta information of all widgets available in the store.
     *
     * @return List list of meta information of all widgets
     */
    public Set<WidgetMetaInfo> getWidgetsMetaInfo() {
        App app = DataHolder.getInstance().getUiServer().getApp("portal")
                .orElseThrow(() -> new IllegalStateException(""));
        return app.getExtensions("widgets").stream()
                .map(this::toWidgetMetaInfo)
                .collect(Collectors.toSet());
    }

    private WidgetMetaInfo toWidgetMetaInfo(Extension extension) {
        try {
            String widgetConf = new String(Files.readAllBytes(Paths.get(extension.getPath(), "widgetConf.json")));
            return GSON.fromJson(widgetConf, WidgetMetaInfo.class);
        } catch (IOException e) {
            // log
            return null;
        }
    }

    /**
     * Provide widget configuration file of the given widget.
     *
     * @param widgetId widget-id
     * @return returns widget configuration of the given widget
     */
    public Optional<String> getWidgetConf(String widgetId) {
        return Optional.ofNullable("");
    }

    /**
     * Provide the thumbnail of the given widget id.
     *
     * @param widgetId widget-id
     * @return returns the thumbnail of the given widget
     */
    public Optional<Path> getThumbnail(String widgetId) {
        return Optional.empty();
    }
}
