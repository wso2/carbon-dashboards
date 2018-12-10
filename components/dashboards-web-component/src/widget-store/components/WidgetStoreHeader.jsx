/*
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import Header from '../../common/Header';
import UserMenu from '../../common/UserMenu';
import PortalButton from '../../common/PortalButton';

export default class WidgetStoreHeader extends Component {
    render() {
        return (
            <Header
                title={
                    <FormattedMessage
                        id="widget.store.title"
                        defaultMessage="Widget Store"
                    />
                }
                rightElement={
                    this.props.showPortalButton ? (
                        <span>
                            <PortalButton />
                            <UserMenu />
                        </span>
                    ) : (
                        <UserMenu />
                    )
                }
            />
        );
    }
}

WidgetStoreHeader.propTypes = {
    showPortalButton: PropTypes.bool,
};

WidgetStoreHeader.defaultProps = {
    showPortalButton: false,
};
