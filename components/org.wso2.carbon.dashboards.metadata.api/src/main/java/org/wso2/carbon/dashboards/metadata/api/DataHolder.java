package org.wso2.carbon.dashboards.metadata.api;

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

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.wso2.carbon.dashboards.metadata.provider.MetadataProvider;

/**
 * This is the data holder for dashboards meta data API.
 */
@Component(name = "org.wso2.carbon.dashboards.metadata.api",
        immediate = true)
public class DataHolder {
    private static MetadataProvider metadataProvider;

    public static MetadataProvider getMetadataProvider() {
        return metadataProvider;
    }

    @Reference(name = "metadataProvider",
            service = MetadataProvider.class,
            cardinality = ReferenceCardinality.MANDATORY,
            policy = ReferencePolicy.DYNAMIC,
            unbind = "unsetMetadataProvider")
    public void setMetadataProvider(MetadataProvider metadataProvider1) {
        metadataProvider = metadataProvider1;
    }

    public void unsetMetadataProvider(MetadataProvider metadataProvider1) {
        metadataProvider = null;
    }
}

