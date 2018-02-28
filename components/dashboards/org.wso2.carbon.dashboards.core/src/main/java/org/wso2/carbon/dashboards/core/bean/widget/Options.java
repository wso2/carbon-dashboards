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
package org.wso2.carbon.dashboards.core.bean.widget;

import java.util.List;

/**
 * Configuration bean class for options in widget conf file.
 */
class Options {

    enum Types {
        TypeText, TypeEnum, TypeBoolean
    }

    String id;
    String title;
    Types type;
    List<String> possibleValues;
    Object defaultData;

    public String getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public Types getType() {
        return type;
    }

    public Object getDefaultData() {
        return defaultData;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setType(Types type) {
        this.type = type;
    }
    public void setDefaultData(Object defaultData) {
        this.defaultData = defaultData;
    }

    public void setPossibleValues(List<String> possibleValues) {
        this.possibleValues = possibleValues;
    }

    public List<String> getPossibleValues() {
        return this.possibleValues;
    }


}

