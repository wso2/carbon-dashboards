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
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { AppBar } from 'material-ui';
import PropTypes from 'prop-types';
import UserMenu from '../../common/UserMenu';

class Header extends Component {

    render() {
        return (
            <AppBar
                style={{ zIndex: this.props.theme.zIndex.drawer + 100 }}
                title={<FormattedMessage id='portal.title' defaultMessage='Portal' />}
                zDepth={2}
                iconElementLeft={
                    <Link to={'/'}>
                        <img
                            height='28'
                            style={{ marginTop: 10 }}
                            src={`${window.contextPath}/public/app/images/logo.svg`}
                            alt='logo'
                        />
                    </Link>
                }
                iconElementRight={<UserMenu />}
            />
        );
    }
}

Header.propTypes = {
    theme: PropTypes.shape({}).isRequired,
};

export default Header;
