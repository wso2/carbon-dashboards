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
/**
 * Functionality of the Create Dashboard defined in create.js.
 * */
$(function () {
    /**
     * Read gadget configurations from the gadget.json file.
     * @param {String} id GUID
     * @returns {*}
     * @private
     */
    var validateGadgetUpload = function() {
        var selectFileElement = $("#selected-file");
        var uploadErrorElement = $("#upload-error");
        var layoutUploadFile = selectFileElement[0].files[0];
        var zipFileType = "application/zip";

        if(! layoutUploadFile) {
            showInlineError(selectFileElement, uploadErrorElement, "Please selet a zip file to upload");
            return;
        }

        if ( layoutUploadFile.type !== zipFileType) {
            showInlineError(selectFileElement, uploadErrorElement, "Please select a zip file to upload. " +  layoutUploadFile.type +" format is not supported");
            return;
            
        }

        return true;
    };

    $(".layout-upload").on('click', function () {
        if(validateGadgetUpload()) {
            $('#layout-upload-form').submit();
        }
    });


    $('.browse').on("click", function () {
        hideInlineError($("#selected-file"),$("#upload-error"));
    });
});

/**
 * Show error style for given element
 * @param1 element
 * @param2 errorElement
 * @param3 message
 * @private
 * */
var showInlineError = function (element, errorElement, message) {
    $('.upload-success').removeClass("show");
    $('.upload-success').addClass("hide");
    element.val('');
    element.parent().addClass("has-error");
    element.addClass("has-error");
    errorElement.removeClass("hide");

    if(message)
        errorElement.html(message);
    errorElement.addClass("show");
};

/**
 * Hide error style for given element
 * @param1 element
 * @param2 errorElement
 * @private
 * */
var hideInlineError = function (element, errorElement) {
    element.parent().removeClass("has-error");
    element.removeClass("has-error");
    errorElement.removeClass("show");
    errorElement.addClass("hide");
};
