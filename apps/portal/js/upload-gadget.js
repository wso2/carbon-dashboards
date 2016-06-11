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
 * Functionality of the Create Dashboard defined in create.js.
 * */
$(function () {
    var overridden = false;
    var modalInfoHbs = Handlebars.compile($('#ues-modal-info-hbs').html());

    /**
     * Show HTML modal.
     * @param {String} content      HTML content
     * @param {function} beforeShow Function to be invoked just before showing the modal
     * @return {null}
     * @private
     */
    var showHtmlModal = function (content, beforeShow) {
        var modalElement = $('#designerModal');
        modalElement.find('.modal-content').html(content);
        if (beforeShow && typeof beforeShow === 'function') {
            beforeShow();
        }
        modalElement.modal();
    };

    /**
     * Show the information message with ok button.
     * @param title {String}
     * @param message {String}
     * @return {null}
     * @private
     * */
    var showInformation = function (title, message) {
        var content = modalInfoHbs({title: title, message: message});
        showHtmlModal(content, null);
    };

    /**
     * Generate URL from the user entered title.
     * @param title
     * @return string
     * @private
     * */
    var generateUrl = function (title) {
        title = title.substring(0,100);
        return title.replace(/[^\w]/g, '-').toLowerCase();
    };

    /**
     * Update the URL in id textbox.
     * @private
     * */
    var updateUrl = function () {
        if (overridden) {
            return;
        }
        var title = $('#ues-dashboard-title').val();
        $('#ues-dashboard-id').val(generateUrl(title));
    };

    /**
     * Sanitize the given input of a user input controller.
     * @param input
     * @return string
     * @private
     * */
    var sanitizeInput = function (input) {
        return input.replace(/[^a-z0-9-\s]/gim, "");
    };

    /**
     * Sanitize the given event's key code.
     * @param event
     * @return boolean
     * @private
     * */
    var sanitizeOnKeyPress = function (element, event, regEx) {
        var code;
        if (event.keyCode) {
            code = event.keyCode;
        } else if (event.which) {
            code = event.which;
        }

        var character = String.fromCharCode(code);
        if (character.match(regEx) && code != 8 && code != 46) {
            return false;
        } else {
            return !($.trim($(element).val()) == '' && character.match(/[\s]/gim));
        }
    };

    /**
     * Show error style for given element
     * @param1 element
     * @param2 errorElement
     * @param3 message
     * @private
     * */
    var showInlineError = function (element, errorElement, message) {
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

    /**
     * Read gadget configurations from the gadget.json file.
     * @param {String} id GUID
     * @returns {*}
     * @private
     */
    var validateGadgetUpload = function() {
        var selectFileElement = $("#selected-file");
        var uploadErrorElement = $("#upload-error");
        var gadgetFile = selectFileElement[0].files[0];
        var zipFileType = "application/zip";

        var gadgetTempLocation = "/store/test.com/temp/";

        if(!gadgetFile) {
            showInlineError(selectFileElement, uploadErrorElement);
            return;
        }

        if (gadgetFile.type !== zipFileType) {
            showInlineError(selectFileElement, uploadErrorElement, "Please select a zip file");
            return;
        }

        return true;
       // if(gadgetFile.)
       /* if (!gadgetFile) {
            log.error("No gadget file uploaded.");
            return false;
        }

        var gadgetDestPath = GADGET_EXT_PATH + '/gadgets/temp/' + id + '.gadget';

        // Save the uploaded gadget file in the file system
        var gadget = new File(gadgetDestPath);
        gadget.open('w');
        gadget.write(gadgetFile.getStream());
        gadget.close();

        // Extract the gadget zip file
        var InputStreamReader = Packages.java.io.InputStreamReader;
        var BufferedReader = Packages.java.io.BufferedReader;
        var ZipFile = Packages.java.util.zip.ZipFile;
        var StringBuilder = Packages.java.lang.StringBuilder;

        var zipFilePath = getPublisherDir() + gadgetDestPath;
        var conf;

        try {
            // Extract the zip file and read the content of the gadget.json file.
            var zip = new ZipFile(zipFilePath);
            for (var e = zip.entries(); e.hasMoreElements();) {
                var entry = e.nextElement();
                if (entry.getName().toLowerCase() == "gadget.json") {
                    var inputStream = zip.getInputStream(entry);
                    var bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
                    var sb = new StringBuilder();
                    var line;
                    while ((line = bufferedReader.readLine()) != null) {
                        sb.append(line);
                    }
                    conf = sb.toString();
                    bufferedReader.close();
                    inputStream.close();
                }
            }
        } catch (e) {
            log.error('Error occurred while extracting the zip file.', e);
        }

        // Delete the uploaded gadget file
        gadget.del();
        return conf;*/
    };

    $(".gadget-upload").on('click', function () {
        if(validateGadgetUpload()) {
            $('#gadget-upload-form').submit();
        }
    });


    $('.browse').on("click", function () {
        hideInlineError($("#selected-file"),$("#upload-error"));
    });



});