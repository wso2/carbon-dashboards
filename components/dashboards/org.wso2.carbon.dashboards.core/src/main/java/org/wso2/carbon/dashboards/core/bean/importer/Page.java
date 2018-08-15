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

import java.util.HashSet;
import java.util.Set;

/**
 * Defines a page in dashboard JSON format.
 *
 * @since 4.0.29
 */
public class Page {
    private String id;
    private String name;
    private Set<PageContent> content = new HashSet<>();

    /**
     * Returns dashboard Id.
     *
     * @return Dashboard ID
     */
    public String getId() {
        return id;
    }

    /**
     * Set dashboard Id.
     *
     * @param id Dashboard ID
     */
    public void setId(String id) {
        this.id = id;
    }

    /**
     * Returns name of the dashboard.
     *
     * @return Dashboard name
     */
    public String getName() {
        return name;
    }

    /**
     * Set name of the dashboard.
     *
     * @param name Dashboard name
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Returns contents of the page.
     *
     * @return Set of contents
     */
    public Set<PageContent> getContent() {
        return content;
    }

    /**
     * Set contents of the dashboard.
     *
     * @param content Set of contents
     */
    public void setContent(Set<PageContent> content) {
        this.content = content;
    }
}
