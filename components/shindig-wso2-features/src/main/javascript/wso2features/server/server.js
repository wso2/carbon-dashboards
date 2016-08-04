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
 * Implements server API o get server specific details.
 */
wso2.gadgets.server = (function () {

    /**
     * Service name to get hostname.
     * @const
     * @private
     */
    var RPC_SERVICE_SERVER_HOSTNAME = 'RPC_SERVICE_SERVER_HOSTNAME';

    /**
     * Service name to get port.
     * @const
     * @private
     */
    var RPC_SERVICE_GET_SERVER_PORT = 'RPC_SERVICE_GET_SERVER_PORT';

    /**
     * Get hostname of the server.
     * @param {function} callback Callback function
     * @return {null}
     */
    var getHostname = function (callback) {
        wso2.gadgets.core.callContainerService(RPC_SERVICE_SERVER_HOSTNAME, null, function (hostname) {
            if (callback) {
                callback(hostname);
            }
        });
    };

    /**
     * Get port of the server
     * @param httpType https or http
     * @param callback
     */
    var getPort = function (httpType, callback) {
        wso2.gadgets.core.callContainerService(RPC_SERVICE_GET_SERVER_PORT, httpType, function (port) {
            if (callback) {
                callback(port);
            }
        });
    };

    return {
        getHostname: getHostname,
        getPort: getPort
    };
})();