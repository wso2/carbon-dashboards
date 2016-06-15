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
 * Functionality of upload gadget is defined in this file
 */

$(function () {

    /**
     * Validate whether the user hase uploaded a zip file.
     * @returns {*}
     * @private
     */
    var validateAssetUpload = function () {
        var selectFileElement = $("#selected-file");
        var uploadErrorElement = $("#upload-error");
        var assetFile = selectFileElement[0].files[0];
        var zipFileType = "application/zip";

        if (!assetFile) {
            showInlineError(selectFileElement, uploadErrorElement, "Please selet a zip file to upload");
            return;
        }
        if (assetFile.type !== zipFileType) {
            showInlineError(selectFileElement, uploadErrorElement, "Please select a zip file to upload. " + assetFile.type + " format is not supported");
            return;
        }
        return true;
    };

    /**
     * When user clicks upload button, validate the user upload and submit the form
     */
    $(".asset-upload").on('click', function () {
        if (validateAssetUpload()) {
            $('#asset-upload-form').submit();
        }
    });

    /**
     * When user clicks browse button, hide the error, if there are any
     */
    $('.browse').on("click", function () {
        hideInlineError($("#selected-file"), $("#upload-error"));
    });
});

/**
 * Show error style for given element
 * @param1 element
 * @param2 errorElement
 * @param3 message
 * */
var showInlineError = function (element, errorElement, message) {
    $('.upload-success').removeClass("show");
    $('.upload-success').addClass("hide");
    element.val('');
    element.parent().addClass("has-error");
    element.addClass("has-error");
    errorElement.removeClass("hide");

    if (message)
        errorElement.html(message);
    errorElement.addClass("show");
};

/**
 * Hide error style for given element
 * @param1 element
 * @param2 errorElement
 * */
var hideInlineError = function (element, errorElement) {
    element.parent().removeClass("has-error");
    element.removeClass("has-error");
    errorElement.removeClass("show");
    errorElement.addClass("hide");
};