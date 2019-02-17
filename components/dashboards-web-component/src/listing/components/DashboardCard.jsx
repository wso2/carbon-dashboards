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
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import withStyles from '@material-ui/core/styles/withStyles';

import DeleteConfirmationDialog from '../../common/DeleteConfirmationDialog';
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
            openDashboardDeleteConfirmationDialog: false,
            dashboardDeletionResult: null,
        };

        this.handleMenuIconClick = this.handleMenuIconClick.bind(this);
        this.hideMenu = this.hideMenu.bind(this);
        this.showDashboardDeleteConfirmationDialog = this.showDashboardDeleteConfirmationDialog.bind(this);
        this.hideDashboardDeleteConfirmationDialog = this.hideDashboardDeleteConfirmationDialog.bind(this);
        this.handleDashboardExport = this.handleDashboardExport.bind(this);
        this.handleDashboardDeletionSuccess = this.handleDashboardDeletionSuccess.bind(this);
    }

    handleMenuIconClick(event) {
        event.preventDefault();
        const isMenuOpen = !!this.state.menuAnchorElement;
        this.setState({
            menuAnchorElement: isMenuOpen ? null : event.currentTarget,
            openDashboardDeleteConfirmationDialog: false,
            dashboardDeletionResult: null,
        });
    }

    hideMenu() {
        this.setState({ menuAnchorElement: null });
    }

    showDashboardDeleteConfirmationDialog() {
        this.setState({ openDashboardDeleteConfirmationDialog: true });
        this.hideMenu();
    }

    hideDashboardDeleteConfirmationDialog() {
        this.setState({ openDashboardDeleteConfirmationDialog: false, dashboardDeletionResult: null });
    }

    handleDashboardDeletionSuccess() {
        this.hideDashboardDeleteConfirmationDialog();
        this.setState({ dashboardDeletionResult: 'success' });
    }

    handleDashboardExport(name, url) {
        DashboardExporter.exportDashboard(name, url);
        this.hideMenu();
    }

    renderDashboardDeleteConfirmationDialog(dashboard) {
        const { name, url } = dashboard;
        return (
            <DeleteConfirmationDialog
                open={this.state.openDashboardDeleteConfirmationDialog}
                title={(
                    <FormattedMessage
                        id='delete.dashboard.dialog.title'
                        defaultMessage='Delete {name} Dashboard?'
                        values={{ name: dashboard.name }}
                    />
                )}
                description={(
                    <FormattedMessage
                        id='delete.dashboard.dialog.content'
                        defaultMessage='This action cannot be undone.'
                    />
                )}
                noAction={this.hideDashboardDeleteConfirmationDialog}
                yesAction={() => DashboardAPI.deleteDashboardByID(url)}
                deletionSuccessMessage={(
                    <FormattedMessage
                        id='delete.dashboard.success'
                        defaultMessage='Dashboard {name} deleted successfully'
                        values={{ name }}
                    />
                )}
                deletionFailureMessage={(
                    <FormattedMessage
                        id='delete.dashboard.fail'
                        defaultMessage='Cannot delete dashboard {name}.'
                        values={{ name }}
                    />
                )}
                onDeletionSuccess={this.handleDashboardDeletionSuccess}
                onDeletionFailure={this.hideDashboardDeleteConfirmationDialog}
            />
        );
    }

    renderMenu(dashboard) {
        const { name, url, hasOwnerPermission, hasDesignerPermission } = dashboard;

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
                <MenuItem onClick={this.showDashboardDeleteConfirmationDialog}>
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

    renderCardContent(dashboard, classes) {
        if (this.state.dashboardDeletionResult === 'success') {
            return null;
        }

        const { name, description, url, hasOwnerPermission, hasDesignerPermission } = dashboard;
        let menuButton = null;
        if (hasOwnerPermission && hasDesignerPermission) {
            menuButton = <IconButton onClick={this.handleMenuIconClick}><MoreVertIcon /></IconButton>;
        }
        return (
            <Fragment>
                <Grid key={url} item xl={3} lg={3} md={3} sm={4} xs={6}>
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
                </Grid>
                {menuButton && this.renderMenu(dashboard)}
            </Fragment>
        );
    }

    render() {
        const { dashboard, classes } = this.props;
        return (
            <Fragment>
                {this.renderCardContent(dashboard, classes)}
                {this.renderDashboardDeleteConfirmationDialog(dashboard)}
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
