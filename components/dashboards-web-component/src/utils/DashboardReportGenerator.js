/*
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import jspdf from 'jspdf';
import autoTable from 'jspdf-autotable'; // jspdf plugin to get table data
import DateFormat from 'dateformat';
import html2canvas from 'html2canvas';
import { pdfConfig } from './JspdfConf.js';
import DashboardAPI from './apis/DashboardAPI';

/**
 * App context sans starting forward slash.
 */
const appContext = window.contextPath.substr(1);

export default class DashboardReportGenerator {
    /**
     * Generates the report for widget
     * @param {object} element element to be considered
     * @param {string} widgetName name of the widget
     * @param {boolean} includeTime add the report generation time
     * @param {boolean} includeRecords add the number of records
     * @param {string} themeName name of the current theme
     */
    static generateWidgetPdf(element, widgetName, includeTime, includeRecords, themeName) {
        // Gets the document title from HTML and adds that in the center of the front page
        const dashboardName = (document.getElementsByTagName('h1')[0].innerText) + ' : ';

        if (DashboardReportGenerator.containsTable(element)) {
            DashboardReportGenerator.createTablePdf(element, widgetName, includeTime, includeRecords,
                dashboardName, themeName);
        } else {
            html2canvas(element).then((canvas) => {
                DashboardReportGenerator.createWidgetPdf(widgetName, includeTime, canvas, dashboardName);
            }).catch((e) => {
                console.log(e);
            });
        }
    }

    /**
     * Create the report for the table data
     * @private
     * @param element jspdf objectexportWidget
     * @param widgetName name of the widget
     * @param includeTime add the report generation time
     * @param includeRecords add the number of records in the table
     * @param dashboardName name of the dashboard
     * @param themeName name of the current theme
     */
    static createTablePdf(element, widgetName, includeTime, includeRecords, dashboardName, themeName) {
        const pdf = new jspdf('p', 'pt');

        DashboardReportGenerator.addTitle(pdf, includeTime, includeRecords, dashboardName, widgetName);
        const tableData = DashboardReportGenerator.getTableData(pdf, element, themeName);
        DashboardReportGenerator.addSubTitle(pdf, includeTime, includeRecords, tableData.rowData.length);
        DashboardReportGenerator.addTable(pdf, tableData, widgetName);
    }

    /**
     * Add the table into the report
     * @private
     * @param {object} pdf jspdf object
     * @param {list} tableData table data from the table element
     * @param {string} widgetName name of the widget
     */
    static addTable(pdf, tableData, widgetName) {
        const totalPagesExp = '{total_pages_count_string}';

        const pageContent = function (data) {
            DashboardReportGenerator.addPdfConfigs(pdf, null, widgetName, 'table', 'portrait', false);

            // Page numbers
            let pageNumber = 'Page ' + data.pageCount;
            // Total page number plugin only available in jspdf v1.0+
            if (typeof pdf.putTotalPages === 'function') {
                pageNumber = pageNumber + ' of ' + totalPagesExp;
            }
            pdf.setFontSize(10);
            const pageHeight = pdf.internal.pageSize.getHeight();
            pdf.text(pageNumber, data.settings.margin.left, pageHeight - 10);
        };

        const tableStyles = pdfConfig.pdfTableStyles;
        tableStyles.addPageContent = pageContent;
        tableStyles.margin = { top: 50, bottom: 50 };

        pdf.autoTable(tableData.columnData, tableData.rowData, tableStyles);

        if (typeof pdf.putTotalPages === 'function') {
            pdf.putTotalPages(totalPagesExp);
        }
    }

    /**
     * Get the data from the table component
     * @private
     * @param pdf jspdf object
     * @param element element which included the table data
     * @param themeName current theme
     * @returns {{columnData: Array, rowData: Array}} returns column and row data
     */
    static getTableData(pdf, element, themeName) {
        const colData = DashboardReportGenerator.getColumnData(element);
        const rowData = DashboardReportGenerator.getRowData(element, colData.length, themeName);
        return { columnData: colData, rowData };
    }

    /**
     * Get the row data from a given element
     * @private
     * @param {object} element element to be considered
     * @param {int} columnCount the number of columns
     * @param {string} themeName current theme
     * @returns {Array} returns row data
     */
    static getRowData(element, columnCount, themeName) {
        let rowDivs;
        if (themeName === 'dark') {
            rowDivs = element.getElementsByClassName('cell-data');
        } else {
            rowDivs = element.getElementsByTagName('span');
        }

        const rowNum = rowDivs.length / columnCount;
        const rowData = [];

        for (let i = 0; i < rowNum; i++) {
            const row = [];
            for (let j = 0; j < columnCount; j++) {
                row.push(rowDivs[(columnCount * i) + j].innerText);
            }
            rowData.push(row);
        }

        return rowData;
    }

