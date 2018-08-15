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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import GoldenLayout from 'golden-layout';
import 'golden-layout/src/css/goldenlayout-base.css';

import GoldenLayoutContentUtils from '../../utils/GoldenLayoutContentUtils';
import WidgetRenderer from '../../common/WidgetRenderer';
import DashboardThumbnail from '../../utils/DashboardThumbnail';
import { Event } from '../../utils/Constants';

import '../../common/styles/custom-goldenlayout-dark-theme.css';
import glDarkTheme from '!!css-loader!../../common/styles/custom-goldenlayout-dark-theme.css';
import '../../common/styles/custom-goldenlayout-light-theme.css';
import glLightTheme from '!!css-loader!../../common/styles/custom-goldenlayout-light-theme.css';
import './dashboard-container-styles.css';

import jspdf from 'jspdf';
import html2cavas from 'html2canvas';
import { pdfConfig } from './JspdfConf.js';
import axios from 'axios';

import { Dialog, FlatButton, Checkbox, CircularProgress } from 'material-ui';

import autoTable from 'jspdf-autotable';  //Need to work with report generation for tables (jspdf extension)

const glDarkThemeCss = glDarkTheme.toString();
const glLightThemeCss = glLightTheme.toString();
const dashboardContainerId = 'dashboard-container';


export default class DashboardRenderer extends Component {

    constructor(props) {
        super(props);
        this.goldenLayout = null;
        this.loadedWidgetsCount = 0;

        this.handleWindowResize = this.handleWindowResize.bind(this);
        this.renderGoldenLayout = this.renderGoldenLayout.bind(this);
        this.destroyGoldenLayout = this.destroyGoldenLayout.bind(this);
        this.triggerThemeChangeEvent = this.triggerThemeChangeEvent.bind(this);
        this.onWidgetLoadedEvent = this.onWidgetLoadedEvent.bind(this);
        this.onGoldenLayoutComponentAddEvent = this.onGoldenLayoutComponentAddEvent.bind(this);
        this.unmounted = false;

        this.exportWidget = this.exportWidget.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleOpen = this.handleOpen.bind(this);
        this.handleincludeGenerateTime = this.handleincludeGenerateTime.bind(this);
        this.handleincludeNoOfRecords = this.handleincludeNoOfRecords.bind(this);

        this.state = {
            dialogOpen: false,
            widget: null,
            title: '',
            includeTime: false,
            includeRecords: false,
            completed: 0,
            reportStatusOpen: false,
            recordCountEnabled: false,

        };
    }

    handleWindowResize() {
        if (this.goldenLayout) {
            this.goldenLayout.updateSize();
        }
    }

    componentDidMount() {
        this.setState({ height: window.innerHeight });
        window.addEventListener('resize', this.handleWindowResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowResize);
        this.unmounted = true;
        this.destroyGoldenLayout();
    }

    shouldComponentUpdate(nextProps, nextState) {

        if (this.props.goldenLayoutContents !== nextProps.goldenLayoutContents) {
            // Receiving a new dashboard to render.
            this.destroyGoldenLayout();
            return true;
        } else if (this.props.theme !== nextProps.theme) {
            // Receiving a new theme.
            this.triggerThemeChangeEvent(nextProps.theme);
            return true;
        }

        if (this.props.theme.name == 'light') {
            this.triggerThemeChangeEvent(nextProps.theme);
        }

        if (this.state.dialogOpen != nextState.dialogOpen) {
            return true;
        }
        if (this.state.reportStatusOpen != nextState.reportStatusOpen) {
            return true;
        }
        if (this.state.completed < nextState.completed & nextState.completed <= 100) {
            return true;
        }
        if (this.state.recordCountEnabled != nextState.recordCountEnabled) {
            return true;
        }

        return false;
    }

