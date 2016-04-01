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

gadgets = gadgets || { };
gadgets.dsapi = { };
(function(ns) {
    /**
     * RPC service name to get gadget state.
     * @const
     * @private
     */
    var RPC_SERVICE_GET_STATE = 'RPC_SERVICE_GET_STATE';
    
    /**
     * RPC service name to set gadget state.
     * @const
     * @private
     */
    var RPC_SERVICE_SET_STATE = 'RPC_SERVICE_SET_STATE';
    
    /**
     * RPC service name to get current username.
     * @const
     * @private
     */
    var RPC_SERVICE_GET_USERNAME = 'RPC_SERVICE_GET_USERNAME';
    
    /**
     * RPC service name to get access token.
     * @const
     * @private
     */
    var RPC_SERVICE_GET_ACCESS_TOKEN = 'RPC_SERVICE_GET_ACCESS_TOKEN';
    
    /**
     * RPC service name fo get query string params.
     * @const
     * @private
     */
    var RPC_SERVICE_GET_QUERY_STRING = 'RPC_SERVICE_GET_QUERY_STRING';
    
    /**
     * RPC service name of gadget side callback.
     * @const
     * @private
     */
    var RPC_SERVICE_GADGET_CALLBACK = 'RPC_SERVICE_GADGET_CALLBACK';
    
    /**
     * Keeps callback functions registered for each service.
     * @private
     */
    var callbacks = { };
    
    /**
     * Request RPC sadgets.dsapervice implemented in the container.
     * @param {String} service Name of the service
     * @param {Object} data Request data
     * @param {function} callback Callback function
     * @return {null}
     */
    var requestRpcService = function(service, data, callback) {
        if (callback) {
            if (! callbacks[service]) {
                callbacks[service] = [];
            }
            callbacks[service].push(callback);
        }
        gadgets.rpc.call('', service, null, data);
    }
    
    /**
     * Get gadget state from the containers URL hash.
     * @param {function} callback Callback function
     * @return {null}
     */
    ns.getGadgetState = function(callback) {
        requestRpcService(RPC_SERVICE_GET_STATE, null, callback);
    }
    
    /**
     * Set gadget state in the containers URL hash.
     * @param {Object} state Gadget state
     * @param {function} callback Callback function
     * @return {null}
     */
    ns.setGadgetState = function(state, callback) {
        requestRpcService(RPC_SERVICE_SET_STATE, state, callback);
    }
    
    /**
     * Get current username.
     * @param {function} callback Callback function
     * @return {null}
     */
    ns.getUsername = function(callback) {
       requestRpcService(RPC_SERVICE_GET_USERNAME , null, callback);
    }
    
    /**
     * Get access token.
     * @param {function} callback Callback function
     * @return {null}
     */
    ns.GetAccessToken = function(callback) {
        requestRpcService(RPC_SERVICE_GET_ACCESS_TOKEN, null, callback);
    }
    
    /**
     * Get query string parameter.
     * @param {String} param Query string parameter name
     * @param {function} callback Callback function
     * @return {null}
     */
    ns.getQueryString = function(param, callback) {
        requestRpcService(RPC_SERVICE_GET_QUERY_STRING, param, callback);
    }
    
    // Register callback function to get responses from the container.
    gadgets.rpc.register(RPC_SERVICE_GADGET_CALLBACK, function(service, result) {
        if (!callbacks[service]) {
            return;
        }
        
        var callback = callbacks[service].shift();
        if (!callback) {
            return;
        }
        callback(result);
    });
})(gadgets.dsapi);


