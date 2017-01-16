package org.wso2.carbon.dashboards.api;

/*
 *  Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import org.wso2.carbon.dashboards.core.provider.MetadataProvider;

/**
 * This is the data holder for dashboards meta data API.
 */

public class DataHolder {
    private static DataHolder instance = new DataHolder();
    private MetadataProvider metadataProvider;

    /**
     * This method is used to get the core provider of dashboard.
     *
     * @return MetadataProvider metadataprovide for dashboard
     */
    public MetadataProvider getMetadataProvider() {
        return metadataProvider;
    }

    /**
     * This method is used to return the Dataholder instance
     *
     * @return DataHolder dataholder for dashboard
     */
    public static DataHolder getInstance() {
        return instance;
    }

    /**
     * This method is used to set the core provider of dashboards
     *
     * @param metadataProvider MetadataProvider of dashboard
     */
    public void setMetadataProvider(MetadataProvider metadataProvider) {
        this.metadataProvider = metadataProvider;
    }

}

