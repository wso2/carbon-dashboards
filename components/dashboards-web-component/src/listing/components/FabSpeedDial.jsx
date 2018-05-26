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
import { withRouter } from 'react-router-dom';
import { BubbleList, BubbleListItem, SpeedDial } from 'react-speed-dial';
import { Avatar } from 'material-ui';
import { ActionDashboard, DeviceWidgets } from 'material-ui/svg-icons';
import PropTypes from 'prop-types';

class FabSpeedDial extends Component {

    render() {
        const theme = this.props.theme;
        const styles = {
            item: {
                fontFamily: theme.fontFamily,
                color: theme.palette.textColor,
            },
        };

        return (
            <SpeedDial styleBackdrop={{ opacity: 0 }}>
                <BubbleList>
                    <BubbleListItem
                        styleText={styles.item}
                        primaryText={<FormattedMessage id='create.dashboard' defaultMessage='Create Dashboard' />}
                        rightAvatar={<Avatar icon={<ActionDashboard />} />}
                        onClick={() => this.props.history.push('/create')}
                    />
                    <BubbleListItem
                        styleText={styles.item}
                        primaryText={<FormattedMessage id='create.widget' defaultMessage='Create Widget' />}
                        rightAvatar={<Avatar icon={<DeviceWidgets />} />}
                        onClick={() => this.props.history.push('/createGadget')}
                    />
                </BubbleList>
            </SpeedDial>
        );
    }
}

FabSpeedDial.propTypes = {
    history: PropTypes.shape({}).isRequired,
};

export default withRouter(FabSpeedDial);
