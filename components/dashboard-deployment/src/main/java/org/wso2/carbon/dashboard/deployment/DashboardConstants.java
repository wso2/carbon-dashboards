/**
 * Copyright (c) 2005 - 2013, WSO2 Inc. (http://www.wso2.com) All Rights Reserved.
 * <p>
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * <p>
 * http://www.apache.org/licenses/LICENSE-2.0
 * <p>
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.wso2.carbon.dashboard.deployment;

import org.wso2.carbon.registry.core.RegistryConstants;

/**
 * Constants related to dashboards
 */
public class DashboardConstants {

    public static final String APP_NAME = "portal";
    public static final String DEFAULT_STORE_TYPE = "fs";
    public static final String SHARED_RESOURCE_LOCATION = "repository/resources/sharedstore";
    public static final String LAYOUT_TYPE = "layout";
    public static final String GADGET_TYPE = "gadget";
    public static final String LAYOUT_DEPLOYMENT_DIR = "layout";
    public static final String GADGET_DEPLOYMENT_DIR = "gadget";
    public static final String THEME_TYPE = "theme";

    public static final String DASHBOARD_ARTIFACT_TYPE = "dashboards/dashboard";
    public static final String LAYOUT_ARTIFACT_TYPE = "dashboards/layout";
    public static final String GADGET_ARTIFACT_TYPE = "dashboards/gadget";
    public static final String THEME_ARTIFACT_TYPE = "dashboards/theme";

    public static final String DASHBOARD_EXTENSION = ".json";
    public static final String DEFAULT_THEME = "Default Theme";
    public static final String DASHBOARDS_RESOURCE_PATH = RegistryConstants.PATH_SEPARATOR +
            "ues" + RegistryConstants.PATH_SEPARATOR + "dashboards" + RegistryConstants.PATH_SEPARATOR;
    public static final String ZIP_FILE_EXTENSION = ".zip";
    public static final String ID = "id";
}
