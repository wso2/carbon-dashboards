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

(function () {
    /**
     * RPC service name to get gadget state.
     * @const
     * @private
     */
    var RPC_SERVICE_GET_STATE = 'RPC_SERVICE_GET_STATE';

    /**
     * RPC service name to get global state.
     * @const
     * @private
     */
    var RPC_SERVICE_GET_GLOBAL_STATE = 'RPC_SERVICE_GET_GLOBAL_STATE';

    /**
     * RPC service name to set gadget state.
     * @const
     * @private
     */
    var RPC_SERVICE_SET_STATE = 'RPC_SERVICE_SET_STATE';

    /**
     * Global state preserving variable name
     * @type {string}
     */
    var GLOBAL_STATE_KEY = 'GLOBAL-STATE';

    /**
     * RPC service name to set global state.
     * @const
     * @private
     */
    var RPC_SERVICE_SET_GLOBAL_STATE = 'RPC_SERVICE_SET_GLOBAL_STATE';

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
     * RPC service name to navigate to other page.
     * @const
     * @private
     */
    var RPC_SERVICE_NAVIGATE_PAGE = 'RPC_SERVICE_NAVIGATE_PAGE';

    /**
     * RPC service name fo show gadget
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
     * RPC service name of gadget side callback.
     * @const
     * @private
     */
    var RPC_SERVICE_GADGET_CALLBACK = 'RPC_SERVICE_GADGET_CALLBACK';

    /**
     * RPC service name of lost focus event notifications.
     * @const
     * @private
     */
    var RPC_SERVICE_LOST_FOCUS_CALLBACK = 'RPC_SERVICE_LOST_FOCUS_CALLBACK';

    /**
     * RPC service name of finished loading event notifications.
     * @const
     * @private
     */
    var RPC_SERVICE_FINISHEDLOADING_CALL = 'RPC_SERVICE_FINISHEDLOADING_CALL';

    /**
     * RPC service name of getting dashboard ID
     * @const
     * @private
     */
    var RPC_SERVICE_GETDASHBOARDID_CALL = 'RPC_SERVICE_GETDASHBOARDID_CALL';

    /**
     * RPC service name of getting dashboard Name
     * @const
     * @private
     */
    var RPC_SERVICE_GETDASHBOARDNAME_CALL = 'RPC_SERVICE_GETDASHBOARDNAME_CALL';

    /**
     * RPC service name of getting logged-in user domain
     * @const
     * @private
     */
    var RPC_SERVICE_GET_TENANT_DOMAIN = 'RPC_SERVICE_GET_TENANT_DOMAIN';

    /**
     * RPC service name of getting hostname
     * @const
     * @private
     */
    var RPC_SERVICE_SERVER_HOSTNAME = 'RPC_SERVICE_SERVER_HOSTNAME';

    /**
     * RPC service name of getting port
     * @const
     * @private
     */
    var RPC_SERVICE_GET_SERVER_PORT = 'RPC_SERVICE_GET_SERVER_PORT';

    /**
     * RPC service name of getting current page
     * @const
     * @private
     */
    var RPC_SERVICE_GETCURRENTPAGE_CALL = 'RPC_SERVICE_GETCURRENTPAGE_CALL';

    /**
     * RPC service name of getting current view
     * @const
     * @private
     */
    var RPC_SERVICE_GETCURRENTVIEW_CALL = 'RPC_SERVICE_GETCURRENTVIEW_CALL';

    var username;
    var hostname;
    var port;
    var encodeHash = false;

    /**
     * Serialize the page into formatted hash.
     * @param {Object} states Gadget states
     * @return {String} Serialized page state
     * @private
     */
    var serialize = function (states) {
        var result = '';
        for (var property in states) {
            if (states.hasOwnProperty(property)) {
                var key = property;
                var val = JSON.stringify(states[property]);
                if (encodeHash) {
                    key = encodeURIComponent(key);
                    val = encodeURIComponent(val);
                }
                result += '/' + key + '/' + val;
            }
        }
        return result.substr(1);
    };

    /**
     * Deserialize the page state into an object.
     * @param {String} hash Page state hash string
     * @return {Object} Page state
     * @private
     */
    var deserialize = function (hash) {
        var tokens = hash.split('/');
        var result = {};
        for (var i = 0; i < tokens.length; i += 2) {
            if (typeof tokens[i + 1] != 'undefined') {
                var key = tokens[i];
                var val = tokens[i + 1];
                if (encodeHash) {
                    key = decodeURIComponent(key);
                    val = decodeURIComponent(val);
                }
                result[key] = JSON.parse(val);
            }
        }
        return result;
    };

    /**
     * Get page state from the URL hash.
     * @return {Object} Page state
     * @private
     */
    var getPageState = function () {
        var hash = window.location.hash;
        if (hash.length > 1) {
            return deserialize(hash.substr(1));
        }
        return {};
    };

    /**
     * Send response to gadgets for dashboard API invocations.
     * @param {String} service Name of the requested service
     * @param {String} gadgetId Gadget ID
     * @param {Number} callbackId Callback function ID
     * @param {String} response Response
     * @return {null}
     * @private
     */
    var sendGadgetResponse = function (target, service, response) {
        gadgets.rpc.call(target, RPC_SERVICE_GADGET_CALLBACK, null, service, response);
    };

    /**
     * Get gadget ID from the gadget container ID.
     * @param {String} containerID ID of the container
     * @return {String} Gadget ID
     * @private
     */
    var getGadgetId = function (containerId) {
        return containerId.replace('sandbox-gadget-', '');
    };

    // Register RPC services
    // Get gadget state
    gadgets.rpc.register(RPC_SERVICE_GET_STATE, function () {
        var gadgetState = getPageState()[getGadgetId(this.f)];
        sendGadgetResponse(this.f, RPC_SERVICE_GET_STATE, gadgetState);
    });

    // Register RPC services
    // Get global state
    gadgets.rpc.register(RPC_SERVICE_GET_GLOBAL_STATE, function () {
        var globalState = getPageState()[GLOBAL_STATE_KEY];
        sendGadgetResponse(this.f,RPC_SERVICE_GET_GLOBAL_STATE , globalState);
    });


    // Set gadget state
    gadgets.rpc.register(RPC_SERVICE_SET_STATE, function (gadgetState) {
        var pageState = getPageState();
        pageState[getGadgetId(this.f)] = gadgetState;
        window.location.hash = serialize(pageState);
        sendGadgetResponse(this.f, RPC_SERVICE_SET_STATE);
    });

    // Set global state
    gadgets.rpc.register(RPC_SERVICE_SET_GLOBAL_STATE, function (keyValue) {
        var pageState = getPageState();
        if(!pageState[GLOBAL_STATE_KEY]){
            pageState[GLOBAL_STATE_KEY] = {};
        }
        pageState[GLOBAL_STATE_KEY][keyValue.key] = keyValue.value;
        window.location.hash = serialize(pageState);
        sendGadgetResponse(this.f, RPC_SERVICE_SET_STATE);
    });

    // Get current username
    gadgets.rpc.register(RPC_SERVICE_GET_USERNAME, function () {
        var target = this.f;
        if (username) {
            sendGadgetResponse(target, RPC_SERVICE_GET_USERNAME, username);
            return;
        }

        $.ajax({
            url: '/portal/apis/user',
            type: 'GET',
            dataType: "JSON",
            success: function (data) {
                username = data.username;
                sendGadgetResponse(target, RPC_SERVICE_GET_USERNAME, username);
            },
            error: function () {
                sendGadgetResponse(target, RPC_SERVICE_GET_USERNAME, '');
            }
        });
    });

    // Get current tenantDomain
    gadgets.rpc.register(RPC_SERVICE_GET_TENANT_DOMAIN, function () {
        sendGadgetResponse(this.f, RPC_SERVICE_GET_TENANT_DOMAIN, ues.dashboards.getTenantDomain());
    });

    // Get port of the server
    gadgets.rpc.register(RPC_SERVICE_GET_SERVER_PORT, function (httpType) {
        var target = this.f;
        if (port) {
            sendGadgetResponse(target, RPC_SERVICE_GET_SERVER_PORT, port);
            return;
        }

        $.ajax({
            url: '/portal/apis/server/port/' + httpType,
            type: 'GET',
            success: function (data) {
                port = data;
                sendGadgetResponse(target, RPC_SERVICE_GET_SERVER_PORT, port);
            },
            error: function () {
                sendGadgetResponse(target, RPC_SERVICE_GET_SERVER_PORT, '');
            }
        });
    });

    // Get hostname of the server
    gadgets.rpc.register(RPC_SERVICE_SERVER_HOSTNAME, function () {
        var target = this.f;
        if (hostname) {
            sendGadgetResponse(target, RPC_SERVICE_SERVER_HOSTNAME, hostname);
            return;
        }

        $.ajax({
            url: '/portal/apis/server/hostname',
            type: 'GET',
            success: function (data) {
                hostname = data;
                sendGadgetResponse(target, RPC_SERVICE_SERVER_HOSTNAME, hostname);
            },
            error: function () {
                sendGadgetResponse(target, RPC_SERVICE_SERVER_HOSTNAME, '');
            }
        });
    });

    // Get access token
    gadgets.rpc.register(RPC_SERVICE_GET_ACCESS_TOKEN, function () {
        var target = this.f;
        var tokenUrl = ues.utils.tenantPrefix() + 'apis/accesstokens/' + ues.global.dashboard.id;
        $.ajax({
            url: tokenUrl,
            type: 'GET',
            dataType: 'JSON',
            data: {
                id: ues.global.dashboard.id
            },
            success: function (data) {
                sendGadgetResponse(target, RPC_SERVICE_GET_ACCESS_TOKEN, data.accessToken);
            }
        });
    });

    // Show already Hidden Gadget
    gadgets.rpc.register(RPC_SERVICE_SHOW_GADGET, function () {
        var gadgetID = getGadgetId(this.f);
        var sandbox = $('#' + gadgetID);
        sandbox.removeClass('ues-hide-gadget');
        sandbox.find('.ues-component-body').show();
        sendGadgetResponse(this.f, RPC_SERVICE_SHOW_GADGET);
    });

    // Navigate to other page
    gadgets.rpc.register(RPC_SERVICE_NAVIGATE_PAGE, function (url) {
        window.open(url, "_self");
    });

    // Resize the gadget
    gadgets.rpc.register(RPC_SERVICE_RESIZE_GADGET, function (options) {
        var block = $('#' + this.f).closest('.grid-stack-item');
        block.css({
            'top': options.top ? 'calc(' + block.css('top') + ' + (' + options.top + '))' : '',
            'left': options.left ? 'calc(' + block.css('left') + ' + (' + options.left + '))' : '',
            'width': options.width || '',
            'height': options.height || '',
            'z-index': 1000
        });

        // If the height is changed, adjust the height of the gadget IFRAME as well.
        if (options.height) {
            var height = parseInt(options.height.replace('px', ''));
            var headingHeight = block.find('.ues-component').hasClass('ues-no-heading') ?
                0 : block.find('.ues-component-heading').height();
            block.find('iframe').height(height - headingHeight - 4);
        }
    });

    // Restore the gadget
    gadgets.rpc.register(RPC_SERVICE_RESTORE_GADGET, function () {
        var block = $('#' + this.f).closest('.grid-stack-item');
        block.css({
            'top': '',
            'left': '',
            'width': '',
            'height': '',
            'z-index': ''
        });
        block.find('iframe').css('height', '');
    });

    //notifies the completion of gadget loading
    gadgets.rpc.register(RPC_SERVICE_FINISHEDLOADING_CALL, function () {
        ues.dashboards.finishedLoadingGadget();
    });

    //get id of the dashboard
    gadgets.rpc.register(RPC_SERVICE_GETDASHBOARDID_CALL, function () {
        sendGadgetResponse(this.f, RPC_SERVICE_GETDASHBOARDID_CALL, ues.dashboards.getDashboardID());
    });

    //get name of the dashboard
    gadgets.rpc.register(RPC_SERVICE_GETDASHBOARDNAME_CALL, function () {
        sendGadgetResponse(this.f, RPC_SERVICE_GETDASHBOARDNAME_CALL, ues.dashboards.getDashboardName());
    });

    //get current page of the dashboard
    gadgets.rpc.register(RPC_SERVICE_GETCURRENTPAGE_CALL, function () {
        sendGadgetResponse(this.f, RPC_SERVICE_GETCURRENTPAGE_CALL, ues.dashboards.getCurrentPage());
    });

    //get current view of the dashboard
    gadgets.rpc.register(RPC_SERVICE_GETCURRENTVIEW_CALL, function () {
        sendGadgetResponse(this.f, RPC_SERVICE_GETCURRENTVIEW_CALL, ues.dashboards.getCurrentView());
    });

    // Notify each gadgets when the user clicks on the dashboard.
    $(document).on('click', function () {
        $('.ues-component-box iframe').each(function () {
            gadgets.rpc.call($(this).attr('id'), RPC_SERVICE_LOST_FOCUS_CALLBACK, null, null);
        });
    });
})();