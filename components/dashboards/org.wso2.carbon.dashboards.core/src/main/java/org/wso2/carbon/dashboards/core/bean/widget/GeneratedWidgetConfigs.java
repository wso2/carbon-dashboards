/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
package org.wso2.carbon.dashboards.core.bean.widget;

/**
 * Configuration bean class for generated widget configuration.
 */
public class GeneratedWidgetConfigs {
    private String name;
    private String id;
    private String chartConfig;
    private String providerConfig;

    public String getChartConfig() {
        return chartConfig;
    }

    public void setChartConfig(String chartConfig) {
        this.chartConfig = chartConfig;
    }

    public String getProviderConfig() {
        return providerConfig;
    }

    public void setProviderConfig(String providerConfig) {
        this.providerConfig = providerConfig;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    @Override
    public String toString() {
        return "GeneratedWidgetConfigs{" +
               "name='" + name + '\'' +
               ", id='" + id + '\'' +
               ", chartConfig='" + chartConfig + '\'' +
               ", providerConfig='" + providerConfig + '\'' +
               '}';
    }
}
