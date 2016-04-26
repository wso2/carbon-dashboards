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
 * Implements dashboard API gadget control feature.
 */
wso2.gadgets.controls = (function () {

    /**
     * Service name to show gadget.
     * @const
     * @private
     */
    var RPC_SERVICE_SHOW_GADGET = 'RPC_SERVICE_SHOW_GADGET';
    var RPC_GADGET_BUTTON_CALLBACK = 'RPC_GADGET_BUTTON_CALLBACK';
    var btnCallbacks = {};
    /**
     * Adding button callback functions.
     * @return {null}
     */
    var addButtonListener = function (action, callback) {
        if (!btnCallbacks[action]) {
            btnCallbacks[action] = [];
        }
        btnCallbacks[action].push(callback);
    };

    /**
     * Display an already hidden gadget.
     * @return {null}
     */
    var showGadget = function () {
        wso2.gadgets.core.callContainerService(RPC_SERVICE_SHOW_GADGET, null, null);
    };

    // Register callback function to trigger respective fuction to button click.
    gadgets.rpc.register(RPC_GADGET_BUTTON_CALLBACK, function (action) {
        if (!btnCallbacks[action]) {
            return;
        }
        for (var i = 0; i < btnCallbacks[action].length; i++) {
            btnCallbacks[action][i]();
        }
    });

    return {
        showGadget: showGadget,
        addButtonListener: addButtonListener
    };
})();