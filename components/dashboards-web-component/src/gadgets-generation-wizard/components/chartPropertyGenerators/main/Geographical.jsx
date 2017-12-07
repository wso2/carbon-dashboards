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
// Material UI Components
import FlatButton from 'material-ui/FlatButton';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import AddButton from 'material-ui/svg-icons/content/add';
import ClearButton from 'material-ui/svg-icons/content/clear';
// App Components
import TextProperty from '../../inputTypes/TextProperty';
import SelectProperty from '../../inputTypes/SelectProperty';
import ColorProperty from '../../inputTypes/ColorProperty';
import StreamProperty from '../../inputTypes/StreamProperty';
// App Utilities
import Types from '../../../utils/Types';
import Constants from '../../../utils/Constants';

/**
 * Represents a Geographical chart
 */
class Geographical extends Component {
    constructor(props) {
        super(props);
        this.state = {
            configuration: props.configuration,
        };
    }

    /**
     * Assigns value for the main chart's main property, that has the given key
     * @param key
     * @param value
     */
    handleMainPropertyChange(key, value) {
        const state = this.state;
        state.configuration[key] = value;
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    /**
     * Assigns value for the property that has the given key, and exists under the sub chart
     * @param key
     * @param value
     */
    handleSubChartPropertyChange(key, value) {
        const state = this.state;
        state.configuration.charts[0][key] = value;
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    /**
     * Adds an empty color scale member
     */
    addColorScaleMember() {
        const state = this.state;
        state.configuration.charts[0].colorScale.push('');
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    /**
     * Assigns changed value of a color scale member denoted with the given index, belonging to the sub chart with
     * the given index
     * @param memberIndex
     * @param value
     */
    handleColorScaleMemberChange(memberIndex, value) {
        const state = this.state;
        state.configuration.charts[0].colorScale[memberIndex] = value;
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    /**
     * Removes the color member that has the given index
     * @param colorMemberIndex
     */
    removeColorScaleMember(colorMemberIndex) {
        const state = this.state;
        state.configuration.charts[0].colorScale.splice(colorMemberIndex, 1);
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    render() {
        return (
            <div>
                <StreamProperty
                    id="x"
                    value={this.state.configuration.x}
                    fieldName="Field values to be plotted in the choropleth"
                    filter={Types.dataset.metadata.linear}
                    onChange={(id, value) => this.handleMainPropertyChange(id, value)}
                    metadata={this.props.metadata}
                    fullWidth
                />
                <br />
                <StreamProperty
                    id="y"
                    value={this.state.configuration.charts[0].y}
                    fieldName="Field values to be plotted in the map"
                    onChange={(id, value) => this.handleSubChartPropertyChange(id, value)}
                    metadata={this.props.metadata}
                    fullWidth
                />
                <br />
                <SelectProperty
                    id="mapType"
                    value={this.props.configuration.charts[0].mapType}
                    fieldName="Type of the map"
                    onChange={(id, value) => this.handleSubChartPropertyChange(id, value)}
                    options={{
                        values: [Types.chart.world, Types.chart.europe, Types.chart.usa],
                        texts: [Constants.CHART_NAMES.WORLD_MAP, Constants.CHART_NAMES.EUROPE_MAP,
                            Constants.CHART_NAMES.USA_MAP],
                    }}
                    fullWidth
                />
                <br />
                <br />
                <br />
                <br />
                <a>Color set to use in the charts</a>
                {(this.props.configuration.charts[0].colorScale.length === 0) ?
                    (
                        <a>
                            &nbsp; &nbsp;
                            <FlatButton
                                primary
                                label="Default"
                                onClick={() => this.addColorScaleMember()}
                            />
                        </a>
                    ) : (null)}
                <Table>
                    <TableBody displayRowCheckbox={false}>
                        {this.props.configuration.charts[0].colorScale.map((color, index) =>
                            (<TableRow key={index}>
                                <TableRowColumn>
                                    <ColorProperty
                                        id={'colorScale' + index}
                                        value={color}
                                        onChange={(id, value) =>
                                            this.handleColorScaleMemberChange(index, value)}
                                    />
                                </TableRowColumn>
                                <TableRowColumn>
                                    <IconButton onClick={() =>
                                        this.removeColorScaleMember(index)}
                                    >
                                        <ClearButton />
                                    </IconButton>
                                </TableRowColumn>
                            </TableRow>))}
                    </TableBody>
                </Table>
                <br />
                {(this.props.configuration.charts[0].colorScale.length !== 0) ?
                    (<div>
                        <IconButton onClick={() => this.addColorScaleMember()}>
                            <AddButton />
                        </IconButton>
                        <br />
                    </div>) : (null)}

                <TextProperty
                    id="height"
                    value={this.state.configuration.height}
                    fieldName="Height of the chart (in pixels)"
                    onChange={(id, value) => this.handleMainPropertyChange(id, value)}
                    number
                    fullWidth
                />
                <br />
                <TextProperty
                    id="width"
                    value={this.state.configuration.width}
                    fieldName="Width of the chart (in pixels)"
                    onChange={(id, value) => this.handleMainPropertyChange(id, value)}
                    number
                    fullWidth
                />
                <br />
            </div>
        );
    }
}

export default Geographical;
