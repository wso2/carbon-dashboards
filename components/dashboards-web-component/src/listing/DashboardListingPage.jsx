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

import React from 'react';
import {withRouter} from 'react-router-dom';
import ContentAdd from 'material-ui/svg-icons/content/add';
import FlatButton from 'material-ui/FlatButton';
import Snackbar from 'material-ui/Snackbar';
import {FormattedMessage} from 'react-intl';
import DashboardThumbnail from './DashboardThumbnail';
import DashboardAPI from '../utils/apis/DashboardAPI';
import DefaultLayout from '../layouts/DefaultLayout';

const styles = {
    thumbnailsWrapper: {
        position: 'fixed',
        top: '130px',
        right: '10px',
        bottom: '10px',
        left: '10px',
        overflow: 'auto'
    },
    noDashboardsMessage: {
        color: 'white',
        fontSize: '30px'
    }
};

class DashboardListingPage extends React.Component {

    constructor() {
        super();
        this.state = {
            isDashboardsFetchSuccess: true,
            dashboards: []
        };
        this.retrieveDashboards = this.retrieveDashboards.bind(this);
        this.renderDashboardThumbnails = this.renderDashboardThumbnails.bind(this);
    }

    componentDidMount() {
        this.retrieveDashboards();
    }

    render() {
        return (
            <DefaultLayout
                navigationBar={
                    <span>
                        <FlatButton
                            label={<FormattedMessage id='create.dashboard' defaultMessage='Create Dashboard' />}
                            icon={<ContentAdd />} primary
                            style={{marginRight: '12px'}}
                            labelStyle={{paddingLeft: '2px' }}
                            onClick={() => {
                                this.props.history.push('/create');
                            }} />
                        <FlatButton
                            label={<FormattedMessage id='create.widget' defaultMessage='Create Widget' />}
                            icon={<ContentAdd />} primary
                            style={{marginRight: '12px'}}
                            labelStyle={{paddingLeft: '2px' }}
                            onClick={() => {
                                this.props.history.push('/createGadget');
                            }} />
                    </span>
                }>
                <div style={styles.thumbnailsWrapper}>
                    {this.renderDashboardThumbnails()}
                </div>
            </DefaultLayout>
        );
    }

    retrieveDashboards() {
        new DashboardAPI().getDashboardList()
            .then((response) => {
                let dashboards = response.data;
                dashboards.sort(function (dashboardA, dashboardB) {
                    return dashboardA.url > dashboardB.url;
                });
                this.setState({
                    isDashboardsFetchSuccess: true,
                    dashboards: dashboards
                });
            }).catch(function (error) {
                this.setState({
                    isDashboardsFetchSuccess: false,
                    dashboards: []
                });
            }
        );
    }

    renderDashboardThumbnails() {
        if (!this.state.isDashboardsFetchSuccess) {
            return (
                <Snackbar
                    open={!this.state.isDashboardsFetchSuccess}
                    message={<FormattedMessage id='listing.error.cannot-list'
                                               defaultMessage='Cannot list available dashboards' />}
                    autoHideDuration={4000} />
            );
        }
        if (this.state.dashboards.length === 0) {
            return (
                <div style={styles.noDashboardsMessage}>
                    <FormattedMessage id='listing.error.no-dashboards' defaultMessage='No Dashboards Available' />
                </div>
            );
        } else {
            return this.state.dashboards.map(dashboard => {
                return <DashboardThumbnail dashboard={dashboard} />;
            });
        }
    }
}

export default withRouter(DashboardListingPage);
