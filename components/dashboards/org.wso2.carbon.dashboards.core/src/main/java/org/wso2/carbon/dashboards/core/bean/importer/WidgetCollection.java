/*
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package org.wso2.carbon.dashboards.core.bean.importer;

import org.wso2.carbon.dashboards.core.bean.widget.GeneratedWidgetConfigs;
import java.util.HashSet;
import java.util.Set;

/**
 * Organizes widgets based on their type.
 *
 * @since 4.0.29
 */
public class WidgetCollection {
    private Set<GeneratedWidgetConfigs> generated = new HashSet<>();
    private Set<String> custom = new HashSet<>();

    /**
     * Returns generated widgets.
     *
     * @return Set of generated widgets
     */
    public Set<GeneratedWidgetConfigs> getGenerated() {
        return generated;
    }

    /**
     * Set set of generated widgets.
     *
     * @param generated Generated widgets
     */
    public void setGenerated(Set<GeneratedWidgetConfigs> generated) {
        this.generated = generated;
    }

    /**
     * Returns Ids of the custom widgets.
     *
     * @return Set of IDs of the custom widgets
     */
    public Set<String> getCustom() {
        return custom;
    }

    /**
     * Set Ids of the custom widgets.
     *
     * @param custom Set of IDs of the custom widgets
     */
    public void setCustom(Set<String> custom) {
        this.custom = custom;
    }
}
