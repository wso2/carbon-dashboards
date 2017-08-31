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
    protected String description;
    protected String landingPage;
    protected String parentId;
    protected Object pages;

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
     * This method is used get the name of the dashboard
     *
     * @return String returns dashboard name
     */
    public String getName() {
        return name;
    }

    /**
     * This method is used to set the name of dashboard
     *
     * @param name the dashboard name
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * This methos is used to get the description of the dashboard
     *
     * @return String return the description of dashboard
     */
    public String getDescription() {
        return description;
    }

    /**
     * This method is used to set the description of the dashboard
     *
     * @param description description of the dashboard
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * This methos is used to get the landing page of the dashboard
     *
     * @return String return the landing page of dashboard
     */
    public String getLandingPage() {
        return landingPage;
    }

    /**
     * This method is used to set the landing page of the dashboard
     *
     * @param landingPage description of the dashboard
     */
    public void setLandingPage(String landingPage) {
        this.landingPage = landingPage;
    }

    /**
     * This method is used to get the parent id of the dashboard
     *
     * @return String returns the parentID of the dashboard
     */
    public String getParentId() {
        return parentId;
    }

    /**
     * This method is used to set the parent id of the dashboard
     *
     * @param parentId parentId of the dashboard
     */
    public void setParentId(String parentId) {
        this.parentId = parentId;
    }

    /**
     * This method is used to get the DB level dashboard id
     *
     * @return String returns the id of dashboard
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
    public Object getPages() throws DashboardException {
        return pages;
    }

    /**
     * This method is used to set the content/dashboard json
     *
     * @param pages content of dashboard
     */
    public void setPages(Object pages) {
        this.pages = pages;
    }

}
