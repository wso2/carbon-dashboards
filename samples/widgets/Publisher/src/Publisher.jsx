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

class Publisher extends Widget {
    constructor(props) {
        super(props);
        this.publishMsg = this.publishMsg.bind(this);
        this.publishedMsgSet = new Set();
        this.state = {publishedMsg: ''};
        this.onChangeHandle = this.onChangeHandle.bind(this);
        this.getPublishedMsgsOutput = this.getPublishedMsgsOutput.bind(this);
        this.clearMsgs = this.clearMsgs.bind(this);
    }

    publishMsg(event) {
        event.preventDefault();
        if (this.input.value) {
            this.state.inputVal = '';
            this.publishedMsgSet.add(this.input.value);
            super.publish(this.input.value);
            this.setState({publishedMsg: this.input.value});
        }
    }

    componentDidMount() {
        super.publish("Initial Message");
    }

    getPublishedMsgsOutput() {
        const output = [];
        for (const key of this.publishedMsgSet.values()) {
            output.push(<div>[Sent] {new Date().toTimeString()} [Message] - {key}</div>);
        }
        return output;
    }

    clearMsgs() {
        this.setState({publishedMsg: ''});
        this.publishedMsgSet.clear();
    }

    onChangeHandle(event) {
        this.setState({inputVal: event.target.value});
        this.input = {};
        this.input.value = event.target.value;
    }

    renderWidget() {
        return (
            <section style={{marginTop: 25}}>
                <form onSubmit={this.publishMsg}>
                    <label style={{marginRight: 10}}>
                        What do you want to publish
                    </label>
                    <input
                        type="text"
                        value={this.state.inputVal}
                        onChange={this.onChangeHandle}
                    />
                    <br />
                    <input type="submit" value="Publish"/>
                    <br />
                    <h4 style={{display: 'inline', marginRight: 10}}>Sent Messages</h4>
                    <input type="button" value="Clear" onClick={this.clearMsgs}/>
                </form>
                {this.getPublishedMsgsOutput()}
            </section>
        );
    }
}

global.dashboard.registerWidget("Publisher", Publisher);
