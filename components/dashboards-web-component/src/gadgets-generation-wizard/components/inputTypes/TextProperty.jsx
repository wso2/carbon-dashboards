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
import TextField from 'material-ui/TextField';

/**
 * Represents a property that refers to given meta data from stream, for its value
 */
class TextProperty extends React.Component {

    /**
     * Returns value as a number, when a number has been entered with number mode enabled
     * @param value
     */
    convertValue(value) {
        if (value === '') {
            return value; // To prevent 0 being replaced when erasing until blank
        }
        if (this.props.number) {
            return Number(value);
        }
        return value;
    }

    render() {
        return (
            <TextField
                id={this.props.id}
                name={this.props.id}
                errorText={this.props.inputHint}
                errorStyle={{ color: '#757575' }}
                floatingLabelFocusStyle={{ color: '#0097a7' }}
                floatingLabelText={(this.props.fieldName) ? (this.props.fieldName) : (null)}
                type={this.props.number ? 'number' : 'text'}
                value={this.props.value}
                onChange={e => this.props.onChange(this.props.id, this.convertValue(e.target.value))}
                fullWidth={this.props.fullWidth}
                multiLine={this.props.multiline}
                style={(this.props.fullWidth) ? (null) : ({ width: this.props.width })}
            />
        );
    }
}

export default TextProperty;
