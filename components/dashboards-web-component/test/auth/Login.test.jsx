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
import Redirect from 'react-router-dom/Redirect';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Snackbar from '@material-ui/core/Snackbar';
import AuthManager from 'src/auth/utils/AuthManager';
import Login from 'src/auth/Login';
import { MockPromise, muiShallow } from 'test/material-ui-test-utils';

describe('Login', () => {
    describe('when user is already authenticated', () => {
        beforeAll(() => {
            AuthManager.getUser = jest.fn(() => ({ username: 'Foo' }));
        });

        test('should redirect to / if query string is null', () => {
            const wrapper = muiShallow(<Login location={{ search: null }} />).dive();
            expect(wrapper.is(Redirect)).toBeTruthy();
            expect(wrapper.prop('to')).toBe('/');
        });

        test('should redirect to / if query string is empty', () => {
            const wrapper = muiShallow(<Login location={{ search: '' }} />).dive();
            expect(wrapper.is(Redirect)).toBeTruthy();
            expect(wrapper.prop('to')).toBe('/');
        });

        test('should redirect to / if there are no query params', () => {
            const wrapper = muiShallow(<Login location={{ search: '?' }} />).dive();
            expect(wrapper.is(Redirect)).toBeTruthy();
            expect(wrapper.prop('to')).toBe('/');
        });

        test('should redirect to / if referrer query param is empty', () => {
            const wrapper = muiShallow(<Login location={{ search: '?referrer' }} />).dive();
            expect(wrapper.is(Redirect)).toBeTruthy();
            expect(wrapper.prop('to')).toBe('/');
        });

        test('should redirect to / if referrer query param is /', () => {
            const wrapper = muiShallow(<Login location={{ search: '?referrer=/' }} />).dive();
            expect(wrapper.is(Redirect)).toBeTruthy();
            expect(wrapper.prop('to')).toBe('/');
        });

        test('should redirect to /foo if referrer query param is /foo', () => {
            const wrapper = muiShallow(<Login location={{ search: 'referrer=/foo' }} />).dive();
            expect(wrapper.is(Redirect)).toBeTruthy();
            expect(wrapper.prop('to')).toBe('/foo');
        });

        test('should redirect to / if referrer query param is /portal', () => {
            const wrapper = muiShallow(<Login location={{ search: 'referrer=/portal' }} />).dive();
            expect(wrapper.is(Redirect)).toBeTruthy();
            expect(wrapper.prop('to')).toBe('/');
        });

        test('should redirect to / if referrer query param is /portal/', () => {
            const wrapper = muiShallow(<Login location={{ search: 'referrer=/portal/' }} />).dive();
            expect(wrapper.is(Redirect)).toBeTruthy();
            expect(wrapper.prop('to')).toBe('/');
        });

        test('should redirect to /foo if referrer query param is /portal/foo', () => {
            const wrapper = muiShallow(<Login location={{ search: 'referrer=/portal/foo' }} />).dive();
            expect(wrapper.is(Redirect)).toBeTruthy();
            expect(wrapper.prop('to')).toBe('/foo');
        });
    });

    describe('when user enters credentials', () => {
        beforeAll(() => {
            AuthManager.getUser = jest.fn(() => null);
        });

        test('should not be able to click Login button unless both username & password is entered', () => {
            const wrapper = muiShallow(<Login location={{ search: '?referrer=/' }} />).dive();
            const usernameWrapper = wrapper.find(TextField).find({ name: 'username' });
            const passwordWrapper = wrapper.find(TextField).find({ name: 'password' });

            usernameWrapper.simulate('change', { target: { value: 'admin' } });
            wrapper.update();
            expect(wrapper.find(Button).first().prop('disabled')).toBeTruthy();

            passwordWrapper.simulate('change', { target: { value: 'admin' } });
            wrapper.update();
            expect(wrapper.find(Button).first().prop('disabled')).toBeFalsy();
        });

        test('should redirect to referrer when correct username, password entered', () => {
            const wrapper = muiShallow(<Login location={{ search: '?referrer=/' }} />).dive();
            AuthManager.authenticate = jest.fn((username, password, rememberMe) => {
                return MockPromise.resolve((resolve) => {
                    if (username === 'admin' && password === 'admin') {
                        resolve();
                    }
                });
            });

            wrapper.find(TextField).find({ name: 'username' }).simulate('change', { target: { value: 'admin' } });
            wrapper.find(TextField).find({ name: 'password' }).simulate('change', { target: { value: 'admin' } });
            wrapper.find('form').first().simulate('submit', { preventDefault: () => null });
            wrapper.update();

            expect(wrapper.is(Redirect)).toBeTruthy();
            expect(wrapper.prop('to')).toBe('/');
        });

        test('should show an error if authentication fails', () => {
            const wrapper = muiShallow(<Login location={{ search: '?referrer=/' }} />).dive();
            AuthManager.authenticate = jest.fn((username, password, rememberMe) => {
                return MockPromise.reject((reject) => {
                    reject({ response: { status: 401 } });
                });
            });

            wrapper.find(TextField).find({ name: 'username' }).simulate('change', { target: { value: 'admin' } });
            wrapper.find(TextField).find({ name: 'password' }).simulate('change', { target: { value: 'admin' } });
            wrapper.find('form').first().simulate('submit', { preventDefault: () => null });
            wrapper.update();

            const snackbarWrapper = wrapper.find(Snackbar);
            expect(snackbarWrapper.prop('open')).toBeTruthy();
            expect(snackbarWrapper.prop('message'))
                .toEqual(<FormattedMessage id='login.error.credentials' defaultMessage='Invalid username/password' />);
        });
    });
});
