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
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';
import UserMenu from 'src/common/UserMenu';
import AuthManager from 'src/auth/utils/AuthManager';
import { muiShallow } from 'test/material-ui-test-utils';

describe('UserMenu', () => {
    test('should render the login button if there is no user session', () => {
        AuthManager.getUser = jest.fn(() => null);
        const wrapper = muiShallow(<UserMenu />).dive();
        expect(wrapper.prop('to')).toEqual('/login?referrer=/');
        expect(wrapper.childAt(0).prop('id')).toEqual('login');
    });

    test('should render the menu with correct username & logout menu item when an user session is present', () => {
        AuthManager.getUser = jest.fn(() => ({ username: 'Foo' }));
        const wrapper = muiShallow(<UserMenu />);

        const menuButtonWrapper = wrapper.find(Button);
        expect(menuButtonWrapper).not.toBe(null);
        expect(menuButtonWrapper.containsMatchingElement(<span>Foo</span>)).toBeTruthy();
    });

    test('should open the user menu upon clicking the user button when an user session is present', () => {
        AuthManager.getUser = jest.fn(() => ({ username: 'Foo' }));
        const wrapper = muiShallow(<UserMenu />);

        wrapper.find(Button).simulate('click', { currentTarget: {} });
        wrapper.update();
        expect(wrapper.find(Popover).prop('open')).toBeTruthy();

        const logoutMenuItemWrapper = wrapper.find(MenuItem);
        expect(logoutMenuItemWrapper.prop('to')).toEqual('/logout');
        expect(logoutMenuItemWrapper.childAt(0).prop('id')).toEqual('logout');
    });
});
