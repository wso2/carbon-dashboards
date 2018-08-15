/*
 *  Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */

import React, { Component } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import _ from 'lodash';

import { Divider, Drawer, IconButton, List, ListItem, makeSelectable, Subheader, Toggle, Checkbox, CardText, CardHeader,
         CardActions ,RaisedButton, SelectField, MenuItem, Card, FlatButton, Dialog, CircularProgress } from 'material-ui';
import { MuiThemeProvider } from 'material-ui/styles';
import { ActionHome, NavigationMenu, ImagePictureAsPdf } from 'material-ui/svg-icons';

import DeleteIcon from 'material-ui/svg-icons/action/delete';

import DashboardAPI from '../utils/apis/DashboardAPI';
import Error403 from '../error-pages/Error403';
import Error404 from '../error-pages/Error404';
import Error500 from '../error-pages/Error500';
import PageLoadingIndicator from '../common/PageLoadingIndicator';
import { HttpStatus } from '../utils/Constants';
import DashboardRenderer from './components/DashboardRenderer';
import Header from '../common/Header';
import UserMenu from '../common/UserMenu';
import PortalButton from '../common/PortalButton';
import { darkTheme, lightTheme } from '../utils/Theme';
import '../utils/GoldenLayoutOverrides.css';

import jspdf from 'jspdf';
import html2cavas from 'html2canvas';
import axios from 'axios';
import { pdfConfig } from './components/JspdfConf.js';

const SelectableList = makeSelectable(List);

class DashboardViewPage extends Component {

    constructor(props) {
        super(props);
        let isDarkTheme = window.localStorage.getItem('isDarkTheme');
        this.dashboard = null;
        this.isInitilialLoading = true;
        this.state = {
            dashboardFetchStatus: HttpStatus.UNKNOWN,
            isSidePaneOpen: true,
            isCurrentThemeDark: isDarkTheme ? isDarkTheme === 'true' : true,
            printEnabledList: [],
            pageList: [],
            isPrintChecked: false,
            pageSize: "A4",
            resizeRatio: 1,
            canvasWidth: 0,
            canvasHeight: 0,
            expanded: false,
            reportStatusOpen: false,
            completed: 0,
            dialogOpen: false,
        };

        this.fetchDashboard = this.fetchDashboard.bind(this);
        this.handleSidePaneToggle = this.handleSidePaneToggle.bind(this);
        this.handleThemeToggle = this.handleThemeToggle.bind(this);
        this.getNavigationToPage = this.getNavigationToPage.bind(this);
        this.renderHeader = this.renderHeader.bind(this);
        this.renderSidePane = this.renderSidePane.bind(this);
        this.renderPagesList = this.renderPagesList.bind(this);
        this.renderDashboard = this.renderDashboard.bind(this);

        this.handleChange = this.handleChange.bind(this);
        this.capturePage = this.capturePage.bind(this);
        this.generatePdf = this.generatePdf.bind(this);
        this.handleCardClick = this.handleCardClick.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleOpen = this.handleOpen.bind(this);
        this.handleincludeGenerateTime = this.handleincludeGenerateTime.bind(this);
        this.removePage = this.removePage.bind(this);
    }

    componentDidMount() {
        if (!this.dashboard) {
            this.fetchDashboard();
        }
    }

    fetchDashboard() {
        new DashboardAPI().getDashboardByID(this.props.match.params.dashboardId)
            .then((response) => {
                this.dashboard = response.data;
                if (_.isString(this.dashboard.pages)) {
                    this.dashboard.pages = JSON.parse(this.dashboard.pages);
                }
                this.setState({ dashboardFetchStatus: HttpStatus.OK });
            })
            .catch((error) => {
                this.dashboard = null;
                this.setState({ dashboardFetchStatus: error.response.status });
            });
    }

    handleSidePaneToggle() {
        this.setState({
            isSidePaneOpen: !this.state.isSidePaneOpen,
        });
    }

    handleThemeToggle() {
        window.localStorage.setItem('isDarkTheme', !this.state.isCurrentThemeDark);
        this.setState({
            isCurrentThemeDark: !this.state.isCurrentThemeDark,
        });
    }

