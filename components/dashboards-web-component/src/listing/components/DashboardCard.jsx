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
import { Link, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import {
    Card, CardMedia, CardTitle, Dialog, FlatButton, Menu, MenuItem, Popover, Snackbar,
    TextField
} from 'material-ui';
import { NavigationMoreVert } from 'material-ui/svg-icons';

import DashboardThumbnail from '../../utils/DashboardThumbnail';
import DashboardAPI from '../../utils/apis/DashboardAPI';
import DashboardExporter from '../../utils/DashboardExporter';
import { HttpStatus } from "../../utils/Constants";

const styles = {
    card: {
        display: 'inline-block',
        width: 'calc(25% - 20px)',
        minWidth: 300,
        margin: '20px 10px 0px 10px',
    },
    cardTitleText: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        fontSize: '1.125em',
    },
    cardSubtitleText: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        fontSize: '0.8em',
    },
    cardActions: {
        float: 'right',
        paddingRight: 0,
    },
    menuIcon: {
        float: 'right',
        padding: '4px',
        cursor: 'pointer',
    },
    cardTitle: {
        float: 'left',
    },
    errorMessage: {},
    successMessage: {},
};

class DashboardCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isMenuOpen: false,
            menuAnchorElement: null,
            isDashboardDeleteConfirmDialogOpen: false,
            isDashboardDuplicateConfigDialogOpen: false,
            dashboardDeleteActionResult: null,
            newDashboardName: null,
            newDashboardUrl: null,
            showMessage: false,
            message: '',
        };

        this.handleMenuIconClick = this.handleMenuIconClick.bind(this);
        this.handleMenuCloseRequest = this.handleMenuCloseRequest.bind(this);
        this.hideDashboardDeleteConfirmDialog = this.hideDashboardDeleteConfirmDialog.bind(this);
        this.showDashboardDeleteConfirmDialog = this.showDashboardDeleteConfirmDialog.bind(this);
        this.handleDashboardDeletionConfirm = this.handleDashboardDeletionConfirm.bind(this);

        this.duplicateDashboard = this.duplicateDashboard.bind(this);
        this.showDashboardDuplicateConfigDialog = this.showDashboardDuplicateConfigDialog.bind(this);
        this.hideDashboardDuplicateConfigDialog = this.hideDashboardDuplicateConfigDialog.bind(this);
        this.renderDashboardDuplicateConfigDialog = this.renderDashboardDuplicateConfigDialog.bind(this);
        this.renderDashboardMessage = this.renderDashboardMessage.bind(this);
        this.showError = this.showError.bind(this);
        this.showMessage = this.showMessage.bind(this);

        this.renderDashboardDeleteConfirmDialog = this.renderDashboardDeleteConfirmDialog.bind(this);
        this.renderDashboardDeletionSuccessMessage = this.renderDashboardDeletionSuccessMessage.bind(this);
        this.renderDashboardDeletionFailMessage = this.renderDashboardDeletionFailMessage.bind(this);
        this.renderMenu = this.renderMenu.bind(this);
    }

    handleMenuIconClick(event) {
        event.preventDefault();
        this.setState({
            isMenuOpen: !this.state.isMenuOpen,
            menuAnchorElement: event.currentTarget,
        });
    }

    handleMenuCloseRequest() {
        this.setState({
            isMenuOpen: false,
        });
    }

    hideDashboardDeleteConfirmDialog() {
        this.setState({ isDashboardDeleteConfirmDialogOpen: false });
    }

    showDashboardDeleteConfirmDialog() {
        this.setState({
            isDashboardDeleteConfirmDialogOpen: true,
            isMenuOpen: false,
        });
    }

    showDashboardDuplicateConfigDialog() {
        const { dashboard } = this.props;
        this.setState({
            isDashboardDuplicateConfigDialogOpen: true,
            isMenuOpen: false,
            newDashboardName: dashboard.name + ' Copy',
            newDashboardUrl: dashboard.url + '_copy',
        });
    }

    hideDashboardDuplicateConfigDialog() {
        this.setState({ isDashboardDuplicateConfigDialogOpen: false });
    }

    /**
     * Show error message.
     *
     * @param {string} message Error message
     */
    showError(message) {
        this.showMessage(message, styles.errorMessage);
    }

    /**
     * Show info message.
     *
     * @param {string} message Message
     * @param {string} style Message style
     */
    showMessage(message, style = styles.successMessage) {
        this.setState({
            showMessage: true,
            message,
        });
    }

    duplicateDashboard(dashboard) {
        this.hideDashboardDuplicateConfigDialog();
        const { retrieveDashboards } = this.props;
        DashboardAPI.exportDashboardByID(dashboard.url)
            .then((response) => {
                let dashboard = response.data.dashboard;
                dashboard.url = this.state.newDashboardUrl;
                dashboard.name = this.state.newDashboardName;
                dashboard.content.readOnly = false;
                new DashboardAPI()
                    .createDashboard(response.data.dashboard)
                    .then((response) => {
                        switch (response.status) {
                            case HttpStatus.CREATED: {
                                this.showMessage(
                                    <FormattedMessage
                                        id='dashboard.duplicate.success'
                                        defaultMessage="Dashboard is duplicated successfully!"
                                    />
                                );
                                retrieveDashboards();
                                break;
                            }
                            default: {
                                this.showError(
                                    <FormattedMessage
                                        id='dashboard.duplicate.failure'
                                        defaultMessage="Unable to duplicate the dashboard due to unknown error."
                                    />
                                );
                                break;
                            }
                        }
                    })
                    .catch((error) => {
                        if (error.response.status === HttpStatus.CONFLICT) {
                            this.showError(
                                <FormattedMessage
                                    id='dashboard.duplicate.error.sameurl'
                                    defaultMessage="Dashboard with same url already exists. Please use a different url."
                                />
                            );
                        } else {
                            this.showError(this.context.intl.formatMessage({
                                id: "dashboard.duplicate.add.error",
                                defaultMessage: "Couldn't create the dashboard!!"
                            }));
                        }
                    });

            })
            .catch((e) => {
                console.error(`Duplicating dashboard '${dashboard.name}' with URL '${dashboard.url}' failed.`, e);
            });

    }

    handleDashboardDeletionConfirm(dashboard) {
        this.hideDashboardDeleteConfirmDialog();
        new DashboardAPI().deleteDashboardByID(dashboard.url)
            .then(() => this.setState({ dashboardDeleteActionResult: 'success' }))
            .catch(() => this.setState({ dashboardDeleteActionResult: 'fail' }));
    }

    renderDashboardDeleteConfirmDialog(dashboard) {
        const actionsButtons = [
            <FlatButton
                primary
                label={<FormattedMessage id='dialog-box.confirmation.no' defaultMessage='No' />}
                onClick={this.hideDashboardDeleteConfirmDialog}
            />,
            <FlatButton
                primary
                label={<FormattedMessage id='dialog-box.confirmation.yes' defaultMessage='Yes' />}
                onClick={() => this.handleDashboardDeletionConfirm(dashboard)}
            />,
        ];

        return (
            <Dialog
                title={`Do you want to delete dashboard '${dashboard.name}'?`}
                actions={actionsButtons}
                open={this.state.isDashboardDeleteConfirmDialogOpen}
                modal={false}
                onRequestClose={this.hideDashboardDeleteConfirmDialog}
            >
                This action cannot be undone
            </Dialog>
        );
    }

    renderDashboardDuplicateConfigDialog(dashboard) {
        const actionsButtons = [
            <TextField
                floatingLabelText={
                    <FormattedMessage id="dashboard.duplicate.name" defaultMessage="Name" />
                }
                hintText={
                    <FormattedMessage
                        id="dashboard.duplicate.name.hint.text"
                        defaultMessage="E.g. Sales Statistics"
                    />
                }
                value={this.state.newDashboardName}
                fullWidth
                onChange={(e, value) => {
                    this.setState({
                        newDashboardName: value,
                    });
                }}
            />,
            <TextField
                floatingLabelText={
                    <FormattedMessage id="dashboard.duplicate.url" defaultMessage="URL" />
                }
                hintText={
                    <FormattedMessage
                        id="dashboard.duplicate.url.hint.text"
                        defaultMessage="E.g. sales-stats"
                    />
                }
                value={this.state.newDashboardUrl}
                fullWidth
                onChange={(e, value) => {
                    this.setState({
                        newDashboardUrl: value,
                    });
                }}
            />,
            <FlatButton
                primary
                label={<FormattedMessage id='dialog-box.confirmation.cancel' defaultMessage='Cancel' />}
                onClick={this.hideDashboardDuplicateConfigDialog}
            />,
            <FlatButton
                primary
                label={<FormattedMessage id='dialog-box.confirmation.ok' defaultMessage='Ok' />}
                onClick={() => this.duplicateDashboard(dashboard)}
            />,
        ];

        return (
            <Dialog
                title={`Do you want to duplicate dashboard '${dashboard.name}'?`}
                actions={actionsButtons}
                open={this.state.isDashboardDuplicateConfigDialogOpen}
                modal={false}
                onRequestClose={this.hideDashboardDuplicateConfigDialog}
            >
            </Dialog>
        );
    }

    renderDashboardDeletionSuccessMessage(dashboard) {
        return (<Snackbar
            open
            message={`Dashboard '${dashboard.name}' deleted successfully`}
            autoHideDuration={4000}
        />);
    }

    renderDashboardMessage() {
        return (<Snackbar
            contentStyle={styles.messageBox}
            open={this.state.showMessage}
            message={this.state.message}
            autoHideDuration={4000}
            onRequestClose={() => {
                this.setState({ showMessage: false, message: '' });
            }}
        />);
    }

    renderDashboardDeletionFailMessage(dashboard) {
        return (<Snackbar
            open={this.state.dashboardDeleteActionResult === 'fail'}
            message={`Cannot delete dashboard '${dashboard.name}'`}
            autoHideDuration={4000}
            onRequestClose={() => this.setState({ dashboardDeleteActionResult: null })}
        />);
    }

    renderMenu(dashboard) {
        if (!(dashboard.hasOwnerPermission || dashboard.hasDesignerPermission)) {
            return null;
        }
        let duplicateMenuItem;
        duplicateMenuItem = (<MenuItem
            primaryText={<FormattedMessage id='duplicate.button' defaultMessage='Duplicate' />}
            onClick={() => this.showDashboardDuplicateConfigDialog(dashboard)}
        />);

        let designMenuItem;
        if (dashboard.hasDesignerPermission) {
            designMenuItem = (<MenuItem
                primaryText={<FormattedMessage id='design.button' defaultMessage='Design' />}
                containerElement={<Link to={`/designer/${dashboard.url}`} />}
            />);
        }
        let exportMenuItem;
        const dashboardName = dashboard.name;
        const dashboardURL = dashboard.url;
        if (dashboard.hasDesignerPermission) {
            exportMenuItem = (<MenuItem
                primaryText={<FormattedMessage id="export.button" defaultMessage="Export" />}
                onClick={() => DashboardExporter.exportDashboard(dashboardName, dashboardURL)}
            />);
        }
        let settingsMenuItem;
        let deleteMenuItem;
        if (dashboard.hasOwnerPermission) {
            settingsMenuItem = (<MenuItem
                primaryText={<FormattedMessage id='settings.button' defaultMessage='Settings' />}
                containerElement={<Link to={`/settings/${dashboard.url}`} />}
            />);
            deleteMenuItem = (<MenuItem
                primaryText={<FormattedMessage id='delete.button' defaultMessage='Delete' />}
                onClick={this.showDashboardDeleteConfirmDialog}
            />);
        }

        return (
            <Popover
                open={this.state.isMenuOpen}
                anchorEl={this.state.menuAnchorElement}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                targetOrigin={{ horizontal: 'right', vertical: 'top' }}
                onRequestClose={this.handleMenuCloseRequest}
            >
                <Menu>
                    {duplicateMenuItem}
                    {designMenuItem}
                    {settingsMenuItem}
                    {exportMenuItem}
                    {deleteMenuItem}
                </Menu>
            </Popover>
        );
    }

    render() {
        const dashboard = this.props.dashboard;
        if (this.state.dashboardDeleteActionResult === 'success') {
            return this.renderDashboardDeletionSuccessMessage(dashboard);
        }

        const title = dashboard.name;
        const subtitle = dashboard.description ? dashboard.description.trim() : null;
        const dashboardUrl = dashboard.url;
        const history = this.props.history;

        return (
            <span>
                <Card expanded={false} expandable={false} actAsExpander={false} style={styles.card} zDepth={1}>
                    <CardMedia
                        actAsExpander={false}
                        style={{
                            cursor: 'pointer',
                            width: '100%',
                            backgroundImage: `url(${DashboardThumbnail.getDashboardThumbnail(dashboardUrl)})`,
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: 'cover',
                        }}
                        onClick={() => history.push(`/dashboards/${dashboardUrl}`)}
                    >
                        <div style={{ height: 120 }}>&nbsp;</div>
                    </CardMedia>
                    <CardTitle
                        actAsExpander={false}
                        showExpandableButton={false}
                        title={
                            <div>
                                <span style={styles.cardTitle}>{title}</span>
                                {
                                    (dashboard.hasOwnerPermission || dashboard.hasDesignerPermission) &&
                                    (<NavigationMoreVert onClick={this.handleMenuIconClick} style={styles.menuIcon} />)
                                }
                            </div>
                        }
                        titleStyle={styles.cardTitleText}
                        subtitle={subtitle ? <span title={subtitle}>{subtitle}</span> : <span>&nbsp;</span>}
                        subtitleStyle={styles.cardSubtitleText}
                    />
                </Card>
                {this.renderMenu(dashboard)}
                {this.renderDashboardDeleteConfirmDialog(dashboard)}
                {this.renderDashboardDeletionFailMessage(dashboard)}
                {this.renderDashboardDuplicateConfigDialog(dashboard)}
                {this.renderDashboardMessage()}
            </span>
        );
    }
}

DashboardCard.propTypes = {
    dashboard: PropTypes.shape({
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
        hasOwnerPermission: PropTypes.bool.isRequired,
        hasDesignerPermission: PropTypes.bool.isRequired,
    }).isRequired,
    history: PropTypes.shape({}).isRequired,
};

export default withRouter(DashboardCard);
