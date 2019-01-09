/*
 *   Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *   WSO2 Inc. licenses this file to you under the Apache License,
 *   Version 2.0 (the "License"); you may not use this file except
 *   in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing,
 *   software distributed under the License is distributed on an
 *   "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *   KIND, either express or implied.  See the License for the
 *   specific language governing permissions and limitations
 *   under the License.
 *
 */

package org.wso2.carbon.siddhi.apps.api.rest.worker;

import feign.Headers;
import feign.Param;
import feign.RequestLine;
import feign.Response;

/**
 * Feign client to send request to workers
 */
public interface WorkerServiceStub {

    @RequestLine("GET /siddhi-apps")
    @Headers("Content-Type: application/json")
    Response getSiddhiAppNames();

    @RequestLine("GET /siddhi-apps/{appName}")
    @Headers("Content-Type: application/json")
    Response getSiddhiAppContent(@Param("appName") String appName);
}
