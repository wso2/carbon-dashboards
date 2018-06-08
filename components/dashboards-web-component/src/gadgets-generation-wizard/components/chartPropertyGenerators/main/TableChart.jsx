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
import { Card, CardHeader, CardText, IconButton } from 'material-ui';
import ClearButton from 'material-ui/svg-icons/content/clear';
import AddButton from 'material-ui/svg-icons/content/add';
// App Components
import TextProperty from '../../inputTypes/TextProperty';
import UtilFunctions from '../../../utils/UtilFunctions';
import ColorProperty from '../../inputTypes/ColorProperty';
import Toggle from '../../inputTypes/SwitchProperty';

// Constants
const SELECT_ALL = 'SELECT_ALL';
const SELECT_NONE = 'SELECT_NONE';

/**
 * Represents a Table chart
 */
class TableChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            configuration: props.configuration,
            tableHeight: '900',
        };
        this.addColorMember = this.addColorMember.bind(this);
        this.handleColumnPropertyChange = this.handleColumnPropertyChange.bind(this);
        this.handleColorMemberChange = this.handleColorMemberChange.bind(this);
        this.colorBasedCategorization = this.colorBasedCategorization.bind(this);
        this.toggleConfigProperty = this.toggleConfigProperty.bind(this);
    }

    componentWillMount() {
        this.constructColumns(this.props.metadata);
    }

    /**
     * Creates columns and column titles from metadata.
     * @param metadata
     */
    constructColumns(metadata) {
        const state = this.state;
        state.configuration.charts[0].filterColumn = [];
        for (const name of metadata.names) {
            state.configuration.charts[0].columns.push({
                name,
                title: UtilFunctions.toSentenceCase(name),
                colorBasedStyle: false,
            });
            state.configuration.charts[0].filterColumn.push(true);
            state.configuration.pagination = false;
            state.configuration.filterable = false;
            state.configuration.append = false;
        }
        this.setState(state);
    }

    /**
     * Assigns value for the chart's property, that has the given key
     * @param key
     * @param value
     */
    handlePropertyChange(key, value) {
        const state = this.state;
        state.configuration[key] = value;
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    /**
     * Assigns value for the property with the given key, that belongs to the column with the given index
     * @param columnIndex
     * @param key
     * @param value
     */
    handleColumnPropertyChange(columnIndex, key, value) {
        const state = this.state;
        state.configuration.charts[0].columns[columnIndex][key] = value;
        if (state.configuration.charts[0].columns[columnIndex][key].length === 0) {
            delete state.configuration.charts[0].columns[columnIndex][key];
        }
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    handleColorMemberChange(colIndex, colorProperty, colorPropertyIndex, value) {
        const state = this.state;
        state.configuration.charts[0].columns[colIndex][colorProperty][colorPropertyIndex] = value;
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    /**
     * Sets the selection of a column that has the given index, based on the given status
     * @param columnIndex
     * @param isSelected
     */
    selectColumn(columnIndex, isSelected) {
        const state = this.state;
        state.configuration.charts[0].filterColumn[columnIndex] = isSelected;
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    toggleConfigProperty(property, value) {
        const state = this.state;
        state.configuration[property] = value;
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    colorBasedCategorization(columnIndex, value) {
        const state = this.state;
        state.configuration.charts[0].columns[columnIndex].colorBasedStyle = value;
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    /**
     * Selects All or No columns, based on columns selected until now
     */
    toggleSelectAll() {
        const state = this.state;
        let eachSelection = true;
        if (this.getSelectionType() === SELECT_NONE) {
            eachSelection = false;
        }
        for (const column of state.configuration.charts[0].columns) {
            column.isSelected = eachSelection;
        }
    }

    /**
     * Gets the selection type, either 'all' or 'none'
     * @returns {string}
     */
    getSelectionType() {
        let isAtLeastOneSelected = false;
        for (const column of this.state.configuration.charts[0].columns) {
            if (column.isSelected) {
                isAtLeastOneSelected = true;
                break;
            }
        }
        if (isAtLeastOneSelected) {
            return SELECT_NONE;
        }
        return SELECT_ALL;
    }

    addColorMember(columnIndex, propertyName) {
        const state = this.state;

        if (!state.configuration.charts[0].columns[columnIndex][propertyName]) {
            state.configuration.charts[0].columns[columnIndex][propertyName] = [];
        }

        state.configuration.charts[0].columns[columnIndex][propertyName].push('');
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    removeColorMember(columnIndex, propertyName, colorIndex) {
        const state = this.state;
        state.configuration.charts[0].columns[columnIndex][propertyName].splice(colorIndex, 1);
        if (state.configuration.charts[0].columns[columnIndex][propertyName].length === 0) {
            delete state.configuration.charts[0].columns[columnIndex][propertyName];
        }
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    render() {
        return (
            <div>
                <br />
                <br />
                <a>Columns and titles to be displayed*</a>
                <FlatButton
                    label="Select All/None"
                    style={{ marginLeft: 10, paddingLeft: 10, paddingRight: 10 }}
                    onClick={() => this.toggleSelectAll()}
                    primary
                />
                <br />

                <div>
                    <div style={{ margin: 20 }}>
                        {this.state.configuration.charts[0].columns.map((column, index) => {
                            return (
                                <Card style={{ marginBottom: 10 }}>
                                    <CardHeader
                                        title={`Column ID: ${column.name}`}
                                    />
                                    <CardText>
                                        <Toggle
                                            fieldName="Select Column"
                                            onChange={(e, checked) => this.selectColumn(index, checked)}
                                            value={this.state.configuration.charts[0].filterColumn[index]}
                                        />
                                        <Toggle
                                            fieldName="Enable Color Based Categorization"
                                            onChange={(e, checked) => this.colorBasedCategorization(index, checked)}
                                            value={column.colorBasedStyle}
                                        />
                                        <div style={{ margin: 5 }}>
                                            <TextProperty
                                                id="title"
                                                value={column.title}
                                                fieldName="Title of the Column"
                                                onChange={(id, value) => this.handleColumnPropertyChange(index, id, value)}
                                            />
                                            <TextProperty
                                                id="timeFormat"
                                                value={column.timeFormat}
                                                fieldName="Time formatting regex if the column contains time series data"
                                                onChange={(id, value) => this.handleColumnPropertyChange(index, id, value)}
                                                fullWidth
                                            />
                                            <ColorProperty
                                                id={'textColor'}
                                                value={column.textColor}
                                                fieldName="Color of Text in Cell"
                                                onChange={(id, value) =>
                                                    this.handleColumnPropertyChange(index, id, value)}
                                            />
                                            <br />
                                            <a>Color set to use in the charts</a>
                                            {(!column.colorScale || column.colorScale.length === 0) ?
                                                (
                                                    <a>
                                                        &nbsp; &nbsp;
                                                        <FlatButton
                                                            primary
                                                            label="Default"
                                                            onClick={() => this.addColorMember(index, 'colorScale')}
                                                        />
                                                    </a>
                                                ) : (null)}
                                            <Table>
                                                <TableBody displayRowCheckbox={false}>
                                                    {column.colorScale && column.colorScale.map((color, colorIndex) =>
                                                        (<TableRow key={colorIndex} >
                                                            <TableRowColumn>
                                                                <ColorProperty
                                                                    id={'colorScale' + colorIndex}
                                                                    value={color}
                                                                    onChange={(id, value) =>
                                                                        this.handleColorMemberChange(index, 'colorScale', colorIndex, value)}
                                                                />
                                                            </TableRowColumn>
                                                            <TableRowColumn
                                                                style={{ width: '41%' }}
                                                            >
                                                                <IconButton onClick={() =>
                                                                    this.removeColorMember(index, 'colorScale', colorIndex)}
                                                                >
                                                                    <ClearButton />
                                                                </IconButton>
                                                            </TableRowColumn>
                                                        </TableRow>))}
                                                </TableBody>
                                            </Table>
                                            <div>
                                                <IconButton onClick={() => this.addColorMember(index, 'colorScale')}>
                                                    <AddButton />
                                                </IconButton>
                                                <br />
                                            </div>
                                            <br />
                                            <br />
                                            <a>If certain categories are required to be grouped in a certain color</a>
                                            <Table>
                                                <TableBody displayRowCheckbox={false}>
                                                    {column.colorDomain && column.colorDomain.map((colorDomainMember, domainIndex) =>
                                                        (<TableRow key={domainIndex}>
                                                            <TableRowColumn>
                                                                <TextProperty
                                                                    id={'colorDomain' + domainIndex}
                                                                    value={colorDomainMember}
                                                                    onChange={
                                                                        (id, value) =>
                                                                            this.handleColorMemberChange(index, 'colorDomain', domainIndex, value)
                                                                    }
                                                                />
                                                                <br />
                                                            </TableRowColumn>
                                                            <TableRowColumn>
                                                                <IconButton onClick={() =>
                                                                    this.removeColorMember(index, 'colorDomain', domainIndex)}
                                                                >
                                                                    <ClearButton />
                                                                </IconButton>
                                                            </TableRowColumn>
                                                        </TableRow>))}
                                                </TableBody>
                                            </Table>
                                            <div>
                                                <IconButton onClick={() => this.addColorMember(index, 'colorDomain')}>
                                                    <AddButton />
                                                </IconButton>
                                                <br />
                                            </div>
                                        </div>
                                    </CardText>
                                </Card>
                            );
                        })}
                    </div>
                </div>
                <TextProperty
                    id="maxLength"
                    value={this.state.configuration.maxLength}
                    fieldName="Maximum number of rows in the table*"
                    onChange={(id, value) => this.handlePropertyChange(id, value)}
                    number
                    fullWidth
                />
                <Toggle
                    fieldName="Enable Pagination"
                    onChange={(e, checked) => this.toggleConfigProperty('pagination', checked)}
                    value={this.state.configuration.pagination}
                />
                <Toggle
                    fieldName="Enable Filtering of Table"
                    onChange={(e, checked) => this.toggleConfigProperty('filterable', checked)}
                    value={this.state.configuration.filterable}
                />
                <Toggle
                    fieldName="Append Data to the Table everytime"
                    onChange={(e, checked) => this.toggleConfigProperty('append', checked)}
                    value={this.state.configuration.append}
                />
                <br />
            </div>
        );
    }
}

export default TableChart;
