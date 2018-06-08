/*
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React from 'react';
import { IconButton, Table, TableBody, TableRow, TableRowColumn } from 'material-ui';
import ClearButton from 'material-ui/svg-icons/content/clear';
import AddButton from 'material-ui/svg-icons/content/add';
import TextInput from '../inputTypes/TextProperty';
import SelectProperty from '../inputTypes/SelectProperty';

export default class MetaDataCollector extends React.Component {
    constructor(props) {
        super(props);

        this.handleMetadataPropertyChange = this.handleMetadataPropertyChange.bind(this);
        this.removeMetadata = this.removeMetadata.bind(this);
        this.addMetadata = this.addMetadata.bind(this);
    }

    handleMetadataPropertyChange(index, property, value) {
        const { metadata } = this.props;
        metadata[property][index] = value;
        this.props.handleMetadataChange(metadata);
    }

    removeMetadata(index) {
        const { metadata } = this.props;
        metadata.names.splice(index, 1);
        metadata.types.splice(index, 1);
        this.props.handleMetadataChange(metadata);
    }

    addMetadata() {
        const { metadata } = this.props;
        metadata.names.push('');
        metadata.types.push('LINEAR');
        this.props.handleMetadataChange(metadata);
    }

    render() {
        const { metadata } = this.props;

        return (
            <div>
                <br />
                <br />
                Metadata related to the stream
                <Table>
                    <TableBody displayRowCheckbox={false}>
                        {metadata && metadata.names.map((name, metaIndex) =>
                            (<TableRow key={metaIndex} >
                                <TableRowColumn>
                                    <TextInput
                                        id={name}
                                        value={name}
                                        fieldName={'Metadata Name'}
                                        onChange={
                                            (id, value) => this.handleMetadataPropertyChange(metaIndex, 'names', value)
                                        }
                                    />
                                </TableRowColumn>
                                <TableRowColumn>
                                    <SelectProperty
                                        id={`metadata-${metaIndex}-type`}
                                        value={metadata.types[metaIndex]}
                                        fieldName={'Metadata Type'}
                                        onChange={
                                            (id, value) => this.handleMetadataPropertyChange(metaIndex, 'types', value)
                                        }
                                        options={{
                                            values: ['LINEAR', 'ORDINAL', 'TIME'],
                                            texts: ['LINEAR', 'ORDINAL', 'TIME'],
                                        }}
                                        fullWidth
                                    />
                                </TableRowColumn>
                                <TableRowColumn
                                    style={{ width: '30%' }}
                                >
                                    <IconButton onClick={() => this.removeMetadata(metaIndex)} >
                                        <ClearButton />
                                    </IconButton>
                                </TableRowColumn>
                            </TableRow>))}
                    </TableBody>
                </Table>
                <div>
                    <IconButton onClick={() => this.addMetadata()}>
                        <AddButton />
                    </IconButton>
                    <br />
                </div>
            </div>
        );
    }
}
