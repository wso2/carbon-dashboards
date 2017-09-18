/*
 *  Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */

import axios from 'axios';

class WidgetInfoAPIS {

    /**
     * This method will return the AXIOS http client.
     * @returns httpClient
     */
    getHTTPClient() {
        let httpClient = axios.create({
            baseURL: window.location.origin + '/apis/widgets',
            timeout: 2000
        });
        return httpClient;
    }

    /**
     * This method will get a list of widgets available in the server.
     * @returns {*}
     */
    getWidgetsInfo() {
        return this.getHTTPClient().get();
    }
}

export default WidgetInfoAPIS;