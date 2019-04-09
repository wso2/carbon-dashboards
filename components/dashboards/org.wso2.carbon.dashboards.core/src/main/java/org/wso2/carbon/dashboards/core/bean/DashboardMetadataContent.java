/*
 *  Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
package org.wso2.carbon.dashboards.core.bean;

import com.google.gson.JsonArray;

import java.util.HashMap;
import java.util.Map;

/**
 * Class to represent the dashboard content.
 *
 * @since 4.0.57
 */
public class DashboardMetadataContent {
    private Map<String, String> properties = new HashMap<>();
    private JsonArray pages;

    public DashboardMetadataContent() {
    }

    public DashboardMetadataContent(JsonArray pages) {
        this.pages = pages;
    }

    /**
     * Get dashboard properties.
     *
     * @return Map of properties
     */
    public Map<String, String> getProperties() {
        return properties;
    }

    /**
     * Set dashboard properties
     *
     * @param properties Map of properties
     */
    public void setProperties(Map<String, String> properties) {
        this.properties = properties;
    }

    /**
     * Get dashboard pages.
     *
     * @return Array of pages
     */
    public JsonArray getPages() {
        return pages;
    }

    /**
     * Set dashboard pages.
     *
     * @param pages Array of pages
     */
    public void setPages(JsonArray pages) {
        this.pages = pages;
    }
}
