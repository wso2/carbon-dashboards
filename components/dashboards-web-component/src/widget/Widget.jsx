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
import AuthManager from '../auth/utils/AuthManager';

/**
 * Widget base component.
 */
export default class Widget extends Component {
    constructor() {
        super();
        this.getDashboardAPI = this.getDashboardAPI.bind(this);
    }

    /**
     * Returns the dashboards API functions.
     * @return {{}} APIs
     */
    getDashboardAPI() {
        const that = this;

        /**
         * Get state object.
         * @return {{}} Current state
         */
        function getStateObject() {
            // De-serialize the object in suitable format
            return (window.location.hash === '' || window.location.hash === '#') ?
                {} : JSON.parse(window.location.hash.substr(1));
        }

        /**
         * Set state object.
         * @param {{}} state New state
         */
        function setStateObject(state) {
            // Serialize the object in suitable format
            window.location.hash = JSON.stringify(state);
        }

        /**
         * Get local state.
         * @return {{}} Local state
         */
        function getLocalState() {
            const allStates = getStateObject();
            return Object.prototype.hasOwnProperty.call(allStates, that.props.id) ? allStates[that.props.id] : {};
        }

        /**
         * Set local state.
         * @param {{}} state New state
         */
        function setLocalState(state) {
            const allStates = getStateObject();
            allStates[that.props.id] = state;
            setStateObject(allStates);
        }

        return {
            state: {
                get(key) {
                    const state = getLocalState();
                    return Object.prototype.hasOwnProperty.call(state, key) ? state[key] : null;
                },
                set(key, value) {
                    const state = getLocalState();
                    state[key] = value;
                    setLocalState(state);
                },
            },
            identity: {
                get() {
                    const user = AuthManager.getUser();
                    return {
                        username: (user && user.username) ? user.username : null,
                    };
                },
            },
        };
    }

    /**
     * Returns HTML content.
     * @return {XML} HTML contemnt
     */
    render() {
        return (
            <div style={{ padding: '30px 15px 15px 15px' }}>
                {this.renderWidget()}
            </div>
        );
    }
}