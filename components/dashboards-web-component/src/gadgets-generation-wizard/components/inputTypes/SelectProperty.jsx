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
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

/**
 * Represents a property that allows to input a value through selecting one among the given data
 */
class SelectProperty extends React.Component {
    render() {
        return (
            <SelectField
                floatingLabelText={(this.props.fieldName) ? (this.props.fieldName) : (null)}
                value={this.props.value}
                errorText={this.props.inputHint}
                errorStyle={{ color: '#757575' }}
                onChange={(event, index, value) => this.props.onChange(this.props.id, value)}
                fullWidth={(this.props.fullWidth)}
                style={(this.props.fullWidth) ? (null) : ({ width: this.props.width })}
            >
                {this.props.options.values.map((value, index) =>
                    (
                        <MenuItem
                            key={index}
                            value={value}
                            primaryText={this.props.options.texts[index]}
                        />
                    ))}
            </SelectField>
        );
    }
}

export default SelectProperty;
