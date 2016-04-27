/**
 * Copyright (c) 2005 - 2013, WSO2 Inc. (http://www.wso2.com) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.wso2.carbon.dashboard.deployment.internal;

import org.apache.axis2.context.ConfigurationContext;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.wso2.carbon.context.PrivilegedCarbonContext;
import org.wso2.carbon.dashboard.deployment.DashboardConstants;
import org.wso2.carbon.utils.AbstractAxis2ConfigurationContextObserver;
import org.wso2.carbon.utils.CarbonUtils;
import org.wso2.carbon.utils.FileManipulator;

import java.io.File;
import java.io.IOException;

public class DSAxis2ConfigurationObserverImpl extends AbstractAxis2ConfigurationContextObserver {
    private static final Log log = LogFactory.getLog(DSAxis2ConfigurationObserverImpl.class);

    public void createdConfigurationContext(ConfigurationContext configContext) {
        String tenantDomain = PrivilegedCarbonContext.getThreadLocalCarbonContext().getTenantDomain();
        String tenantDir = getTenantDirPath(tenantDomain);
        String layoutDir = tenantDir + DashboardConstants.LAYOUT_DEPLOYMENT_DIR;
        String gadgetDir = tenantDir + DashboardConstants.GADGET_DEPLOYMENT_DIR;
        createTenantDirectory(tenantDir);
        if (!isDSTenantIArtifactInitialized(layoutDir)) {
           copyResources(DashboardConstants.LAYOUT_TYPE, layoutDir);
        }
        if (!isDSTenantIArtifactInitialized(gadgetDir)) {
            copyResources(DashboardConstants.GADGET_TYPE, gadgetDir);
        }
    }

    private void createTenantDirectory (String tenantDirectory){
        File file = new File(tenantDirectory);
        if(!file.exists()){
            file.mkdirs();
        }
    }

    private boolean isDSTenantIArtifactInitialized(String tenantArtifactDirectory){
        File file = new File(tenantArtifactDirectory);
        return file.exists();
    }

    private void copyResources(String artifactType, String destinationLocation){
        File sourceResourceFile =
                new File(CarbonUtils.getCarbonHome() + File.separator +
                        DashboardConstants.SHARED_RESOURCE_LOCATION + File.separator + artifactType);
        File destinationFile = new File(destinationLocation);
        try {
            FileManipulator.copyDir(sourceResourceFile, destinationFile);
        } catch (IOException e) {
            log.error("Error while initializing the tenant dashboard resources :"+
                    PrivilegedCarbonContext.getThreadLocalCarbonContext().getTenantDomain(true)
                    +e.getMessage());
        }
    }

    private String getTenantDirPath(String tenantDomain){
        String carbonRepository = CarbonUtils.getCarbonRepository();
        StringBuilder sb = new StringBuilder(carbonRepository);
        sb.append("jaggeryapps").append(File.separator)
                .append(DashboardConstants.APP_NAME).append(File.separator)
                .append("store").append(File.separator)
                .append(tenantDomain).append(File.separator)
                .append(DashboardConstants.DEFAULT_STORE_TYPE).append(File.separator);

        return sb.toString();
    }
}
