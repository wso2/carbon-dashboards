/*
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

$(function () {

    /**
     * This is the initial call from the dashboard.js.
     * @return {null}
     * @private
     */
    var initDashboard = function () {
        var allPages = dashboard.pages;

        //if (allPages.length > 0) {
        //    page = (ues.global.page ? ues.global.page : allPages[0]);
        //}
        //for (var i = 0; i < allPages.length; i++) {
        //    if (ues.global.page == allPages[i].id) {
        //        page = allPages[i];
        //    }
        //}
        //var allowedViews = getUserAllowedViews(page);
        //var renderingView;
        //
        //if (embeddableView) {
        //    renderingView = embeddableView;
        //} else {
        //    if (allowedViews.length > 0) {
        //        if (currentView) {
        //            if (allowedViews.indexOf(currentView) > -1) {
        //                renderingView = currentView;
        //            } else {
        //                renderingView = allowedViews[0];
        //            }
        //        } else {
        //            renderingView = allowedViews[0];
        //        }
        //    }
        //}
        ////if there is more than one view, enable dropdown list
        //if (allowedViews.length > 1) {
        //    $('#list-user-views').removeClass("hide");
        //    $('#list-user-views').removeClass("show");
        //}
        //ues.global.dbType = renderingView;
        //isPersonalizeEnabled ? renderViewContentInEditMode(renderingView) : renderViewContentInViewMode(renderingView);
        //$('.nano').nanoScroller();
        debugger;
        $('#download-pdf-panel').on('click', function () {
            if ($("#pdf-size-panel").hasClass("in")) {
                $(this).find("span.caret").addClass("open-caret");
            } else {
                $(this).find("span.caret").removeClass("open-caret");
            }
        });
    };

    /**
     * Update the pages menu in left navigation.
     * @return null
     * */
    var updateMenuList = function () {
        var pages = $('#ues-pages');
        var menu = dashboard.menu;
        var currentView = dashboard.content.pages[0];
        var allowedViews = getUserAllowedPages();
        var divTree = "<ul id='sortable' class='nav nav-pills nav-stacked menu-customize pages'>";
        var parentsOfSelectedView = [];
        collectParentsOfSelectedView(menu, currentView, parentsOfSelectedView);
        divTree = updateSubordinates(menu, null, allowedViews, divTree, parentsOfSelectedView);
        pages.html(divTree);
    };

    var updateSubordinates = function (menu, parent, allowedViews, divTree, parentsOfSelectedView) {
        for (var i in menu) {
            var cls = checkParentsOfSelectedView(menu[i].id, parentsOfSelectedView) ? 'active' : '';
            var divLi = "<li class='" + cls + "'><a href='" + menu[i].id + "'>" + menu[i].title + "</a>" +
                "<span id='" + menu[i].id + "' class='refreshBtn' style='background-color:#1e2531; display:none;'><i class='icon fw fw-undo'></i></span>";
            divTree += divLi;
        }

        return divTree;
    };

    var collectParentsOfSelectedView = function (menu, currentView, parentsOfSelectedView) {
        for (var i in menu) {
            if (menu[i].id === currentView) {
                parentsOfSelectedView.push("" + currentView);
                return true;
            }
            //if (menu[i].subordinates) {
            //    if (collectParentsOfSelectedView(menu[i].subordinates, currentView, parentsOfSelectedView)) {
            //        parentsOfSelectedView.push(menu[i].id);
            //        return true;
            //    }
            //}
        }
    };

    /**
     * Check the given view is a parent of selected view or not
     * @param id given view
     * @param parentsOfSelectedView parents of selected view
     * @returns {boolean} true if the given view is a parent of selected view
     */
    var checkParentsOfSelectedView = function (id, parentsOfSelectedView) {
        for (var i = 0; i < parentsOfSelectedView.length; i++) {
            if (id === parentsOfSelectedView[i]) {
                return true;
            }
        }
        return false;
    };

    /**
     * To get the user allowed pages based on views
     * @returns {Array} array of pages that is permitted by user to view
     */
    var getUserAllowedPages = function () {
        var pageIds = [];
        var pages = dashboard.content.pages;

        for (var i in pages) {
            var allowedViews = getUserAllowedViews(pages[i], true);
            if (allowedViews.length > 0) {
                pageIds.push(pages[i].id);
            }
        }
        return pageIds;
    };

    /**
     * Returns the list of allowed views for the current user
     * @param page Current page
     * @param isMenuRendering to check whether the user allowed views is required for the menu rendering
     * @returns {Array} List of allowe roles
     */
    var getUserAllowedViews = function (page, isMenuRendering) {
        if (!isMenuRendering) {
            $('#ds-allowed-view-list').empty();
        }
        var allowedViews = [];
        var views = Object.keys(page.views.content);
        for (var i in views) {
            var viewRoles = page.views.content[views[i]].roles;
            if (isAllowedView(viewRoles)) {
                allowedViews.push(views[i]);
            }
        }
        return allowedViews;
    };

    /**
     * Check whether a view is allowed for the current user
     * according to his/her list of roles
     * @param viewRoles Allowed roles list for the view
     * @returns {boolean} View is allowed or not
     */
    var isAllowedView = function (viewRoles) {
        var userRolesList = ["Internal/Everyone", "admin"];
        for (var i = 0; i < userRolesList.length; i++) {
            var tempUserRole = userRolesList[i];
            for (var j in viewRoles) {
                if (viewRoles[j] === tempUserRole) {
                    return true;
                }
            }
        }
        return false;
    };

    initDashboard();
    updateMenuList();
});

/**
 * We make this true so that the dashboard.jag files inline ues.dashboards.render method is not triggered.
 * @type {boolean}
 */
//ues.global.renderFromExtension = true;