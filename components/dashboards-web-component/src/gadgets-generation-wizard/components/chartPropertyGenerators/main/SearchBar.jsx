/*
 *  Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import SwitchProperty from '../../inputTypes/SwitchProperty';
import StreamProperty from '../../inputTypes/StreamProperty';

/**
 * Represents a search bar
 */
class SearchBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            configuration: props.configuration,
            expandAdvanced: false,
        };
    }

    /**
     * Assigns value for the search bar's property, that has the given key
     * @param key
     * @param value
     */
    handleChartPropertyChange(key, value) {
        const state = this.state;
        state.configuration.charts[0][key] = value;
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    render() {
        return (
            <div>
                <StreamProperty
                    id="column"
                    value={this.state.configuration.charts[0].column}
                    fieldName="Column name*"
                    onChange={(id, value) => this.handleChartPropertyChange(id, value)}
                    metadata={this.props.metadata}
                    fullWidth
                />
                <br />
                <br />
                <SwitchProperty
                    id="selectMultiple"
                    value={this.state.configuration.charts[0].selectMultiple}
                    fieldName="Select Multiple"
                    onChange={(id, value) => this.handleChartPropertyChange(id, value)}
                />
                <br />
                <br />
            </div>
        );
    }
}

export default SearchBar;
