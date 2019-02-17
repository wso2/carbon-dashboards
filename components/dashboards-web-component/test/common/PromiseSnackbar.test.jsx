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
import Snackbar from '@material-ui/core/Snackbar';
import PromiseSnackbar from 'src/common/PromiseSnackbar';
import { MockPromise, muiShallow } from 'test/material-ui-test-utils';


describe('PromiseSnackbar', () => {
    const promiseSupplier = jest.fn();
    const successMessage = 'Success';
    const failureMessage = 'Failure';
    const onSuccess = jest.fn();
    const onFailure = jest.fn();

    afterEach(() => {
        promiseSupplier.mockReset();
        onSuccess.mockClear();
        onFailure.mockClear();
    });

    test('should show the success message when the promise resolves', () => {
        promiseSupplier.mockReturnValue(MockPromise.resolve());
        const wrapper = muiShallow(<PromiseSnackbar
            promiseSupplier={promiseSupplier}
            successMessage={successMessage}
            failureMessage={failureMessage}
            onSuccess={onSuccess}
            onFailure={onFailure}
        />);

        expect(promiseSupplier).toHaveBeenCalledTimes(1);
        const snackbarWrapper = wrapper.find(Snackbar);
        expect(snackbarWrapper.exists()).toBeTruthy();
        expect(snackbarWrapper.prop('message')).toBe(successMessage);
        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(onFailure).not.toHaveBeenCalled();
    });

    test('should show the success message when the promise rejects', () => {
        promiseSupplier.mockReturnValue(MockPromise.reject());
        const wrapper = muiShallow(
            <PromiseSnackbar
                promiseSupplier={promiseSupplier}
                successMessage={successMessage}
                failureMessage={failureMessage}
                onSuccess={onSuccess}
                onFailure={onFailure}
            />,
        );

        expect(promiseSupplier).toHaveBeenCalledTimes(1);
        const snackbarWrapper = wrapper.find(Snackbar);
        expect(snackbarWrapper.exists()).toBeTruthy();
        expect(snackbarWrapper.prop('message')).toBe(failureMessage);
        expect(onSuccess).not.toHaveBeenCalled();
        expect(onFailure).toHaveBeenCalledTimes(1);
    });
});
