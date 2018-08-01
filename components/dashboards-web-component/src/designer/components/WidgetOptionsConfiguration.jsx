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

import React, {Component} from 'react';

import {FormattedMessage} from 'react-intl';

import PropTypes from 'prop-types';
import _ from 'lodash';
import {Card, CardHeader, CardText, Checkbox, MenuItem, SelectField, TextField} from 'material-ui';

const labelStyle = {
    fontSize: 12,
};

export default class WidgetOptionsConfiguration extends Component {
    constructor(props) {
        super(props);
        this.doesSelectedWidgetHasOptions = this.doesSelectedWidgetHasOptions.bind(this);
        this.getCurrentWidgetOptionsInputs = this.getCurrentWidgetOptionsInputs.bind(this);
        this.handleWidgetOutput = this.handleWidgetOutput.bind(this);
        this.state = {
            options: props.selectedWidget.props.configs.options,
        };
    }

    componentWillReceiveProps(props) {
        this.state.options = props.selectedWidget.props.configs.options;
    }

    getCurrentWidgetOptionsInputs() {
        const CurrentWidgetOptionsInputs = [];
        const options = this.props.selectedWidgetConfiguration.configs.options;
        if (options) {
            for (let i = 0; i < options.length; i++) {
                const value = this.state.options[options[i].id] || '';
                const currentOption = options[i].type.name.toUpperCase();
                switch (currentOption) {
                    case 'TEXT':
                        CurrentWidgetOptionsInputs.push(
                            <div>
                                <TextField
                                    id={options[i].id}
                                    floatingLabelText={options[i].title}
                                    value={value}
                                    onChange={(event, newValue) => {
                                        this.handleWidgetOutput(options[i].id, newValue, options[i].defaultValue);
                                    }}
                                    name={options[i].title}
                                />
                            </div>);
                        break;
                    case 'ENUM':
                        const items = [];
                        if (options[i].type.possibleValues) {
                            for (let j = 0; j < options[i].type.possibleValues.length; j++) {
                                items.push(
                                    <MenuItem
                                        key={options[i].type.possibleValues[j]}
                                        id={options[i].id}
                                        value={options[i].type.possibleValues[j]}
                                        primaryText={options[i].type.possibleValues[j]}
                                    />);
                            }
                        }
                        CurrentWidgetOptionsInputs.push(
                            <div>
                                <SelectField
                                    floatingLabelText={options[i].title}
                                    onChange={(event, key, payload) => {
                                        this.handleWidgetOutput(options[i].id, payload, options[i].defaultValue);
                                    }}
                                    value={value}
                                    multiple={!!options[i].type.multiple}
                                    id={options[i].id}
                                >
                                    {items}
                                </SelectField>
                            </div>);
                        break;
                    case 'BOOLEAN':
                        CurrentWidgetOptionsInputs.push(
                            <div>
                                <Checkbox
                                    id={options[i].id}
                                    label={options[i].title}
                                    labelStyle={labelStyle}
                                    onCheck={(event, isInputChecked) => {
                                        this.handleWidgetOutput(options[i].id, isInputChecked, options[i].defaultValue);
                                    }}
                                    checked={value}
                                />
                            </div>);
                        break;
                    default :
                        break;
                }
            }
        }

        return CurrentWidgetOptionsInputs;
    }

    doesSelectedWidgetHasOptions() {
        const configurationOptions = _.get(this.props.selectedWidgetConfiguration, 'configs.options');
        return (!_.isEmpty(configurationOptions));
    }

    handleWidgetOutput(optionId, optionValue, defaultValue) {
        const options = this.props.selectedWidget.props.configs.options;
        options[optionId] = optionValue == null ? defaultValue : optionValue;
        this.setState({ options });
    }

    render() {
        if (!this.doesSelectedWidgetHasOptions()) {
            return null;
        }

        return (<Card style={{ margin: 10 }} initiallyExpanded>
            <CardHeader
                title={<FormattedMessage id='widget-configuration.options.title' defaultMessage='Options' />}
                style={{ paddingBottom: 0 }}
                actAsExpander={false}
                showExpandableButton={false}
            />
            <CardText expandable>
                {this.getCurrentWidgetOptionsInputs()}
            </CardText>
        </Card>);
    }
}

WidgetOptionsConfiguration.propTypes = {
    selectedWidget: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        className: PropTypes.string.isRequired,
        props: PropTypes.shape({}).isRequired,
    }).isRequired,
    selectedWidgetConfiguration: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        configs: PropTypes.shape({}).isRequired,
    }).isRequired,
};
