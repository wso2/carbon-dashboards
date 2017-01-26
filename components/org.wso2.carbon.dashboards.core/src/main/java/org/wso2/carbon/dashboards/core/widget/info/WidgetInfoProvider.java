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

import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

/**
 * Interface to for getting widget related information.
 */
public interface WidgetInfoProvider {

    /**
     * List meta information of all widgets available in the store.
     *
     * @return List list of meta information of all widgets
     */
    List getWidgetsMetaInfo();

    /**
     * Provide widget configuration file of the given widget.
     *
     * @param widgetId widget-id
     * @return returns widget configuration of the given widget
     */
    Optional<String> getWidgetConf(String widgetId);

    /**
     * Provide the thumbnail of the given widget id.
     *
     * @param widgetId widget-id
     * @return returns the thumbnail of the given widget
     */
    Optional<Path> getThumbnail(String widgetId);
}
