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
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ConfirmationDialog from 'src/common/ConfirmationDialog';
import { muiMount, muiShallow } from 'test/material-ui-test-utils';

describe('ConfirmationDialog', () => {
    test('should correctly place passed title, description, action props', () => {
        const title = 'Some Title';
        const description = 'Some description.';
        const okAction = { label: 'ok', onClick: jest.fn(() => null) };
        const wrapper = muiShallow(<ConfirmationDialog
            open
            title={title}
            description={description}
            actions={[okAction]}
        />);

        expect(wrapper.find(DialogTitle).render().text()).toBe(title);
        expect(wrapper.find(DialogContentText).render().text()).toBe(description);

        const actionButtonWrapper = wrapper.find(DialogActions).find(Button);
        expect(actionButtonWrapper).toHaveLength(1);
        expect(actionButtonWrapper.key()).toBe(okAction.label);
        actionButtonWrapper.simulate('click');
        wrapper.update();
        expect(okAction.onClick.mock.calls).toHaveLength(1);
    });

    test('should be opened when prop open == true', () => {
        const wrapper = muiShallow(<ConfirmationDialog open title='' description='' actions={[]} />);
        expect(wrapper.find(Dialog).prop('open')).toBeTruthy();
    });

    test('should be closed when prop open == false', () => {
        const wrapper = muiShallow(<ConfirmationDialog open={false} title='' description='' actions={[]} />);
        expect(wrapper.find(Dialog).prop('open')).toBeFalsy();
    });

    test('should open after changing open prop from false to true', () => {
        const wrapper = muiMount(<ConfirmationDialog open={false} title='' description='' actions={[]} />);
        expect(wrapper.find(Dialog).prop('open')).toBeFalsy();
        wrapper.setProps({ open: true }, () => {
            expect(wrapper.find(Dialog).prop('open')).toBeTruthy();
        });
    });

    test('should close an opened dialog on the close event', () => {
        const wrapper = muiShallow(<ConfirmationDialog open title='' description='' actions={[]} />);
        expect(wrapper.find(Dialog).prop('open')).toBeTruthy();
        wrapper.simulate('close');
        expect(wrapper.find(Dialog).prop('open')).toBeFalsy();
    });

    test('should remain closed a closed dialog on close event', () => {
        const wrapper = muiShallow(<ConfirmationDialog open={false} title='' description='' actions={[]} />);
        expect(wrapper.find(Dialog).prop('open')).toBeFalsy();
        wrapper.simulate('close');
        expect(wrapper.find(Dialog).prop('open')).toBeFalsy();
    });

    test('should close the dialog on clicking on an action', () => {
        const okAction = { label: 'ok', onClick: jest.fn(() => null) };
        const wrapper = muiShallow(<ConfirmationDialog open title='' description='' actions={[okAction]} />);

        expect(wrapper.find(Dialog).prop('open')).toBeTruthy();
        const actionButtonWrapper = wrapper.find(DialogActions).find(Button);
        actionButtonWrapper.simulate('click');
        wrapper.update();
        expect(wrapper.find(Dialog).prop('open')).toBeFalsy();
    });
});
