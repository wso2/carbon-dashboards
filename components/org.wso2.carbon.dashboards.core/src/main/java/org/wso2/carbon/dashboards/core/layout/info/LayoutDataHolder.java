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

import java.util.ArrayList;
import java.util.List;

/**
 * This is the dataholder for LayoutProvider implementations.
 */
public class LayoutDataHolder {

    private static LayoutDataHolder instance = new LayoutDataHolder();

    private List<LayoutInfoProvider> layoutInfoProvidersList = new ArrayList<>();

    /**
     * provide an instance of LayoutDataHolder.
     *
     * @return instance of LayoutDataHolder
     */
    public static LayoutDataHolder getInstance() {
        return instance;
    }

    /**
     * add layoutInfoProvider object to the ArrayList.
     *
     * @param layoutInfoProvider object that implements layoutInfoProvider
     */
    public void addLayoutInfoProvider(LayoutInfoProvider layoutInfoProvider) {
        layoutInfoProvidersList.add(layoutInfoProvider);
    }

    /**
     * remove layoutInfoProvider object from the list.
     *
     * @param layoutInfoProvider
     */
    public void removeLayoutInfoProvider(LayoutInfoProvider layoutInfoProvider) {
        layoutInfoProvidersList.removeIf(layoutInfoProviders -> layoutInfoProviders.equals(layoutInfoProvider));
    }

    /**
     * provide list of objects added using addObject method.
     *
     * @return list of objects that implements layoutInfoProvider
     */
    public List<LayoutInfoProvider> getLayoutInfoProviders() {
        return instance.layoutInfoProvidersList;
    }
}
