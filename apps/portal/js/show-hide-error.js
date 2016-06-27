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
 *
 * This file handles the showing and hiding error
 */

/**
 * Show error style for given element
 * @param1 {Object} element UI element under which error should be shown
 * @param2 {Object} errorElement UI error element to show
 * @param3 {String} message Error message
 * */
var showInlineError = function (element, errorElement, message) {
    element.val('');
    element.parent().addClass("has-error");
    element.addClass("has-error");
    element.parent().find("span.glyphicon").removeClass("hide").addClass("show");
    errorElement.removeClass("hide").addClass("show");
    if (message) {
        errorElement.html(message);
    }
};

/**
 * Hide error style for given element
 * @param1 {Object} element UI element under which error should be hidden
 * @param2 {Object} errorElement UI error element to hide
 * */
var hideInlineError = function (element, errorElement) {
    $('.upload-success').addClass("hide").removeClass("show");
    element.parent().removeClass("has-error");
    element.removeClass("has-error");
    element.parent().find("span.glyphicon").removeClass("show").addClass("hide");
    errorElement.removeClass("show").addClass("hide");
};