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
//import Widget from '@wso2-dashboards/widget';
import Widget from '../../Publisher/src/Widget';
import FlatButton from 'material-ui/FlatButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';

class Subscriber extends Widget {
    constructor(props) {
        super(props);
        this.state = {receivedMsg: ''};
        this.set = [];
        this.clearMsgs = this.clearMsgs.bind(this);
        this.setReceivedMsg = this.setReceivedMsg.bind(this);
    }

    componentWillMount() {
        super.subscribe(this.setReceivedMsg);
    }

    setReceivedMsg(receivedMsg) {
        this.set.push({time: new Date(), value: receivedMsg});
        this.setState({receivedMsg});
    }

    generateOutput() {
        if (this.state.receivedMsg) {
            const output = [];
            this.set.forEach(d => {
                output.push(<div>[Received] {d.time.toTimeString()} [Message] - {d.value}</div>);
            });

            return output;
        } else {
            return '';
        }
    }

    clearMsgs() {
        this.setState({receivedMsg: ''});
        this.set = [];
    }

    render() {
        return (
            <MuiThemeProvider
                muiTheme={getMuiTheme(darkBaseTheme)}
            >
                <section style={{marginTop: 25}}><h3 style={{display: 'inline', marginRight: 10}}>Received Messages</h3>
                    <FlatButton
                        backgroundColor={'#d3240b'}
                        hoverColor={'#86170b'}
                        label={"Clear"}
                        onClick={this.clearMsgs}
                        style={{
                            marginLeft: 5
                        }}
                    />
                    <div style={{marginTop: 10}}>{this.generateOutput()}</div>
                </section>
            </MuiThemeProvider>
        );
    }
}

global.dashboard.registerWidget("Subscriber", Subscriber);
