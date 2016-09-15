/*
 * Copyright (c) 2015, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

/**
 * Handlebars helpers
 */
// Check whether a particular object has a property.
Handlebars.registerHelper('has', function () {
    var has = function (o) {
        if (!o) {
            return false;
        }
        if (o instanceof Array && !o.length) {
            return false;
        }
        var key;
        for (key in o) {
            if (o.hasOwnProperty(key)) {
                return true;
            }
        }
        return false;
    };
    var args = Array.prototype.slice.call(arguments);
    var options = args.pop();
    var length = args.length;
    if (!length) {
        return new Handlebars.SafeString(options.inverse(this));
    }
    var i;
    for (i = 0; i < length; i++) {
        if (has(args[i])) {
            return new Handlebars.SafeString(options.fn(this));
        }
    }
    return new Handlebars.SafeString(options.inverse(this));
});

// Check whether the left hand side equals to the right hand side.
Handlebars.registerHelper('equals', function (left, right, options) {
    if (left === right) {
        return options.fn(this);
    }
    return options.inverse(this);
});

Handlebars.registerHelper('equalsIgnoreCase', function (left, right, options) {
    if (left.toLowerCase() === right.toLowerCase()) {
        return options.fn(this);
    }
    return options.inverse(this);
});

// Check whether the left hand side does not equals to the right hand side.
Handlebars.registerHelper('if_neq', function (a, b, blocks) {
    if (a != b) {
        return blocks.fn(this);
    } else {
        return blocks.inverse(this);
    }
});

// JSON stringify a particular object.
Handlebars.registerHelper('dump', function (o) {
    return JSON.stringify(o);
});

// Resolve a URI.
Handlebars.registerHelper('resolveURI', function (path) {
    return ues.dashboards.resolveURI(path);
});

//handlebar helper which returns menu hierachy
Handlebars.registerHelper('traverseMenu', function (menu, designer, isAnonView, user, isHidden, queryString, currentView, allowedViews) {
    var divTree = "";
    var checked = isHidden ? "checked=''" : "";
    var requestParam = (queryString !== null) ? "?" + queryString : "";

    if (designer) {
        divTree += "<ul class='nav nav-pills nav-stacked menu-customize'>" +
                        "<li class='hide-all add-margin-bottom-3x'>" +
                            "<label class='checkbox'>" +
                                "<input type='checkbox' " + checked + " name='ds-menu-hide-all' value='hide' id='ds-menu-hide-all'>" +
                                "<span class='helper'> Hide All</span>" +
                            "</label>" +
                        "</li>" +
                    "</ul>" +
                    "<ul id='sortable' class='nav nav-pills nav-stacked connect dd dd-list'>";
    } else {
        divTree += "<ul id='sortable' class='nav nav-pills nav-stacked menu-customize pages'>";
    }

    var parentsOfSelectedView = [];
    collectParentsofSelectedView(menu, currentView, parentsOfSelectedView);
    updateSubordinates(menu, null, allowedViews);
    divTree += "</ul>";

    function updateSubordinates(menu, parent, allowedViews) {
        for (var i = 0; i < menu.length; i++) {
            if (designer) {
                //todo use fw-hide class once latest wso2 icon project released
                var iClass = menu[i].ishidden ? "<i class='fw fw-block'></i>" : "<i class='fw fw-view'></i>";
                divTree += "<li id='" + menu[i].id + "' data-parent='" + parent +
                    "' data-id='" + menu[i].id + "' data-anon='" + menu[i].isanon + "' class='dd-item'>" +
                    "<div class='dd-handle'>" + menu[i].title + "<span class='controls hide-menu-item hide-" +
                    menu[i].ishidden + "' id='" + menu[i].id + "' title='Hide page in Dashboard View Page'>" + iClass + "</span></div>";
            } else {
                var cls = checkParentsOfSelectedView(menu[i].id, parentsOfSelectedView) ? 'active' : '';
                var divLi = "<li class='" + cls + "'><a href='" + menu[i].id + requestParam + "'>" + menu[i].title + "</a>" +
                    "<span id='" + menu[i].id + "' class='refreshBtn' style='background-color:#1e2531; display:none;'><i class='icon fw fw-undo'></i></span>";
                if (!menu[i].ishidden) {
                    if (allowedViews) {
                        if ((parent === null || allowedViews.indexOf(parent) > -1) && allowedViews.indexOf(menu[i].id) > -1) {
                            divTree += divLi;
                        }
                    }
                    else if (isAnonView || !user) {
                        if (menu[i].isanon) {
                            // Anonymous viewing. So render only anonymous pages links.
                            divTree += divLi;
                        }
                    } else {
                        divTree += divLi;
                    }
                }
            }
            if (menu[i].subordinates.length > 0 && (designer || (allowedViews && allowedViews.indexOf(menu[i].id) > -1))) {
                divTree += "<ul class='dd-list connect' id='" + menu[i].id + "' data-anon='" + menu[i].isanon + "'>";
                updateSubordinates(menu[i].subordinates, menu[i].id, allowedViews);
                divTree += "</ul>";
            } else {
                divTree += "</li>";
            }
        }
    }

    return divTree;
});

/**
 * Go through the menu hierarchy and get the parents of selected view
 * @param menu
 * @param currentView selected view
 * @param parentsOfSelectedView parents of selected view
 * @returns {boolean}
 */
var collectParentsofSelectedView = function (menu, currentView, parentsOfSelectedView) {
    for (var i = 0; i < menu.length; i++) {
        if (menu[i].id === currentView) {
            parentsOfSelectedView.push("" + currentView);
            return true;
        }
        if (menu[i].subordinates.length > 0) {
            if (collectParentsofSelectedView(menu[i].subordinates, currentView, parentsOfSelectedView)) {
                parentsOfSelectedView.push(menu[i].id);
                return true;
            }
        }
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
}
