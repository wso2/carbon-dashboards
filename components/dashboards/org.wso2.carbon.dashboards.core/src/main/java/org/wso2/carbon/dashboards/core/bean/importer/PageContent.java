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

import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;

/**
 * Defines major contents of a dashboard page.
 *
 * @since 4.0.29
 */
public class PageContent {
    private String title;
    private String type;
    private String component;
    private Set<PageContent> content = new HashSet<>();
    private HashMap<String, Object> props = new HashMap<>();

    /**
     * Returns widget title.
     *
     * @return Widget title
     */
    public String getTitle() {
        return title;
    }

    /**
     * Ste title of the widget.
     * @param title Widget title
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * Returns type of the widget.
     *
     * @return Type of the widget
     */
    public String getType() {
        return type;
    }

    /**
     * Set type of the widget.
     * @param type Widget type
     */
    public void setType(String type) {
        this.type = type;
    }

    /**
     * Returns related component for the widget.
     *
     * @return Component of the widget
     */
    public String getComponent() {
        return component;
    }

    /**
     * Set component of the widget.
     *
     * @param component Component
     */
    public void setComponent(String component) {
        this.component = component;
    }

    /**
     * Returns nested content of the page.
     *
     * @return Nested content
     */
    public Set<PageContent> getContent() {
        return content;
    }

    /**
     * Set nested content of the page.
     *
     * @param content Page content
     */
    public void setContent(Set<PageContent> content) {
        this.content = content;
    }

    /**
     * Returns widget props.
     *
     * @return Props
     */
    public HashMap<String, Object> getProps() {
        return props;
    }

    /**
     * Set widget props.
     *
     * @param props Props
     */
    public void setProps(HashMap<String, Object> props) {
        this.props = props;
    }
}
