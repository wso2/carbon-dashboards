/*
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

/**
 * Implements dashboard API gadget state feature.
 */
wso2.gadgets.state = (function () {

    /**
     * Service name to get gadget state.
     * @const
     * @private
     */
    var RPC_SERVICE_GET_STATE = 'RPC_SERVICE_GET_STATE';

    /**
     * Service name to get global state.
     * @const
     * @private
     */
    var RPC_SERVICE_GET_GLOBAL_STATE = 'RPC_SERVICE_GET_GLOBAL_STATE';

    /**
     * Service name to set gadget state.
     * @const
     * @private
     */
    var RPC_SERVICE_SET_STATE = 'RPC_SERVICE_SET_STATE';

    /**
     * Service name to set global state.
     * @const
     * @private
     */
    var RPC_SERVICE_SET_GLOBAL_STATE = 'RPC_SERVICE_SET_GLOBAL_STATE';

    /**
     * Get gadget state from the containers URL hash.
     * @param {function} callback Callback function
     * @return {null}
     */
    var getGadgetState = function (callback) {
        wso2.gadgets.core.callContainerService(RPC_SERVICE_GET_STATE, null, function (gadgetState) {
            if (callback) {
                callback(gadgetState);
            }
        });
    };

    /**
     * Get global state from the containers URL hash.
     * @param {function} callback Callback function
     * @return {null}
     */
    var getGlobalState = function (key, callback) {
        wso2.gadgets.core.callContainerService(RPC_SERVICE_GET_GLOBAL_STATE, key, function (gadgetState) {
            if (callback) {
                callback(gadgetState);
            }
        });
    };

    /**
     * Set gadget state in the containers URL hash.
     * @param {Object} state Gadget state
     * @param {function} callback Callback function
     * @return {null}
     */
    var setGadgetState = function (state, callback) {
        wso2.gadgets.core.callContainerService(RPC_SERVICE_SET_STATE, state, function () {
            if (callback) {
                callback();
            }
        });
    };

    /**
     * Set global state in the containers URL hash.
     * @param {Object} state Gadget state
     * @param {function} callback Callback function
     * @return {null}
     */
    var setGlobalState = function (key, state, callback) {
        wso2.gadgets.core.callContainerService(RPC_SERVICE_SET_GLOBAL_STATE, {key:key,value:state}, function () {
            if (callback) {
                callback();
            }
        });
    };

    return {
        getGadgetState: getGadgetState,
        setGadgetState: setGadgetState,
        getGlobalState: getGlobalState,
        setGlobalState: setGlobalState
    };
})();