    getNavigationToPage(pageId) {
        return {
            pathname: `/dashboards/${this.dashboard.url}/${pageId}`,
        };
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
        const currentTheme = this.state.isCurrentThemeDark ? darkTheme : lightTheme;

        switch (this.state.dashboardFetchStatus) {
            case HttpStatus.NOTFOUND:
                return <Error404 />;
            case HttpStatus.FORBIDDEN:
                return <Error403 />;
            case HttpStatus.SERVE_ERROR:
                return <Error500 />;
            case HttpStatus.UNKNOWN:
                // Still fetching the dashboard.
                return (
                    <MuiThemeProvider theme={currentTheme}>
                        {this.renderHeader(currentTheme)}
                        <PageLoadingIndicator />
                    </MuiThemeProvider>
                );
            default:
            // Fetched the dashboard successfully.
        }
        // No page is mentioned in the URl. Let's redirect to the landing page so that we have a page to render.
        if (!this.props.match.params.pageId) {
            return <Redirect to={this.getNavigationToPage(this.dashboard.landingPage)} />;
        }
        // If this is the very first display of this page, then show the side pane briefly and close it.
        if (this.isInitilialLoading) {
            this.isInitilialLoading = false;
            setTimeout(() => this.handleSidePaneToggle(), 1000);
        }

        const dialogActions = [
            <FlatButton
                label="Cancel"
                primary={true}
                onClick={this.handleClose}
            />,
            <FlatButton
                label="Export"
                primary={true}
                onClick={this.generatePdf}
            />,
        ];

        const customStatusDailogStyle = {
            width: 400,
            maxWidth: 'none',
            position: 'relative'
        };

        return (
            <MuiThemeProvider muiTheme={currentTheme}>
                {this.renderHeader(currentTheme)}
                {this.renderSidePane(currentTheme)}
                {this.renderDashboard(currentTheme)}

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
            </MuiThemeProvider>
        );
    }


    renderHeader(theme) {
        const logo = (
            <IconButton style={{ margin: 0, padding: 0, width: 'initial', height: theme.appBar.height }}>
                <NavigationMenu />
            </IconButton>
        );
        return (
            <div data-html2canvas-ignore={true}>
                <Header
                    title={this.dashboard ? this.dashboard.name : this.props.match.params.dashboardId}
                    logo={logo}
                    onLogoClick={this.handleSidePaneToggle}
                    rightElement={<span><PortalButton /><UserMenu /></span>}
                    theme={theme}
                />
            </div>
        );
    }

    handleCardClick(expand) {
        this.setState({ expanded: expand });

    }

