/*
 *  Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */

import React from 'react';
// Material UI Components
import Toggle from 'material-ui/Toggle';

/**
 * Represents a property that allows to toggle a boolean state
 */
class SwitchProperty extends React.Component {
    render() {
        return (
            <div style={{ width: this.props.width }}>
                <Toggle
                    label={this.props.fieldName}
                    onToggle={(e, checked) => this.props.onChange(this.props.id, checked)}
                    toggled={(this.props.value)}
                />
            </div>
        );
    }
}

export default SwitchProperty;
