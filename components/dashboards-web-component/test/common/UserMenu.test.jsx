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

import { shallow } from 'enzyme';
import React from 'react';
import Link from 'react-router-dom/Link';
import { FlatButton, MenuItem, Popover } from 'material-ui';
import UserMenu from 'src/common/UserMenu';
import AuthManager from 'src/auth/utils/AuthManager';

describe('UserMenu', () => {
    test('should render the login button if there is no user session', () => {
        AuthManager.getUser = jest.fn(() => null);
        const wrapper = shallow(<UserMenu />);
        expect(wrapper.prop('containerElement')).toEqual(<Link to='/login?referrer=/' />);
    });

    test('should render the menu with correct username & logout menu item when an user session is present', () => {
        AuthManager.getUser = jest.fn(() => ({ username: 'Foo' }));
        const wrapper = shallow(<UserMenu />);

        const menuButtonWrapper = wrapper.find(FlatButton);
        expect(menuButtonWrapper).not.toBe(null);
        expect(menuButtonWrapper.prop('label')).toBe('Foo');

        const logoutMenuItemWrapper = wrapper.find(MenuItem);
        expect(logoutMenuItemWrapper.prop('containerElement')).toEqual(<Link to='/logout' />);
    });

    test('should open the user menu upon clicking the user button when an user session is present', () => {
        AuthManager.getUser = jest.fn(() => ({ username: 'Foo' }));
        const wrapper = shallow(<UserMenu />);

        wrapper.find(FlatButton).simulate('click', { preventDefault: () => null });
        wrapper.update();
        expect(wrapper.find(Popover).prop('open')).toBeTruthy();
    });
});
