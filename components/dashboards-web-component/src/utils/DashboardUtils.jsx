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

export default class DashboardUtils {
    getDashboardByPageId(pageId, dashboardContent, landingPage) {
        let dashboardPageContent = [];
        if (dashboardContent[0]) {
            if (pageId) {
                let pages = pageId.split("/");
                let parentPage = dashboardContent;
                let selectedPage;
                pages.forEach(page => {
                    selectedPage = this.findPageByID(page, parentPage);
                    parentPage = selectedPage.pages;
                });
                dashboardPageContent.push(selectedPage.content[0]);
            } else {
                dashboardPageContent.push(this.findPageFromDashboardJSon(landingPage, dashboardContent).content[0]);
            }
        }
        return dashboardPageContent;
    }

    findPageFromDashboardJSon(pageId, pagesList) {
        let selectedPage;
        for (let page of pagesList) {
            if (page.id === pageId) {
                selectedPage = page;
                break;
            }
            else if (page.pages) {
                selectedPage = this.findPageFromDashboardJSon(pageId, page.pages)
            }
        }
        return selectedPage;
    }

    findPageByID(pageId, pagesList) {
        let selectedPage;
        pagesList.find(page => {
            if (page.id === pageId) {
                selectedPage = page;
            }
        });
        return selectedPage;
    }

    sanitizeInput(input) {
        return input.replace(/[^a-z0-9-\s]/gim, "");
    };

    static findDashboardPageById(dashboard, pageId) {
        if (!dashboard || !dashboard.pages) {
            return {};
        }
        let page = this._findPageByIdRecursively(dashboard.pages, pageId);
        return page || undefined;
    }

    static _findPageByIdRecursively(pages, id) {
        pages = pages || [];
        for (var i = 0; i < pages.length; i++) {
            if (pages[i].id == id) {
                return pages[i];
            } else {
                var p;
                if (pages[i].hasOwnProperty('pages')) {
                    p = this._findPageByIdRecursively(pages[i].pages, id);
                }
                if (p) {
                    return p;
                }
            }
        }
    }
}