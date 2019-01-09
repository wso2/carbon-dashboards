/*
 *   Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *   WSO2 Inc. licenses this file to you under the Apache License,
 *   Version 2.0 (the "License"); you may not use this file except
 *   in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing,
 *   software distributed under the License is distributed on an
 *   "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *   KIND, either express or implied.  See the License for the
 *   specific language governing permissions and limitations
 *   under the License.
 *
 */

package org.wso2.carbon.siddhi.apps.api.rest.bean;

import org.wso2.siddhi.query.api.definition.Attribute;
import java.util.List;
import java.util.Objects;

/**
 * Bean class to hold elements of a SiddhiApp Store Element (Aggregation/Table/Window)
 */

public class SiddhiStoreElement implements Comparable<SiddhiStoreElement> {
    private String name;
    private String definition;
    private String type;
    private List<Attribute> attributes;

    public SiddhiStoreElement(String name, String definition, String type, List<Attribute> attributes) {
        this.name = name;
        this.definition = definition;
        this.type = type;
        this.attributes = attributes;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDefinition() {
        return definition;
    }

    public void setDefinition(String definition) {
        this.definition = definition;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }


    public List<Attribute> getAttributes() {
        return attributes;
    }

    public void setAttributes(List<Attribute> attributes) {
        this.attributes = attributes;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        SiddhiStoreElement that = (SiddhiStoreElement) o;
        return Objects.equals(name, that.name) &&
                Objects.equals(definition, that.definition) &&
                Objects.equals(type, that.type) &&
                Objects.equals(attributes, that.attributes);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, definition, type, attributes);
    }

    @Override
    public int compareTo(SiddhiStoreElement sd) {
        return name.compareTo(sd.name);
    }
}