    /**
     * Get the column data of a given element
     * @private
     * @param {object} element the element to be considered
     * @returns {Array} returns the column elements of the given element
     */
    static getColumnData(element) {
        const colDivs = element.getElementsByClassName('rt-resizable-header-content');
        const colData = [];
        const colNum = colDivs.length;

        for (let i = 0; i < colNum; i++) {
            colData.push(colDivs[i].innerHTML);
        }
        return colData;
    }

    /**
     * Check whether a table is included in the element
     * @private
     * @param {object} element the element to be checked
     * @returns {boolean} returns true if there is a table compoenet in the given element
     */
    static containsTable(element) {
        return element.innerHTML.search('rt-table') > -1;
    }

    /**
     * Create the pdf for widget
     * @private
     * @param {object} widgetName name of the widget
     * @param {boolean} includeTime add the report generation time in the report
     * @param {object} canvas canvas object containing the snapshot
     * @param {string} dashboardName name of the dashboard
     */
    static createWidgetPdf(widgetName, includeTime, canvas, dashboardName) {
        const pdf = new jspdf('l', 'pt', 'a4');
        DashboardReportGenerator.addTitle(pdf, includeTime, false, dashboardName, widgetName);
        DashboardReportGenerator.addSubTitle(pdf, includeTime, false, 0);
        DashboardReportGenerator.addPdfConfigs(pdf, canvas, widgetName, 'widget', 'landscape', false);
    }

    /**
     * Add title to the report
     * @private
     * @param {object} pdf jspdf object
     * @param {boolean} includeTime add the report generation time
     * @param {boolean} includeRecords add the number of records
     * @param {string} dashboardName name of the dashboard
     * @param {string} widgetName name of the widget
     */
    static addTitle(pdf, includeTime, includeRecords, dashboardName, widgetName) {
        // Apply bold and normal styles separately for the widget name and dashboard name as to be appeared as title.
        pdf.setFontType('bold');
        pdf.setFontSize(18);
        const centerPosition = DashboardReportGenerator.getCenterCoordinate(pdf, dashboardName + widgetName);

        pdf.text(centerPosition, pdfConfig.title.coordinates.y - 50, dashboardName);
        const padding = Array(...Array(dashboardName.length + 1)).map(() => {
            return ' ';
        });
        pdf.setFontType('normal');

        const finalTitle = padding.join(' ') + widgetName;
        pdf.text(centerPosition, pdfConfig.title.coordinates.y - 50, finalTitle);
    }

    /**
     * Calculates the center x coordinate
     * @private
     * @param {object} pdf jspdf object
     * @param {string} text text to be centered
     * @returns {number} returns the x coordinate to center the text
     */
    static getCenterCoordinate(pdf, text) {
        const fontSize = pdf.internal.getFontSize();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const txtWidth = pdf.getStringUnitWidth(text) * fontSize / pdf.internal.scaleFactor;
        return (pageWidth - txtWidth) / 2;
    }

    /**
     * Add subtitle containing report generation time and record count
     * @private
     * @param {object} pdf jspdf object
     * @param {boolean} includeTime add the report generation time
     * @param {boolean} includeRecords add number of records to the report
     * @param {int} recordCount number of records in the report (only for table)
     */
    static addSubTitle(pdf, includeTime, includeRecords, recordCount) {
        let pdfInfo = '';

        if (includeTime) {
            pdfInfo = 'Generated on : ' + DateFormat(new Date(), 'dd/mm/yyyy, h:MM TT');
        }

        if (includeRecords) {
            if (pdfInfo !== '') {
                pdfInfo += '\n';
            }
            pdfInfo += 'No of records : ' + recordCount;
        }

        pdf.setFontType('bold');
        pdf.setFontSize(12);
        pdf.text(pdfInfo, pdfConfig.text.coordinates.x, pdfConfig.text.coordinates.y - 30);
        pdf.setFontType('normal');
    }

