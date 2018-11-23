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
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import AddButton from 'material-ui/svg-icons/content/add';
import ClearButton from 'material-ui/svg-icons/content/clear';
import FlatButton from 'material-ui/FlatButton';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
// App Components
import Constants from '../../../utils/Constants';
import SelectProperty from '../../inputTypes/SelectProperty';
import ColorProperty from '../../inputTypes/ColorProperty';
import TextProperty from '../../inputTypes/TextProperty';
import Types from '../../../utils/Types';
import StreamProperty from '../../inputTypes/StreamProperty';
import SwitchProperty from '../../inputTypes/SwitchProperty';

/**
 * Represents a sub chart of line chart
 */
class LineAreaBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            index: props.index,
        };
    }

    render() {
        return (
            <div>
                <Paper>
                    <div style={{ margin: 20 }}>
                        <SelectProperty
                            id="type"
                            value={this.props.configuration.type}
                            fieldName="Type of the chart*"
                            onChange={(id, value) => this.props.handleSubChartPropertyChange(id, value)}
                            options={{
                                values: [Types.chart.lineChart, Types.chart.areaChart, Types.chart.barChart],
                                texts: [Constants.CHART_NAMES.LINE_CHART, Constants.CHART_NAMES.AREA_CHART,
                                    Constants.CHART_NAMES.BAR_CHART],
                            }}
                            fullWidth
                        />
                        <br />
                        <StreamProperty
                            id="y"
                            value={this.props.configuration.y}
                            fieldName="Y Axis*"
                            filter={Types.dataset.metadata.linear}
                            onChange={(id, value) => this.props.handleSubChartPropertyChange(id, value)}
                            metadata={this.props.metadata}
                            fullWidth
                        />
                        <br />
                        <StreamProperty
                            id="color"
                            value={this.props.configuration.color}
                            fieldName="Data field, according to which, color categorization is done"
                            filter={Constants.ordinal}
                            metadata={this.props.metadata}
                            onChange={(id, value) => this.props.handleSubChartPropertyChange(id, value)}
                            fullWidth
                        />
                        {(this.props.configuration.color !== '') ?
                            (<IconButton onClick={() => this.props.handleSubChartPropertyChange('color', '')}>
                                <ClearButton />
                            </IconButton>) :
                            (null)
                        }
                        <br />
                        {/* When no selection has been made for 'color' */}
                        {(this.props.configuration.color === '') ?
                            (<div>
                                <ColorProperty
                                    id="fill"
                                    value={this.props.configuration.fill}
                                    fieldName="Color in which data should be plotted"
                                    onChange={(id, value) => this.props.handleSubChartPropertyChange(id, value)}
                                />
                                <br />
                            </div>) : (null)
                        }
                        {/* Only for bar / area charts */}
                        {((this.props.configuration.type === Types.chart.areaChart) ||
                            (this.props.configuration.type === Types.chart.barChart)) ?
                            (<div>
                                <br />
                                <SwitchProperty
                                    id="stacked"
                                    value={this.props.configuration.stacked}
                                    fieldName="Stack this chart"
                                    onChange={(id, value) => this.props.handleSubChartPropertyChange(id, value)}
                                />
                            </div>) :
                            (null)
                        }
                        {/* No styling available for bar charts */}
                        {((this.props.configuration.type !== Types.chart.barChart)) ?
                            (<div><br /><h4>Style</h4></div>) :
                            (null)
                        }
                        {((this.props.configuration.type === Types.chart.lineChart) ||
                            (this.props.configuration.type === Types.chart.areaChart)) ?
                            (<div>
                                <TextProperty
                                    id="strokeWidth"
                                    value={this.props.configuration.style.strokeWidth}
                                    fieldName="Stroke width of the line plotted"
                                    onChange={(id, value) =>
                                        this.props.handleSubChartStylePropertyChange(id, value)}
                                    fullWidth
                                />
                                <br />
                            </div>) :
                            (null)
                        }
                        {(this.props.configuration.type === Types.chart.areaChart) ?
                            (<div>
                                <TextProperty
                                    id="fillOpacity"
                                    value={this.props.configuration.style.fillOpacity}
                                    fieldName="Opacity of the colored area"
                                    onChange={(id, value) =>
                                        this.props.handleSubChartStylePropertyChange(id, value)}
                                    fullWidth
                                />
                                <br />
                            </div>) :
                            (null)
                        }
                        {((this.props.configuration.type === Types.chart.lineChart) ||
                            (this.props.configuration.type === Types.chart.areaChart)) ?
                            (<div>
                                <TextProperty
                                    id="markRadius"
                                    value={this.props.configuration.style.markRadius}
                                    fieldName="Radius of the mark rendered in the chart"
                                    onChange={(id, value) => this.props.handleSubChartStylePropertyChange(id, value)}
                                    fullWidth
                                />
                                <br />
                            </div>) :
                            (null)
                        }
                        <a>Color set to use in the charts</a>
                        {(this.props.configuration.colorScale.length === 0) ?
                            (
                                <a>
                                    &nbsp; &nbsp;
                                    <FlatButton
                                        primary
                                        label="Default"
                                        onClick={() => this.props.addColorMember('colorScale')}
                                    />
                                </a>
                            ) : (null)}
                        <Table>
                            <TableBody displayRowCheckbox={false}>
                                {this.props.configuration.colorScale.map((color, index) =>
                                    (<TableRow key={index}>
                                        <TableRowColumn>
                                            <ColorProperty
                                                id={'colorScale' + index}
                                                value={color}
                                                onChange={(id, value) =>
                                                    this.props.handleSubChartColorMemberChange(
                                                        'colorScale', index, value)}
                                            />
                                        </TableRowColumn>
                                        <TableRowColumn>
                                            <IconButton onClick={() =>
                                                this.props.removeSubChartColorMember('colorScale', index)}
                                            >
                                                <ClearButton />
                                            </IconButton>
                                        </TableRowColumn>
                                    </TableRow>))}
                            </TableBody>
                        </Table>
                        <br />

                        {(this.props.configuration.colorScale.length !== 0) ?
                            (
                                <IconButton onClick={() => this.props.addColorMember('colorScale')}>
                                    <AddButton />
                                </IconButton>
                            ) : (null)}

                        {(this.props.configuration.color !== '') ?
                            (<div>
                                <br />
                                <br />
                                <a>If certain categories are required to be grouped in a certain color</a>
                                <Table>
                                    <TableBody displayRowCheckbox={false}>
                                        {this.props.configuration.colorDomain.map((colorDomainMember, index) =>
                                            (<TableRow key={index}>
                                                <TableRowColumn>
                                                    <TextProperty
                                                        id={'colorDomain' + index}
                                                        value={colorDomainMember}
                                                        onChange={(id, value) =>
                                                            this.props.handleSubChartColorMemberChange(
                                                                'colorDomain', index, value)}
                                                    />
                                                    <br />
                                                </TableRowColumn>
                                                <TableRowColumn>
                                                    <IconButton onClick={() =>
                                                        this.props.removeSubChartColorMember('colorDomain', index)}
                                                    >
                                                        <ClearButton />
                                                    </IconButton>
                                                </TableRowColumn>
                                            </TableRow>))}
                                    </TableBody>
                                </Table>
                                <IconButton onClick={() => this.props.addColorMember('colorDomain')}>
                                    <AddButton />
                                </IconButton>
                                <br />
                                <br />
                            </div>) :
                            (null)}
                        <br />
                        <FlatButton label="Remove Chart" onClick={() => this.props.removeChart()} primary />
                        <br />
                        <br />
                    </div>
                </Paper>
            </div>
        );
    }
}

export default LineAreaBar;