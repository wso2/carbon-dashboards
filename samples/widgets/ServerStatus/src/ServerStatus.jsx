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
import Widget from '@wso2-dashboards/widget';

const serverData = [
    {
        name: 'Server 1',
        ip: '192.168.1.2',
        status: true
    },
    {
        name: 'Server 2',
        ip: '192.168.1.3',
        status: true
    },
    {
        name: 'Server 3',
        ip: '192.168.1.4',
        status: false
    }
];

const styles = {
    wrapper: {
        padding: '30px 15px 15px 15px',
        font: '11px Roboto, sans-serif'
    },
    container: {
        width: '33.33%',
        'min-height': '200px',
        float: 'left',
        padding: '10px',
        'box-sizing': 'border-box'
    },
    containerDivUp: {
        'min-height': '180px',
        'background-color': '#19862b',
        'padding-top': '30px'
    },
    containerDivDown: {
        'min-height': '180px',
        'background-color': '#d00000',
        'padding-top': '30px'
    },
    h3: {
        margin: 0,
        padding: '10px',
        'text-align': 'center',
        color: '#fff',
        'font-size': '32px'
    },
    p: {
        margin: 0,
        padding: '10px',
        'text-align': 'center',
        color: '#fff',
    },
    h1: {
        color: '#fff',
        'font-size': '36px',
        margin: 0,
        'padding-bottom': '10px',
        'margin-bottom': '15px',
        'border-bottom': '1px solid #444'
    }
};

class ServerStatus extends Widget {
    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            width: props.glContainer.width,
            height: props.glContainer.height,
        };
        this.handleResize = this.handleResize.bind(this);
        this.props.glContainer.on('resize', this.handleResize);
    }

    render () {
        return (
            <section style={styles.wrapper}>
                <h1 style={styles.h1}>System Analytics</h1>
                {
                    serverData.map((server) => {
                        return (
                            <div style={styles.container}>
                                <div style={server.status ? styles.containerDivUp : styles.containerDivDown}>
                                    <h3 style={styles.h3}>{server.name}</h3>
                                    <p style={styles.p}><strong>IP Address: </strong>{server.ip}</p>
                                </div>
                            </div>
                        );
                    })
                }
            </section>
        );
    }

    handleResize() {
        this.setState({width: this.props.glContainer.width, height: this.props.glContainer.height});
    }
}

global.dashboard.registerWidget("ServerStatus", ServerStatus);