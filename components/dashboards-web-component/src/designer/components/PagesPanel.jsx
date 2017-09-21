import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import AddCircleOutlineIcon from 'material-ui/svg-icons/content/add-circle-outline';
import TextField from 'material-ui/TextField';
import PageEntry from './PageEntry';
import DashboardsAPIs from '../../utils/dashboard-apis';

var pages = [];

const styles = {
    open: {
    },
    close: {
        display: 'none'
    }
};

export default class PagesPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pages: pages
        };
        this.searchPages = this.searchPages.bind(this);
        this.addPage = this.addPage.bind(this);
        this.savePage = this.savePage.bind(this);
        this.deletePage  = this.deletePage.bind(this);
        this.buildPages = this.buildPages.bind(this);
    }

    componentWillReceiveProps(props) {
        let pagesObj = JSON.parse(props.dashboard.pages);
        pages = this.buildPages(pagesObj);
        console.log(props.dashboard);
        this.setState({
            pages: pages
        });
    }

    buildPages(p, a, baseUrl) {
        a = a || [];
        baseUrl = baseUrl || '';
        for(var i = 0; i < p.length; i++) {
            let pageUrl = baseUrl + p[i].id;
            a.push({
                id: p[i].id,
                title: p[i].name,
                url: pageUrl
            });
            if (p[i].pages && p[i].pages.length > 0) {
                this.buildPages(p[i].pages, a, pageUrl + '/');
            }
        }
        return a;
    }

    render () {
        return (
            <div style={this.props.show ? styles.open : styles.close}>
                <div style={{'text-align': 'center'}}>
                    <RaisedButton label="Create Page" primary={true} icon={<AddCircleOutlineIcon />} style={{margin: 12}} onClick={this.addPage} />
                    <TextField hintText="Search..." onChange={this.searchPages} />
                </div>
                {
                    this.state.pages.map(p => {
                        return (
                            <PageEntry page={p} dashboardUrl={this.props.dashboard.url} pageUrl={p.url} onPageChanged={this.savePage} onPageDeleted={this.deletePage} />
                        );
                    })
                }
            </div>
        );
    }

    searchPages(e) {
        let filteredPages = pages.filter(function(p) {
            return p.title.toLowerCase().includes(e.target.value.toLowerCase());
        });
        this.setState({
            pages: filteredPages
        });
    }

    addPage() {
        let id = this.generatePageId(pages.length);
        pages.push({
            id: id,
            title: 'New Page'
        });
        this.setState({
            pages: pages
        }); 

        let pagesObj = JSON.parse(this.props.dashboard.pages);
        pagesObj.push({
            id: id,
            name: 'New Page',
            content: [],
            pages: []
        });

        alert(JSON.stringify(pagesObj));

        this.props.dashboard.pages = JSON.stringify(pagesObj);
        // this.props.dashboard.pages = pagesObj;
        // todo: call api
        let dashboardsAPIs = new DashboardsAPIs();
        dashboardsAPIs.updateDashboardByID(this.props.dashboard.id, this.props.dashboard);

        window.global.notify('Page added succcessfully!');
    }

    deletePage(id) {
        if (!confirm('Are you sure you want to delete the page')) {
            return;
        }
        // todo delete page
        let index = -1;
        for(let i = 0; i < pages.length; i++) {
            if (pages[i].id === id) {
                index = i;
            }
        }
        if (index > -1) {
            pages.splice(index, 1);
        }
        this.setState({
            pages: pages
        });
        window.global.notify('Page deleted successfully!');
    }

    generatePageId(id) {
        let candidateId = 'page' + id;
        let hasPage = false;
        for (let i = 0; i < pages.length; i++) {
            if (pages[i].id.toLowerCase() === candidateId) {
                hasPage = true;
                break;
            }
        }
        if (!hasPage) {
            return candidateId;
        }
        return generatePageId(id);
    }

    savePage(id, page) {
        for(let i = 0; i < pages.length; i++) {
            if (pages[i].id === id) {
                pages[i] = page;
                this.setState({
                    pages: pages
                });
                // TODO: Save this
                break;
            }
        }
        window.global.notify('Dashboard saved successfully!');
        console.log(pages);
    }
}