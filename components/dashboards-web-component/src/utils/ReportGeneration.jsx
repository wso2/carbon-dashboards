import jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { pdfConfig } from './JspdfConf.js';
import axios from 'axios';
import AuthManager from '../auth/utils/AuthManager';

/**
 * App context sans starting forward slash.
 */
const appContext = window.contextPath.substr(1);

export default class ReportGeneration{
    constructor() {
        this.exportWidget = this.exportWidget.bind(this);
        this.generatePdf=this.generatePdf.bind(this);
    }

    static formatDate(date) {
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
        return day + '/' + month + '/' + date.getFullYear() + '  ' + timeStr;
    }

    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static async exportWidget(element,docTitle,includeTime,includeRecords,themeName) {
        //Initialize pdf object with margin parameters
        const pdf = new jspdf('l', 'mm', 'a4');
        const lMargin = 15;
        const rMargin = 15;
        const pdfInMM = 400;
        const heightINMM = 600;
        const pageCenter = pdfInMM / 2;

        //Gets the document title from HTML and adds that in the center of the front page
        //document and adds a border
        const title = document.getElementsByTagName('h1')[0].innerText;
        const mainTitle = title + ' : ';

        const lines = pdf.splitTextToSize(mainTitle, (pdfInMM - lMargin - rMargin));

        if (element.innerHTML.search('rt-table') > -1) {
            const colDivs = element.getElementsByClassName('rt-resizable-header-content');
            const colData = [];
            const colNum = colDivs.length;

            for (let i = 0; i < colNum; i++) {
                colData.push(colDivs[i].innerHTML);
            }

            let rowDivs;
            if (themeName == 'dark') {
                rowDivs = element.getElementsByClassName('cell-data');
            } else {
                rowDivs = element.getElementsByTagName('span');
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
            const totalPagesExp = '{total_pages_count_string}';

            await this.addPdfImage(`/${appContext}/apis/dashboards/pdfHeader`, function (res) {
                localStorage.setItem('dashboardHeader', res);
            });

            await this.addPdfImage(`/${appContext}/apis/dashboards/pdfFooter`, function (res) {
                if (res != 'none') {
                    localStorage.setItem('dashboardFooter', res);
                }
            });

            doc.setFontType('bold');
            doc.text((pdf.internal.pageSize.getHeight() / 2 + 50), pdfConfig.title.coordinates.y - 30, mainTitle);
            const offset = doc.getStringUnitWidth(mainTitle);
            const padding = Array.apply(null, Array(mainTitle.length + 1)).map(function () { return ' ' })
            doc.setFontType('normal');

            const finalTitle = padding.join(' ') + docTitle;
            doc.text((pdf.internal.pageSize.getHeight() / 2 + 50), pdfConfig.title.coordinates.y - 30, finalTitle);

            let pdfInfo = '';

            if (includeTime) {
                pdfInfo += 'Generated on : ' + this.formatDate(new Date());
            }

            if (includeRecords) {
                if (pdfInfo != '') {
                    pdfInfo += '\n';
                }
                pdfInfo += 'No of records : ' + rowData.length;
            }

            doc.setFontType('bold');
            doc.setFontSize(pdfConfig.text.size);
            doc.text(pdfInfo, pdfConfig.text.coordinates.x, pdfConfig.text.coordinates.y - 20);
            doc.setFontType('normal');

            const pageContent = function (data) {
                // HEADER
                const headerImg = localStorage.getItem('dashboardHeader');
                if (headerImg != null) {
                    doc.addImage(headerImg, 'JPEG', data.settings.margin.left,
                        pdfConfig.stampImageDashboard.coordinates.y, pdfConfig.stampImageDashboard.size.x,
                        pdfConfig.stampImageDashboard.size.y);
                }

                // FOOTER
                let pageNumber = 'Page ' + data.pageCount;
                // Total page number plugin only available in jspdf v1.0+
                if (typeof doc.putTotalPages === 'function') {
                    pageNumber = pageNumber + ' of ' + totalPagesExp;
                }
                doc.setFontSize(10);
                const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
                doc.text(pageNumber, data.settings.margin.left, pageHeight - 10);
                const footerImg = localStorage.getItem('dashboardFooter');
                if (footerImg != null) {
                    doc.addImage(footerImg, 'JPEG', 380, 780, pdfConfig.stampImage.size.x, pdfConfig.stampImage.size.y);
                }

            };

            let tstyles = pdfConfig.pdfTableStyles;
            tstyles.addPageContent = pageContent;
            tstyles.margin = { top: 50, bottom: 50 };

            doc.autoTable(colData, rowData, tstyles);

            if (typeof doc.putTotalPages === 'function') {
                doc.putTotalPages(totalPagesExp);
            }

            const tableDocumentName = docTitle + '.pdf';
            const rst=doc.save(tableDocumentName);
            return rst;

        } else {
            //Add the element's snapshot into the page
            await this.addPdfImage(`/${appContext}/apis/dashboards/pdfHeader`, function (res) {
                pdf.addImage(res, 'JPEG', pdfConfig.stampImageLandscape.coordinates.x,
                    pdfConfig.stampImageLandscape.coordinates.y, pdfConfig.stampImageLandscape.size.x,
                    pdfConfig.stampImageLandscape.size.y);
            });

            pdf.setFontType('bold');
            pdf.text((pdf.internal.pageSize.getHeight() / 2 + 30), 12, mainTitle, null, null, 'center');
            const offset = pdf.getStringUnitWidth(mainTitle) * 2.5;
            const padding = Array.apply(null, Array(mainTitle.length + 1)).map(function () { return ' ' })
            pdf.setFontType('normal');

            const finalTitle = padding.join(' ') + docTitle;
            pdf.text((pdf.internal.pageSize.getHeight() / 2 + 30) + offset, 12, finalTitle, null, null, 'center');

            let pdfInfo = '';

            if (includeTime) {
                pdfInfo = 'Generated on : ' + this.formatDate(new Date());
            }

            pdf.setFontType('bold');
            pdf.setFontSize(12);
            pdf.text(pdfInfo, pdfConfig.stampImageLandscape.coordinates.x, 18);
            pdf.setFontType('normal');

            await this.addPdfImage(`/${appContext}/apis/dashboards/pdfFooter`, function (res) {
                if (res != 'none') {
                    pdf.addImage(res, 'JPEG', (pdf.internal.pageSize.getWidth() - 40),
                        (pdf.internal.pageSize.getHeight() - 8), pdfConfig.stampImageLandscape.size.x,
                        pdfConfig.stampImageLandscape.size.y);
                }
            });

            await html2canvas(element).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                if (canvas.width > canvas.height - 28) {
                    const val = (pdf.internal.pageSize.getWidth()) / canvas.width;
                    const xposition = (pdf.internal.pageSize.getWidth() - canvas.width * val) / 2;

                    if (canvas.height * val < 210) {
                        if (canvas.height * val < 180) {
                            pdf.addImage(imgData, 'JPEG', xposition, 45, canvas.width * val, canvas.height * val,
                                'widget', 'FAST');
                        } else {
                            pdf.addImage(imgData, 'JPEG', xposition, 25, canvas.width * val, canvas.height * val,
                                'widget', 'FAST');
                        }
                    } else {
                        const valH = (pdf.internal.pageSize.getHeight() - 28) / canvas.height;
                        const xposition = (pdf.internal.pageSize.getWidth() - canvas.width * valH) / 2;
                        pdf.addImage(imgData, 'JPEG', xposition, 25, canvas.width * valH, canvas.height * valH,
                            'widget', 'FAST');
                    }
                } else {
                    const val = (pdf.internal.pageSize.getHeight() - 28) / canvas.height;
                    const xposition = (pdf.internal.pageSize.getWidth() - canvas.width * val) / 2;
                    pdf == new jspdf('p', 'mm', 'a4');
                    pdf.addImage(imgData, 'JPEG', xposition, 25, canvas.width * val, canvas.height * val,
                        'widget', 'FAST');
                }
            });

            const documentName = docTitle + '.pdf';
            const rst=pdf.save(documentName);

            return rst;
        }
        return ;
    }

    static async addPdfImage(url, callback) {
        let path = `/${appContext}/public/app/images/`;
        const httpClient = axios.create({
            baseURL: url,
            timeout: 2000,
            headers: { Authorization: 'Bearer ' + AuthManager.getUser().SDID },
        });

        await httpClient.get()
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
                        imgStr = canvas.toDataURL('image/png');
                        callback(imgStr);
                    }

                    img.src = path;
                }
            });
    }

    static async generatePdf(pageSize,pageList,includeTime,title,pages) {

        const pdf = new jspdf('l', 'px', pageSize);

        // Get header : a cutomized header defined by the user or else the default stream processor header
        await this.addPdfImage(`/${appContext}/apis/dashboards/pdfHeader`, function (res) {
            if (res != 'none') {
                localStorage.setItem('dashboardHeader', res);
            }
        });

        // Get footer : a cutomized footer defined by the user or else the no footer by default
        await this.addPdfImage(`/${appContext}/apis/dashboards/pdfFooter`, function (res) {
            if (res != 'none') {
                localStorage.setItem('dashboardFooter', res);
            }
        });

        // To handle the async calls (wait until the image data is stored in localStorage)
        await this.sleep(100);

        const img = localStorage.getItem('dashboardHeader');
        pdf.addImage(img, 'JPEG', pdfConfig.stampImageDashboard.coordinates.x,
                     pdfConfig.stampImageDashboard.coordinates.y, pdfConfig.stampImageDashboard.size.x,
                     pdfConfig.stampImageDashboard.size.y);

        pageList.map((item, ind) => {
            const it = localStorage.getItem(item);
            const image = JSON.parse(it);
            const imgData = image.imageData;

            const imgWidth = image.width;
            const imgHeight = image.height;

            const page = pages.find(page => {
                return page.id == item;
            })

            //Add title
            pdf.setFontSize(15);
            pdf.setFontType('bold');
            const padding = Array.apply(null, Array(title.length + 4)).map(function () { return '  ' })
            pdf.text((pdf.internal.pageSize.getHeight() / 2 + 30), 18, title + ' : ');

            const ntext = padding.join('') + page.name;
            pdf.setFontType('normal');
            pdf.text((pdf.internal.pageSize.getHeight() / 2 + 30), 18, ntext);

            let pdfInfo = '';

            if (includeTime) {
                pdfInfo = 'Generated on : ' + this.formatDate(new Date());
            }

            pdf.setFontType('bold');
            pdf.setFontSize(12);
            pdf.text(pdfInfo, pdfConfig.stampImageDashboard.coordinates.x, 35);
            pdf.setFontType('normal');

            if (imgWidth > imgHeight) {
                const val = (pdf.internal.pageSize.getWidth()) / imgWidth;
                if (imgHeight * val < (pdf.internal.pageSize.getHeight()-60)) {
                    pdf.addImage(imgData, 'JPEG', 0, 55, imgWidth * val, imgHeight * val, 'dashboard' + ind, 'FAST');
                } else {
                    const valH = (pdf.internal.pageSize.getHeight()-60) / imgHeight;
                    const xposition = (pdf.internal.pageSize.getWidth() - imgWidth * valH) / 2;
                    pdf.addImage(imgData, 'JPEG', xposition, 45, imgWidth * valH, imgHeight * valH, 'dashboard' + ind,
                    'FAST');
                }
            } else {
                const val = (pdf.internal.pageSize.getHeight()) / imgHeight;
                pdf.addImage(imgData, 'JPEG', 0, 35, imgWidth * val, imgHeight * val, 'dashboard' + ind, 'FAST');
            }

            // FOOTER : a customized footer defined by the user in the deployment.yaml file or else no footer by default
            const pageNo = 'Page ' + (ind + 1) + ' of ' + pageList.length;
            pdf.setFontSize(10);
            const pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
            pdf.text(pageNo, 10, pageHeight - 10);

            const footerImg = localStorage.getItem('dashboardFooter');
            if (footerImg != null) {
                pdf.addImage(footerImg, 'JPEG', 380, 780, pdfConfig.stampImage.size.x, pdfConfig.stampImage.size.y);
            }

            if (ind < pageList.length - 1) {
                pdf.addPage();

                // HEADER : a cutomized header defined by the user or else the default stream processor header
                const headerImg = localStorage.getItem('dashboardHeader');
                if (headerImg != null) {
                    pdf.addImage(headerImg, 'JPEG', pdfConfig.stampImageDashboard.coordinates.x,
                                 pdfConfig.stampImageDashboard.coordinates.y, pdfConfig.stampImageDashboard.size.x,
                                 pdfConfig.stampImageDashboard.size.y);
                }
            }
        });

        const docName = title + '.pdf';
        const rst=pdf.save(docName);

        return rst;

    }

}