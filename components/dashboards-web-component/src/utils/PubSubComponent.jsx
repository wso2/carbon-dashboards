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

import {dashboardLayout} from './WidgetLoadingComponent';

class PubSubComponent {
    constructor() {
        this.pubsubCallbackMap = new Map();
        this.publishersMap = new Map();
    }

    wire(subscriberId, publisherId) {
        let pubsubCallback = function (message) {
            dashboardLayout.eventHub.emit(subscriberId, message)
        };
        dashboardLayout.eventHub.on(publisherId, pubsubCallback);
        this.pubsubCallbackMap.set(subscriberId, pubsubCallback);
    }

    unwire(subscriberId, publisherId) {
        if (this.pubsubCallbackMap.get(subscriberId)) {
            dashboardLayout.eventHub.off(publisherId, this.pubsubCallbackMap.get(subscriberId));
            return true;
        }
        return false;
    }

    addPublisherToMap(generatedPublisherName, id) {
        this.publishersMap.set(generatedPublisherName, id);
    }

    getPublishersMap() {
        return this.publishersMap;
    }

    isPublisher(widget) {
        let widgetConfigs = widget.props.configs;
        let isPublisher = false;
        if (widgetConfigs) {
            let pubsubTypes = widgetConfigs.pubsub ? widgetConfigs.pubsub.types : [];
            pubsubTypes.map(type => {
                if (type === "publisher") {
                    isPublisher = true;
                }
            });
        }
        return isPublisher;
    }

}

let pubsubComponent = new PubSubComponent();

export {pubsubComponent};