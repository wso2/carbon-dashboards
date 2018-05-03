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
import {Link} from 'react-router-dom';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Snackbar from 'material-ui/Snackbar';
import {FormattedMessage} from 'react-intl';
import DashboardAPI from '../utils/apis/DashboardAPI';
import PropTypes from 'prop-types';
import './dashboard-thumbnail-styles.css';

const styles = {
    card: {backgroundColor: '#5d6e77'},
    title: {color: '#eee'},
    subtitle: {color: '#ccc', height: 17},
    errorMessage: {backgroundColor: '#FF5722', color: 'white'},
    successMessage: {backgroundColor: '#4CAF50', color: 'white'}
};

export default class DashboardThumbnail extends React.Component {

    constructor(props) {
        super();
        this.state = {
            isDashboardDeleteConfirmDialogOpen: false,
            dashboardDeleteActionResult: null
        };
        this.dashboard = props.dashboard;

        this.handleDashboardDeleteConfirmDialogOpen = this.handleDashboardDeleteConfirmDialogOpen.bind(this);
        this.handleDashboardDeletionConfirm = this.handleDashboardDeletionConfirm.bind(this);
        this.handleDashboardDeletionCancel = this.handleDashboardDeletionCancel.bind(this);

        this.renderActionButtons = this.renderActionButtons.bind(this);
        this.renderDashboardDeleteConfirmDialog = this.renderDashboardDeleteConfirmDialog.bind(this);
        this.renderDashboardDeletionResultMessage = this.renderDashboardDeletionResultMessage.bind(this);
    }

    handleDashboardDeleteConfirmDialogOpen() {
        this.setState({isDashboardDeleteConfirmDialogOpen: true});
    }

    handleDashboardDeletionCancel() {
        this.setState({isDashboardDeleteConfirmDialogOpen: false});
    }

    handleDashboardDeletionConfirm() {
        new DashboardAPI().deleteDashboardByID(this.dashboard.url)
            .then((response) => {
                this.setState({dashboardDeleteActionResult: 'success'});
            }).catch(function (error) {
                this.setState({dashboardDeleteActionResult: 'fail'});
            }
        );
    }

    render() {
        if (this.state.dashboardDeleteActionResult) {
            return (
                <div>
                    {this.renderDashboardDeletionResultMessage()}
                </div>
            );
        }

        const actionButtons = this.renderActionButtons();
        return (
            <div>
                {this.renderDashboardDeleteConfirmDialog()}
                <div className='dashboard-thumbnail'>
                    {actionButtons.deleteButton}
                    <div style={styles.card} className='content'>
                        <h4 style={styles.title}>{this.dashboard.name}</h4>
                        <p style={styles.subtitle}>{this.dashboard.description}</p>
                        <div className='actions'>
                            {actionButtons.viewButton}
                            {actionButtons.designButton}
                            {actionButtons.settingsButton}
                        </div>
                    </div>
                </div>
                {this.renderDashboardDeletionResultMessage()}
            </div>
        );
    }

    renderActionButtons() {
        let viewButton = (
            <Link to={`/dashboards/${this.dashboard.url}`}>
                <span className='fw-stack icon'>
                    <i className='fw fw-circle-outline fw-stack-2x'></i><i className='fw fw-view fw-stack-1x'></i>
                </span>
                <FormattedMessage id='view.button' defaultMessage='View' />
            </Link>
        );

        let deleteButton = this.dashboard.hasOwnerPermission ? (
            <div className='trash-button-div' onClick={this.handleDashboardDeleteConfirmDialogOpen}>
                <a href='#'>
                    <i className='fw fw-delete trash-button-icon' title='Delete Dashboard'></i>
                </a>
            </div>
        ) : null;

        let designButton = this.dashboard.hasDesignerPermission ? (
            <Link to={`/designer/${this.dashboard.url}`}>
                <span className='fw-stack icon edit-dashboard-icon'>
                    <i className='fw fw-circle-outline fw-stack-2x'></i><i className='fw fw-edit fw-stack-1x'></i>
                </span>
                <FormattedMessage id='design.button' defaultMessage='Design' />
            </Link>
        ) : null;

        let settingsButton = this.dashboard.hasOwnerPermission ? (
            <Link to={`/settings/${this.dashboard.url}`}>
                <span className='fw-stack icon edit-dashboard-icon'>
                    <i className='fw fw-circle-outline fw-stack-2x'></i><i className='fw fw-settings fw-stack-1x'></i>
                </span>
                <FormattedMessage id='settings.button' defaultMessage='Settings' />
            </Link>
        ) : null;

        return {deleteButton, viewButton, designButton, settingsButton};
    }

    renderDashboardDeleteConfirmDialog() {
        let actionsButtons = [
            <FlatButton
                label={<FormattedMessage id='dialog-box.confirmation.no' defaultMessage='No' />}
                primary={true}
                onClick={this.handleDashboardDeletionCancel}
            />,
            <FlatButton
                label={<FormattedMessage id='dialog-box.confirmation.yes' defaultMessage='Yes' />}
                primary={true}
                onClick={this.handleDashboardDeletionConfirm}
            />
        ];

        return (
            <Dialog
                title={`Do you want to delete dashboard '${this.dashboard.name}'?`}
                actions={actionsButtons}
                modal={false}
                open={this.state.isDashboardDeleteConfirmDialogOpen}>
                This action cannot be undone
            </Dialog>
        );
    }

    renderDashboardDeletionResultMessage() {
        switch (this.state.dashboardDeleteActionResult) {
            case 'success':
                return <Snackbar
                    open={true}
                    message={`Dashboard '${this.dashboard.name}' deleted successfully`}
                    autoHideDuration={4000} />;
            case 'fail':
                return <Snackbar
                    open={true}
                    bodyStyle={styles.errorMessage}
                    message={`Cannot delete dashboard '${this.dashboard.name}'`}
                    autoHideDuration={4000} />;
        }
    }
}

DashboardThumbnail.propTypes = {
    dashboard: PropTypes.shape(
        {
            name: PropTypes.string,
            description: PropTypes.string,
            url: PropTypes.string,
            hasOwnerPermission: PropTypes.bool,
            hasDesignerPermission: PropTypes.bool
        }
    )
};
