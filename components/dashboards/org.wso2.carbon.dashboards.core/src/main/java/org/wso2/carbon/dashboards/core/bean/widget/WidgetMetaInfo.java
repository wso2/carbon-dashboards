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
package org.wso2.carbon.dashboards.core.bean.widget;

/**
 * Bean class to represent widget configuration file.
 */
public class WidgetMetaInfo {
    private String name;
    private String id;
    private String thumbnailURL;
    private WidgetConfigs configs;
    private String version;

    /**
     * This method is to get the name of the widget.
     *
     * @return name of the widget
     */
    public String getName() {
        return name;
    }

    /**
     * This method is to set name of the widget.
     *
     * @param name name of the widget
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * This method is to get id of the widget.
     *
     * @return id of the widget
     */
    public String getId() {
        return id;
    }

    /**
     * This method is to set id of the widget.
     *
     * @param id of the widget
     */
    public void setId(String id) {
        this.id = id;
    }

    /**
     * This method is to get thumbnailURL of the widget.
     *
     * @return thumnailURL of the widget
     */
    public String getThumbnailURL() {
        return thumbnailURL;
    }

    /**
     * This method is to set thumbnailURL of the widget.
     *
     * @param thumbnailURL thumbnailURL of the widget
     */
    public void setThumbnailURL(String thumbnailURL) {
        this.thumbnailURL = thumbnailURL;
    }

    /**
     * This method is get configs of the widget.
     *
     * @return configs of the widget
     */
    public WidgetConfigs getConfigs() {
        return configs;
    }

    /**
     * This method is to set configs of the widget.
     *
     * @param configs of the widget
     */
    public void setConfigs(WidgetConfigs configs) {
        this.configs = configs;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }
}
