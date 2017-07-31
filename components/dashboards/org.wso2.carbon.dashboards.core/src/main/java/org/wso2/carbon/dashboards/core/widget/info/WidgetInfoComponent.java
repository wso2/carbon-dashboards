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
package org.wso2.carbon.dashboards.core.widget.info;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;

import java.util.Map;

/**
 * This is the osgi-component to register WidgetInfoProvider services.
 */
@Component(
        name = "org.wso2.carbon.dashboards.core.widget.info.WidgetInfoComponent",
        immediate = true
)
public class WidgetInfoComponent {

    /**
     * This method registers WidgetInfoProvider implementations in the WidgetDataHolder.
     * @param widgetInfoProvider implementation of WidgetInfoProvider
     * @param properties
     */
    @Reference(
            name = "widgetinfo",
            service = WidgetInfoProvider.class,
            cardinality = ReferenceCardinality.MULTIPLE,
            policy = ReferencePolicy.DYNAMIC,
            unbind = "unregisterWidgetInfoProvider")
    protected void registerWidgetInfoProvider(WidgetInfoProvider widgetInfoProvider, Map properties) {
        WidgetDataHolder.getInstance().addWidgetInfoProvider(widgetInfoProvider);
    }

    /**
     * This method is used to unregister the WidgetInfoProvider in the WidgetDataHolder.
     * @param widgetInfoProvider implementation of WidgetInfoProvider
     * @param properties
     */
    protected void unregisterWidgetInfoProvider(WidgetInfoProvider widgetInfoProvider, Map properties) {
        WidgetDataHolder.getInstance().removeWidgetInfoProvider(widgetInfoProvider);
    }
}
