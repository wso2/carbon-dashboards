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

import React, {Component} from 'react';
// Material UI Components
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
// App Components
import TextProperty from './inputTypes/TextProperty';
import SwitchProperty from './inputTypes/SwitchProperty';
import CodeProperty from './inputTypes/CodeProperty';
// Util Functions
import UtilFunctions from '../utils/UtilFunctions';
// App Constants
import Types from '../utils/Types';
import DynamicQueryComponent from './DynamicQueryComponent';

/**
 * Displays data provider selection, and the properties related to the selected provider type
 */
class ProviderConfigurator extends Component {
    constructor(props) {
        super(props);
        this.state = {
            configuration: props.configuration,
            configRenderTypes: props.configRenderTypes,
        };
    }

    componentWillReceiveProps(props) {
        this.setState({
            configuration: props.configuration,
            configRenderTypes: props.configRenderTypes,
        });
    }

    /**
     * Renders properties from the configuration
     */
    renderProperties() {
        const propertyKeys = [];
        for (const key in this.state.configuration) {
            if (Object.prototype.hasOwnProperty.call(this.state.configuration, key)) {
                propertyKeys.push(key);
            }
        }

        return propertyKeys.map(key => (
            this.renderAsInputField(key, this.state.configRenderTypes[key])
        ));
    }

    /**
     * Returns input fields according to the value provided
     * @param value
     * @param type
     */
    renderAsInputField(value, type) {
        switch (type) {
            case (Types.inputFields.SWITCH):
                return (
                    <div>
                        <br/>
                        <SwitchProperty
                            id={value}
                            value={this.props.configuration[value]}
                            fieldName={UtilFunctions.toSentenceCase(value)}
                            onChange={(id, value) => this.props.handleProviderConfigPropertyChange(id, value)}
                        />
                        <br/>
                    </div>
                );
            case (Types.inputFields.SQL_CODE):
            case (Types.inputFields.SIDDHI_CODE):
                return (
                    <div>
                        <CodeProperty
                            id={value}
                            value={this.props.configuration[value]}
                            fieldName={UtilFunctions.toSentenceCase(value)}
                            mode={(type === Types.inputFields.SQL_CODE) ? 'sql' : 'text'}
                            onChange={(id, value) => this.props.handleProviderConfigPropertyChange(id, value)}
                        />
                        <br/>
                    </div>
                );
            case (Types.inputFields.DYNAMIC_SQL_CODE):
            case (Types.inputFields.DYNAMIC_SIDDHI_CODE):
                return (
                    <DynamicQueryComponent value={this.props.configuration[value].queryFunction}
                                           handleDynamicQuery={this.props.handleDynamicQuery}/>
                );
            default:
                return (
                    <div>
                        <TextProperty
                            id={value}
                            value={this.props.configuration[value]}
                            fieldName={UtilFunctions.toSentenceCase(value)}
                            onChange={(id, value) => this.props.handleProviderConfigPropertyChange(id, value)}
                            number={type === Types.inputFields.NUMBER}
                            multiLine={type === Types.inputFields.TEXT_AREA}
                            fullWidth
                        />
                        <br/>
                    </div>
                );
        }
    }

    render() {
        return (
            <div style={{margin: 10, fontFamily: 'Roboto, sans-serif', color: 'white'}}>
                <SelectField
                    floatingLabelText='Select a data provider type & configure its properties'
                    value={this.props.providerType}
                    onChange={(e, i, v) => this.props.handleProviderTypeChange(v)}
                    fullWidth
                >
                    {this.props.providersList.map(provider => (
                        <MenuItem
                            key={provider}
                            value={provider}
                            primaryText={UtilFunctions.toSentenceCase(provider)}/>
                    ))}
                </SelectField>
                <br/>
                {this.renderProperties()}
            </div>
        );
    }
}

export default ProviderConfigurator;
