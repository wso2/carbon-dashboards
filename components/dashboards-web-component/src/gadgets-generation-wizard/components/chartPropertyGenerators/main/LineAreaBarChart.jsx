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
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
// App Components
import SubChart from '../sub/LineAreaBarChart';
import TextProperty from '../../inputTypes/TextProperty';
import SwitchProperty from '../../inputTypes/SwitchProperty';
import SelectProperty from '../../inputTypes/SelectProperty';
import ColorProperty from '../../inputTypes/ColorProperty';
import StreamProperty from '../../inputTypes/StreamProperty';
// App Utilities
import Types from '../../../utils/Types';
import Configurations from '../../../utils/Configurations';

/**
 * Represents a main chart, that can have Line / Bar / Area as sub charts
 */
class LineAreaBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            configuration: props.configuration,
            expandAdvanced: false,
        };
    }

    /**
     * Assigns value for the main chart's main property, that has the given key
     * @param key
     * @param value
     */
    handleMainChartPropertyChange(key, value) {
        const state = this.state;
        state.configuration[key] = value;
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    /**
     * Adds a sub chart for the given type of main chart
     * @param mainChartType
     */
    addSubChart(mainChartType) {
        const state = this.state;
        state.configuration.charts.push(JSON.parse(JSON.stringify(Configurations.charts[mainChartType].charts[0])));
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    /**
     * Removes the sub chart, that has the given index
     * @param index
     */
    removeSubChart(index) {
        const state = this.state;
        state.configuration.charts.splice(index, 1);
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    /**
     * Assigns value for the main chart's style property, that has the given key
     * @param key
     * @param value
     */
    handleMainChartStylePropertyChange(key, value) {
        const state = this.state;
        state.configuration.style[key] = value;
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    /**
     * Assigns value for the property with the given key, that belongs to the sub chart with the given index
     * @param subChartIndex
     * @param key
     * @param value
     */
    handleSubChartPropertyChange(subChartIndex, key, value) {
        const state = this.state;
        state.configuration.charts[subChartIndex][key] = value;
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    /**
     * Assigns value for the style property with the given key, that belongs to the sub chart with the given index
     * @param subChartIndex
     * @param key
     * @param value
     */
    handleSubChartStylePropertyChange(subChartIndex, key, value) {
        const state = this.state;
        state.configuration.charts[subChartIndex].style[key] = value;
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    /**
     * Adds an empty color member of an array to the chart with the given index
     * @param parentName
     * @param subChartIndex
     */
    addSubChartColorMember(parentName, subChartIndex) {
        const state = this.state;
        state.configuration.charts[subChartIndex][parentName].push('');
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    /**
     * Assigns changed value of a color member denoted with the given index, belonging to the sub chart with
     * the given index
     * @param subChartIndex
     * @param parentName
     * @param memberIndex
     * @param value
     */
    handleSubChartColorMemberChange(subChartIndex, parentName, memberIndex, value) {
        const state = this.state;
        state.configuration.charts[subChartIndex][parentName][memberIndex] = value;
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    /**
     * Removes the color domain / color scale member that has the given index, from the sub chart that has the
     * given index
     * @param parentName
     * @param subChartIndex
     * @param colorMemberIndex
     */
    removeSubChartColorMember(parentName, subChartIndex, colorMemberIndex) {
        const state = this.state;
        state.configuration.charts[subChartIndex][parentName].splice(colorMemberIndex, 1);
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    render() {
        return (
            <div>
                <StreamProperty
                    id="x"
                    value={this.state.configuration.x}
                    fieldName="X Axis*"
                    onChange={(id, value) => this.handleMainChartPropertyChange(id, value)}
                    metadata={this.props.metadata}
                    fullWidth
                />
                <br />
                <br />
                <h3>Charts</h3>
                <div>
                    {this.state.configuration.charts.map((chart, index) =>
                        (<SubChart
                            key={index}
                            index={index}
                            configuration={chart}
                            metadata={this.props.metadata}
                            handleSubChartPropertyChange={(id, value) =>
                                this.handleSubChartPropertyChange(index, id, value)}
                            handleSubChartStylePropertyChange={(id, value) =>
                                this.handleSubChartStylePropertyChange(index, id, value)}
                            addColorMember={parentName => this.addSubChartColorMember(parentName, index)}
                            handleSubChartColorMemberChange={(parentName, memberIndex, value) =>
                                this.handleSubChartColorMemberChange(index, parentName, memberIndex, value)}
                            removeSubChartColorMember={(parentName, memberIndex) =>
                                this.removeSubChartColorMember(parentName, index, memberIndex)}
                            handlePropertyChange={e => this.handleSubChartPropertyChange(index, e)}
                            removeChart={() => this.removeSubChart(index)}
                        />))}
                    <FlatButton
                        label="Add Chart"
                        onClick={() => this.addSubChart(Types.chart.lineAreaBarChart)}
                        primary
                    />
                    <br />
                </div>
                <br />
                <SwitchProperty
                    id="legend"
                    value={this.state.configuration.legend}
                    fieldName="Show legend"
                    onChange={(id, value) => this.handleMainChartPropertyChange(id, value)}
                />
                <br />
                <TextProperty
                    id="maxLength"
                    value={this.state.configuration.maxLength}
                    fieldName="Maximum Length of the data set displayed*"
                    onChange={(id, value) => this.handleMainChartPropertyChange(id, value)}
                    number
                    fullWidth
                />
                <br />
                <br />
                {/* Optional configuration properties */}
                <Card
                    style={this.state.expandAdvanced ? { padding: 30 } : { padding: 10 }}
                    expanded={this.state.expandAdvanced}
                    onExpandChange={e => this.setState({ expandAdvanced: e })}
                >
                    <CardHeader
                        title="Advanced Settings"
                        actAsExpander
                        showExpandableButton
                    />
                    <CardMedia
                        expandable
                    >
                        <br />
                        <br />
                        <SwitchProperty
                            id="append"
                            value={this.state.configuration.append}
                            fieldName="Append new data to the chart"
                            onChange={(id, value) => this.handleMainChartPropertyChange(id, value)}
                        />
                        <br />
                        <br />
                        <TextProperty
                            id="xAxisLabel"
                            value={this.state.configuration.xAxisLabel}
                            fieldName="Label to be displayed in the x axis"
                            onChange={(id, value) => this.handleMainChartPropertyChange(id, value)}
                            fullWidth
                        />
                        <br />
                        <TextProperty
                            id="yAxisLabel"
                            value={this.state.configuration.yAxisLabel}
                            fieldName="Label to be displayed in the y axis"
                            onChange={(id, value) => this.handleMainChartPropertyChange(id, value)}
                            fullWidth
                        />
                        <br />
                        <br />
                        <br />
                        <SwitchProperty
                            id="disableVerticalGrid"
                            value={this.state.configuration.disableVerticalGrid}
                            fieldName="Disable vertical grid lines in the chart"
                            onChange={(id, value) => this.handleMainChartPropertyChange(id, value)}
                        />
                        <br />
                        <br />
                        <SwitchProperty
                            id="disableHorizontalGrid"
                            value={this.state.configuration.disableHorizontalGrid}
                            fieldName="Disable horizontal grid lines in the chart"
                            onChange={(id, value) => this.handleMainChartPropertyChange(id, value)}
                        />
                        <TextProperty
                            id="timeFormat"
                            value={this.state.configuration.timeFormat}
                            fieldName="Time formatting regex of any time series reference"
                            onChange={(id, value) => this.handleMainChartPropertyChange(id, value)}
                            fullWidth
                        />
                        <a>(Refer : https://github.com/d3/d3-time-format/blob/master/README.md#locale_format)</a>
                        <br />
                        <SelectProperty
                            id="legendOrientation"
                            value={this.state.configuration.legendOrientation}
                            fieldName="Orientation of the legend relative to the chart"
                            options={{
                                values: ['top', 'bottom', 'left', 'right'],
                                texts: ['Top', 'Bottom', 'Left', 'Right'],
                            }}
                            onChange={(id, value) => this.handleMainChartPropertyChange(id, value)}
                            fullWidth
                        />
                        <br />
                        <br />
                        <h3>Style</h3>
                        <ColorProperty
                            id="axisLabelColor"
                            value={this.state.configuration.style.axisLabelColor}
                            fieldName="Color of the axis labels & tick labels in the axis"
                            onChange={(id, value) => this.handleMainChartStylePropertyChange(id, value)}
                            fullWidth
                        />
                        <br />
                        <ColorProperty
                            id="legendTitleColor"
                            value={this.state.configuration.style.legendTitleColor}
                            fieldName="Text color of the legend title"
                            onChange={(id, value) => this.handleMainChartStylePropertyChange(id, value)}
                            fullWidth
                        />
                        <br />
                        <ColorProperty
                            id="legendTextColor"
                            value={this.state.configuration.style.legendTextColor}
                            fieldName="Text color of the text in the legend"
                            onChange={(id, value) => this.handleMainChartStylePropertyChange(id, value)}
                            fullWidth
                        />
                        <br />
                        <TextProperty
                            id="xAxisTickAngle"
                            value={this.state.configuration.style.xAxisTickAngle}
                            fieldName="Angle of the x axis ticks"
                            number
                            onChange={(id, value) => this.handleMainChartStylePropertyChange(id, value)}
                            fullWidth
                        />
                        <br />
                        <TextProperty
                            id="yAxisTickAngle"
                            value={this.state.configuration.style.yAxisTickAngle}
                            fieldName="Angle of the y axis ticks"
                            number
                            onChange={(id, value) => this.handleMainChartStylePropertyChange(id, value)}
                            fullWidth
                        />
                    </CardMedia>
                </Card>
            </div>
        );
    }
}

export default LineAreaBar;
