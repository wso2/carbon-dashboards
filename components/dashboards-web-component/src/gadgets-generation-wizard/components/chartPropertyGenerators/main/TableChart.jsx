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
// App Components
import TextProperty from '../../inputTypes/TextProperty';
import SwitchProperty from '../../inputTypes/SwitchProperty';
import UtilFunctions from '../../../utils/UtilFunctions';
import ColorProperty from "../../inputTypes/ColorProperty";

// Constants
const SELECT_ALL = "SELECT_ALL";
const SELECT_NONE = "SELECT_NONE";

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
        this.selectRows = this.selectRows.bind(this);
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
        for (const name of metadata.names) {
            state.configuration.charts[0].columns.push(name);
            state.configuration.charts[0].columnTitles.push(UtilFunctions.toSentenceCase(name));
            state.configuration.charts[0].filterColumn.push(true);
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
        state.configuration.charts[0].columns[columnIndex].isSelected = isSelected;
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    /**
     * Adds an empty column
     */
    addColumn() {
        const state = this.state;
        state.configuration.charts[0].columns.push('');
        state.configuration.charts[0].columnTitles.push('');
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    /**
     * Sets value for a column / columnTitle based on the state of isColumnTitle, that has the given index
     * @param columnMemberIndex
     * @param value
     * @param isColumnTitle
     */
    handleColumnChange(columnMemberIndex, value, isColumnTitle) {
        const state = this.state;
        if (isColumnTitle) {
            state.configuration.charts[0].columnTitles[columnMemberIndex] = value;
        } else {
            state.configuration.charts[0].columns[columnMemberIndex] = value;
        }
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
        for (let column of state.configuration.charts[0].columns) {
            column.isSelected = eachSelection;
        }
    }

    /**
     * Gets the selection type, either 'all' or 'none'
     * @returns {string}
     */
    getSelectionType() {
        let isAtLeastOneSelected = false;
        for (let column of this.state.configuration.charts[0].columns) {
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

    // /**
    //  * Returns 'none' when all columns are selected already, otherwise 'all'
    //  * @returns {*}
    //  */
    // toggleSelectAll() {
    //     if (this.state.configuration.charts[0].filterColumn.indexOf(true) > -1) {
    //         return 'none';
    //     } else {
    //         return 'all';
    //     }
    // }
    //
    // /**
    //  * Selects rows of the table
    //  * @param selectedRows
    //  */
    // selectRows(selectedRows) {
    //     const state = this.state;
    //     if (selectedRows === 'all') {
    //         for (let i = 0; i < state.configuration.charts[0].filterColumn.length; i++) {
    //             state.configuration.charts[0].filterColumn[i] = true;
    //         }
    //     } else if (selectedRows === 'none') {
    //         for (let i = 0; i < state.configuration.charts[0].filterColumn.length; i++) {
    //             state.configuration.charts[0].filterColumn[i] = false;
    //         }
    //     } else if (selectedRows.length === 0) {
    //         for (let i = 0; i < state.configuration.charts[0].filterColumn.length; i++) {
    //             state.configuration.charts[0].filterColumn[i] = false;
    //         }
    //     } else {
    //         for (let i = 0; i < state.configuration.charts[0].filterColumn.length; i++) {
    //             state.configuration.charts[0].filterColumn[i] = false;
    //         }
    //         for (let i = 0; i < selectedRows.length; i++) {
    //             state.configuration.charts[0].filterColumn[selectedRows[i]] = true;
    //         }
    //     }
    //     this.setState(state);
    //     this.props.onConfigurationChange(state.configuration);
    // }

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
                        {this.state.configuration.charts[0].columns.map((column, index) => (
                            <Card>
                                <CardHeader
                                    title={column.name}
                                />
                                <CardText>
                                    <Toggle
                                        label="Select Column"
                                        onToggle={(e, checked) => this.selectColumn(index, checked)}
                                        toggled={this.state.configuration.charts[0].filterColumn[index]}
                                    />
                                </CardText>
                                <CardMedia>
                                    <TextProperty
                                        id="title"
                                        value={column.title}
                                        fieldName="Title of the Column"
                                        onChange={(id, value) => this.handleColumnPropertyChange(index, id, value)}
                                        fullWidth
                                    />
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
                                    <br/>
                                    <br/>

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
                                                        <br/>
                                                    </TableRowColumn>
                                                    <TableRowColumn>
                                                        <IconButton onClick={() =>
                                                            this.props.removeSubChartColorMember('colorDomain', index)}
                                                        >
                                                            <ClearButton/>
                                                        </IconButton>
                                                    </TableRowColumn>
                                                </TableRow>))}
                                        </TableBody>
                                    </Table>
                                    <IconButton onClick={() => this.props.addColorMember('colorDomain')}>
                                        <AddButton/>
                                    </IconButton>
                                    <br />

                                    <TextProperty
                                        id="timeFormat"
                                        value={column.timeFormat}
                                        fieldName="Time formatting regex of any time series reference"
                                        onChange={(id, value) => this.handleColumnPropertyChange(index, id, value)}
                                        fullWidth
                                    />
                                    <a>
                                        {`(Refer : ` +
                                        `https://github.com/d3/d3-time-format/blob/master/README.md#locale_format)`}
                                    </a>
                                    <br />

                                    <ColorProperty
                                        id="textColor"
                                        value={column.textColor}
                                        fieldName="Color of the text in the cell"
                                        onChange={(id, value) => this.handleColumnPropertyChange(index, id, value)}
                                        fullWidth
                                    />
                                    <br />

                                    <SwitchProperty
                                        id="colorBasedStyle"
                                        value={column.colorBasedStyle}
                                        fieldName="Color the column data according to the type of data in the columns"
                                        onChange={(id, value) => this.handleColumnPropertyChange(index, id, value)}
                                    />
                                </CardMedia>
                            </Card>
                        ))}




                        <Table
                            height={this.state.tableHeight}
                            fixedHeader={this.state.fixedHeader}
                            selectable
                            multiSelectable
                            onRowSelection={this.selectRows}
                        >
                            <TableBody
                                displayRowCheckbox
                                deselectOnClickaway={false}
                            >
                                {this.state.configuration.charts[0].columns.map((column, index) => (
                                    <TableRow
                                        key={index}
                                        selected={this.state.configuration.charts[0].filterColumn[index]}
                                    >
                                        <TableRowColumn>
                                            <a>{column}</a>
                                        </TableRowColumn>
                                        <TableRowColumn>
                                            <TextProperty
                                                id={'columnTitle' + index}
                                                value={this.state.configuration.charts[0].columnTitles[index]}
                                                onChange={(id, value) => this.handleColumnChange(index, value, true)}
                                                fullWidth
                                            />
                                        </TableRowColumn>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
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
                <br />
            </div>
        );
    }
}

export default TableChart;
