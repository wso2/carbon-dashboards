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

package org.wso2.carbon.dashboards.samples.serverstats.internal.memory;

import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import org.wso2.carbon.dashboards.samples.serverstats.api.StatType;
import org.wso2.carbon.dashboards.samples.serverstats.internal.AbstractStat;

import java.time.Instant;

/**
 * Represents a memory stat.
 *
 * @since 4.0.0
 */
public class MemoryStat extends AbstractStat {

    private final long physicalMemorySize;
    private final long physicalMemoryUsed;
    private final long heapMemorySize;
    private final long heapMemoryUsed;

    /**
     * Creates a new memory stat.
     *
     * @param timestamp          timestamp
     * @param physicalMemorySize full size of the physical memory
     * @param physicalMemoryUsed used amount of physical memory
     * @param heapMemorySize     full size of the JVM heap memory
     * @param heapMemoryUsed     used amount of the JVM heap memory
     */
    public MemoryStat(Instant timestamp, long physicalMemorySize, long physicalMemoryUsed, long heapMemorySize,
                      long heapMemoryUsed) {
        super(timestamp, StatType.MEMORY);
        this.physicalMemorySize = physicalMemorySize;
        this.physicalMemoryUsed = physicalMemoryUsed;
        this.heapMemorySize = heapMemorySize;
        this.heapMemoryUsed = heapMemoryUsed;
    }

    @Override
    public String toJson() {
        JsonObject json = new JsonObject();
        json.add("timestamp", new JsonPrimitive(getTimestamp().toEpochMilli()));
        JsonObject physical = new JsonObject();
        physical.add("size", new JsonPrimitive(physicalMemorySize));
        physical.add("used", new JsonPrimitive(physicalMemoryUsed));
        json.add("physical", physical);
        JsonObject heap = new JsonObject();
        heap.add("size", new JsonPrimitive(heapMemorySize));
        heap.add("used", new JsonPrimitive(heapMemoryUsed));
        json.add("heap", heap);
        return json.toString();
    }
}
