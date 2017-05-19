/**
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function (api) {
    /**
     * Initializes the widget state API. The widget state is stored in the URL hash.
     * Hash: { "global": { "<key>": "<value>", ... }, "local": { "<widgetId>": {"<key>": "<value>", ... }, ... } }
     */
    api.state = (function () {

        /**
         * Build state object from the URL hash.
         * @returns {{}} State object
         */
        function getState() {
            try {
                return (location.hash.length > 1) ? JSON.parse(location.hash.substring(1)) : {};
            } catch (e) {
                return {};
            }
        }

        /**
         * Set the state object to the URL hash.
         * @param stateObj State object
         */
        function setState(stateObj) {
            location.hash = JSON.stringify(stateObj);
        }

        /**
         * Get the global state which can be shared between multiple widgets.
         * @param key Key
         * @returns {*}
         */
        function getGlobalState(key) {
            var globalState = getState().global || {};
            return globalState.hasOwnProperty(key) ? globalState[key] : undefined;
        }

        /**
         * Set the global state which can be shared between multiple widgets.
         * @param key Key
         * @param value Value
         */
        function setGlobalState(key, value) {
            var state = getState();
            state.global = state.global || {};
            state.global[key] = value;
            setState(state);
        }

        /**
         * Get the local state of a widget.
         * @param containerId ID of the widget container
         * @param key Key
         * @returns {*}
         */
        function getLocalState(containerId, key) {
            var localState = getState().local || {};
            return localState.hasOwnProperty(containerId) && localState[containerId].hasOwnProperty(key) ?
                localState[containerId][key] : undefined;
        }

        /**
         * Set the local state of a widget.
         * @param containerId ID of the widget container
         * @param key Key
         * @param value Value
         */
        function setLocalState(containerId, key, value) {
            var state = getState();
            state.local = state.local || {};
            state.local[containerId] = state.local[containerId] || {};
            state.local[containerId][key] = value;
            setState(state);
        }

        return {
            getGlobalState: getGlobalState,
            setGlobalState: setGlobalState,
            getLocalState: getLocalState,
            setLocalState: setLocalState
        }
    })();
})(portal.dashboards.api);