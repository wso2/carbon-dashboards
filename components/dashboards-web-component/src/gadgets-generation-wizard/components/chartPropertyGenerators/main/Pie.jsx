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
import { Card } from 'material-ui/Card';
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
 * Represents a Pie chart
 */
class Pie extends Component {
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
    handleChartPropertyChange(key, value) {
        const state = this.state;
        state.configuration[key] = value;
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    /**
     * Assigns value for the main chart's style property, that has the given key
     * @param key
     * @param value
     */
    handleChartStylePropertyChange(key, value) {
        const state = this.state;
        state.configuration.style[key] = value;
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    /**
     * Assigns value for the property with the given key, under the charts array
     * @param key
     * @param value
     */
    handleInnerChartPropertyChange(key, value) {
        const state = this.state;
        state.configuration.charts[0][key] = value;
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    /**
     * Adds an empty color member
     * @param parentName
     * @param subChartIndex
     */
    addColorMember(parentName) {
        const state = this.state;
        state.configuration.charts[0][parentName].push('');
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    /**
     * Assigns changed value of a color member denoted with the given index, belonging to the sub chart with
     * the given index
     * @param parentName
     * @param memberIndex
     * @param value
     */
    handleColorMemberChange(parentName, memberIndex, value) {
        const state = this.state;
        state.configuration.charts[0][parentName][memberIndex] = value;
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    /**
     * Removes the color member that has the given index
     * @param parentName
     * @param colorMemberIndex
     */
    removeColorMember(parentName, colorMemberIndex) {
        const state = this.state;
        state.configuration.charts[0][parentName].splice(colorMemberIndex, 1);
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    render() {
        return (
            <div>
                <StreamProperty
                    id="x"
                    value={this.state.configuration.charts[0].x}
                    fieldName="Data field"
                    filter={Types.dataset.metadata.linear}
                    onChange={(id, value) => this.handleInnerChartPropertyChange(id, value)}
                    metadata={this.props.metadata}
                    fullWidth
                />
                <br />
                <SelectProperty
                    id="chartType"
                    value={this.state.configuration.chartType}
                    fieldName="Type of the chart"
                    options={{
                        values: [Types.chart.pie, Types.chart.donut, Types.chart.gauge],
                        texts: [Constants.CHART_NAMES.PIE_CHART, Constants.CHART_NAMES.DONUT_CHART,
                            Constants.CHART_NAMES.GAUGE_CHART],
                    }}
                    onChange={(id, value) => this.handleChartPropertyChange(id, value)}
                    fullWidth
                />
                <br />
                <StreamProperty
                    id="color"
                    value={this.props.configuration.charts[0].color}
                    fieldName="Field to color categorize"
                    filter={Types.dataset.metadata.ordinal}
                    onChange={(id, value) => this.handleInnerChartPropertyChange(id, value)}
                    metadata={this.props.metadata}
                    fullWidth
                />
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
                                onClick={() => this.addColorMember('colorScale')}
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
                                            this.handleColorMemberChange('colorScale', index, value)}
                                    />
                                </TableRowColumn>
                                <TableRowColumn>
                                    <IconButton onClick={() =>
                                        this.removeColorMember('colorScale', index)}
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
                        <IconButton onClick={() => this.addColorMember('colorScale')}>
                            <AddButton />
                        </IconButton>
                        <br />
                    </div>) : (null)}
                <br />
                <a>If certain categories are required to be grouped in a certain color</a>
                <Table>
                    <TableBody displayRowCheckbox={false}>
                        {this.props.configuration.charts[0].colorDomain.map((colorDomainMember, index) =>
                            (<TableRow key={index}>
                                <TableRowColumn>
                                    <TextProperty
                                        id={'colorDomain' + index}
                                        value={colorDomainMember}
                                        onChange={(id, value) =>
                                            this.handleColorMemberChange('colorDomain', index, value)}
                                    />
                                    <br />
                                </TableRowColumn>
                                <TableRowColumn>
                                    <IconButton onClick={() =>
                                        this.removeColorMember('colorDomain', index)}
                                    >
                                        <ClearButton />
                                    </IconButton>
                                </TableRowColumn>
                            </TableRow>))}
                    </TableBody>
                </Table>
                <IconButton onClick={() => this.addColorMember('colorDomain')}>
                    <AddButton />
                </IconButton>
                <TextProperty
                    id="height"
                    value={this.state.configuration.height}
                    fieldName="Height of the chart in pixels"
                    onChange={(id, value) => this.handleChartPropertyChange(id, value)}
                    number
                    fullWidth
                />
                <br />
                <TextProperty
                    id="width"
                    value={this.state.configuration.width}
                    fieldName="Width of the chart in pixels"
                    onChange={(id, value) => this.handleChartPropertyChange(id, value)}
                    number
                    fullWidth
                />
                <br />
                <br />
                {/* Optional configuration properties */}
                <Card style={{ padding: 50 }}>
                    <h3>Advanced Settings</h3>
                    <SelectProperty
                        id="legendOrientation"
                        value={this.state.configuration.legendOrientation}
                        fieldName="Orientation of the legend relative to the chart"
                        options={{
                            values: ['top', 'bottom', 'left', 'right'],
                            texts: ['Top', 'Bottom', 'Left', 'Right'],
                        }}
                        onChange={(id, value) => this.handleChartPropertyChange(id, value)}
                        fullWidth
                    />
                    <br />
                    <br />
                    <h3>Style</h3>
                    <ColorProperty
                        id="legendTitleColor"
                        value={this.state.configuration.style.legendTitleColor}
                        fieldName="Text color of the legend title"
                        onChange={(id, value) => this.handleChartStylePropertyChange(id, value)}
                        fullWidth
                    />
                    <br />
                    <ColorProperty
                        id="legendTextColor"
                        value={this.state.configuration.style.legendTextColor}
                        fieldName="Text color of the text in the legend"
                        onChange={(id, value) => this.handleChartStylePropertyChange(id, value)}
                        fullWidth
                    />
                    <br />
                </Card>

            </div>
        );
    }
}

export default Pie;
