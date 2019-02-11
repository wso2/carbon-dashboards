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
import WidgetStoreButton from 'src/common/WidgetButton';
import { muiShallow } from 'test/material-ui-test-utils';

describe('WidgetStoreButton', () => {
    test('should have the correct URL', () => {
        const wrapper = muiShallow(<WidgetStoreButton />).dive();
        console.log('abc', wrapper.debug());
        expect(wrapper.find(Button).prop('to')).toBe('/widgets');
    });

    test('should have the correct message ID', () => {
        const wrapper = muiShallow(<WidgetStoreButton />).dive();
        expect(wrapper.find(Button).find(FormattedMessage).prop('id')).toEqual('widgets.title');
    });
});
