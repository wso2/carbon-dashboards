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
import {FormattedMessage} from 'react-intl';

import {darkBaseTheme, getMuiTheme, MuiThemeProvider} from 'material-ui/styles';
import {Card, CardMedia} from 'material-ui/Card';
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

const dynamicQueryCardStyle = {
    paddingTop: 1,
    paddingLeft: 25,
    paddingRight: 25,
    paddingBottom: 25,
    marginTop: 10
};

const addWidgetInputBtnStyle = {
    marginRight: 20,
    minWidth: 0,
    width: 0,
    verticalAlign: 'middle'
};

const textFieldStyle = {
    verticalAlign: 'middle',
    marginRight: 10,
    width: '20%'
};

const deleteBtnStyle = {
    color: ' #e74c3c'
};

const queryEditorPaneStyle = {
    verticalAlign: 'middle',
    marginTop: 30,
    marginRight: 10,
    marginBottom: 15
};


class DynamicQueryComponent extends Component {

    constructor(props) {
        super(props);
        this.addWidgetInput = this.addWidgetInput.bind(this);
        this.handleDefaultValue = this.handleDefaultValue.bind(this);
        this.handleInputValue = this.handleInputValue.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleRowSelection = this.handleRowSelection.bind(this);
        this.handleQueryEditor = this.handleQueryEditor.bind(this);
        DynamicQueryComponent.generateFunctionParameters = DynamicQueryComponent.generateFunctionParameters.bind(this);
        DynamicQueryComponent.generateFunctionDefaultValues =
            DynamicQueryComponent.generateFunctionDefaultValues.bind(this);
        this.customWidgetInputs = [];
        this.state = {
            widgetInputs: [],
            selectedRow: [],
            systemWidgetInputs: [{name: "username", defaultValue: "admin"}],
            customWidgetInputs: [],
            queryValue: props.value,
            inputValue: "",
            defaultValue: "",
            errorInputValue: "",
            errorDefaultValue: ""
        }
    }

    componentWillReceiveProps(props) {
        if (this.state.queryValue !== props.value) {
            this.props.handleDynamicQuery(props.value, this.customWidgetInputs, this.state.systemWidgetInputs,
                DynamicQueryComponent.generateFunctionParameters(this.state.systemWidgetInputs, this.customWidgetInputs),
                DynamicQueryComponent.generateFunctionDefaultValues(this.state.systemWidgetInputs, this.customWidgetInputs));
            this.setState({queryValue: props.value});
        }
    }

    componentDidMount() {
        this.props.handleDynamicQuery(this.state.queryValue, this.customWidgetInputs, this.state.systemWidgetInputs,
            DynamicQueryComponent.generateFunctionParameters(this.state.systemWidgetInputs, this.customWidgetInputs),
            DynamicQueryComponent
                .generateFunctionDefaultValues(this.state.systemWidgetInputs, this.customWidgetInputs));
    }

    addWidgetInput(event) {
        if (this.validateWidgetInputs()) {
            this.validateWidgetInputs();
            this.customWidgetInputs.push({name: this.state.inputValue, defaultValue: this.state.defaultValue});
            this.props.handleDynamicQuery(this.state.queryValue, this.customWidgetInputs, this.state.systemWidgetInputs,
                DynamicQueryComponent
                    .generateFunctionParameters(this.state.systemWidgetInputs, this.customWidgetInputs),
                DynamicQueryComponent
                    .generateFunctionDefaultValues(this.state.systemWidgetInputs, this.customWidgetInputs));
            this.setState({customWidgetInputs: this.customWidgetInputs, defaultValue: "", inputValue: ""});
        }
    }

    validateWidgetInputs() {
        let isWidgetInputsValid = true;
        if (!this.state.inputValue || this.state.inputValue === "") {
            isWidgetInputsValid = false;
            this.setState({
                errorInputValue: <FormattedMessage id="widget.input.errorMsg"
                                                   defaultMessage="The input value cannot be empty"/>
            });
        } else if (!this.state.defaultValue || this.state.defaultValue === "") {
            isWidgetInputsValid = false;
            this.setState({
                errorDefaultValue: <FormattedMessage id="widget.defaultValue.errorMsg"
                                                     defaultMessage="The default value cannot be empty"/>
            });
        } else {
            this.customWidgetInputs.map(inputValue => {
                if (inputValue.name === this.state.inputValue) {
                    isWidgetInputsValid = false;
                    this.setState({
                        errorInputValue:
                            <FormattedMessage id="widget.input.exists.errorMsg"
                                              defaultMessage={"The value " + this.state.inputValue + "already exists"}/>
                    });
                }
            });
        }
        return isWidgetInputsValid;
    }

