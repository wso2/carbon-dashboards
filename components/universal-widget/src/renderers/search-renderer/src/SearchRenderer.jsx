/*
*  Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*  http://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License.
*/

import React, {Component} from 'react';
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import Popper from '@material-ui/core/Popper';
import Paper from '@material-ui/core/Paper';
import Select from 'react-select';
import JssProvider from 'react-jss/lib/JssProvider';

// //This is the workaround suggested in https://github.com/marmelab/react-admin/issues/1782
const escapeRegex = /([[\].#*$><+~=|^:(),"'`\s])/g;
let classCounter = 0;

export const generateClassName = (rule, styleSheet) => {
    classCounter += 1;

    if (process.env.NODE_ENV === 'production') {
        return `c${classCounter}`;
    }

    if (styleSheet && styleSheet.options.classNamePrefix) {
        let prefix = styleSheet.options.classNamePrefix;
        // Sanitize the string as will be used to prefix the generated class name.
        prefix = prefix.replace(escapeRegex, '-');

        if (prefix.match(/^Mui/)) {
            return `${prefix}-${rule.key}`;
        }

        return `${prefix}-${rule.key}-${classCounter}`;
    }

    return `${rule.key}-${classCounter}`;
};


const darkTheme = createMuiTheme({
    palette: {
        type: 'dark'
    }
});

const lightTheme = createMuiTheme({
    palette: {
        type: 'light'
    }
});

let popperAnchor = null;
let textInputElement = null;
let openPopper = false;

// the following functions are used to create an autocomplete using react-select
// refer : https://v1-5-0.material-ui.com/demos/autocomplete/
const NoOptionsMessage = function (props) {
    return (
        <Typography
            style={{
                padding: 15,
                color: '#7e7e7e'
            }}
            {...props.innerProps}>
            {props.children}
        </Typography>
    );
};

const inputComponent = function ({inputRef, ...props}) {
    return <div
        ref={inputRef}
        {...props}/>;
};

const Control = function (props) {
    openPopper = props.selectProps.menuIsOpen;
    return (
        <TextField
            id={popperAnchor}
            fullWidth={true}
            InputProps={{
                inputComponent,
                inputProps: {
                    inputRef: props.innerRef,
                    children: props.children,
                    ...props.innerProps,
                    style:{display:'flex'}
                },
            }}
            {...props.selectProps.textFieldProps}
        />
    );
};

const Option = function (props) {
    return (
        <MenuItem
            buttonRef={props.innerRef}
            selected={props.isFocused}
            component='div'
            style={{fontWeight: props.isSelected ? 500 : 400}}
            {...props.innerProps}>
            {props.children}
        </MenuItem>
    );
};

const Placeholder = function (props) {
    return (
        <Typography
            style={{
                position: 'absolute',
                left: 2,
                fontSize: '90%',
                color: '#7e7e7e'
            }}
            {...props.innerProps}>
            {props.children}
        </Typography>
    );
};

const SingleValue = function (props) {
    return (
        <Typography
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                color: 'white',
                fontSize: '95%'
            }}
            {...props.innerProps}>
            {props.children}
        </Typography>
    );
};

const ValueContainer = function (props) {
    return (
        <div
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                flex: 1,
                alignItems: 'center',
            }}>
            {props.children}
        </div>);
};

const MultiValue = function (props) {
    return (
        <Chip
            tabIndex={-1}
            label={props.children}
            onDelete={event => {
                props.removeProps.onClick();
                props.removeProps.onMouseDown(event);
            }}
            style={{
                borderRadius: 15,
                display: 'flex',
                flexWrap: 'wrap',
                fontSize: '90%',
                overflow: 'hidden',
                paddingLeft: 6,
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                minWidth: '20',
                margin: 2
            }}/>
    );
};

const Menu = function (props) {
    popperAnchor = 'popper-anchor-generic-search-' + props.selectProps.id;
    let popperNode = document.getElementById(popperAnchor);
    return (
        <Popper
            open={openPopper}
            anchorEl={popperNode}
            style={{zIndex:10000}}>
            <Paper
                square
                style={{
                    width: popperNode ?
                        popperNode.clientWidth :
                        document.getElementById(props.selectProps.id).clientWidth}}
                {...props.innerProps}>
                {props.children}
            </Paper>
        </Popper>
    );
};

const components = {
    Option,
    Control,
    NoOptionsMessage,
    Placeholder,
    SingleValue,
    MultiValue,
    ValueContainer,
    Menu,
};

