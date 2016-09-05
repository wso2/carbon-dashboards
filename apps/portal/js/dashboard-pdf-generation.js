/*
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

(function () {

    var gadgetsCount;

    /**
     * register event handler to toggle the class to collapse the generate pdf panel
     */
    $("#download-pdf-panel").click(function () {
        $("#pdf-size").text(DEFAULT_SIZE);
        populatePredefinedSizesIntoUI(DEFAULT_SIZE);
        $("#pdf-size-panel").toggleClass("in");
    });

    /**
     * validate input of width and height text fields
     */
    $("#pdf-width,#pdf-height").keyup(function () {
        this.value = this.value.replace(/[^0-9\.]/g, '');
    });

    /**
     * register event handler to populate width and height into text fields in view UI
     */
    $(".dropdown li a").click(function () {
        var pdfType = $(this).html();
        $("#pdf-size").text(pdfType);
        populatePredefinedSizesIntoUI(pdfType);
    });

    /**
     * populate width and height fields in view UI using pdf type such A4,A3 and etc
     * @param pdfType
     */
    var populatePredefinedSizesIntoUI = function (pdfType) {
        switch (pdfType) {
            case A4:
                $("#pdf-width").val(A4_WIDTH);
                $("#pdf-height").val(A4_HEIGHT);
                break;
            case A3:
                $("#pdf-width").val(A3_WIDTH);
                $("#pdf-height").val(A3_HEIGHT);
                break;
            case A2:
                $("#pdf-width").val(A2_WIDTH);
                $("#pdf-height").val(A2_HEIGHT);
                break;
            case DEFAULT_SIZE:
                $("#pdf-width").val($("#gadgets-grid").width());
                $("#pdf-height").val($("#gadgets-grid").height());
                break;
        }

    };

    /**
     * register click event handler to generate and download the pdf
     */
    $("#generate-pdf").click(function (event) {
        event.preventDefault();
        gadgetsCount = 0;
        var backGroundImageURL;
        for (var i = 0; i < $("#gadgets-grid")[0].children[0].children.length; i++) {
            var gridStack = $("#gadgets-grid")[0].children[0].children[i];
            var gadgetContainer = $(".grid-stack>.grid-stack-item[data-gs-y='" + $(gridStack).attr('data-gs-y') + "']");
            var topValue = gadgetContainer.css(TOP);
            if (gadgetContainer.css(BACKGROUND_IMAGE) != NONE) {
                var imageHTML = document.createElement(IMG);
                backGroundImageURL = gadgetContainer.css(BACKGROUND_IMAGE)
                backGroundImageURL = backGroundImageURL.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
                imageHTML.src = backGroundImageURL;
                $(gadgetContainer).append(imageHTML);
            }
            gadgetContainer.css(TOP, topValue);
        }
        convertHTMLIntoImage();
    });

    /**
     * go through each gadget and convert svg elemene into image. Then convert entire iframe into image
     */
    var convertHTMLIntoImage = function () {
        if (gadgetsCount === $(".gadget-body").find(IFRAME).length) {
            downloadPDF();
            return;
        }
        var canvas = document.createElement(CANVAS);
        var imageSVG = document.createElement(IMG);
        var xmlSVG;
        var svgContent = $($(".gadget-body")[gadgetsCount]).find(IFRAME).contents().find(SVG);
        for (var y = 0; y < svgContent.length; y++) {
            var svgElement = svgContent[y];
            imageSVG = document.createElement(IMG);
            //convert SVG into a XML string
            xmlSVG = (new XMLSerializer()).serializeToString(svgElement);
            // Removing the name space as IE throws an error
            xmlSVG = xmlSVG.replace(/xmlns=\"http:\/\/www\.w3\.org\/2000\/svg\"/, '');
            //draw the SVG onto a canvas
            canvg(canvas, xmlSVG);
            imageSVG.src = canvas.toDataURL(IMAGEPNG);
            $(imageSVG).insertAfter(svgElement);
            $(svgElement).hide();
        }

        if ($($(".gadget-body")[gadgetsCount]).find(IFRAME).contents()[0]) {
            convertGadgetIntoImage($($($(".gadget-body")[gadgetsCount]).find(IFRAME).contents()[0]).get()[0].body, function () {
                $($($(".gadget-body")[gadgetsCount]).find(IFRAME)[0]).hide();
                gadgetsCount++;
                convertHTMLIntoImage();
            });
        } else if (gadgetsCount < $(".gadget-body").find(IFRAME).length) {
            gadgetsCount++;
            convertHTMLIntoImage();
        }
    };

    /**
     * convert iframe html content into image
     * @param content iframe html content
     * @param callback
     */
    var convertGadgetIntoImage = function (content, callback) {
        html2canvas(content, {
            onrendered: function (canvas) {
                var imageHTML = document.createElement(IMG);
                var divGen = document.createElement(DIV);
                imageHTML.src = canvas.toDataURL(IMAGEPNG);
                $(divGen).insertAfter($($(".gadget-body")[gadgetsCount]).find(IFRAME));
                $(imageHTML).width('100%');
                $(divGen).append(imageHTML);
                callback();
            }
        });
    };

    /**
     * restore the gridstack into original state after generating the pdf
     */
    var restoreGadgetsGrid = function () {
        for (var i = 0; i < $(".gadget-body").length; i++) {
            var length = $($(".gadget-body")[i]).find(IFRAME).contents().find(SVG).length;
            for (var y = 0; y < length; y++) {
                var svgElement = $($(".gadget-body")[i]).find(IFRAME).contents().find(SVG)[y];
                $($(".gadget-body")[i]).find(IFRAME).contents().find(IMG)[0].remove();
                $(svgElement).show();
            }
            if ($($(".gadget-body")[i]).find(IMG)[0] && $($($(".gadget-body")[i]).find(IFRAME)[0])) {
                $($(".gadget-body")[i]).find(IMG)[0].remove();
                $($($(".gadget-body")[i]).find(IFRAME)[0]).show();
            }
        }
    };

    /**
     * restore banner after generating pdf
     */
    var restoreBanner = function () {
        for (var i = 0; i < $("#gadgets-grid")[0].children[0].children.length; i++) {
            var gridStack = $("#gadgets-grid")[0].children[0].children[i];
            var gadgetContainer = $(".grid-stack>.grid-stack-item[data-gs-y='" + $(gridStack).attr('data-gs-y') + "']");
            var topValue = gadgetContainer.css(TOP);
            if (gadgetContainer.css(BACKGROUND_IMAGE) != NONE) {
                gadgetContainer.find(IMG).remove();
            }
        }
    };

    /**
     * download the pdf into disk
     */
    var downloadPDF = function () {
        var height = getPDFHeight();
        var width = getPDFWidth();
        var fontSize = height * .0075;
        $('div.body-wrapper > div.nano > div.nano-content').animate({SCROLL_TOP: 0}, SCROLL_FAST, function () {
            html2canvas($("#gadgets-grid"), {
                onrendered: function (canvas) {
                    restoreGadgetsGrid();
                    restoreBanner();
                    var doc = new jsPDF({
                        orientation: PORTRAIT,
                        unit: PIXELS,
                        format: [width, (height * 1.1).toString()]
                    });
                    doc.setFontSize(fontSize);
                    doc.text(width * .01, 0, DASHBOARD_TITLE + ues.global.dashboard.title + CURRENT_PAGE + ues.global.page + CURRENT_VIEW + ues.global.dbType + NEW_LINE);
                    doc.addImage(canvas.toDataURL(IMAGEPNG), 'PNG', 0, (height * 1.1 - height * .03), width, height);
                    doc.setFontType(PDF_WATERMARK_ITALIC);
                    doc.setFontSize(fontSize / 2);
                    doc.text(50, height * 1.1 - height * .025, PDF_WATERMARK_PART_1 + ues.global.dashboard.title + PDF_WATERMARK_PART_2 + new Date().toUTCString() + PDF_WATERMARK_PART_3);
                    doc.save(DASHBOARD_PDF_NAME + ues.global.dashboard.id + PDF_EXTENSION);
                    $("#download-pdf-panel").attr(VAL, SUCCESS);
                }, height: $(".page-content").height(), allowTaint: true, useCORS: true
            });
        });
    };

    /**
     * get the user defined height for pdf generation
     * @returns {height}
     */
    var getPDFHeight = function () {
        var height = $("#pdf-height").val();
        if (!height) {
            height = DEFAULT_PDF_HEIGHT;
        }
        return height;
    };

    /**
     * get the user defined height for pdf generation
     * @returns {height}
     */
    var getPDFWidth = function () {
        var width = $("#pdf-width").val();
        if (!width) {
            width = DEFAULT_PDF_WIDTH;
        }
        return width;
    };
}());