    formatDate(date) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        let day = date.getDate();
        let month = date.getMonth() + 1;
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        day = day < 10 ? '0' + day : day;
        month = month < 10 ? '0' + month : month;
        const timeStr = hours + ':' + minutes + ' ' + ampm;
        return day + "/" + month + "/" + date.getFullYear() + "  " + timeStr;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async exportWidget() {
        this.handleClose();
        this.handleReportStatusOpen();
        this.timer = setInterval(this.progress, 200);

        const element = this.state.widget;
        const docTitle = this.state.title;

        //Initialize pdf object with margin parameters
        const pdf = new jspdf("l", "mm", "a4");
        const lMargin = 15;
        const rMargin = 15;
        const pdfInMM = 400;
        const heightINMM = 600;
        const pageCenter = pdfInMM / 2;

        //Gets the document title from HTML and adds that in the center of the front page
        //document and adds a border
        const title = document.getElementsByTagName("h1")[0].innerText;
        const mainTitle = title + " : ";

        const lines = pdf.splitTextToSize(mainTitle, (pdfInMM - lMargin - rMargin));

        if (element.innerHTML.search("rt-table") > -1) {
            const colDivs = element.getElementsByClassName("rt-resizable-header-content");
            const colData = [];
            const colNum = colDivs.length;

            for (let i = 0; i < colNum; i++) {
                colData.push(colDivs[i].innerHTML);
            }

            let rowDivs;
            if (this.props.theme.name == 'dark') {
                rowDivs = element.getElementsByClassName("cell-data");
            } else {
                rowDivs = element.getElementsByTagName("span");
            }

            const rowNum = rowDivs.length / colDivs.length;
            const rowData = [];

            for (let i = 0; i < rowNum; i++) {
                const row = [];
                for (let j = 0; j < colNum; j++) {
                    row.push(rowDivs[colNum * i + j].innerText)
                }
                rowData.push(row);
            }

            const doc = new jspdf('p', 'pt');
            const totalPagesExp = "{total_pages_count_string}";

            await this.addPdfImage("/portal/apis/dashboards/pdfHeader", function (res) {

                localStorage.setItem("dashboardHeader", res);
            });

            await this.addPdfImage("/portal/apis/dashboards/pdfFooter", function (res) {
                if (res != 'none') {

                    localStorage.setItem("dashboardFooter", res);
                }
            });

            await this.sleep(2000);

            doc.setFontType('bold');
            doc.text((pdf.internal.pageSize.getHeight() / 2 + 50), pdfConfig.title.coordinates.y - 30, mainTitle);
            const offset = doc.getStringUnitWidth(mainTitle);
            const padding = Array.apply(null, Array(mainTitle.length + 1)).map(function () { return " " })
            doc.setFontType('normal');

            const ntext = padding.join(" ") + docTitle;
            doc.text((pdf.internal.pageSize.getHeight() / 2 + 50), pdfConfig.title.coordinates.y - 30, ntext);

            let pdfInfo = "";

            if (this.state.includeTime) {
                pdfInfo += "Generated on : " + this.formatDate(new Date());
            }

            if (this.state.includeRecords) {
                if (pdfInfo != '') {
                    pdfInfo += "\n";
                }
                pdfInfo += "No of records : " + rowData.length;
            }

            doc.setFontType('bold');
            doc.setFontSize(pdfConfig.text.size);
            doc.text(pdfInfo, pdfConfig.text.coordinates.x, pdfConfig.text.coordinates.y - 20);
            doc.setFontType('normal');

            const pageContent = function (data) {
                // HEADER
                const headerImg = localStorage.getItem('dashboardHeader');
                if (headerImg != null) {
                    doc.addImage(headerImg, "JPEG", data.settings.margin.left,
                                 pdfConfig.stampImageDashboard.coordinates.y, pdfConfig.stampImageDashboard.size.x,
                                 pdfConfig.stampImageDashboard.size.y);
                }

                // FOOTER
                let str = "Page " + data.pageCount;
                // Total page number plugin only available in jspdf v1.0+
                if (typeof doc.putTotalPages === 'function') {
                    str = str + " of " + totalPagesExp;
                }
                doc.setFontSize(10);
                const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
                doc.text(str, data.settings.margin.left, pageHeight - 10);
                const footerImg = localStorage.getItem('dashboardFooter');
                if (footerImg != null) {
                    doc.addImage(footerImg, "JPEG", 380, 780, pdfConfig.stampImage.size.x, pdfConfig.stampImage.size.y);
                }

            };

            let tstyles = pdfConfig.pdfTableStyles;
            tstyles.addPageContent = pageContent;
            tstyles.margin = { top: 50, bottom: 50 };

            doc.autoTable(colData, rowData, tstyles);

            if (typeof doc.putTotalPages === 'function') {
                doc.putTotalPages(totalPagesExp);
            }

            clearInterval(this.timer);
            this.handleReportStatusClose();
            this.state.completed = 0;
            this.state.includeRecords = false;
            this.state.includeTime = false;

            const tableDocumentName = docTitle + ".pdf";
            doc.save(tableDocumentName);


        } else {
            //Add the element's snapshot into the page
            await this.addPdfImage("/portal/apis/dashboards/pdfHeader", function (res) {
                pdf.addImage(res, "JPEG", pdfConfig.stampImageLandscape.coordinates.x,
                             pdfConfig.stampImageLandscape.coordinates.y, pdfConfig.stampImageLandscape.size.x,
                             pdfConfig.stampImageLandscape.size.y);
            });

            pdf.setFontType('bold');
            pdf.text((pdf.internal.pageSize.getHeight() / 2 + 30), 12, mainTitle, null, null, 'center');
            const offset = pdf.getStringUnitWidth(mainTitle) * 2.5;
            const padding = Array.apply(null, Array(mainTitle.length + 1)).map(function () { return " " })
            pdf.setFontType('normal');

            const ntext = padding.join(" ") + docTitle;
            pdf.text((pdf.internal.pageSize.getHeight() / 2 + 30) + offset, 12, ntext, null, null, 'center');

            let pdfInfo = "";

            if (this.state.includeTime) {
                pdfInfo = "Generated on : " + this.formatDate(new Date());
            }

            pdf.setFontType('bold');
            pdf.setFontSize(12);
            pdf.text(pdfInfo, pdfConfig.stampImageLandscape.coordinates.x, 18);
            pdf.setFontType('normal');

            await this.addPdfImage("/portal/apis/dashboards/pdfFooter", function (res) {
                if (res != 'none') {
                    pdf.addImage(res, "JPEG", (pdf.internal.pageSize.getWidth() - 45),
                                 (pdf.internal.pageSize.getHeight() - 8), pdfConfig.stampImageLandscape.size.x,
                                 pdfConfig.stampImageLandscape.size.y);
                }
            });

            await this.sleep(2000);

            await html2cavas(element).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                if (canvas.width > canvas.height - 28) {
                    const val = (pdf.internal.pageSize.getWidth()) / canvas.width;
                    const xposition = (pdf.internal.pageSize.getWidth() - canvas.width * val) / 2;

                    if (canvas.height * val < 210) {
                        if (canvas.height * val < 180) {
                            pdf.addImage(imgData, 'JPEG', xposition, 45, canvas.width * val, canvas.height * val,
                                                                                                "widget", "FAST");
                        } else {
                            pdf.addImage(imgData, 'JPEG', xposition, 25, canvas.width * val, canvas.height * val,
                                                                                                "widget", "FAST");
                        }
                    } else {
                        const valH = (pdf.internal.pageSize.getHeight() - 28) / canvas.height;
                        const xposition = (pdf.internal.pageSize.getWidth() - canvas.width * valH) / 2;
                        pdf.addImage(imgData, 'JPEG', xposition, 25, canvas.width * valH, canvas.height * valH,
                                                                                                "widget", "FAST");
                    }
                } else {
                    const val = (pdf.internal.pageSize.getHeight() - 28) / canvas.height;
                    const xposition = (pdf.internal.pageSize.getWidth() - canvas.width * val) / 2;
                    pdf == new jspdf("p", "mm", "a4");
                    pdf.addImage(imgData, 'JPEG', xposition, 25, canvas.width * val, canvas.height * val,
                                                                                                 "widget", "FAST");
                }
            });

