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
import PropTypes from 'prop-types';
import _ from 'lodash';

import Checkbox from 'material-ui/Checkbox';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

const labelStyle = {
    fontSize: 12
};

export default class WidgetOptionsConfiguration extends Component {
    constructor(props) {
        super(props);

        this.doesSelectedWidgetHasOptions = this.doesSelectedWidgetHasOptions.bind(this);
        this.getCurrentWidgetOptionsInputs = this.getCurrentWidgetOptionsInputs.bind(this);
        this.state = {};
    }

    doesSelectedWidgetHasOptions() {
        const contentOptions = _.get(this.props.selectedWidget.props, 'configs.options');
        const configurationOptions = _.get(this.props.selectedWidgetConfiguration, 'configs.options');
        return (!_.isEmpty(contentOptions) && !_.isEmpty(configurationOptions));
    }

    getCurrentWidgetOptionsInputs() {
        let CurrentWidgetOptionsInputs = [];
        let options = this.props.selectedWidget.props.configs.options;
        if (options) {
            for (let i = 0; i < options.length; i++) {
                this.state.defaultValue = options[i].defaultValue;
                switch (options[i].type.name.toUpperCase()) {
                    case "TEXT":
                        CurrentWidgetOptionsInputs.push(
                            <div className="options-list">
                                <TextField id={options[i].id}
                                           floatingLabelText={options[i].title}
                                           defaultValue={this.state.options[i].defaultData}
                                           onChange={(event, newValue) => {
                                               event.persist();
                                               this.handleWidgetOptionTextFieldEvent(event, newValue, options)
                                               this.props.setWidgetConfigPanelDirty(true);
                                           }}
                                           name={options[i].title}/>
                            </div>);
                        break;
                    case "ENUM":
                        let items = [];
                        if (options[i].type.possibleValues) {
                            for (let j = 0; j < options[i].type.possibleValues.length; j++) {
                                items.push(
                                    <MenuItem
                                        key={options[i].type.possibleValues[j]} id={options[i].id}
                                        value={options[i].type.possibleValues[j]}
                                        primaryText={options[i].type.possibleValues[j]}
                                    />)
                            }
                        }
                        CurrentWidgetOptionsInputs.push(
                            <div className="options-list">
                                <SelectField
                                    floatingLabelText={options[i].title}
                                    onChange={(event, key, payload,) => {
                                        this.handleWidgetOptionSelectFieldEvent(event, key, payload, options),
                                            this.props.setWidgetConfigPanelDirty(true);
                                    }}
                                    value={this.state.defaultData}
                                    id={options[i].id}
                                    className="options-list">
                                    {items}
                                </SelectField>
                            </div>);
                        break;
                    case "BOOLEAN":
                        CurrentWidgetOptionsInputs.push(
                            <div className="options-list">
                                <Checkbox
                                    id={options[i].id}
                                    label={options[i].title}
                                    labelStyle={labelStyle}
                                    onCheck={(event, isInputChecked) => {
                                        this.handleWidgetOptionCheckBoxEvent(event, isInputChecked, options),
                                            this.props.setWidgetConfigPanelDirty(true);
                                    }}
                                    checked={this.state.defaultData}
                                    className="options-list"
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

    render() {
        if (!this.doesSelectedWidgetHasOptions()) {
            return null;
        }
        return <span>{this.getCurrentWidgetOptionsInputs()}</span>;
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
