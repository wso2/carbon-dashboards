/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

export default class DashboardUtils {
    static sanitizeInput(input) {
        return input.replace(/[^a-z0-9-\s]/gim, '');
    }

    /**
     * Generates a {@link https://www.ietf.org/rfc/rfc4122.txt RFC4122} version 4 compliant UUID.
     * @returns {string} UUID
     */
    static generateUuid() {
        // Adopted from: https://stackoverflow.com/a/2117523/1577286
        /* eslint-disable no-bitwise, no-mixed-operators */
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = (c === 'x') ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
