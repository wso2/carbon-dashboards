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

import React from 'react';
import { FormattedMessage } from 'react-intl';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import DeleteConfirmationDialog from 'src/common/DeleteConfirmationDialog';
import PromiseSnackbar from 'src/common/PromiseSnackbar';
import { MockPromise, muiMount, muiShallow } from 'test/material-ui-test-utils';

describe('DeleteConfirmationDialog', () => {
    const title = 'Delete Sales Dashboard';
    const description = 'This action cannot be undone.';
    const noAction = jest.fn();
    const yesAction = jest.fn();
    const deletionSuccessMessage = 'Sales dashboard deleted successfully';
    const deletionFailureMessage = 'Cannot deleted Sales dashboard';
    const onDeletionSuccess = jest.fn();
    const onDeletionFailure = jest.fn();
    let rootWrapper;

    beforeEach(() => {
        rootWrapper = muiShallow(<DeleteConfirmationDialog
            open
            title={title}
            description={description}
            noAction={noAction}
            yesAction={yesAction}
            deletionSuccessMessage={deletionSuccessMessage}
            deletionFailureMessage={deletionFailureMessage}
        />);
    });

    afterEach(() => {
        yesAction.mockReset();
        noAction.mockClear();
        onDeletionSuccess.mockClear();
        onDeletionFailure.mockClear();
    });

    test('should correctly place passed props', () => {
        const dialogWrapper = rootWrapper.find(Dialog);
        expect(dialogWrapper.exists()).toBeTruthy();
        expect(dialogWrapper.prop('open')).toBeTruthy();
        expect(dialogWrapper.find(DialogTitle).render().text()).toBe(title);
        expect(dialogWrapper.find(DialogContentText).render().text()).toBe(description);

        const dialogActionsWrapper = dialogWrapper.find(DialogActions);
        expect(dialogActionsWrapper.children()).toHaveLength(2);
        expect(dialogActionsWrapper.childAt(0).is(Button)).toBeTruthy();
        expect(dialogActionsWrapper.childAt(0).find(FormattedMessage).prop('id')).toBe('dialog-box.confirmation.no');
        expect(dialogActionsWrapper.childAt(1).is(Button)).toBeTruthy();
        expect(dialogActionsWrapper.childAt(1).find(FormattedMessage).prop('id')).toBe('dialog-box.confirmation.yes');
    });

    test('should close the dialog after clicking on outside', () => {
        rootWrapper.find(Dialog).simulate('close');
        rootWrapper.update();
        expect(rootWrapper.find(Dialog).prop('open')).toBeFalsy();
        expect(noAction).toHaveBeenCalledTimes(1);
        expect(yesAction).not.toHaveBeenCalled();
    });

    test('should close the dialog after clicking on the "No" button', () => {
        const noButtonWrapper = rootWrapper.find(DialogActions).children().findWhere(node => node.key() === 'no');
        noButtonWrapper.simulate('click');
        rootWrapper.update();

        expect(rootWrapper.find(Dialog).prop('open')).toBeFalsy();
        expect(noAction).toHaveBeenCalledTimes(1);
        expect(yesAction).not.toHaveBeenCalled();
    });

    test('should close the dialog & show the PromiseSnackbar after clicking on the "Yes" button', () => {
        const wrapper = muiShallow(<DeleteConfirmationDialog
            open
            title={title}
            description={description}
            noAction={noAction}
            yesAction={yesAction}
            deletionSuccessMessage={deletionSuccessMessage}
            deletionFailureMessage={deletionFailureMessage}
            onDeletionSuccess={onDeletionSuccess}
            onDeletionFailure={onDeletionFailure}
        />);
        const yesButtonWrapper = wrapper.find(DialogActions).children().findWhere(node => node.key() === 'yes');
        yesButtonWrapper.simulate('click');
        wrapper.update();

        expect(wrapper.find(Dialog).prop('open')).toBeFalsy();
        const promiseSnackbarWrapper = wrapper.find(PromiseSnackbar);
        expect(promiseSnackbarWrapper.exists()).toBeTruthy();
        expect(promiseSnackbarWrapper.prop('promiseSupplier')).toBe(yesAction);
        expect(promiseSnackbarWrapper.prop('successMessage')).toBe(deletionSuccessMessage);
        expect(promiseSnackbarWrapper.prop('failureMessage')).toBe(deletionFailureMessage);
        expect(promiseSnackbarWrapper.prop('onSuccess')).toBe(onDeletionSuccess);
        expect(promiseSnackbarWrapper.prop('onFailure')).toBe(onDeletionFailure);
    });

    test('should invoke yesAction & onDeletionSuccess if deletion is successful', () => {
        yesAction.mockReturnValue(MockPromise.resolve());
        const wrapper = muiShallow(<DeleteConfirmationDialog
            open
            title={title}
            description={description}
            noAction={noAction}
            yesAction={yesAction}
            deletionSuccessMessage={deletionSuccessMessage}
            deletionFailureMessage={deletionFailureMessage}
            onDeletionSuccess={onDeletionSuccess}
            onDeletionFailure={onDeletionFailure}
        />);
        const yesButtonWrapper = wrapper.find(DialogActions).children().findWhere(node => node.key() === 'yes');
        yesButtonWrapper.simulate('click');
        wrapper.update();
        wrapper.find(PromiseSnackbar).shallow();

        expect(noAction).not.toHaveBeenCalled();
        expect(yesAction).toHaveBeenCalledTimes(1);
        expect(onDeletionSuccess).toHaveBeenCalledTimes(1);
        expect(onDeletionFailure).not.toHaveBeenCalled();
    });

    test('should invoke yesAction & onDeletionFailure if deletion fails', () => {
        yesAction.mockReturnValue(MockPromise.reject());
        const wrapper = muiShallow(<DeleteConfirmationDialog
            open
            title={title}
            description={description}
            noAction={noAction}
            yesAction={yesAction}
            deletionSuccessMessage={deletionSuccessMessage}
            deletionFailureMessage={deletionFailureMessage}
            onDeletionSuccess={onDeletionSuccess}
            onDeletionFailure={onDeletionFailure}
        />);
        const yesButtonWrapper = wrapper.find(DialogActions).children().findWhere(node => node.key() === 'yes');
        yesButtonWrapper.simulate('click');
        wrapper.update();
        wrapper.find(PromiseSnackbar).shallow();

        expect(noAction).not.toHaveBeenCalled();
        expect(yesAction).toHaveBeenCalledTimes(1);
        expect(onDeletionSuccess).not.toHaveBeenCalled();
        expect(onDeletionFailure).toHaveBeenCalledTimes(1);
    });

    test('should close after changing open prop from true to false', () => {
        expect(rootWrapper.find(Dialog).prop('open')).toBeTruthy();
        rootWrapper.setProps({ open: false }, () => {
            expect(rootWrapper.find(Dialog).prop('open')).toBeFalsy();
        });
    });
});
