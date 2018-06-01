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

import React, {Component} from 'react';
import {darkBaseTheme, getMuiTheme, MuiThemeProvider} from 'material-ui/styles';
import Checkbox from 'material-ui/Checkbox';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ContentDelete from 'material-ui/svg-icons/action/delete';
import Divider from 'material-ui/Divider';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import CodeProperty from './inputTypes/CodeProperty';
import 'brace/mode/javascript';
import 'brace/theme/dracula';

import {
    Table,
    TableBody,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn,
} from 'material-ui/Table';

/**
 * Material UI theme.
 */
const muiTheme = getMuiTheme(darkBaseTheme);

class DynamicQueryComponent extends Component {

    constructor(props) {
        super(props);
        this.addWidgetInput = this.addWidgetInput.bind(this);
        this.handleDefaultValue = this.handleDefaultValue.bind(this);
        this.handleInputValue = this.handleInputValue.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleRowSelection = this.handleRowSelection.bind(this);
        this.handleQueryEditor = this.handleQueryEditor.bind(this);
        this.generateFunctionParameters = this.generateFunctionParameters.bind(this);
        this.generateFunctionDefaultValues = this.generateFunctionDefaultValues.bind(this);
        this.customWidgetInputs = [];
        this.state = {
            widgetInputs: [],
            selectedRow: [],
            systemWidgetInputs: [{name: "username", defaultValue: "admin"}],
            customWidgetInputs: [],
            queryValue: props.value
        }
    }

    componentDidMount() {
        this.props.handleDynamicQuery(this.state.queryValue, this.customWidgetInputs, this.state.systemWidgetInputs,
            this.generateFunctionParameters(this.state.systemWidgetInputs, this.customWidgetInputs),
            this.generateFunctionDefaultValues(this.state.systemWidgetInputs, this.customWidgetInputs));
    }

    addWidgetInput(event) {
        this.customWidgetInputs.push({name: this.inputValue, defaultValue: this.defaultValue});
        this.props.handleDynamicQuery(this.state.queryValue, this.customWidgetInputs, this.state.systemWidgetInputs,
            this.generateFunctionParameters(this.state.systemWidgetInputs, this.customWidgetInputs),
            this.generateFunctionDefaultValues(this.state.systemWidgetInputs, this.customWidgetInputs));
        this.setState({customWidgetInputs: this.customWidgetInputs});
    }

    handleDefaultValue(event, value) {
        this.defaultValue = value;
    }

    handleInputValue(event, value) {
        this.inputValue = value;
    }

    handleDelete(event) {
        this.customWidgetInputs.splice(this.state.selectedRow[0], 1);
        this.props.handleDynamicQuery(this.state.queryValue, this.customWidgetInputs, this.state.systemWidgetInputs,
            this.generateFunctionParameters(this.state.systemWidgetInputs, this.customWidgetInputs),
            this.generateFunctionDefaultValues(this.state.systemWidgetInputs, this.customWidgetInputs));
        this.setState({
            customWidgetInputs: this.customWidgetInputs,
            selectedRow: []
        });
    }

    handleRowSelection(selectedRow) {
        this.setState({selectedRow: selectedRow});
    }

    handleQueryEditor(id, value) {
        this.props.handleDynamicQuery(value, this.state.customWidgetInputs, this.state.systemWidgetInputs,
            this.generateFunctionParameters(this.state.systemWidgetInputs, this.state.customWidgetInputs),
            this.generateFunctionDefaultValues(this.state.systemWidgetInputs, this.state.customWidgetInputs));
        this.setState({queryValue: value});
    }

    generateFunctionParameters(systemWidgetInputs, customWidgetInputs) {
        let parameters = systemWidgetInputs[0].name;
        for (let i = 1; i < systemWidgetInputs.length; i++) {
            parameters = parameters + "," + systemWidgetInputs[i].name;
        }
        for (let i = 0; i < customWidgetInputs.length; i++) {
            parameters = parameters + "," + customWidgetInputs[i].name;
        }
        return parameters;
    }

