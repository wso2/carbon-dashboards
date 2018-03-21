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

const SESSION_USER = 'DASHBOARD_USER';

/**
 * Widget base class.
 */
export default class Widget extends Component {
    constructor(props) {
        super(props);

        this.messageQueue = [];
        this.props.glContainer.layoutManager.on('initialised', this.publishQueuedMessages);

        this._getLocalState = this._getLocalState.bind(this);
        this._setLocalState = this._setLocalState.bind(this);
        this.getWidgetState = this.getWidgetState.bind(this);
        this.setWidgetState = this.setWidgetState.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.publishQueuedMessages = this.publishQueuedMessages.bind(this);
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
     * Build state object from the browser hash.
     * 
     * @return {{}} State
     */
    static _getStateObject() {
        // De-serialize the object in suitable format
        return (window.location.hash === '' || window.location.hash === '#') ?
            {} : JSON.parse(window.location.hash.substr(1));
    }

    /**
     * Set state object in the browser hash.
     * 
     * @param {{}} state State
     */
    static _setStateObject(state) {
        // Serialize the object in suitable format
        window.location.hash = JSON.stringify(state);
    }

    /**
     * Get session cookie by name.
     *
     * @param {string} name Name of the cookie
     * @returns {string} Content
     */
    static _getSessionCookie(name) {
        name = `${name}=`;
        const arr = document.cookie.split(';');
        for (let i = 0; i < arr.length; i++) {
            let c = arr[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return '';
    }

    /**
     * Get local widget state.
     * 
     * @return {{}} State
     */
    _getLocalState() {
        let states = Widget._getStateObject();
        return Object.prototype.hasOwnProperty.call(states, this.props.id) ? states[this.props.id] : {};
    }

    /**
     * Set local widget state.
     * 
     * @param {{}} state State
     */
    _setLocalState(state) {
        let states = Widget._getStateObject();
        states[this.props.id] = state;
        Widget._setStateObject(states);
    }

    /**
     * Get widget state.
     * 
     * @param {string} key Key
     * @return {{}} State
     */
    getWidgetState(key) {
        const state = this._getLocalState();
        return Object.prototype.hasOwnProperty.call(state, key) ? state[key] : null;
    }

    /**
     * Set widget state.
     * 
     * @param {string} key State key
     * @param {{}} value State value
     */
    setWidgetState(key, value) {
        const state = this._getLocalState();
        state[key] = value;
        this._setLocalState(state);
    }

    /**
     * Get current user.
     * 
     * @return {{}} User object
     */
    getCurrentUser() {
        const user = JSON.parse(Widget._getSessionCookie(SESSION_USER));
        return {
            username: (user && user.username) ? user.username : null,
        };
    }
}
