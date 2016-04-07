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
 * Implements dashboard API navigate feature.
 */
wso2.gadgets.navigate = (function () {

    /**
     * Service name to navigate page.
     * @const
     * @private
     */
    var RPC_SERVICE_NAVIGATE_PAGE = 'RPC_SERVICE_NAVIGATE_PAGE';

    /**
     * Navigate the parent to a given URL.
     * @param {Object} options Options
     * @return {null}
     */
    var navigatePage = function(options) {
        // build the hash
        var hash = '';
        for(var prop in options.states) {
            if (options.states.hasOwnProperty(prop)) {
                hash += '/' + prop + '/' + JSON.stringify(options.states[prop]);
            }
        }

        if (hash.length > 0) {
            hash = '#' + hash.substr(1);
        }
        var url = options.url + hash;
        wso2.gadgets.core.callContainerService(RPC_SERVICE_NAVIGATE_PAGE, url,  null)
    };

    return {
        navigatePage: navigatePage
    };
})();