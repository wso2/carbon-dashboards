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

    protected String url;
    protected String owner;
    protected String name;
    protected String description;
    protected String landingPage;
    protected String parentId;
    protected Object pages;
    protected boolean hasOwnerPermission;
    protected boolean hasDesignerPermission;
    protected boolean hasViewerPermission;

    /**
     * This method is to get whether user has owner permission or not
     *
     * @return boolean hasOwnerPermission
     */
    public boolean isHasOwnerPermission() {
        return hasOwnerPermission;
    }

    /**
     * This method is to set whether user has owner permission or not
     *
     * @param hasOwnerPermission
     */
    public void setHasOwnerPermission(boolean hasOwnerPermission) {
        this.hasOwnerPermission = hasOwnerPermission;
    }

    /**
     * This method is to get whether user has designer/editor permission or not
     *
     * @return boolean hasOwnerPermission
     */
    public boolean isHasDesignerPermission() {
        return hasDesignerPermission;
    }

    /**
     * This method is to set whether user has designer/editor permission or not
     *
     * @param hasDesignerPermission
     */
    public void setHasDesignerPermission(boolean hasDesignerPermission) {
        this.hasDesignerPermission = hasDesignerPermission;
    }

    /**
     * This method is to get whether user has viewer permission or not
     *
     * @return boolean hasOwnerPermission
     */
    public boolean isHasViewerPermission() {
        return hasViewerPermission;
    }

    /**
     * This method is to set whether user has viewer permission or not
     *
     * @param hasViewerPermission
     */
    public void setHasViewerPermission(boolean hasViewerPermission) {
        this.hasViewerPermission = hasViewerPermission;
    }

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
     * This method is used to get owner of the dashboard
     *
     * @return String returns dashboard owner
     */
    public String getOwner() {
        return owner;
    }

    /**
     * This method is used to set the owner of dashboard
     *
     * @param owner owner of the dashboard
     */
    public void setOwner(String owner) {
        this.owner = owner;
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

    @Override
    public String toString() {
        return "DashboardMetadata{url='" + url + "', owner='" + owner + "', name='" + name + "'}'";
    }
}
