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

import React from 'react';
import Widget from '@wso2-dashboards/widget';

/**
 * This class depicts how the basic functions of widget state persistence works.
 */
class WidgetState extends Widget {
    /**
     * Constructor.
     */
    constructor(props) {
        super(props);
        this.state = {
            inputVal: ''
        };
        this.btnPersistState = this.btnPersistState.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    /**
     * Implements the renderWidget function.
     */
    render() {
        let styles = {
            container: {
                font: '12px Roboto, sans-serif',
                color: '#fff'
            },
            button: {
                'margin-right': '10px'
            },
            logPanel: {
                'background-color': '#000',
                padding: '10px',
                color: '#ffffff',
                height: '100px'
            },
            inputBox: {
                padding: '3px',
                'margin-right': '10px'
            },
            controls: {
                'margin-bottom': '10px'
            }
        };

        // Syntax: super.getWidgetState(<KEY>)
        let message = super.getWidgetState('message');
        let labelText = message && message != null && message !== ''  ?
            'Persisted message found: ' + message : 'No persisted state found';

        return (

            <div style={styles.container}>
                <div style={styles.controls}>
                    <strong>Message: </strong><input style={styles.inputBox} type="text" id="txtMessage" 
                        value={this.state.inputVal} onChange={this.handleChange} />
                    <button style={styles.button} onClick={this.btnPersistState}>Persist State</button>
                </div>
                <div style={styles.logPanel} id="divConsole">{labelText}</div>
            </div>
        );
    }

    /**
     * Event handler for set state button.
     */
    btnPersistState() {
        // Syntax: super.setWidgetState(<KEY>, <VALUE>)
        let message = document.getElementById('txtMessage').value;
        super.setWidgetState('message', message);
        alert('State persisted successfully!');
        this.forceUpdate();
    }

    handleChange(event) {
        this.setState({ inputVal: event.target.value });
        this.input = {};
        this.input.value = event.target.value;
    }
}

global.dashboard.registerWidget('WidgetState', WidgetState);
