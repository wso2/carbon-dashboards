/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

package org.wso2.carbon.dashboards.core.bean;

import org.wso2.carbon.config.annotation.Element;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

/**
 * Bean class for dashboard SQl queries configurations.
 *
 * @since 4.0.0
 */
public class QueryConfiguration {

    @Element(description = "database type")
    private String type;

    @Element(description = "DBMS version")
    private String version;

    @Element(description = "SQL queries mappings")
    private Map<String, String> mappings = Collections.emptyMap();

    public String getType() {
        return type;
    }

    public String getVersion() {
        return version;
    }

    public Map<String, String> getMappings() {
        return mappings;
    }

    public Optional<String> getQuery(String key) {
        return Optional.ofNullable(mappings.get(key));
    }
}
