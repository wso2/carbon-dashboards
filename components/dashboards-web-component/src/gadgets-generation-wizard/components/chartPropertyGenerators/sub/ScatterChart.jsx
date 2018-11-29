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
import ColorProperty from '../../inputTypes/ColorProperty';
import TextProperty from '../../inputTypes/TextProperty';
import StreamProperty from '../../inputTypes/StreamProperty';
// App Utils
import Types from '../../../utils/Types';

/**
 * Represents a sub chart of scatter chart
 */
class Scatter extends Component {
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
                        <StreamProperty
                            id="x"
                            value={this.props.configuration.x}
                            fieldName="X Axis*"
                            onChange={(id, value) => this.props.handleSubChartPropertyChange(id, value)}
                            metadata={this.props.metadata}
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
                            metadata={this.props.metadata}
                            onChange={(id, value) => this.props.handleSubChartPropertyChange(id, value)}
                            fullWidth
                        />
                        <br />
                        <StreamProperty
                            id="size"
                            value={this.props.configuration.size}
                            fieldName="Field, using which, mark sizes are categorized"
                            metadata={this.props.metadata}
                            filter={Types.dataset.metadata.linear}
                            onChange={(id, value) => this.props.handleSubChartPropertyChange(id, value)}
                            fullWidth
                        />
                        <br />
                        <TextProperty
                            id="maxLength"
                            value={this.props.configuration.maxLength}
                            fieldName="Maximum Length of the data set displayed*"
                            onChange={(id, value) => this.props.handleSubChartPropertyChange(id, value)}
                            number
                            fullWidth
                        />
                        <br />
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
                                <br />
                                <ColorProperty
                                    id="fill"
                                    value={this.props.configuration.fill}
                                    fieldName="Color in which data should be plotted"
                                    onChange={(id, value) => this.props.handleSubChartPropertyChange(id, value)}
                                />
                                <br />
                            </div>) : (null)
                        }
                        <br />
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

export default Scatter;