    /**
     * Add pdf configurations loaded from deployment.yaml file
     * @param {object }pdf jspdf object
     * @param {object} canvas canvas containing the snapshot image
     * @param {string} widgetName name of the component to be in the report
     * @param {string} type name of the dashboard component
     * @param {string} orientation report orientation
     * @param {list} dashboardPages list of the pages to be added in the report
     */
    static addPdfConfigs(pdf, canvas, widgetName, type, orientation, dashboardPages) {
        // separate methods for widget type , dashboard etc.

        const path = `/${appContext}/public/app/images/`;
        const reportName = widgetName + '.pdf';

        DashboardAPI.getDashboardReportPdfConfigs().then((res) => {
            if (res.data !== '') {
                if (res.data.header) {
                    DashboardReportGenerator.convertImageToBase64(path + res.data.header, (headerImgData) => {
                        // to handle the header and footer adding and widget image addition in separate promises
                        DashboardReportGenerator.addPdfConfigImage(pdf, headerImgData, 'header', orientation);

                        if (res.data.footer) {
                            DashboardReportGenerator.convertImageToBase64(path + res.data.footer, (footerImgData) => {
                                DashboardReportGenerator.addPdfConfigImage(pdf, footerImgData, 'footer', orientation);
                                DashboardReportGenerator.addPdfContent(pdf, type, canvas, dashboardPages, footerImgData,
                                    'footer', orientation, reportName);
                            });
                        }
                        DashboardReportGenerator.addPdfContent(pdf, type, canvas, dashboardPages, headerImgData,
                            'header', orientation, reportName);
                    });
                }

                if (res.data.footer) {
                    DashboardReportGenerator.convertImageToBase64(path + res.data.footer, (footerImgData) => {
                        DashboardReportGenerator.addPdfConfigImage(pdf, footerImgData, 'footer', 'portrait');
                        DashboardReportGenerator.addPdfContent(pdf, type, canvas, dashboardPages, footerImgData,
                            'footer', orientation, reportName);
                    });
                }
            }
        }).catch((e) => {
            console.log(e);
        });
    }

    /**
     * Add pdf configuration image to the report
     * @private
     * @param {object} pdf jspdf object
     * @param {string} imgData encoded image data
     * @param {string} property configuration type (header,footer)
     * @param {string} orientation orientation of the report page
     */
    static addPdfConfigImage(pdf, imgData, property, orientation) {
        let xCoordinate;
        let yCoordinate;
        let imageWidth;
        let imageHeight;
        if (orientation === 'landscape') {
            if (property === 'header') {
                xCoordinate = pdfConfig.stampImageLandscape.coordinates.x;
                yCoordinate = pdfConfig.stampImageLandscape.coordinates.y;
                imageWidth = pdfConfig.stampImageLandscape.size.x;
                imageHeight = pdfConfig.stampImageLandscape.size.y;
            } else if (property === 'footer') {
                xCoordinate = pdf.internal.pageSize.getWidth() - pdfConfig.pdfFooter.margin.x;
                yCoordinate = pdf.internal.pageSize.getHeight() - pdfConfig.pdfFooter.margin.y;
                imageWidth = pdfConfig.stampImageLandscape.size.x;
                imageHeight = pdfConfig.stampImageLandscape.size.y;
            }
        } else if (orientation === 'portrait') {
            if (property === 'header') {
                xCoordinate = pdfConfig.stampImageDashboard.coordinates.x;
                yCoordinate = pdfConfig.stampImageDashboard.coordinates.y;
                imageWidth = pdfConfig.stampImageDashboard.size.x;
                imageHeight = pdfConfig.stampImageDashboard.size.y;
            } else if (property === 'footer') {
                xCoordinate = pdfConfig.pdfFooterPortrait.coordinates.x;
                yCoordinate = pdfConfig.pdfFooterPortrait.coordinates.y;
                imageWidth = pdfConfig.stampImage.size.x;
                imageHeight = pdfConfig.stampImage.size.y;
            }
        }

        pdf.addImage(imgData, 'PNG', xCoordinate, yCoordinate, imageWidth, imageHeight);
    }

    /**
     * Add the widget snapshot to the report
     * @param {object} pdf jspdf object
     * @param {object} canvas canvas containing the snapshot
     */

    static addWidgetImage(pdf, canvas) {
        const resizeDimensions = DashboardReportGenerator.getImageResizeDimensions(canvas, pdf);
        if (!(canvas instanceof HTMLCanvasElement)) {
            canvas = canvas.imageData;
        }
        const xPosition = (pdf.internal.pageSize.getWidth() - resizeDimensions.width) / 2;
        let yPosition = (pdf.internal.pageSize.getHeight() - resizeDimensions.height - 70) / 2;
        if (yPosition < 70) {
            yPosition += 70;
        }
        pdf.addImage(canvas, 'PNG', xPosition, yPosition, resizeDimensions.width, resizeDimensions.height);
    }

    /**
     * Resize an image
     * @private
     * @param {object} canvas canvas containing the image to be resized
     * @param {object} pdf jspdf object
     * @returns {{width: *, height: *}}
     */

    static getImageResizeDimensions(canvas, pdf) {
        let printHeight = canvas.height;
        let printWidth = canvas.width;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const k = Math.max(printWidth / pageWidth, printHeight / pageHeight);

        while ((pageWidth < printWidth) || ((pageHeight - 70) < printHeight)) {
            if (k < 1) {
                printHeight *= k;
                printWidth *= k;
            } else {
                printHeight /= k;
                printWidth /= k;
            }
        }
        return { width: printWidth, height: printHeight };
    }