    renderSidePane(theme) {
        const pageId = this.props.match.params.pageId,
            subPageId = this.props.match.params.subPageId;

        const pageSizes = ["A4", "Letter", "Government-Letter"];

        return (
            <div data-html2canvas-ignore={true}>
                <Drawer
                    docked={false}
                    open={this.state.isSidePaneOpen}
                    onRequestChange={isOpen => this.setState({ isSidePaneOpen: isOpen })}
                    containerStyle={{ top: theme.appBar.height }}
                    overlayStyle={{ opacity: 0 }}

                    id="hideFromPDF"
                >
                    <Subheader>
                        <FormattedMessage id='side-pane.pages' defaultMessage='Pages' />
                    </Subheader>
                    <SelectableList value={subPageId ? `${pageId}/${subPageId}` : pageId}>
                        {this.renderPagesList()}
                    </SelectableList>
                    <Divider />
                    <Subheader>
                        <FormattedMessage id='theme.change-theme' defaultMessage='Theme' />
                    </Subheader>
                    <div style={{ display: 'flex', marginLeft: 72 }}>
                        <span style={{ marginTop: 2, marginRight: 10 }}>
                            <FormattedMessage id='theme.name.light' defaultMessage='Light' />
                        </span>
                        <Toggle
                            toggled={this.state.isCurrentThemeDark}
                            label={<FormattedMessage id='theme.name.dark' defaultMessage='Dark' />}
                            labelPosition='right'
                            onToggle={this.handleThemeToggle}
                        />

                    </div>
                    <br />
                    <Divider />
                    <span>
                        <Card
                            style={{ margin: 10 }}
                            expanded={this.state.expanded}
                            onExpandChange={this.handleCardClick}
                        >
                            <CardHeader title='Export dashboard' actAsExpander style={{ paddingRight: '0px' }} />
                            <CardActions expandable style={{ display: 'flex', paddingRight: '0px' }}>
                                <div style={{ marginRight: 0 }}>


                                    <RaisedButton label='Capture current page'
                                        onClick={this.capturePage}
                                        primary />

                                    <List>
                                        {this.state.pageList.map(field =>
                                            <ListItem primaryText={
                                                            this.dashboard.pages.find(page => page.id === field).name}
                                            rightIcon={<DeleteIcon />}
                                                      onClick={() => this.removePage(field)} />
                                        )}
                                    </List>

                                    <SelectField
                                        style={{ width: 200 }}
                                        floatingLabelText='Page Size'
                                        value={this.state.pageSize}
                                        onChange={(event, index, value) => { this.setState({ pageSize: value }) }}

                                    >
                                        {pageSizes.map(field =>
                                            (
                                                <MenuItem
                                                    key={field}
                                                    value={field}
                                                    primaryText={field}
                                                />
                                            ))}
                                    </SelectField>

                                    <RaisedButton label='Export'
                                        onClick={this.handleOpen}
                                        disabled={!(this.state.pageList.length > 0)}
                                        primary />
                                </div>
                            </CardActions>
                        </Card>
                    </span>
                </Drawer>
            </div>
        );
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

    async generatePdf() {

        //Starts showing report generation progress
        this.handleClose();
        this.handleReportStatusOpen();
        this.timer = setInterval(this.progress, 195);

        let pdf = new jspdf("l", "px", this.state.pageSize.toLowerCase());

        const title = document.getElementsByTagName("h1")[0].innerText;

        // Get header : a cutomized header defined by the user or else the default stream processor header
        await this.addPdfImage("/portal/apis/dashboards/pdfHeader", function (res) {
            if (res != 'none') {
                localStorage.setItem("dashboardHeader", res);
            }
        });

        // Get footer : a cutomized footer defined by the user or else the no footer by default
        await this.addPdfImage("/portal/apis/dashboards/pdfFooter", function (res) {
            if (res != 'none') {
                localStorage.setItem("dashboardFooter", res);
            }
        });

        // To handle the async calls (wait until the image data is stored in localStorage)
        await this.sleep(2000);

        const img = localStorage.getItem("dashboardHeader");
        pdf.addImage(img, "JPEG", pdfConfig.stampImageDashboard.coordinates.x,
                     pdfConfig.stampImageDashboard.coordinates.y, pdfConfig.stampImageDashboard.size.x,
                     pdfConfig.stampImageDashboard.size.y);

        this.state.pageList.map((item, ind) => {
            const it = localStorage.getItem(item);
            const image = JSON.parse(it);
            const imgData = image.imageData;

            const imgWidth = image.width;
            const imgHeight = image.height;

            const page = this.dashboard.pages.find(page => {
                return page.id == item;
            })

            //Add title
            pdf.setFontSize(15);
            pdf.setFontType('bold');
            const padding = Array.apply(null, Array(title.length + 4)).map(function () { return "  " })
            pdf.text((pdf.internal.pageSize.getHeight() / 2 + 30), 18, title + " : ");

            const ntext = padding.join("") + page.name;
            pdf.setFontType('normal');
            pdf.text((pdf.internal.pageSize.getHeight() / 2 + 30), 18, ntext);

            let pdfInfo = "";

            if (this.state.includeTime) {
                pdfInfo = "Generated on : " + this.formatDate(new Date());
            }

            pdf.setFontType('bold');
            pdf.setFontSize(12);
            pdf.text(pdfInfo, pdfConfig.stampImageDashboard.coordinates.x, 35);
            pdf.setFontType('normal');

            if (imgWidth > imgHeight) {
                const val = (pdf.internal.pageSize.getWidth()) / imgWidth;

                if (imgHeight * val < (pdf.internal.pageSize.getHeight())) {
                    pdf.addImage(imgData, 'JPEG', 0, 55, imgWidth * val, imgHeight * val, "dashboard" + ind, "FAST");
                } else {
                    const valH = (pdf.internal.pageSize.getHeight()) / imgHeight;
                    pdf.addImage(imgData, 'JPEG', 0, 55, imgWidth * valH, imgHeight * valH, "dashboard" + ind, "FAST");
                }

            } else {
                const val = (pdf.internal.pageSize.getHeight()) / imgHeight;
                pdf = new jspdf("p", "px", "a4");
                pdf.addImage(imgData, 'JPEG', 0, 35, imgWidth * val, imgHeight * val, "dashboard" + ind, "FAST");
            }

            // FOOTER : a customized footer defined by the user in the deployment.yaml file or else no footer by default
            const str = "Page " + (ind + 1) + " of " + this.state.pageList.length;
            pdf.setFontSize(10);
            const pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
            pdf.text(str, 10, pageHeight - 10);

            const footerImg = localStorage.getItem('dashboardFooter');
            if (footerImg != null) {
                pdf.addImage(footerImg, "JPEG", 380, 780, pdfConfig.stampImage.size.x, pdfConfig.stampImage.size.y);
            }

            if (ind < this.state.pageList.length - 1) {
                pdf.addPage();

                // HEADER : a cutomized header defined by the user or else the default stream processor header
                const headerImg = localStorage.getItem('dashboardHeader');
                if (headerImg != null) {
                    pdf.addImage(headerImg, "JPEG", pdfConfig.stampImageDashboard.coordinates.x,
                                 pdfConfig.stampImageDashboard.coordinates.y, pdfConfig.stampImageDashboard.size.x,
                                 pdfConfig.stampImageDashboard.size.y);
                }
            }
        });

        clearInterval(this.timer);
        this.handleReportStatusClose();
        this.state.completed = 0;
        this.state.includeTime = false;

        const docName = title + ".pdf";
        pdf.save(docName);

    }

    // Get the image from deployment.yaml file through the server
    async addPdfImage(url, callback) {
        let path = "/portal/public/app/images/"

        await axios.get(url, { auth: { username: "admin", password: "admin" } })
            .then(function (res) {
                if (res.data === '') {
                    callback('none');
                } else {
                    path += res.data;

                    //Convert image to bdase64 encoded image (data_url)
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

    async removePage(index) {

        const newAr = this.state.pageList.slice();
        const ind = newAr.indexOf(index);
        newAr.splice(ind, 1);
        this.setState({ pageList: newAr });

        if (newAr.indexOf(index) == -1) {
            localStorage.removeItem(index);
        }

    }

    async capturePage(index) {

        const url = window.location.href;
        const parts = url.split('/');
        const currentPage = parts[parts.length - 1] === "" ? parts[parts.length - 2] : parts[parts.length - 1];

        await html2cavas(document.getElementById("content")).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const w = canvas.width;
            const h = canvas.height;
            localStorage.setItem(currentPage, JSON.stringify({ imageData: imgData, width: w, height: h }));

            const newAr = this.state.pageList.slice();
            newAr.push(currentPage);
            this.setState({ pageList: newAr });

            const val = 620 / canvas.width;
            this.state.resizeRatio = val;
            this.state.canvasWidth = canvas.width;
            this.state.canvasHeight = canvas.height;
        });
    }

    renderPagesList() {
        const landingPage = this.dashboard.landingPage;
        const history = this.props.history;
        return this.dashboard.pages.map((page) => {
            const isLandingPage = (page.id === landingPage);
            let nestedItems = [];
            if (page.pages) {
                nestedItems = page.pages.map((subPage) => {
                    const subPageId = `${page.id}/${subPage.id}`;
                    return (
                        <ListItem
                            key={subPageId}
                            value={subPageId}
                            primaryText={subPage.name}
                            insetChildren
                            onClick={() => history.push(this.getNavigationToPage(subPageId))}
                        />
                    );
                });
            }
            return (
                <ListItem
                    key={page.id}
                    value={page.id}
                    primaryText={page.name}
                    leftIcon={isLandingPage ? <ActionHome /> : null}
                    insetChildren={!isLandingPage}
                    nestedItems={nestedItems}
                    open={!!nestedItems}
                    onClick={() => history.push(this.getNavigationToPage(page.id))}
                />
            );
        });
    }

    handleChange(index) {
        let newArray = this.state.printEnabledList.slice();

        if (typeof newArray[index] != 'undefined') {
            newArray[index].value = !newArray[index].value;
            this.setState({ printEnabledList: newArray }, () => this.capturePage(index));
        } else {
            newArray[index] = { value: true };
            this.setState({ printEnabledList: newArray }, () => this.capturePage(index));
        }

    }

    renderPagesChecklist() {
        const landingPage = this.dashboard.landingPage;

        return this.dashboard.pages.map((page, index) => {
            const isLandingPage = (page.id === landingPage);
            let nestedItems = [];
            if (page.pages) {
                nestedItems = page.pages.map((subPage) => {
                    const subPageId = `${page.id}/${subPage.id}`;
                    return (
                        <Checkbox
                            key={subPageId}
                            label={subPage.name}
                            disabled={!(currentPage === page.id)}
                            onClick={this.handleChange}
                            checked={false}
                        />
                    );
                });
            }

            //Gets the current page id from the URL
            const url = window.location.href;
            const parts = url.split('/');
            const currentPage = parts[parts.length - 1] === "" ? parts[parts.length - 2] : parts[parts.length - 1];

            return (
                <Checkbox
                    key={page.id}
                    value={page.id}
                    label={page.name}
                    id={index}
                    disabled={!((currentPage === page.id) || this.state.printEnabledList[index])}
                    onClick={() => this.handleChange(index)}
                />
            );
        });
    }

    renderDashboard(theme) {
        const pageId = this.props.match.params.pageId,
            subPageId = this.props.match.params.subPageId;
        let page = this.dashboard.pages.find(page => (page.id === pageId));

        if (page) {
            if (page.pages && subPageId) {
                page = page.pages.find(page => (page.id === subPageId));
            }
            return (
                <DashboardRenderer
                    dashboardId={this.dashboard.url}
                    goldenLayoutContents={page.content}
                    theme={theme}
                />
            );
        } else {
            // Non-existing page ID found in the URL. Redirect to the landing page so that we have a page to render.
            return <Redirect to={this.getNavigationToPage(this.dashboard.landingPage)} />;
        }
    }
}

export default withRouter(DashboardViewPage);
