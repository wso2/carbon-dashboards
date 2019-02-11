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
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Header from 'src/common/Header';
import WidgetStoreButton from 'src/common/WidgetButton';
import PortalButton from 'src/common/PortalButton';
import UserMenu from 'src/common/UserMenu';
import { muiShallow } from 'test/material-ui-test-utils';

describe('Header', () => {
    test('should correctly place passed logo, title, extraRightElement props', () => {
        const logo = <img src='' alt='logo' />;
        const title = 'Some Title';
        const extraRightElement = <div>More</div>;
        const wrapper = muiShallow(<Header logo={logo} title={title} extraRightElement={extraRightElement} />).dive();
        const toolbarWrapper = wrapper.find(Toolbar);
        expect(toolbarWrapper.childAt(0).equals(logo)).toBeTruthy();
        expect(toolbarWrapper.childAt(1).is(Typography)).toBeTruthy();
        expect(toolbarWrapper.childAt(1).render().text()).toBe(title);
        expect(toolbarWrapper.childAt(2).equals(extraRightElement)).toBeTruthy();
    });

    test('should render widget store button, portal button, and the user menu in correct order', () => {
        const wrapper = muiShallow(<Header showWidgetStoreButton showPortalButton showUserMenu />).dive();
        const toolbarWrapper = wrapper.find(Toolbar);
        expect(toolbarWrapper.childAt(2).is(WidgetStoreButton)).toBeTruthy();
        expect(toolbarWrapper.childAt(3).is(PortalButton)).toBeTruthy();
        expect(toolbarWrapper.childAt(4).is(UserMenu)).toBeTruthy();
    });
});
