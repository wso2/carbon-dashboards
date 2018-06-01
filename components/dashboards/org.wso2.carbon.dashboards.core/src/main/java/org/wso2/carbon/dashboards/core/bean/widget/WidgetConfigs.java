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
 */
package org.wso2.carbon.dashboards.core.bean.widget;

import com.google.gson.JsonElement;
import java.util.List;

/**
 * Bean class for configs in widget configuration file.
 */
public class WidgetConfigs {
    private JsonElement pubsub;
    private JsonElement chartConfig;
    private JsonElement providerConfig;
    private boolean isGenerated;
    private List<Option> options;

    /**
     * This method is get pubsub configuration of the widget.
     *
     * @return pubsub configuration
     */
    public JsonElement getPubsub() {
        return pubsub;
    }

    /**
     * This method is set the pubsun configuration of the widget.
     *
     * @param pubsub pubsub configuration of the widget
     */
    public void setPubsub(JsonElement pubsub) {
        this.pubsub = pubsub;
    }

    /**
     * This method is used to get options configuration of the widget.
     *
     * @return options configuration
     */
    public List<Option> getOptions() {
        return options;
    }

    /**
     * This method is used to set the options configuration of the widget.
     *
     * @param options options configuration of the widget
     */
    public void setOptions(List<Option> options) {
        this.options = options;
    }

    public JsonElement getChartConfig() {
        return chartConfig;
    }

    public void setChartConfig(JsonElement chartConfig) {
        this.chartConfig = chartConfig;
    }

    public JsonElement getProviderConfig() {
        return providerConfig;
    }

    public void setProviderConfig(JsonElement providerConfig) {
        this.providerConfig = providerConfig;
    }

    public boolean isGenerated() {
        return isGenerated;
    }

    public void setGenerated(boolean generated) {
        isGenerated = generated;
    }
}