    /**
     * Convert the given image url to base64 encoded image data
     * @private
     * @param {string}path url of the image to be converted
     * @param {function}callback callback functions when the image is loaded
     */
    static convertImageToBase64(path, callback) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        let imgStr;

        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            // png : to avoid black background for rounded images
            imgStr = canvas.toDataURL('image/png');
            callback(imgStr);
        };
        img.src = path;
    }

    /**
     * Generate pdf report containing dashboard pages
     * @param {string} paperSize paperSize page size of the report
     * @param {map} dashboardPages dashboardPages list of pages
     * @param {boolean} includeTime includeTime add the report generation time of the report
     * @param {string} title dashboardName dashboard name to be printed in the report
     */
    static generateDashboardPdf(paperSize, dashboardPages, includeTime, title) {
        DashboardReportGenerator.createDashboardPdf(paperSize, dashboardPages, includeTime, title);
    }

    /**
     * Generate dashboard report
     * @private
     * @param {string} paperSize page size of the report
     * @param {map} dashboardPages list of pages
     * @param {boolean} includeTime add the report generation time of the report
     * @param {string} dashboardName dashboard name to be printed in the report
     */
    static createDashboardPdf(paperSize, dashboardPages, includeTime, dashboardName) {
        const pdf = new jspdf('l', 'pt', paperSize);
        DashboardReportGenerator.addDashboardImages(pdf, dashboardPages, includeTime, dashboardName);
    }

    /**
     * Add dashboard report dashboard snapshots
     * @private
     * @param {string} pdf jspdf object
     * @param {map} dashboardPages list of pages
     * @param {boolean} includeTime add report generation time in the report
     * @param {string} dashboardName dashboard name to be printed in the report
     */
    static addDashboardImages(pdf, dashboardPages, includeTime, dashboardName) {
        dashboardPages.map((dashboardPage, ind) => {
            const rawImageData = localStorage.getItem(dashboardPage);
            const image = JSON.parse(rawImageData);

            DashboardReportGenerator.addTitle(pdf, includeTime, false, dashboardName + ' : ', dashboardPage);
            DashboardReportGenerator.addSubTitle(pdf, includeTime, false, 0);
            DashboardReportGenerator.addWidgetImage(pdf, image);
            DashboardReportGenerator.addPageNumber(pdf, dashboardPage, dashboardPages, ind);

            if (ind < dashboardPages.length - 1) {
                pdf.addPage();
            }
        });

        DashboardReportGenerator.addPdfConfigs(pdf, null, dashboardName, 'dashboard', 'landscape', dashboardPages);
    }

    /**
     * Add the page number
     * @private
     * @param {object} pdf jspdf object
     * @param {object} page page to add the number
     * @param {map} dashboardPages list of pages
     * @param {int} index index of the page the number should be added
     */
    static addPageNumber(pdf, page, dashboardPages, pageIndex) {
        const pageNo = 'Page ' + (pageIndex + 1) + ' of ' + dashboardPages.length;
        pdf.setFontSize(10);
        const pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
        pdf.text(pageNo, 10, pageHeight - 10);
    }

    /**
     * Add pdf configurations for a list of pages
     * @private
     * @param {object} pdf jspdf object
     * @param {map} dashboardPages list of pages, the configurations to be added
     * @param {string} headerImgData configuration encoded image data
     * @param {string} property type of the configuration to be added (header, footer)
     * @param {string} orientation orientation of the page
     */
    static addPageConfigsToAll(pdf, dashboardPages, headerImgData, property, orientation) {
        for (let i = 0; i < dashboardPages.length; i++) {
            pdf.setPage(i);
            DashboardReportGenerator.addPdfConfigImage(pdf, headerImgData, property, orientation);
        }
    }

    /**
     * Add pdf content specific to the report type (Dashboard, Widget, Table).
     * @private
     * @param {object} pdf jspdf object
     * @param {string} type report type (dashboard, widget or table)
     * @param {object} canvas canvas object
     * @param {map} dashboardPages list of pages to be added
     * @param {string} imgData pdf configuration image data
     * @param {string} property configuration property
     * @param {string} orientation orientation of the report
     * @param {string} reportName name of the report
     */
    static addPdfContent(pdf, type, canvas, dashboardPages, imgData, property, orientation, reportName) {
        if (type === 'widget') {
            DashboardReportGenerator.addWidgetImage(pdf, canvas);
            pdf.save(reportName);
        } else if (type === 'table') {
            pdf.save(reportName);
        } else if (type === 'dashboard') {
            DashboardReportGenerator.addPageConfigsToAll(pdf, dashboardPages, imgData, property, orientation);
            pdf.save(reportName);
        }
    }
}

