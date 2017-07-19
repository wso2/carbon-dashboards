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
package org.wso2.carbon.dashboards.core.layout.info;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;

import java.util.Map;

/**
 * This is the osgi-component to register LayoutInfoProvider services.
 */
@Component(
        name = "org.wso2.carbon.dashboards.core.layout.info.LayoutInfoComponent",
        immediate = true
)
public class LayoutInfoComponent {
    /**
     * This method registers LayoutInfoProvider implementations in the layoutDataHolder.
     * @param layoutInfoProvider implementation of LayoutInfoProvider
     * @param properties
     */
    @Reference(
            name = "layoutinfo",
            service = LayoutInfoProvider.class,
            cardinality = ReferenceCardinality.MULTIPLE,
            policy = ReferencePolicy.DYNAMIC,
            unbind = "unregisterLayoutInfoProvider")
    protected void registerLayoutInfoProvider(LayoutInfoProvider layoutInfoProvider, Map properties) {
        LayoutDataHolder.getInstance().addLayoutInfoProvider(layoutInfoProvider);
    }

    /**
     * This method is used to unregister the LayoutInfoProvider in the LayoutInfoProvider.
     * @param layoutInfoProvider implementation of LayoutInfoProvider
     * @param properties
     */
    protected void unregisterLayoutInfoProvider(LayoutInfoProvider layoutInfoProvider, Map properties) {
        LayoutDataHolder.getInstance().removeLayoutInfoProvider(layoutInfoProvider);
    }
}
