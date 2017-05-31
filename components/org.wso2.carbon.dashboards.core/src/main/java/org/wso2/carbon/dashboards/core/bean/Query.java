/*
 *  Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
package org.wso2.carbon.dashboards.core.bean;

/**
 * Representation of a DashboardMetadata Query.
 */
public class Query {
    
    private String url;
    private String owner;
    private String name;

    /**
     * Default constructor.
     */
    public Query() {
    }

    /**
     * Overloaded constructor with owner parameter.
     *
     * @param owner Dashboard owner
     */
    public Query(String owner) {
        this.owner = owner;
    }

    /**
     * Overloaded constructor with owner and url parameters.
     *
     * @param owner Dashboard owner
     * @param url   Dashboard URL
     */
    public Query(String owner, String url) {
        this.owner = owner;
        this.url = url;
    }

    /**
     * This method is used to get the url of dashboard
     *
     * @return String returns the url of core/dashboard
     */
    public String getUrl() {
        return url;
    }

    /**
     * This method is used to set the url of dashboard
     *
     * @param url url of the core/dashboard
     */
    public void setUrl(String url) {
        this.url = url;
    }

    /**
     * This methods is used to get the name of core/dashboard
     *
     * @return String returns the name of core/dashboard
     */
    public String getName() {
        return name;
    }

    /**
     * This method is used to set the name of core/dashboard
     *
     * @param name name of the core/dashboard
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * This method is used to get the owner of core/dashboard
     *
     * @return String returns the owner of core/dashboard
     */
    public String getOwner() {
        return owner;
    }

    /**
     * This method is used to set the owner of core/dashboard
     *
     * @param owner owner of the core/dashboard
     */
    public void setOwner(String owner) {
        this.owner = owner;
    }
}
