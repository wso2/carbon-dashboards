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

class Widget extends Component {
    constructor(props) {
        super(props);
        this.getDashboardAPI = this.getDashboardAPI.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.messageQueue = [];
        this.publishQueuedMessages = this.publishQueuedMessages.bind(this);
        this.props.glContainer.layoutManager.on("initialised", this.publishQueuedMessages);
    }

    /**
     * This method publishers the queued messages in the widget. The messages are queued when the widget tried to
     * publish before initializing the dashboard.
     *
     */
    publishQueuedMessages() {
        for (let messageId in this.messageQueue) {
            this.publish(this.messageQueue[messageId])
        }
    }

    /**
     * This method is called by subscriber widget to set the listener callback.
     * @param listnerCallback
     */
    subscribe(listenerCallback) {
        this.props.glEventHub.on(this.props.id, listenerCallback)
    }

    /**
     * This method is called by publisher widget to publish messages.
     * @param listnerCallback
     */
    publish(message) {
        let publishedChannel = this.props.id;
        if (!this.props.glContainer.layoutManager.isInitialised) {
            this.messageQueue.push(message)
        } else {
            this.props.glEventHub.emit(publishedChannel, message);
        }
    }

    /**
     * Returns the dashboards API functions.
     */
    getDashboardAPI() {
        let that = this;

        function getStateObject() {
            // De-serialize the object in suitable format
            return (window.location.hash === '' || window.location.hash === '#') ?
                {} : JSON.parse(window.location.hash.substr(1));
        }

        function setStateObject(state) {
            // Serialize the object in suitable format
            window.location.hash = JSON.stringify(state);
        }

        function getLocalState() {
            let allStates = getStateObject();
            return allStates.hasOwnProperty(that.props.id) ? allStates[that.props.id] : {};
        }

        function setLocalState(state) {
            let allStates = getStateObject();
            allStates[that.props.id] = state;
            setStateObject(allStates);
        }

        return {
            state: {
                get: function (key) {
                    let state = getLocalState();
                    return state.hasOwnProperty(key) ? state[key] : null;
                },
                set: function (key, value) {
                    let state = getLocalState();
                    state[key] = value;
                    setLocalState(state);
                }
            }
        };
    }

    render() {
        let styles = {
            padding: '30px 15px 15px 15px'
        };
        return (
            <div style={styles}>
                {this.renderWidget()}
            </div>
        );
    }
}

export default Widget;
