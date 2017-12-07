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

// App Utilities

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
     * Returns 'none' when all columns are selected already, otherwise 'all'
     * @returns {*}
     */
    toggleSelectAll() {
        if (this.state.configuration.charts[0].filterColumn.indexOf(true) > -1) {
            return 'none';
        } else {
            return 'all';
        }
    }

    /**
     * Selects rows of the table
     * @param selectedRows
     */
    selectRows(selectedRows) {
        const state = this.state;
        if (selectedRows === 'all') {
            for (let i = 0; i < state.configuration.charts[0].filterColumn.length; i++) {
                state.configuration.charts[0].filterColumn[i] = true;
            }
        } else if (selectedRows === 'none') {
            for (let i = 0; i < state.configuration.charts[0].filterColumn.length; i++) {
                state.configuration.charts[0].filterColumn[i] = false;
            }
        } else if (selectedRows.length === 0) {
            for (let i = 0; i < state.configuration.charts[0].filterColumn.length; i++) {
                state.configuration.charts[0].filterColumn[i] = false;
            }
        } else {
            for (let i = 0; i < state.configuration.charts[0].filterColumn.length; i++) {
                state.configuration.charts[0].filterColumn[i] = false;
            }
            for (let i = 0; i < selectedRows.length; i++) {
                state.configuration.charts[0].filterColumn[selectedRows[i]] = true;
            }
        }
        this.setState(state);
        this.props.onConfigurationChange(state.configuration);
    }

    render() {
        return (
            <div>
                <br />
                <br />
                <a>Columns and titles to be displayed</a>
                <FlatButton
                    label={(this.state.configuration.charts[0].filterColumn.indexOf(true) > -1) ?
                        ('Deselect All') : ('Select All')}
                    style={{ marginLeft: 10, paddingLeft: 10, paddingRight: 10 }}
                    onClick={() => this.selectRows(this.toggleSelectAll())}
                    primary={(this.state.configuration.charts[0].filterColumn.indexOf(true) > -1)}
                />
                <div>
                    <div style={{ margin: 20 }}>
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
                    fieldName="Maximum number of rows in the table"
                    onChange={(id, value) => this.handlePropertyChange(id, value)}
                    number
                    fullWidth
                />
                <br />
                <br />
                <br />
                <SwitchProperty
                    id="colorBasedStyle"
                    value={this.state.configuration.colorBasedStyle}
                    fieldName="Color the columns based on the data type"
                    onChange={(id, value) => this.handlePropertyChange(id, value)}
                />
                <br />
            </div>
        );
    }
}

export default TableChart;
