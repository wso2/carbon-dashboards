/*
 *  Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

package org.wso2.carbon.siddhi.apps.api.rest.internal;

import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.carbon.analytics.idp.client.core.api.AnalyticsHttpClientBuilderService;
import org.wso2.carbon.analytics.permissions.PermissionManager;
import org.wso2.carbon.analytics.permissions.PermissionProvider;
import org.wso2.carbon.analytics.permissions.bean.Permission;
import org.wso2.carbon.analytics.permissions.bean.Role;
import org.wso2.carbon.config.ConfigurationException;
import org.wso2.carbon.config.provider.ConfigProvider;
import org.wso2.carbon.siddhi.apps.api.rest.config.DeploymentConfigs;

import java.util.List;

/**
 * OSGi-components to register config provider class.
 */
@Component(
        name = "org.wso2.carbon.siddhi.apps.api.rest.internal.ServiceComponent",
        service = ServiceComponent.class,
        immediate = true
)
public class ServiceComponent {
    private static final Permission viewPermission = new Permission("DASH",
            "DASH.siddhiApp.viewer");
    private static final Logger logger = LoggerFactory.getLogger(ServiceComponent.class);
    private PermissionProvider permissionProvider;

    @Activate
    public void start() {
        try {
            DeploymentConfigs deploymentConfigs = SiddhiAppsDataHolder.getInstance().getConfigProvider()
                    .getConfigurationObject(DeploymentConfigs.class);
            SiddhiAppsDataHolder.getInstance().setUsername(deploymentConfigs.getUsername());
            SiddhiAppsDataHolder.getInstance().setPassword(deploymentConfigs.getPassword());
            SiddhiAppsDataHolder.getInstance().setWorkerList(deploymentConfigs.getWorkerList());
            initPermission(deploymentConfigs.getRoleIdList());
            SiddhiAppsDataHolder.getInstance().setPermissionProvider(permissionProvider);

        } catch (ConfigurationException e) {
            logger.error("Error in reading datasearch configuration from deployment.yaml", e);
        }
    }

    private void initPermission(List<String> roleIdList) {
        if (!permissionProvider.isPermissionExists(viewPermission)) {
            permissionProvider.addPermission(viewPermission);
        }

        if (roleIdList != null) {
            //Grant permission to given role ids
            for (String viewerRole : roleIdList) {
                permissionProvider.grantPermission(viewPermission, new Role(viewerRole, ""));
            }
        }
    }

    @Reference(
            name = "carbon.config.provider",
            service = ConfigProvider.class,
            cardinality = ReferenceCardinality.MANDATORY,
            policy = ReferencePolicy.DYNAMIC,
            unbind = "unregisterConfigProvider"
    )
    protected void registerConfigProvider(ConfigProvider configProvider) {
        SiddhiAppsDataHolder.getInstance().setConfigProvider(configProvider);
    }

    protected void unregisterConfigProvider(ConfigProvider configProvider) {
        SiddhiAppsDataHolder.getInstance().setConfigProvider(null);
    }

    @Reference(
            name = "carbon.anaytics.common.clientservice",
            service = AnalyticsHttpClientBuilderService.class,
            cardinality = ReferenceCardinality.MANDATORY,
            policy = ReferencePolicy.DYNAMIC,
            unbind = "unregisterAnalyticsHttpClient"
    )
    protected void registerAnalyticsHttpClient(AnalyticsHttpClientBuilderService service) {
        SiddhiAppsDataHolder.getInstance().setClientBuilderService(service);
    }

    protected void unregisterAnalyticsHttpClient(AnalyticsHttpClientBuilderService service) {
        SiddhiAppsDataHolder.getInstance().setClientBuilderService(null);
    }

    @Reference(
            name = "permission-manager",
            service = PermissionManager.class,
            cardinality = ReferenceCardinality.MANDATORY,
            policy = ReferencePolicy.DYNAMIC,
            unbind = "unsetPermissionManager"
    )
    protected void setPermissionManager(PermissionManager permissionManager) {
        this.permissionProvider = permissionManager.getProvider();
        SiddhiAppsDataHolder.getInstance().setPermissionProvider(this.permissionProvider);
    }

    protected void unsetPermissionManager(PermissionManager permissionManager) {
        this.permissionProvider = null;
        SiddhiAppsDataHolder.getInstance().setPermissionProvider(null);
    }
}
