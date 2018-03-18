/*
 *
 * Conversation opened. 2 messages. All messages read.
 *
 * Skip to content
 * Using WSO2, Inc. Mail with screen readers
 * Click here to enable desktop notifications for WSO2, Inc. Mail.   Learn more  Hide
 *
 * Fwd: Copyright Template of WSO2 for IntelliJ
 * Inbox
 * 	x
 * 1. Me
 * 	x
 * Dilini Muthumala <dilini@wso2.com>
 *
 * AttachmentsJan 24
 *
 * to me
 *
 * ---------- Forwarded message ----------
 * From: Gobinath Loganathan <gobinath@wso2.com>
 * Date: Thu, Jul 28, 2016 at 10:55 AM
 * Subject: Copyright Template of WSO2 for IntelliJ
 * To: Sirojan Tharmakulasingam <sirojan@wso2.com>, Prakhash Sivakumar <prakhash@wso2.com>, Dilini Muthumala <dilini@wso2.com>, Anoukh Jayawardena <anoukh@wso2.com>
 *
 *
 * Hi,
 * According to the mail thread Issue With WSO2 License Header in Engineering group, the attached copyright template is the correct one to use.
 *
 * To add the template to IntelliJ:
 * Inline image 1
 *
 * For more details: [1]
 *
 * [1] https://groups.google.com/a/wso2.com/forum/#!topic/engineering-group/Ga4YOPxMQpw/discussion
 *
 *
 *
 * Thanks & Regards,
 * Gobinath
 * Attachments area
 * Irindu Nugawela <irindu@wso2.com>
 *
 * Jan 24
 *
 * to Dilini
 * Thank you very much Akka
 *
 * Click here to Reply or Forward
 * Using 23.44 GB
 * Manage
 * Program Policies
 * Powered by
 * Google
 * Last account activity: 54 minutes ago
 * Details
 *
 *
 *
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
 *
 * Intellij Copyright Template.txt
 * Displaying Intellij Copyright Template.txt.
 */
package org.wso2.carbon.dashboards.core.bean.widget;

import com.google.gson.JsonElement;

import java.util.List;


/**
 * Bean class for configs in widget configuration file.
 */
public class WidgetConfigs {
    private PubSub pubsub;
    private JsonElement chartConfig;
    private JsonElement providerConfig;
    private boolean isGenerated;
    private List<Option> options;

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
