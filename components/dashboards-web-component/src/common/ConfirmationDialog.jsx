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

import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

/**
 * A confirmation dialog. Recommended to be opened/closed on a click event.
 */
class ConfirmationDialog extends Component {
    constructor(props) {
        super(props);
        this.state = { isOpen: props.open };
        this.closeDialog = this.closeDialog.bind(this);
        this.wrapWithCloseDialog = this.wrapWithCloseDialog.bind(this);
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({ isOpen: nextProps.open });
    }

    closeDialog() {
        this.setState({ isOpen: false });
    }

    wrapWithCloseDialog(onClick) {
        return (event) => {
            onClick(event);
            this.closeDialog();
        };
    }

    renderActions() {
        return this.props.actions.map((action) => {
            const { label, onClick } = action;
            return (
                <Button key={label} color='primary' onClick={this.wrapWithCloseDialog(onClick)}>
                    <FormattedMessage id={`dialog-box.confirmation.${label}`} defaultMessage={label} />
                </Button>
            );
        });
    }

    render() {
        const { title, description } = this.props;
        return (
            <Dialog open={this.state.isOpen} onClose={this.closeDialog}>
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{description}</DialogContentText>
                </DialogContent>
                <DialogActions>{this.renderActions()}</DialogActions>
            </Dialog>
        );
    }
}

ConfirmationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    title: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element,
    ]).isRequired,
    description: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element,
    ]).isRequired,
    actions: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired,
    })).isRequired,
};

export default ConfirmationDialog;
