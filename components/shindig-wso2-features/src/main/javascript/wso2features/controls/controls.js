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

    /**
     * Service name to resize gadgets.
     * @const
     * @private
     */
    var RPC_SERVICE_RESIZE_GADGET = 'RPC_SERVICE_RESIZE_GADGET';

    /**
     * Service name to restore gadgets.
     * @const
     * @private
     */
    var RPC_SERVICE_RESTORE_GADGET = 'RPC_SERVICE_RESTORE_GADGET';

    /**
     * Service name for lost focus event notifications.
     * @const
     * @private
     */
    var RPC_SERVICE_LOST_FOCUS_CALLBACK = 'RPC_SERVICE_LOST_FOCUS_CALLBACK';

    /**
     * Service name for gadget toolbar button callbacks.
     * @const
     * @private
     */
    var RPC_GADGET_BUTTON_CALLBACK = 'RPC_GADGET_BUTTON_CALLBACK';

	/**
     * RPC service name of finished loading event notifications.
     * @const
     * @private
     */
    var RPC_SERVICE_FINISHEDLOADING_CALL = 'RPC_SERVICE_FINISHEDLOADING_CALL';

    // Keeps handlers for lost focus event.
    var lostFocusCallbacks = [];

    // Keeps handlers for gadget toolbar buttons.
    var btnCallbacks = {};

    /**
     * Display an already hidden gadget.
     * @return {null}
     */
    var showGadget = function () {
        wso2.gadgets.core.callContainerService(RPC_SERVICE_SHOW_GADGET, null, null);
    };

    /**
     * Resize gadget block to a certain size.
     * @param {Object} options Size of the gadget
     * @return {null}
     */
    var resizeGadget = function (options) {
        wso2.gadgets.core.callContainerService(RPC_SERVICE_RESIZE_GADGET, options, null);
    };

    /**
     * Restore the size of the block.
     * @return {null}
     */
    var restoreGadget = function () {
        wso2.gadgets.core.callContainerService(RPC_SERVICE_RESTORE_GADGET, null, null);
    };

    /**
     * Add event handlers for lost focus event.
     * @param {function} callback Callback function
     * @return {null}
     */
    var addLostFocusListener = function (callback) {
        if (callback) {
            lostFocusCallbacks.push(callback);
        }
    };

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
     * Notifies the completion of gadget loading.
     * @return {null}
     */
    var finishedLoadingGadget = function () {
        wso2.gadgets.core.callContainerService(RPC_SERVICE_FINISHEDLOADING_CALL, null, null);
    }

    // Register callback function to get responses from the container.
    gadgets.rpc.register(RPC_SERVICE_LOST_FOCUS_CALLBACK, function () {
        for (var i = 0; i < lostFocusCallbacks.length; i++) {
            lostFocusCallbacks[i]();
        }
    });

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
        resizeGadget: resizeGadget,
        restoreGadget: restoreGadget,
        addLostFocusListener: addLostFocusListener,
        addButtonListener: addButtonListener,
		finishedLoadingGadget:finishedLoadingGadget
    };
})();