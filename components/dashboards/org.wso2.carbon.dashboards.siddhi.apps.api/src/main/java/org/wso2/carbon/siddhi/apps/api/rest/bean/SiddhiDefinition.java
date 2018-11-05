/*
 *   Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

public class SiddhiDefinition implements Comparable<SiddhiDefinition> {
    private String definitionName;
    private String definitionText;
    private String type;
    private String attributes;

    public SiddhiDefinition(String definitionName, String definitionText,String type) {
        this.definitionName = definitionName;
        this.definitionText = definitionText;
        this.type = type;
    }

    public SiddhiDefinition(String definitionName, String definitionText, String type, String attributes) {
        this.definitionName = definitionName;
        this.definitionText = definitionText;
        this.type = type;
        this.attributes=attributes;
    }

    public String getDefinitionName() {
        return definitionName;
    }

    public void setDefinitionName(String definitionName) {
        this.definitionName = definitionName;
    }

    public String getDefinitionText() {
        return definitionText;
    }

    public void setDefinitionText(String definitionText) {
        this.definitionText = definitionText;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }


    public String getAttributes() {
        return attributes;
    }

    public void setAttributes(String attributes) {
        this.attributes = attributes;
    }

    @Override
    public int compareTo(SiddhiDefinition sd) {
        return this.getDefinitionName().compareTo(sd.definitionName);
    }
}