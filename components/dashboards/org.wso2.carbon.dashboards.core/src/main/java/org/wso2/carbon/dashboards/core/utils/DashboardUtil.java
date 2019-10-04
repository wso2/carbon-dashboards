/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
package org.wso2.carbon.dashboards.core.utils;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import org.wso2.carbon.dashboards.core.bean.DashboardMetadataContent;
import org.wso2.carbon.dashboards.core.bean.importer.Page;
import org.wso2.carbon.dashboards.core.bean.importer.PageContent;
import org.wso2.carbon.dashboards.core.bean.importer.WidgetType;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class DashboardUtil {

    private static final String UNIVERSAL_WIDGET = "UniversalWidget";

    /**
     * Find widgets by analyzing a dashboard pages.
     *
     * @param dashboardMetadataContent Dashboard content
     * @return Set of widget IDs
     */
    public static Map<WidgetType, Set<String>> findWidgets(DashboardMetadataContent dashboardMetadataContent) {
        Map<WidgetType, Set<String>> widgets = new HashMap<>();
        widgets.put(WidgetType.GENERATED, new HashSet<>());
        widgets.put(WidgetType.CUSTOM, new HashSet<>());
        Gson gson = new Gson();
        for (JsonElement element : dashboardMetadataContent.getPages()) {
            Page page = gson.fromJson(element, Page.class);
            findWidgets(page.getContent(), widgets);
        }
        return widgets;
    }

    /**
     * Recursively find widgets by analyzing dashboard page contents.
     *
     * @param contents Dashboard page content
     * @param widgets  Set of widget IDs
     */
    public static void findWidgets(Set<PageContent> contents, Map<WidgetType, Set<String>> widgets) {
        for (PageContent content : contents) {
            if (content.getComponent() != null) {
                if (UNIVERSAL_WIDGET.equals(content.getComponent())) {
                    widgets.get(WidgetType.GENERATED).add((String) content.getProps().get("widgetID"));
                } else {
                    widgets.get(WidgetType.CUSTOM).add(content.getComponent());
                }
            }
            if (content.getContent() != null) {
                findWidgets(content.getContent(), widgets);
            }
        }
    }
}
