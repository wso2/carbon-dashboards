/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import com.google.gson.JsonSyntaxException;
import org.wso2.carbon.dashboards.core.bean.widget.WidgetMetaInfo;
import org.wso2.carbon.dashboards.core.exception.DashboardRuntimeException;
import org.wso2.carbon.uiserver.api.Extension;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Reader for widget configuration.
 *
 * @since 4.0.0
 */
public class WidgetConfigurationReader {

    private static final String FILE_NAME_WIDGET_CONFIGURATION = "widgetConf.json";
    private static final Gson GSON = new Gson();

    /**
     * Reads and returns the configurations of the specified widget.
     *
     * @param widget widget
     * @return configurations of the widget
     * @throws DashboardRuntimeException if cannot read configuration file or its is invalid
     */
    public static WidgetMetaInfo getConfiguration(Extension widget) throws DashboardRuntimeException {
        Path widgetConfPath = Paths.get(widget.getLeastPriorityPath(), FILE_NAME_WIDGET_CONFIGURATION);
        try {
            String widgetConf = new String(Files.readAllBytes(widgetConfPath), StandardCharsets.UTF_8);
            return GSON.fromJson(widgetConf, WidgetMetaInfo.class);
        } catch (IOException e) {
            throw new DashboardRuntimeException(
                    "Cannot read configuration file '" + widgetConfPath + "' of widget '" + widget.getName() + "'.");
        } catch (JsonSyntaxException e) {
            throw new DashboardRuntimeException(
                    "Configuration file '" + widgetConfPath + "' of widget '" + widget.getName() + "' is invalid.");
        }
    }
}
