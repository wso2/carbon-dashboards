/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
package org.wso2.carbon.dashboards.core;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.carbon.analytics.idp.client.core.utils.config.IdPClientConfiguration;
import org.wso2.carbon.analytics.idp.client.external.ExternalIdPClientConstants;
import org.wso2.carbon.config.ConfigurationException;
import org.wso2.carbon.config.provider.ConfigProvider;
import org.wso2.carbon.dashboards.core.exception.DashboardException;

import java.util.Map;

/**
 * Default implementation for Default Dashboard Theme Config Provider.
 */
@Component(
        service = DashboardThemeConfigProvider.class,
        immediate = true
)
public class DefaultDashboardThemeConfigProvider implements DashboardThemeConfigProvider {

    private static final Logger LOGGER = LoggerFactory.getLogger(DefaultDashboardThemeConfigProvider.class);

    private IdPClientConfiguration idPClientConfiguration;

    @Reference(service = ConfigProvider.class,
            cardinality = ReferenceCardinality.MANDATORY,
            policy = ReferencePolicy.DYNAMIC,
            unbind = "unsetConfigProvider")
    protected void setConfigProvider(ConfigProvider configProvider) {
        try {
            this.idPClientConfiguration = configProvider.getConfigurationObject(IdPClientConfiguration.class);
        } catch (ConfigurationException e) {
            LOGGER.error("Cannot load idp client configurations from 'deployment.yaml'. Falling-back to defaults.", e);
            this.idPClientConfiguration = new IdPClientConfiguration();
        }
    }

    protected void unsetConfigProvider(ConfigProvider configProvider) {
        LOGGER.debug("An instance of class '{}' unregistered as a config provider.",
                configProvider.getClass().getName());
    }

    @Override
    public String getLogoPath(String username) throws DashboardException {
        Map<String, String> properties = idPClientConfiguration.getProperties();
        String baseUrl = properties.getOrDefault(ExternalIdPClientConstants.BASE_URL,
                ExternalIdPClientConstants.DEFAULT_BASE_URL);
        String portalAppContext = properties.getOrDefault(ExternalIdPClientConstants.PORTAL_APP_CONTEXT,
                ExternalIdPClientConstants.DEFAULT_PORTAL_APP_CONTEXT);
        String logoPath = baseUrl + "/" + portalAppContext + "/public/app/images/logo.svg";
        LOGGER.debug("Default logo path returned via '{}' class for user: '{}.'", this.getClass().getName(), username);
        return logoPath;
    }
}
