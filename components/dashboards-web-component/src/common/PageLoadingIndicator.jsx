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

import React, { Component } from 'react';
import { LinearProgress, Paper } from 'material-ui';
import PropTypes from 'prop-types';

const styles = {
    paper: {
        height: '100%',
        width: '100%',
        margin: 0,
        paddig: 0,
        border: 0,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    title: {
        fontWeight: 500,
        fontSize: '18px',
        marginTop: 20,
        marginBottom: 10,
    },
    progressBar: {
        marginLeft: 20,
        marginRight: 20,
    },
};

export default class PageLoadingIndicator extends Component {
    render() {
        return (
            <Paper style={styles.paper} zDepth={0}>
                <span>
                    <div style={styles.title}>{this.props.title}</div>
                    <div style={styles.progressBar}>
                        <LinearProgress mode="indeterminate" />
                    </div>
                </span>
            </Paper>
        );
    }
}

PageLoadingIndicator.propTypes = {
    title: PropTypes.string,
};

PageLoadingIndicator.defaultProps = {
    title: 'Loading ...',
};
