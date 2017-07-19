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

import java.util.ArrayList;
import java.util.List;

/**
 * This is the dataholder for WidgetInformationProvider implementations.
 */
public class WidgetDataHolder {

    private static WidgetDataHolder instance = new WidgetDataHolder();

    private List<WidgetInfoProvider> widgetInfoProvidersList = new ArrayList<>();

    /**
     * provide an instance of WidgetDataHolder.
     *
     * @return instance of WidgetDataHolder
     */
    public static WidgetDataHolder getInstance() {
        return instance;
    }

    /**
     * add WidgetInfoProvider object to the ArrayList.
     *
     * @param widgetInfoProvider object that implements WidgetInfoProvider
     */
    public void addWidgetInfoProvider(WidgetInfoProvider widgetInfoProvider) {
        widgetInfoProvidersList.add(widgetInfoProvider);
    }

    /**
     * remove WidgetInfoProvider object from the list.
     *
     * @param widgetInfoProvider
     */
    public void removeWidgetInfoProvider(WidgetInfoProvider widgetInfoProvider) {
        widgetInfoProvidersList.removeIf(widgetInfoProviders -> widgetInfoProviders.equals(widgetInfoProvider));
    }

    /**
     * provide list of objects added using addObject method.
     *
     * @return list of objects that implements WidgetInfoProvider
     */
    public List<WidgetInfoProvider> getWidgetInfoProviders() {
        return instance.widgetInfoProvidersList;
    }
}
