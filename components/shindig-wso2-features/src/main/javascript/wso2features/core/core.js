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

var wso2 = {};
wso2.gadgets = {};
/**
 * Implements core feature required for dashboard API.
 */
wso2.gadgets.core = (function () {

    /**
     * Service name of the RPC service callback.
     * @const
     */
    var RPC_SERVICE_GADGET_CALLBACK = 'RPC_SERVICE_GADGET_CALLBACK';

    /**
     * Holds the gadget callback functions.
     */
    var callbacks = {};

    /**
     * Call RPC service available in the dashboard server.
     * @param {String} service RPC service name
     * @param {Object} data Data to be sent
     * @param {function} callback Callback function
     * @return {null}
     */
    var callContainerService = function (service, data, callback) {
        if (callback) {
            callbacks[service] = callbacks[service] || [];
            callbacks[service].push(callback);
        }
        gadgets.rpc.call('', service, null, data);
    };

    // Register callback function to get responses from the container.
    gadgets.rpc.register(RPC_SERVICE_GADGET_CALLBACK, function (service, result) {
        if (!callbacks[service]) {
            return;
        }

        var callback = callbacks[service].shift();
        if (!callback) {
            return;
        }
        callback(result);
    });

    return {
        callContainerService: callContainerService
    };
})();