export default class SearchRenderer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.id,
            width: this.props.width,
            height: this.props.height,
            columnIndex: this.props.metadata.names.indexOf(this.props.config.charts[0].column),
            options: [],
            availableOptions: [],
            selectedOptions: null,
            faultyProviderConf: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleDataReceived = this.handleDataReceived.bind(this);
        this.naturalSortComparator = this.naturalSortComparator.bind(this);
        this.publish = this.publish.bind(this);
        this.updateStyleColor = this.updateStyleColor.bind(this);
        this.updateTextBoxColor = this.updateTextBoxColor.bind(this);
        this.setupPopperAnchorID = this.setupPopperAnchorID.bind(this);
    }

    componentWillReceiveProps(props) {
        this.handleDataReceived(props.data);
    }

    /**
     * Publish selection
     * */
    publish() {
        if(this.props.config.widgetOutputConfigs
            && this.state.selectedOptions) {
            const { onClick } = this.props;
            const data = {};
            const selectedOptions = [];
            this.state.selectedOptions.map(selection => { selectedOptions.push(selection.value) });
            data[this.props.config.widgetOutputConfigs[0].publishingValue] = selectedOptions;
            return onClick && onClick(data);
        }
    }

    /**
     * Create select options from data received
     * */
    handleDataReceived(data) {
        let options = [], availableOptions;

        if(this.state.options.length > 0) {
            options = this.state.options;
        }
        data.forEach(dataUnit => {
            const data = dataUnit[this.state.columnIndex];
            if(options.indexOf(data) === -1) {
                options.push(data);
            }
        });
        options.sort(this.naturalSortComparator);

        availableOptions = options.map(option => ({
            value: option,
            label: option,
            disabled: false
        }));

        this.setState({
            options: options,
            availableOptions: availableOptions,
        });
    }

    /**
     * Sort the options in asc order
     * */
    naturalSortComparator(a, b) {
        if(typeof a === "number" && typeof b === "number") {
            return a-b;
        } else {
            // used to sort alphanumeric combinations
            let ax = [], bx = [];

            a.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
            b.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });

            while(ax.length && bx.length) {
                let an = ax.shift();
                let bn = bx.shift();
                let nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
                if(nn) return nn;
            }

            return ax.length - bx.length;
        }
    }

    /**
     * Handle change in option(s) selected
     * */
    handleChange(values) {
        let options = this.state.options;
        let updatedOptions;
        let selectedValues = [];

        if (this.props.config.charts[0].selectMultiple) {
            selectedValues = values;
        } else {
            if(values.length === 0) {
                selectedValues = values;
            } else {
                selectedValues[0] = values;
            }
        }

        updatedOptions = options.map(option => ({
            value: option,
            label: option,
            disabled: false
        }));
        this.setState({
            selectedOptions: selectedValues,
            availableOptions: updatedOptions
        }, this.publish);
    };

    /**
     * Introduce color to an existing styles element
     * */
    updateStyleColor(existingStyles, color) {
        let result = '';
        existingStyles.split(';').forEach((item) => {
            if (item.length > 0) {
                const itemPair = item.split(':');
                if (itemPair[0].trim() !== 'color') {
                    result = result + itemPair[0] + ': ' + itemPair[1] + ';'
                } else {
                    result = result + 'color: ' + color + ';'
                }
            }
        });
        return result;
    }

    /**
     * Update text color of text box of autocomplete
     * */
    updateTextBoxColor() {
        if (textInputElement
            && document.querySelector(textInputElement)) {
            const inputElm = document.querySelector(textInputElement);
            inputElm.style =
                this.updateStyleColor(inputElm.getAttribute('style'), this.props.theme.palette.textColor);
        }
    }

    /**
     * Create popper anchors for select
     * */
    setupPopperAnchorID(id) {
        popperAnchor = 'popper-anchor-generic-search-' + id;
        textInputElement = '#' + popperAnchor + ' div div div input';
    }

    render() {
        this.updateTextBoxColor();
        this.setupPopperAnchorID(this.state.id);
        return (
            <JssProvider
                generateClassName={generateClassName}>
                <MuiThemeProvider
                    theme={this.props.theme.name === 'dark' ? darkTheme : lightTheme}>
                    <div
                        style={{
                            paddingLeft: 24,
                            paddingRight: 16
                        }}>
                        <Select
                            id={this.state.id}
                            className='autocomplete'
                            classNamePrefix='autocomplete'
                            textFieldProps={{
                                label: '',
                                InputLabelProps: {
                                    shrink: false,
                                },
                            }}
                            options={this.state.availableOptions}
                            components={components}
                            value={this.state.selectedOptions}
                            onChange={this.handleChange}
                            placeholder='Select option'
                            isMulti={this.props.config.charts[0].selectMultiple}
                        />
                    </div>
                </MuiThemeProvider>
            </JssProvider>
        );
    }
}
