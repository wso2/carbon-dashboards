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
 * Bean class for configs in widget configuration file.
 */
public class WidgetConfigs {
    private PubSub pubsub;
    private String chartConfig;
    private String providerConfig;
    private boolean isGenerated;

    /**
     * This method is get pubsub configuration of the widget.
     *
     * @return pubsub configuration
     */
    public PubSub getPubsub() {
        return pubsub;
    }

    /**
     * This method is set the pubsun configuration of the widget.
     *
     * @param pubsub pubsub configuration of the widget
     */
    public void setPubsub(PubSub pubsub) {
        this.pubsub = pubsub;
    }

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

    public boolean isGenerated() {
        return isGenerated;
    }

    public void setGenerated(boolean generated) {
        isGenerated = generated;
    }
}