    generateFunctionDefaultValues(systemWidgetInputs, customWidgetInputs) {
        let defaultValues = systemWidgetInputs[0].defaultValue;
        for (let i = 1; i < systemWidgetInputs.length; i++) {
            defaultValues = defaultValues + "," + systemWidgetInputs[i].defaultValue;
        }
        for (let i = 0; i < customWidgetInputs.length; i++) {
            defaultValues = defaultValues + "," + customWidgetInputs[i].defaultValue;
        }
        return defaultValues;
    }


    render() {
        let that = this;
        let t = "function generateQuery (" +
            this.generateFunctionParameters(this.state.systemWidgetInputs, this.customWidgetInputs) + ") {";
        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                <Card
                    style={{
                        paddingTop: 1,
                        paddingLeft: 25,
                        paddingRight: 25,
                        paddingBottom: 25,
                        marginTop: 10,
                        backgroundColor: '#25353f'
                    }}
                >
                    <h3>Dynamic Query Generation Configuration</h3>
                    <Divider/>
                    <CardMedia>
                        <div style={{marginTop: 15}}>
                            <div style={{verticalAlign: 'middle', marginRight: 10}}>Add widget inputs</div>
                            <TextField
                                style={{verticalAlign: 'middle', marginRight: 10, width: '20%'}}
                                floatingLabelText="Input Name"
                                onChange={this.handleInputValue}
                            />
                            <TextField
                                style={{verticalAlign: 'middle', marginRight: 10, width: '20%'}}
                                floatingLabelText="Default Value"
                                onChange={this.handleDefaultValue}
                            />
                            <FloatingActionButton
                                mini={true}
                                style={{
                                    marginRight: 20,
                                    minWidth: 0,
                                    width: 0,
                                    verticalAlign: 'middle'
                                }}
                                onClick={this.addWidgetInput}
                            >
                                <ContentAdd/>
                            </FloatingActionButton>
                            {this.state.customWidgetInputs.length != 0 ?
                                <Paper zDepth={5} style={{marginTop: 10, backgroundColor: '#282a36'}}>
                                    <Table onRowSelection={this.handleRowSelection}
                                           style={{backgroundColor: '#282a36'}}>
                                        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                                            <TableRow>
                                                <TableHeaderColumn>Input Name</TableHeaderColumn>
                                                <TableHeaderColumn>Default Value</TableHeaderColumn>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody displayRowCheckbox={false} deselectOnClickaway={false}>
                                            {
                                                this.state.customWidgetInputs.map(function (widgetInput, index) {
                                                    return (
                                                        <TableRow
                                                            selected={that.state.selectedRow[0] == index ? true : false}>
                                                            <TableRowColumn>
                                                                {widgetInput.name}
                                                            </TableRowColumn>
                                                            <TableRowColumn>
                                                                {widgetInput.defaultValue}
                                                            </TableRowColumn>
                                                        </TableRow>
                                                    );
                                                })
                                            }
                                        </TableBody>
                                    </Table>
                                    {this.state.selectedRow.length != 0 ?
                                        <FlatButton label='Delete Selected Row'
                                                    primary
                                                    style={{color: ' #e74c3c'}}
                                                    icon={<ContentDelete/>}
                                                    onClick={this.handleDelete}/> : ""
                                    }
                                </Paper> : ""
                            }

                        </div>
                        <div style={
                            {verticalAlign: 'middle', marginTop: 15, marginRight: 10, marginBottom: 15}
                        }>
                            Enter your JS function to create the query
                        </div>
                        <div>{t}</div>
                        <CodeProperty
                            id='queryEditor'
                            mode='javascript'
                            onChange={this.handleQueryEditor}
                            value={this.state.queryValue}
                            theme={'dracula'}
                        />
                        <div>}</div>
                    </CardMedia>
                </Card>
            </MuiThemeProvider>
        );
    }

}

export default DynamicQueryComponent;
