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

import { Card, CardMedia, CardTitle, Dialog, FlatButton, Menu, MenuItem, Popover, Snackbar } from 'material-ui';
import { NavigationMoreVert } from 'material-ui/svg-icons';

import DashboardThumbnail from '../../utils/DashboardThumbnail';
import DashboardAPI from '../../utils/apis/DashboardAPI';

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
    },
    cardActions: {
        float: 'right',
        paddingRight: 0,
    },
};

class DashboardCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isMenuOpen: false,
            menuAnchorElement: null,
            isDashboardDeleteConfirmDialogOpen: false,
            dashboardDeleteActionResult: null,
        };

        this.handleMenuIconClick = this.handleMenuIconClick.bind(this);
        this.handleMenuCloseRequest = this.handleMenuCloseRequest.bind(this);
        this.hideDashboardDeleteConfirmDialog = this.hideDashboardDeleteConfirmDialog.bind(this);
        this.showDashboardDeleteConfirmDialog = this.showDashboardDeleteConfirmDialog.bind(this);
        this.handleDashboardDeletionConfirm = this.handleDashboardDeletionConfirm.bind(this);

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

    renderDashboardDeletionSuccessMessage(dashboard) {
        return (<Snackbar
            open
            message={`Dashboard '${dashboard.name}' deleted successfully`}
            autoHideDuration={4000}
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
        if (!(dashboard.hasOwnerPermission && dashboard.hasDesignerPermission)) {
            return null;
        }

        let designMenuItem;
        if (dashboard.hasDesignerPermission) {
            designMenuItem = (<MenuItem
                primaryText={<FormattedMessage id='design.button' defaultMessage='Design' />}
                containerElement={<Link to={`/designer/${dashboard.url}`} />}
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
                    {designMenuItem}
                    {settingsMenuItem}
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
                        showExpandableButton={dashboard.hasOwnerPermission && dashboard.hasDesignerPermission}
                        openIcon={<NavigationMoreVert onClick={this.handleMenuIconClick} />}
                        closeIcon={<NavigationMoreVert onClick={this.handleMenuIconClick} />}
                        title={title}
                        titleStyle={styles.cardTitleText}
                        subtitle={subtitle ? <span title={subtitle}>{subtitle}</span> : <span>&nbsp;</span>}
                        subtitleStyle={styles.cardTitleText}
                    />
                </Card>
                {this.renderMenu(dashboard)}
                {this.renderDashboardDeleteConfirmDialog(dashboard)}
                {this.renderDashboardDeletionFailMessage(dashboard)}
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
