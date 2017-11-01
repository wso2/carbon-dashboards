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

package org.wso2.carbon.dashboards.samples.serverstats.internal.cpu;

import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import org.wso2.carbon.dashboards.samples.serverstats.api.StatType;
import org.wso2.carbon.dashboards.samples.serverstats.internal.AbstractStat;

import java.time.Instant;

/**
 * Represent a CPU stat.
 *
 * @since 4.0.0
 */
public class CpuStat extends AbstractStat {

    private final double processLoad;
    private final double systemLoad;
    private final double systemLoadAverage;

    /**
     * Creates a new CPU stat.
     *
     * @param timestamp         time stamp
     * @param processLoad       CPU load from the current Java process
     * @param systemLoad        system CPU load
     * @param systemLoadAverage average system CPU load
     */
    public CpuStat(Instant timestamp, double processLoad, double systemLoad, double systemLoadAverage) {
        super(timestamp, StatType.CPU);
        this.processLoad = processLoad;
        this.systemLoad = systemLoad;
        this.systemLoadAverage = systemLoadAverage;
    }

    @Override
    public String toJson() {
        JsonObject json = new JsonObject();
        json.add("timestamp", new JsonPrimitive(getTimestamp().getEpochSecond()));
        json.add("process", new JsonPrimitive(processLoad));
        JsonObject system = new JsonObject();
        system.add("load", new JsonPrimitive(systemLoad));
        system.add("average", new JsonPrimitive(systemLoadAverage));
        json.add("system", system);
        return json.toString();
    }
}
