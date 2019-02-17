/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import PromiseSnackbar from './PromiseSnackbar';

/**
 * A delete confirmation dialog. Recommended to be opened/closed on a click event.
 */
export default class DeleteConfirmationDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: props.open,
            showSnackbar: false,
        };
        this.hideDialog = this.hideDialog.bind(this);
        this.handleNoButtonClick = this.handleNoButtonClick.bind(this);
        this.handleYesButtonClick = this.handleYesButtonClick.bind(this);
    }

    /* eslint-disable-next-line no-unused-vars */
    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({ open: nextProps.open });
    }

    handleNoButtonClick() {
        this.hideDialog();
        this.props.noAction();
    }

    handleYesButtonClick() {
        this.hideDialog();
        this.setState({ showSnackbar: true });
    }

    hideDialog() {
        this.setState({ open: false });
    }

    render() {
        const { open, showSnackbar } = this.state;
        const {
            title,
            description,
            yesAction,
            deletionSuccessMessage,
            deletionFailureMessage,
            onDeletionSuccess,
            onDeletionFailure,
        } = this.props;

        return (
            <Fragment>
                <Dialog open={open} onClose={this.handleNoButtonClick}>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>{description}</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button key='no' color='primary' onClick={this.handleNoButtonClick}>
                            <FormattedMessage id='dialog-box.confirmation.no' defaultMessage='No' />
                        </Button>
                        <Button key='yes' color='primary' onClick={this.handleYesButtonClick}>
                            <FormattedMessage id='dialog-box.confirmation.yes' defaultMessage='Yes' />
                        </Button>
                    </DialogActions>
                </Dialog>
                {showSnackbar && (
                    <PromiseSnackbar
                        promiseSupplier={yesAction}
                        successMessage={deletionSuccessMessage}
                        failureMessage={deletionFailureMessage}
                        onSuccess={onDeletionSuccess}
                        onFailure={onDeletionFailure}
                    />
                )}
            </Fragment>
        );
    }
}

DeleteConfirmationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    title: PropTypes.node.isRequired,
    description: PropTypes.node.isRequired,
    noAction: PropTypes.func.isRequired,
    yesAction: PropTypes.func.isRequired,
    deletionSuccessMessage: PropTypes.node.isRequired,
    deletionFailureMessage: PropTypes.node.isRequired,
    onDeletionSuccess: PropTypes.func,
    onDeletionFailure: PropTypes.func,
};

DeleteConfirmationDialog.defaultProps = {
    onDeletionSuccess: () => null,
    onDeletionFailure: () => null,
};
