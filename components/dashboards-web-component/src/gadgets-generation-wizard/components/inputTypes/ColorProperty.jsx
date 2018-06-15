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

import React, { Component } from 'react';
import { ChromePicker } from 'react-color';
// Material UI Components
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import PaletteButton from 'material-ui/svg-icons/image/palette';
import PreviewColorButton from 'material-ui/svg-icons/av/fiber-manual-record';

/**
 * Represents a property that allows to input a value through picking / entering a color
 */
class ColorProperty extends Component {
    constructor(props) {
        super(props);
        this.state = {
            displayColorPicker: false,
            color: this.props.value,
        };
    }

    /**
     * Toggles display state of the color picker
     */
    toggleColorPickerDisplay() {
        this.setState({ displayColorPicker: !this.state.displayColorPicker });
    }

    /**
     * Closes the color picker
     */
    closeColorPicker() {
        this.setState({ displayColorPicker: false });
    }

    render() {
        const popover = {
            position: 'absolute',
            zIndex: '2',
        };
        const cover = {
            position: 'fixed',
            top: '0px',
            right: '0px',
            bottom: '0px',
            left: '0px',
        };
        const textFieldFullWidthRatio = 0.85;
        let textFieldWidth = 300;
        if (this.props.fullWidth) {
            textFieldWidth = (100 * textFieldFullWidthRatio) + '%';
        } else if (this.props.width) {
            textFieldWidth = (this.props.width * textFieldFullWidthRatio);
        }

        return (
            <div>
                <TextField
                    id={this.props.id}
                    name={this.props.id}
                    errorText={this.props.inputHint}
                    floatingLabelFocusStyle={{ color: '#0097a7' }}
                    errorStyle={{ color: '#757575' }}
                    floatingLabelText={(this.props.fieldName) ? (this.props.fieldName) : (null)}
                    value={this.props.value}
                    onChange={e => this.props.onChange(this.props.id, e.target.value)}
                    // style={{width: '92%'}}
                    style={{ width: textFieldWidth }}
                />
                <PreviewColorButton color={this.props.value} />
                <IconButton onClick={() => this.toggleColorPickerDisplay()}>
                    <PaletteButton />
                </IconButton>
                { (this.state.displayColorPicker) ?
                    (<div style={popover}>
                        <div style={cover} onClick={() => this.closeColorPicker()} />
                        <ChromePicker
                            color={this.props.value}
                            onChangeComplete={color => this.props.onChange(this.props.id, color.hex)}
                        />
                    </div>) : (null) }
            </div>
        );
    }
}

export default ColorProperty;
