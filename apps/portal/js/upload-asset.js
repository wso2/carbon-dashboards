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
 * Functionality of upload asset(gadget/layout) is defined in this file
 */

$(function () {
    /**
     * Validate whether the user hase uploaded a zip file.
     * @returns true if the asset upload validation succeeds
     * @private
     */
    var validateAssetUpload = function () {
        var selectFileElement = $("#selected-file");
        var uploadErrorElement = $("#upload-error");
        var assetFile = selectFileElement[0].files[0];
        var zipFileType = "application/zip";
        var bytesToMB = 1048576;
        var fileSizeLimit = (window.location.pathname.indexOf("gadget") > -1) ? config.assets.gadget.fileSizeLimit : config.assets.layout.fileSizeLimit;

        $('.upload-success').addClass("hide").removeClass("show");

        if (!assetFile) {
            showInlineError(selectFileElement, uploadErrorElement, i18n_data_json["select.zip.file.to.upload"]);
            return;
        } else if (assetFile.type !== zipFileType) {
            showInlineError(selectFileElement, uploadErrorElement, i18n_data_json["select.zip.file.to.upload"] + " " +
                assetFile.type + " " + i18n_data_json["file.format.is.not.supported"]);
            return;
        } else if (assetFile.size / bytesToMB > fileSizeLimit) {
            showInlineError(selectFileElement, uploadErrorElement, i18n_data_json["file.size.exceeded"]);
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
        $('.upload-success').addClass("hide").removeClass("show");
        hideInlineError($("#selected-file"), $("#upload-error"));
    });
});