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

import React, {Component} from 'react';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ContentDelete from 'material-ui/svg-icons/action/delete';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import {
    Table,
    TableBody,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn,
} from 'material-ui/Table';

class DataPublishingComponent extends Component {

    constructor(props) {
        super(props);
        this.handleDropDown = this.handleDropDown.bind(this);
        this.handleRowSelection = this.handleRowSelection.bind(this);
        this.addWidgetInput = this.addWidgetInput.bind(this);
        this.handlePublishedAs = this.handlePublishedAs.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.validatePublishingValues = this.validatePublishingValues.bind(this);
        this.state = {
            selectedKey: 0,
            selectedValue: this.props.outputAttributes[0],
            publishedAttributes: [],
            selectedRow: [],
            errorTextField: ""
        }
    }

    handleDropDown(event, index, value) {
        this.setState({selectedKey: index, selectedValue: value});
    }

    handleRowSelection(selectedRow) {
        this.setState({selectedRow: selectedRow});
    }

    validatePublishingValues() {
        let isExists = false;
        this.state.publishedAttributes.map(outputAttribute => {
            if (outputAttribute.publishedAsValue == this.state.publishedAsValue) {
                isExists = true;
            }
        });
        return !isExists;
    }

    addWidgetInput(event) {
        if (this.validatePublishingValues()) {
            this.state.publishedAttributes.push({
                publishingValue: this.state.selectedValue,
                publishedAsValue: this.state.publishedAsValue
            });
            this.props.onConfigurationChange(this.state.publishedAttributes);
            this.setState({publishedAttributes: this.state.publishedAttributes});
        } else {
            this.setState({errorTextField: 'The value \'' + this.state.publishedAsValue + '\' already exists'})
        }
    }

    handleDelete(event) {
        this.state.publishedAttributes.splice(this.state.selectedRow[0], 1);
        this.setState({publishedAttributes: this.state.publishedAttributes, selectedRow: []});
    }

    handlePublishedAs(event, value) {
        this.state.publishedAsValue = value;
        this.setState({errorTextField: ''})
    }

    render() {
        let that = this;
        return (
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
                <h3>Data Publishing Configuration</h3>
                <Divider/>
                <CardMedia>
                    <div style={{marginTop: 15}}>
                        <div style={{verticalAlign: 'middle', marginRight: 10}}>Add widget inputs</div>
                        <SelectField style={{width: '25%'}} key={this.state.selectedKey}
                                     value={this.state.selectedValue}
                                     onChange={this.handleDropDown}>
                            {this.props.outputAttributes.map((outputAttribute, key) => {
                                return <MenuItem key={key} value={outputAttribute} primaryText={outputAttribute}/>
                            })}
                        </SelectField>
                        <h3 style={{
                            marginLeft: 20,
                            marginRight: 10,
                            verticalAlign: 'top',
                            display: 'inline-block'
                        }}>As</h3>
                        <TextField
                            style={{
                                verticalAlign: 'middle',
                                position: 'absolute',
                                marginLeft: 10,
                                marginRight: 10,
                                width: '20%'
                            }}
                            errorText={this.state.errorTextField}
                            onChange={this.handlePublishedAs}
                        />
                        <FloatingActionButton
                            mini={true}
                            style={{
                                display: 'inline-block',
                                marginRight: 20,
                                minWidth: 0,
                                width: 0,
                                verticalAlign: 'top',
                                marginLeft: '25%'

                            }}
                            onClick={this.addWidgetInput}
                        >
                            <ContentAdd/>
                        </FloatingActionButton>
                        {this.state.publishedAttributes.length != 0 ?
                            <Paper zDepth={5} style={{marginTop: 10, backgroundColor: '#282a36'}}>
                                <Table onRowSelection={this.handleRowSelection}
                                       style={{backgroundColor: '#282a36'}}>
                                    <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                                        <TableRow>
                                            <TableHeaderColumn>Publishing Value</TableHeaderColumn>
                                            <TableHeaderColumn>Published As</TableHeaderColumn>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody displayRowCheckbox={false} deselectOnClickaway={false}>
                                        {
                                            this.state.publishedAttributes.map(function (outputAttribute, index) {
                                                return (
                                                    <TableRow
                                                        selected={that.state.selectedRow[0] == index ? true : false}>
                                                        <TableRowColumn>{outputAttribute.publishingValue}</TableRowColumn>
                                                        <TableRowColumn>{outputAttribute.publishedAsValue}</TableRowColumn>
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
                </CardMedia>
            </Card>);
    }

}

export default DataPublishingComponent;