            clearInterval(this.timer);
            this.handleReportStatusClose();
            this.state.completed = 0;
            this.state.includeRecords = false;
            this.state.includeTime = false;

            const documentName = docTitle + ".pdf";
            pdf.save(documentName);
        }
    }

    async addPdfImage(url, callback) {
        let path = "/portal/public/app/images/"

        await axios.get(url, { auth: { username: "admin", password: "admin" } })
            .then(function (res) {
                if (res.data === '') {
                    callback('none');
                } else {
                    path += res.data;
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const img = new Image();
                    let imgStr;

                    img.onload = function () {
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);
                        imgStr = canvas.toDataURL("image/png");
                        callback(imgStr);
                    }

                    img.src = path;
                }

            });
    }

    onGoldenLayoutComponentAddEvent(component) {
        if (!component.parent || !component.parent.header) {
            return; // Added component is not a widget.
        }

        this.goldenLayout._dragSources.forEach((dragSource) => {
            if (dragSource._itemConfig.props.id === component.config.props.id) {
                dragSource._itemConfig.props.id = DashboardUtils.generateUuid();
            }
        });

        const settingsButton = document.createElement('i');
        settingsButton.title = 'settings';
        settingsButton.className = 'fw fw-export widget-export-button';
        settingsButton.addEventListener('click', () => {
            const selectedElement = component.element[0];
            if (selectedElement.innerHTML.search("rt-table") > -1) {
                this.setState({ recordCountEnabled: true });
            }else{
                this.setState({ recordCountEnabled: false });
            }
            this.handleOpen();
            this.state.widget = component.element[0];
            this.state.title = component.config.title;
        });

        component.parent.header.controlsContainer.prepend(settingsButton);
    }

    handleClose() {
        this.setState({ dialogOpen: false });
    }

    handleOpen() {
        this.setState({ dialogOpen: true });
    }

    handleincludeGenerateTime() {
        this.setState({ includeTime: !this.state.includeTime });
    }

    handleincludeNoOfRecords() {
        this.setState({ includeRecords: !this.state.includeRecords });
    }

    handleReportStatusClose() {
        this.setState({ reportStatusOpen: false });
    }

    handleReportStatusOpen() {
        this.setState({ reportStatusOpen: true });
    }

    progress = () => {
        const { completed } = this.state;
        this.setState({ completed: completed >= 100 ? 0 : completed + 10 });
    };


    render() {
        const dialogActions = [
            <FlatButton
                label="Cancel"
                primary={true}
                onClick={this.handleClose}
            />,
            <FlatButton
                label="Export"
                primary={true}
                onClick={this.exportWidget}
            />,
        ];

        const customStatusDailogStyle = {
            width: 400,
            maxWidth: 'none',
            position: 'relative'
        };

        return (
            <span>
                <style>{this.props.theme.name === 'dark' ? glDarkThemeCss : glLightThemeCss}</style>
                <div
                    id={dashboardContainerId}
                    className='dashboard-view-container'
                    style={{
                        color: this.props.theme.palette.textColor,
                        backgroundColor: this.props.theme.palette.canvasColor,
                        fontFamily: this.props.theme.fontFamily,
                    }}
                    ref={() => {
                        if (!this.unmounted) {
                            this.renderGoldenLayout();
                        }
                    }}
                />

                <Dialog
                    title="Select PDF options"
                    actions={dialogActions}
                    modal={true}
                    open={this.state.dialogOpen}
                >
                    <Checkbox
                        label='Include report genetation time'
                        onClick={this.handleincludeGenerateTime}
                    />

                    {(this.state.recordCountEnabled) && (
                        <Checkbox
                            label='Include number of records'
                            onClick={this.handleincludeNoOfRecords}
                        />
                    )}
                </Dialog>

                <Dialog
                    title="Report is generating"
                    contentStyle={customStatusDailogStyle}
                    modal={true}
                    open={this.state.reportStatusOpen}
                >
                    <CircularProgress
                        mode="determinate"
                        value={this.state.completed}
                        size={80}
                        thickness={5}
                        style={{ marginLeft: '25%' }}
                    />
                </Dialog>

            </span>

        );
    }

    renderGoldenLayout() {
        if (this.goldenLayout) {
            return;
        }

        const goldenLayoutContents = this.props.goldenLayoutContents || [];
        const config = {
            settings: {
                constrainDragToContainer: false,
                reorderEnabled: false,
                selectionEnabled: false,
                popoutWholeStack: false,
                blockedPopoutsThrowError: true,
                closePopoutsOnUnload: true,
                responsiveMode: 'always',
                hasHeaders: true,
                showPopoutIcon: false,
                showMaximiseIcon: true,
                showCloseIcon: false,
            },
            dimensions: {
                headerHeight: 25,
            },
            content: goldenLayoutContents,
        };

        const dashboardContainer = document.getElementById(dashboardContainerId);
        const goldenLayout = new GoldenLayout(config, dashboardContainer);
        const renderingWidgetClassNames = GoldenLayoutContentUtils.getReferredWidgetClassNames(goldenLayoutContents);
        renderingWidgetClassNames.forEach(widgetName => goldenLayout.registerComponent(widgetName, WidgetRenderer));

        goldenLayout.on('itemDropped', this.onGoldenLayoutComponentAddEvent);
        goldenLayout.on('componentCreated', this.onGoldenLayoutComponentAddEvent);

        goldenLayout.eventHub.on(Event.DASHBOARD_VIEW_WIDGET_LOADED,
            () => this.onWidgetLoadedEvent(renderingWidgetClassNames.length, this.props.dashboardId));

        // Workaround suggested in https://github.com/golden-layout/golden-layout/pull/348#issuecomment-350839014
        setTimeout(() => goldenLayout.init(), 0);
        this.goldenLayout = goldenLayout;
    }

    destroyGoldenLayout() {
        if (this.goldenLayout) {
            this.goldenLayout.destroy();
            delete this.goldenLayout;
        }
        this.goldenLayout = null;
        this.loadedWidgetsCount = 0;
    }

    triggerThemeChangeEvent(newTheme) {
        if (this.goldenLayout) {
            this.goldenLayout.eventHub.trigger(Event.DASHBOARD_VIEW_THEME_CHANGE, newTheme);
        }
    }

    onWidgetLoadedEvent(totalNumberOfWidgets, dashboardName) {
        this.loadedWidgetsCount++;
        if (this.loadedWidgetsCount === totalNumberOfWidgets) {
            DashboardThumbnail.saveDashboardThumbnail(dashboardName, dashboardContainerId);
        }
    }
}

DashboardRenderer.propTypes = {
    dashboardId: PropTypes.string.isRequired,
    goldenLayoutContents: PropTypes.array.isRequired,
    theme: PropTypes.shape({}).isRequired,
};
