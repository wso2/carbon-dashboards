/*
*  Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*  http://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License.
*/

let channelManager = null;

const SESSION_USER = 'DASHBOARD_USER';

class WidgetChannelManager {

    constructor() {
        this.webSocket = null;
        this.widgetMap = {};
        this.dashboard = null;
        this.subscribeWidget = this.subscribeWidget.bind(this);
        this.unsubscribeWidget = this.unsubscribeWidget.bind(this);
        this.poll = this.poll.bind(this);
        this._initializeWebSocket = this._initializeWebSocket.bind(this);
        this._wsOnClose = this._wsOnClose.bind(this);
        this._wsOnError = this._wsOnError.bind(this);
        this._wsOnMessage = this._wsOnMessage.bind(this);
        this._initializeWebSocket();
        this.waitForConn = this.waitForConn.bind(this);
        this._getCurrentUser = this._getCurrentUser.bind(this);
    }

    /**
     * Set a widget to the widget map and send configuration to the provider endpoint.
     * @param widgetId
     * @param widgetName
     * @param callback
     * @param dataConfig
     */
    subscribeWidget(widgetId, widgetName, callback, dataConfig) {
        this.widgetMap[widgetId] = callback;
        this.waitForConn(this.webSocket, () => {
            let configJSON = {
                widgetName: widgetName,
                username: this._getCurrentUser(),
                dashboardId: (this.dashboard && this.dashboard.id) ? this.dashboard.id : null,
                providerName: dataConfig.configs.type,
                dataProviderConfiguration: dataConfig.configs.config,
                topic: widgetId,
                action: 'subscribe'
            };
        this.webSocket.send(JSON.stringify(configJSON));
    })
    }

    /**
     * remove a widget from the widget map
     * @param widgetId
     */
    unsubscribeWidget(widgetId) {
        delete this.widgetMap[widgetId];
        let config = {
            widgetName: null,
            username: null,
            dashboardId: null,
            topic: widgetId,
            providerName: null,
            dataProviderConfiguration: null,
            action: 'unsubscribe',
        };
        this.webSocket.send(JSON.stringify(config));
    }

    /**
     * Request publish data from the provider endpoint
     * @param widgetId
     * @param widgetName
     * @param callback
     * @param dataConfig
     * @param paginate
     */
    poll(widgetId, widgetName, callback, dataConfig) {
        this.widgetMap[widgetId] = callback;
        let config = {
            widgetName: widgetName,
            username: this._getCurrentUser(),
            dashboardId: (this.dashboard && this.dashboard.id) ? this.dashboard.id : null,
            topic: widgetId,
            providerName: dataConfig.configs.type,
            dataProviderConfiguration: dataConfig.configs.config,
            action: 'polling',
        };
        this.webSocket.send(JSON.stringify(config));
    }

    /**
     * Initialize websocket
     * @private
     */
    _initializeWebSocket() {
        this.webSocket = new WebSocket('wss://' + window.location.host + '/data-provider');
        this.webSocket.onmessage = this._wsOnMessage;
        this.webSocket.onerror = this._wsOnError;
        this.webSocket.onclose = this._wsOnClose;
    }

    /**
     * handle web-socket on message event
     * @param message
     * @private
     */
    _wsOnMessage(message) {
        let data = JSON.parse(message.data);
        if (this.widgetMap[data.topic]) {
            this.widgetMap[data.topic](data);
        } else {
            // TODO: Error logging
        }
    }

    /**
     * handle web-socket on error event
     * @param message
     * @private
     */
    _wsOnError(message) {
        // TODO: handle error message
    }

    /**
     * handle web-socket on close event
     * @param message
     * @private
     */
    _wsOnClose(message) {
        // TODO: handle on close event
    }

    waitForConn(socket, callback) {
        let that = this;
        setTimeout(() => {
            if (socket.readyState === 1) {
            if (callback !== null) {
                callback();
            }
        } else {
            that.waitForConn(socket, callback);
        }
    }, 1000)
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
     * Get current user.
     *
     * @return {{}} User object
     */
    _getCurrentUser() {
        const user = JSON.parse(WidgetChannelManager._getSessionCookie(SESSION_USER));
        return (user && user.username) ? user.username : null;
    }

    /**
     * Set the dashboard of the widget.
     */
    setDashboard(dashboard) {
        this.dashboard = dashboard;
    }

    /**
     * Get the dashboard of the widget.
     *
     * @return {{}} Dashboard object
     */
    getDashboard() {
        return this.dashboard;
    }
}



export const getWidgetChannelManager = () => {
    if(!channelManager) {
        channelManager = new WidgetChannelManager();
    }

    return channelManager;
};
