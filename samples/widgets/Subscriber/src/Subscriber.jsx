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
import Widget from '@wso2-dashboards/widget';

class Subscriber extends Widget {
    constructor(props) {
        super(props);
        this.state = {receivedMsg: ''};
        this.set = new Set();
        this.clearMsgs = this.clearMsgs.bind(this);
        this.setReceivedMsg = this.setReceivedMsg.bind(this);
    }

    componentWillMount() {
        super.subscribe(this.setReceivedMsg);
    }

    setReceivedMsg(receivedMsg) {
        this.set.add(receivedMsg);
        this.setState({receivedMsg});
    }

    generateOutput() {
        if (this.state.receivedMsg) {
            const output = [];
            for (const key of this.set.values()) {
                output.push(<div>[Received] {new Date().toTimeString()} [Message] - {key}</div>);
            }
            return output;
        } else {
            return '';
        }
    }

    clearMsgs() {
        this.setState({receivedMsg: ''});
        this.set.clear();
    }

    renderWidget() {
        return (<section style={{marginTop: 25}}><h4 style={{display: 'inline', marginRight: 10}}>Received Messages</h4>
            <input
                type="button"
                onClick={this.clearMsgs}
                value="Clear"
            />
            <div>{this.generateOutput()}</div>
        </section>);
    }
}

global.dashboard.registerWidget("Subscriber", Subscriber);
