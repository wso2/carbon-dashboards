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
import PropTypes from 'prop-types';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

const STATUS = { success: 'success', failure: 'failure' };

export default class PromiseSnackbar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: null,
        };
        this.handleClose = this.handleClose.bind(this);
    }

    componentDidMount() {
        const { promiseSupplier, onSuccess, onFailure } = this.props;
        promiseSupplier()
            .then(() => {
                this.setState({ status: STATUS.success });
                onSuccess();
            })
            .catch((error) => {
                this.setState({ status: STATUS.failure });
                console.log('Error', error); /* eslint-disable-line no-console */
                onFailure();
            });
    }

    handleClose() {
        this.setState({ status: null });
    }

    render() {
        const { successMessage, failureMessage } = this.props;
        let message;
        switch (this.state.status) {
            case STATUS.success:
                message = successMessage;
                break;
            case STATUS.failure:
                message = failureMessage;
                break;
            default:
                message = null;
        }

        return (
            <Snackbar
                open={!!message}
                message={message}
                onClose={this.handleClose}
                action={<IconButton color='inherit' onClick={this.handleClose}><CloseIcon /></IconButton>}
                autoHideDuration={4000}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            />
        );
    }
}

PromiseSnackbar.propTypes = {
    promiseSupplier: PropTypes.func.isRequired,
    successMessage: PropTypes.node.isRequired,
    failureMessage: PropTypes.node.isRequired,
    onSuccess: PropTypes.func,
    onFailure: PropTypes.func,
};

PromiseSnackbar.defaultProps = {
    onSuccess: () => null,
    onFailure: () => null,
};
