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

package org.wso2.carbon.dashboards.samples.serverstats;

/**
 * Represents a server stats provider.
 *
 * @since 4.0.0
 */
public interface ServerStatsProvider {

    /**
     * Registers a statistics consumer to this statistics provider.
     *
     * @param statsConsumer statistics consumer to be registered
     * @return registration key that can be later used to unregister the statistics consumer
     */
    String registerConsumer(StatsConsumer statsConsumer);

    /**
     * Unregisters the statistics consumer associated with the supplied key.
     *
     * @param key registration key
     */
    void unregisterConsumer(String key);

    /**
     * Immediately returns statistics value for the given type.
     *
     * @param type type
     * @return value
     */
    double getStats(String type);
}
