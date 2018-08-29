/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, {Component} from 'react';
import Axios from 'axios';

const SESSION_USER = 'DASHBOARD_USER';

/**
 * Widget base class.
 */
export default class Widget extends Component {
    constructor(props) {
        super(props);

        this._getLocalState = this._getLocalState.bind(this);
        this._setLocalState = this._setLocalState.bind(this);
        this.getWidgetState = this.getWidgetState.bind(this);
        this.setWidgetState = this.setWidgetState.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.channelManager = props.channelManager;
    }

    /**
     * This method is called by subscriber widget to set the listener callback.
     * @param listnerCallback
     */
    subscribe(listenerCallback, publisherId, context) {
        if (!publisherId) {
            const publisherIds = this.props.configs.pubsub.publishers;
            if (publisherIds && Array.isArray(publisherIds)) {
                publisherIds.forEach(id => this.props.pubSubHub.subscribe(id, listenerCallback));
            }
        } else {
            this.props.pubSubHub.subscribe(publisherId, listenerCallback, context);
        }
    }

    /**
     * This method is called by publisher widget to publish messages.
     * @param listnerCallback
     */
    publish(message) {
        this.props.pubSubHub.publish(this.props.id, message);
    }

    /**
     * Build state object from the browser hash.
     *
     * @return {{}} State
     */
    static _getStateObject() {
        // De-serialize the object in suitable format
        const hash = decodeURIComponent(window.location.hash);
        return (hash === '' || hash === '#') ?
            {} : JSON.parse(hash.substr(1));
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
     * Get global widget state.
     *
     * @param {string} key Key
     * @returns {{}}
     */
    getGlobalState(key) {
        return Widget._getStateObject()[key] || { };
    }

    /**
     * Set global widget state.
     *
     * @param {string} key Key
     * @param {{}} state State
     */
    setGlobalState(key, state) {
        const states = Widget._getStateObject();
        states[key] = state;
        Widget._setStateObject(states);
    }

    /**
     * Get local widget state.
     *
     * @return {{}} State
     */
    _getLocalState() {
        return this.getGlobalState(this.props.id);
    }

    /**
     * Set local widget state.
     *
     * @param {{}} state State
     */
    _setLocalState(state) {
        this.setGlobalState(this.props.id, state);
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

    getWidgetChannelManager() {
        return this.channelManager;
    }

    getWidgetConfiguration(widgetId) {
        let httpClient = Axios.create({
            baseURL: window.location.origin + window.contextPath,
            timeout: 2000,
            headers: {"Authorization": "Bearer " + JSON.parse(Widget._getSessionCookie(SESSION_USER)).SDID},
        });
        httpClient.defaults.headers.post['Content-Type'] = 'application/json';
        return httpClient.get(`/apis/widgets/${widgetId}`);
    }
}

Widget.version = '1.4.0';
