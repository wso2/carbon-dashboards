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

package org.wso2.carbon.dashboards.core.bean.export;

import org.wso2.carbon.dashboards.core.bean.widget.WidgetMetaInfo;

import java.util.HashSet;
import java.util.Set;

/**
 * Bean class to hold generated and custom widget definitions.
 *
 * @since 4.0.28
 */
public class WidgetCollection {
    private Set<WidgetMetaInfo> generated = new HashSet<>();
    private Set<String> custom = new HashSet<>();

    public Set<WidgetMetaInfo> getGenerated() {
        return generated;
    }

    public void setGenerated(Set<WidgetMetaInfo> generated) {
        this.generated = generated;
    }

    public Set<String> getCustom() {
        return custom;
    }

    public void setCustom(Set<String> custom) {
        this.custom = custom;
    }
}
