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

import java.util.List;

/**
 * Configuration bean class for pubsub in widget conf file.
 */
public class PubSub {
    private List<String> types;
    private List<String> publisherWidgetOutputs;
    private List<String> subscriberWidgetInputs;

    /**
     * This method is to get types of the pubsub configuration.
     *
     * @return types of pubsub configuration
     */
    public List<String> getTypes() {
        return types;
    }

    /**
     * This method is to set types of the pubsun configuration.
     *
     * @param types of pubsub configuration
     */
    public void setTypes(List<String> types) {
        this.types = types;
    }

    public List<String> getPublisherWidgetOutputs() {
        return publisherWidgetOutputs;
    }

    public void setPublisherWidgetOutputs(List<String> publisherWidgetOutputs) {
        this.publisherWidgetOutputs = publisherWidgetOutputs;
    }

    public List<String> getSubscriberWidgetInputs() {
        return subscriberWidgetInputs;
    }

    public void setSubscriberWidgetInputs(List<String> subscriberWidgetInputs) {
        this.subscriberWidgetInputs = subscriberWidgetInputs;
    }
}
