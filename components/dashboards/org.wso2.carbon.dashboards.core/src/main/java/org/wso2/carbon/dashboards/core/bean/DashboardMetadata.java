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
package org.wso2.carbon.dashboards.core.bean;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.carbon.dashboards.core.exception.DashboardException;

/**
 * Class to represent a DashboardMetadata(Dashboard JSON).
 */
public class DashboardMetadata {

    private static final Logger log = LoggerFactory.getLogger(DashboardMetadata.class);

    protected String id;
    protected String url;
    protected String name;
    protected String version;
    protected String description;
    protected String owner;
    protected String lastUpdatedBy;
    protected long createdTime;
    protected long lastUpdatedTime;
    protected boolean isShared;

    protected String parentId;
    protected Object content;

    /**
     * This method is used to get url of the dashboard
     *
     * @return String returns dashboard url
     */
    public String getUrl() {
        return url;
    }

    /**
     * This method is used to set the url of dashboard
     *
     * @param url url of the dashboard
     */
    public void setUrl(String url) {
        this.url = url;
    }

    /**
     * This method is used get the name of the core/dashboard
     *
     * @return String returns core/dashboard name
     */
    public String getName() {
        return name;
    }

    /**
     * This method is used to set the name of core/dashboard
     *
     * @param name the core/dashboard name
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * This method is used to get the version of the core/dashboard
     *
     * @return String returns the core/dashboard version
     */
    public String getVersion() {
        return version;
    }

    /**
     * This method is used to set the version of core/dashboard
     *
     * @param version version of the core/dashboard
     */
    public void setVersion(String version) {
        this.version = version;
    }

    /**
     * This methos is used to get the description of the core/dashboard
     *
     * @return String return the description of core/dashboard
     */
    public String getDescription() {
        return description;
    }

    /**
     * This method is used to set the description of the core/dashboard
     *
     * @param description description of the core/dashboard
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * This method is used to get the owner of the core/dashboard
     *
     * @return String return the owner of the core/dashboard
     */
    public String getOwner() {
        return owner;
    }

    /**
     * This method is used to set the owner of the dashboard/core
     *
     * @param owner owner of the dashboard
     */
    public void setOwner(String owner) {
        this.owner = owner;
    }

    /**
     * This method is used to get the user who updated the core/dashboard lastly
     *
     * @return String returns user who updated the core/dashboard lastly
     */
    public String getLastUpdatedBy() {
        return lastUpdatedBy;
    }

    /**
     * This method is used to set the user who updated the core/dashboard lastly
     *
     * @param lastUpdatedBy user who updated the core/dashboard lastly
     */
    public void setLastUpdatedBy(String lastUpdatedBy) {
        this.lastUpdatedBy = lastUpdatedBy;
    }

    /**
     * This method is to get creation time of core/dashboard
     *
     * @return long returns the core/dashboard - created time
     */
    public long getCreatedTime() {
        return createdTime;
    }

    /**
     * This method is used to set the creation time of core/dashboard
     *
     * @param createdTime creation time of core/dashboard
     */
    public void setCreatedTime(long createdTime) {
        this.createdTime = createdTime;
    }

    /**
     * This method is used to get the last updated time of core/dashboard
     *
     * @return long returns last updated time of core/dashboard
     */
    public long getLastUpdatedTime() {
        return lastUpdatedTime;
    }

    /**
     * This method is used to set the last updated time of core/dashboard
     *
     * @param lastUpdatedTime last updated time of core/dashboard
     */
    public void setLastUpdatedTime(long lastUpdatedTime) {
        this.lastUpdatedTime = lastUpdatedTime;
    }

    /**
     * This method is used to get the core shared state
     *
     * @return boolean returns true if the core/dashboard is shared
     */
    public boolean isShared() {
        return isShared;
    }

    /**
     * This method is used to set the boolean according to core shared state
     *
     * @param shared true if the core/dashboard is shared
     */
    public void setShared(boolean shared) {
        isShared = shared;
    }

    /**
     * This method is used to get the parent id of the dashboard/core
     *
     * @return String returns the parentID of the core/dashboard
     */
    public String getParentId() {
        return parentId;
    }

    /**
     * This method is used to set the parent id of the dashboard/core
     *
     * @param parentId parentId of the core/dashboard
     */
    public void setParentId(String parentId) {
        this.parentId = parentId;
    }

    /**
     * This method is used to get the DB level dashboard id
     *
     * @return String returns the id of core/dashboard
     */
    public String getId() {
        return id;
    }

    /**
     * This method is used to set the DB level dashboard id
     *
     * @param id id of core/dashboard
     */
    public void setId(String id) {
        this.id = id;
    }

    /**
     * This method is to get the content/dashbord json
     *
     * @return Object returns the content of dashboard
     */
    public Object getContent() throws DashboardException {
        return content;
    }

    /**
     * This method is used to set the content/dashboard json
     *
     * @param content content of dashboard
     */
    public void setContent(Object content) {
        this.content = content;
    }

}