    handleDefaultValue(event, value) {
        this.state.errorDefaultValue = "";
        this.setState({defaultValue: value});
    }

    handleInputValue(event, value) {
        this.state.errorInputValue = "";
        this.setState({inputValue: value})
    }

    handleDelete(event) {
        this.customWidgetInputs.splice(this.state.selectedRow[0], 1);
        this.props.handleDynamicQuery(this.state.queryValue, this.customWidgetInputs, this.state.systemWidgetInputs,
            DynamicQueryComponent.generateFunctionParameters(this.state.systemWidgetInputs, this.customWidgetInputs),
            DynamicQueryComponent
                .generateFunctionDefaultValues(this.state.systemWidgetInputs, this.customWidgetInputs));
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
            DynamicQueryComponent
                .generateFunctionParameters(this.state.systemWidgetInputs, this.state.customWidgetInputs),
            DynamicQueryComponent
                .generateFunctionDefaultValues(this.state.systemWidgetInputs, this.state.customWidgetInputs));
        this.setState({queryValue: value});
    }

    static generateFunctionParameters(systemWidgetInputs, customWidgetInputs) {
        let parameters = systemWidgetInputs[0].name;
        for (let i = 1; i < systemWidgetInputs.length; i++) {
            parameters = parameters + "," + systemWidgetInputs[i].name;
        }
        for (let i = 0; i
        < customWidgetInputs.length; i++) {
            parameters = parameters + "," + customWidgetInputs[i].name;
        }
        return parameters;
    }

    static generateFunctionDefaultValues(systemWidgetInputs, customWidgetInputs) {
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
        let queryFunction = "function generateQuery (" + DynamicQueryComponent
            .generateFunctionParameters(this.state.systemWidgetInputs, this.customWidgetInputs) + ") {";
        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                <Card style={dynamicQueryCardStyle}>
                    <h3>Dynamic Query Generation Configuration</h3>
                    <Divider/>
                    <CardMedia>
                        <div style={{marginTop: 15}}>
                            <div style={{verticalAlign: 'middle', marginRight: 10}}>Add widget inputs</div>
                            <TextField
                                style={textFieldStyle}
                                floatingLabelText={<FormattedMessage id="widget.input.value"
                                                                     defaultMessage="Input Value"/>}
                                value={this.state.inputValue}
                                errorText={this.state.errorInputValue}
                                onChange={this.handleInputValue}
                            />
                            <TextField
                                style={textFieldStyle}
                                floatingLabelText={<FormattedMessage id="widget.input.defaultValue"
                                                                     defaultMessage="Default Value"/>}
                                value={this.state.defaultValue}
                                errorText={this.state.errorDefaultValue}
                                onChange={this.handleDefaultValue}
                            />
                            <FloatingActionButton
                                mini={true}
                                style={addWidgetInputBtnStyle}
                                onClick={this.addWidgetInput}
                            >
                                <ContentAdd/>
                            </FloatingActionButton>
                            {this.state.customWidgetInputs.length !== 0 ?
                                <Paper style={{marginTop: 30}}>
                                    <Table onRowSelection={this.handleRowSelection}>
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
                                                            selected={that.state.selectedRow[0] === index}>
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
                                    {this.state.selectedRow.length !== 0 ?
                                        <FlatButton label={<FormattedMessage id="delete.selected.row"
                                                                             defaultMessage="Delete Selected Row"/>}
                                                    primary
                                                    style={deleteBtnStyle}
                                                    icon={<ContentDelete/>}
                                                    onClick={this.handleDelete}/> : ""
                                    }
                                </Paper> : ""
                            }

                        </div>
                        <div style={queryEditorPaneStyle}>
                            Enter your JS function to create the query
                        </div>
                        <div>{queryFunction}</div>
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
