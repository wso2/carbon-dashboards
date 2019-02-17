/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import { createMount, createRender, createShallow } from '@material-ui/core/test-utils';

// Test utils from Material-UI. See https://material-ui.com/guides/testing/#userspace
export const muiShallow = createShallow();
export const muiMount = createMount();
export const muiRender = createRender();

export class MockPromise {
    /**
     * Returns a mock, non-sync Promise-like object then resolves.
     * @param {function(function(Promise.resolve))} [handler] 'then' handler for the mock promise
     * @returns {{then: (function(*=): {catch: (function(): null)})}} a Promise-like object
     */
    static resolve(handler) {
        return {
            then: (promiseResolve) => {
                if (handler) {
                    handler(promiseResolve);
                } else {
                    promiseResolve();
                }
                return { catch: () => null };
            },
        };
    }

    /**
     * Returns a mock, non-sync Promise-like object then rejects.
     * @param {function(function(Promise.catch))} [handler] 'catch' handler for the mock promise
     * @returns {{then: (function(): {catch: (function(*): *)})}} a Promise-like object
     */
    static reject(handler) {
        return {
            then: () => {
                return {
                    catch: promiseReject => (handler ? handler(promiseReject) : promiseReject()),
                };
            },
        };
    }
}
