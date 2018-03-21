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

import _ from 'lodash';
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
                    parentPage = selectedPage ? selectedPage.pages : [];
                });
                dashboardPageContent.push(selectedPage ? selectedPage.content[0] : "");
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

    static generateguid () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };

    /**
     * helper function to traverse the content of a page and find widgets to extract their options to a
     * given map
     * @param page : the page to be traversed
     * @param OptionsMap : the map to extract option configurations
     * */
    static searchForWidgetsInAPage(page, OptionsMap) {
        let obj = page;
        if (obj.type && obj.type === 'component' && obj.props && obj.props.id) {
            if (obj.props.configs.options) {
                let newObj = JSON.parse(JSON.stringify(obj));
                OptionsMap[obj.props.id] = newObj.props.configs.options;
            }
        }
        else if (obj.content) {
            for (let i = 0; i < obj.content.length; i++) {
                searchForWidgetsInAPage(obj.content[i], OptionsMap);
            }
        }
    }

    /**
     * helper function to traverse the content of a page and finding widgets to replace their options with
     *their corresponding options in a given map against their id
     * @param page : the page to be traversed
     * @param OptionsMap : the map to with option configurations
     * */
    static searchAndReplaceOptions(page, OptionsMap) {
        let obj = page;
        if (obj.type && obj.type === 'component' && obj.props && obj.props.id) {
            if (OptionsMap[obj.props.id]) {
                obj.props.configs.options = OptionsMap[obj.props.id];
            }
        }
        else if (obj.content) {
            for (let i = 0; i < obj.content.length; i++) {
                searchAndReplaceOptions(obj.content[i], OptionsMap);
            }
        }
    }

    /**
     * helper function to get the page from a given dashboard given the pageId
     * */
    static getPage(dashboard, pageID) {
        let pages = dashboard.pages;
        if (pages) {
            let pageResult = _.filter(pages, function (page) {
                return page.id === pageID;
            })
            return pageResult[0];
        }
        return null;
    }

    /**
     * helper function to get the widget from a given page given the widgetId
     * */
    static searchForWidget(page, id) {
        let obj = page;
        if (obj.type && obj.type === 'component' && obj.props && obj.props.id && obj.props.id === id) {
            return obj;
        }
        else if (obj.content) {
            let widget = null;
            for (let i = 0; i < obj.content.length; i++) {
                widget = widget || searchForWidget(obj.content[i], id);
            }
            return widget;
        }
    }
}