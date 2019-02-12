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

import React, { Component, Fragment } from 'react';
import Link from 'react-router-dom/Link';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardMedia from '@material-ui/core/CardMedia';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';
import Snackbar from '@material-ui/core/Snackbar';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import withStyles from '@material-ui/core/styles/withStyles';

import ConfirmationDialog from '../../common/ConfirmationDialog';
import DashboardThumbnail from '../../utils/DashboardThumbnail';
import DashboardAPI from '../../utils/apis/DashboardAPI';
import DashboardExporter from '../../utils/DashboardExporter';

const styles = {
    media: {
        height: 0,
        paddingTop: '40%', // 50%=2:1, 56.25%=16:9
    },
    content: {
        overflowX: 'hidden',
    },
    action: {
        backgroundColor: 'red',
    },
    title: {
        display: 'block',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
    subheader: {
        display: 'block',
        overflow: 'hidden',
        whiteSpace: 'normal',
        textOverflow: 'ellipsis',
        height: '3em',
        maxHeight: '3em',
        fontSize: '0.9rem',
    },
};

class DashboardCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            menuAnchorElement: null,
            isDashboardDeleteConfirmDialogOpen: false,
            dashboardDeleteActionResult: null,
        };

        this.handleMenuIconClick = this.handleMenuIconClick.bind(this);
        this.hideMenu = this.hideMenu.bind(this);
        this.showDashboardDeleteConfirmDialog = this.showDashboardDeleteConfirmDialog.bind(this);
        this.hideDashboardDeleteConfirmDialog = this.hideDashboardDeleteConfirmDialog.bind(this);
        this.handleDashboardExport = this.handleDashboardExport.bind(this);
        this.handleDashboardDeletionConfirm = this.handleDashboardDeletionConfirm.bind(this);
    }

    handleMenuIconClick(event) {
        event.preventDefault();
        const isMenuOpen = !!this.state.menuAnchorElement;
        this.setState({
            menuAnchorElement: isMenuOpen ? null : event.currentTarget,
            isDashboardDeleteConfirmDialogOpen: false,
        });
    }

    hideMenu() {
        this.setState({ menuAnchorElement: null });
    }

    showDashboardDeleteConfirmDialog() {
        this.setState({ isDashboardDeleteConfirmDialogOpen: true });
        this.hideMenu();
    }

    hideDashboardDeleteConfirmDialog() {
        this.setState({ isDashboardDeleteConfirmDialogOpen: false });
    }

    handleDashboardExport(name, url) {
        DashboardExporter.exportDashboard(name, url);
        this.hideMenu();
    }

    handleDashboardDeletionConfirm(dashboard) {
        this.hideDashboardDeleteConfirmDialog();
        new DashboardAPI().deleteDashboardByID(dashboard.url)
            .then(() => this.setState({ dashboardDeleteActionResult: 'success' }))
            .catch(() => this.setState({ dashboardDeleteActionResult: 'fail' }));
    }

    renderDashboardDeleteConfirmDialog(dashboard) {
        return (
            <ConfirmationDialog
                open={this.state.isDashboardDeleteConfirmDialogOpen}
                title={(
                    <FormattedMessage
                        id='delete.dashboard.dialog.title'
                        defaultMessage='Delete {name}?'
                        values={{ name: dashboard.name }}
                    />
                )}
                description={(
                    <FormattedMessage
                        id='delete.dashboard.dialog.content'
                        defaultMessage='This action cannot be undone.'
                    />
                )}
                actions={[
                    { label: 'no', onClick: this.hideDashboardDeleteConfirmDialog },
                    { label: 'yes', onClick: (() => this.handleDashboardDeletionConfirm(dashboard)) },
                ]}
            />
        );
    }

    renderDashboardDeletionSuccessMessage(dashboard) {
        const message = (
            <FormattedMessage
                id='delete.dashboard.success'
                defaultMessage='Dashboard {name} deleted successfully'
                values={{ name: dashboard.name }}
            />
        );
        return <Snackbar open message={message} autoHideDuration={4000} />;
    }

    renderDashboardDeletionFailMessage(dashboard) {
        if (this.state.dashboardDeleteActionResult !== 'fail') {
            return null;
        }

        const message = (
            <FormattedMessage
                id='delete.dashboard.fail'
                defaultMessage='Cannot delete dashboard {name}.'
                values={{ name: dashboard.name }}
            />
        );
        return (
            <Snackbar
                open
                message={message}
                autoHideDuration={4000}
                onClose={() => this.setState({ dashboardDeleteActionResult: null })}
            />
        );
    }

    renderMenu(dashboard) {
        const { name, url, hasOwnerPermission, hasDesignerPermission } = dashboard;

        if (!(hasOwnerPermission && hasDesignerPermission)) {
            return null;
        }

        let designMenuItem;
        if (hasDesignerPermission) {
            designMenuItem = (
                <MenuItem component={Link} to={`/designer/${url}`}>
                    <FormattedMessage id='design.button' defaultMessage='Design' />
                </MenuItem>
            );
        }
        let exportMenuItem;
        if (hasDesignerPermission) {
            exportMenuItem = (
                <MenuItem onClick={() => this.handleDashboardExport(name, url)}>
                    <FormattedMessage id='export.button' defaultMessage='Export' />
                </MenuItem>
            );
        }
        let settingsMenuItem;
        let deleteMenuItem;
        if (hasOwnerPermission) {
            settingsMenuItem = (
                <MenuItem component={Link} to={`/settings/${url}`}>
                    <FormattedMessage id='settings.button' defaultMessage='Settings' />
                </MenuItem>
            );
            deleteMenuItem = (
                <MenuItem onClick={this.showDashboardDeleteConfirmDialog}>
                    <FormattedMessage id='delete.button' defaultMessage='Delete' />
                </MenuItem>
            );
        }

        return (
            <Popover
                open={!!this.state.menuAnchorElement}
                anchorEl={this.state.menuAnchorElement}
                onClose={this.hideMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                {designMenuItem}
                {settingsMenuItem}
                {exportMenuItem}
                {deleteMenuItem}
            </Popover>
        );
    }

    render() {
        const { dashboard, classes } = this.props;
        if (this.state.dashboardDeleteActionResult === 'success') {
            return this.renderDashboardDeletionSuccessMessage(dashboard);
        }

        const { name, description, url, hasOwnerPermission, hasDesignerPermission } = dashboard;
        let menuButton = null;
        if (hasOwnerPermission && hasDesignerPermission) {
            menuButton = <IconButton onClick={this.handleMenuIconClick}><MoreVertIcon /></IconButton>;
        }

        return (
            <Fragment>
                <Card>
                    <CardActionArea component={Link} to={`/dashboards/${url}`}>
                        <CardMedia
                            className={classes.media}
                            image={DashboardThumbnail.getDashboardThumbnail(url)}
                        />
                    </CardActionArea>
                    <CardHeader
                        title={name}
                        subheader={description ? description.trim() : ''}
                        action={menuButton}
                        classes={{ content: classes.content, title: classes.title, subheader: classes.subheader }}
                    />
                </Card>
                {this.renderMenu(dashboard)}
                {this.renderDashboardDeleteConfirmDialog(dashboard)}
                {this.renderDashboardDeletionFailMessage(dashboard)}
            </Fragment>
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
    classes: PropTypes.shape({}).isRequired,
};

export default withStyles(styles)(DashboardCard);
