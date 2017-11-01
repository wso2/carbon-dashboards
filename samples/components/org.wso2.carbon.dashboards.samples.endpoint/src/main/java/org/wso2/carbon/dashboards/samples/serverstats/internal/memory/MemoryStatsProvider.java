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

import org.wso2.carbon.dashboards.samples.serverstats.api.StatType;
import org.wso2.carbon.dashboards.samples.serverstats.internal.AbstractServerStatsProvider;
import org.wso2.carbon.dashboards.samples.serverstats.spi.Stat;

import java.time.Instant;

/**
 * Server statistics provider.
 *
 * @since 4.0.0
 */
public class MemoryStatsProvider extends AbstractServerStatsProvider {

    private static final String ATTRIBUTE_PHYSICAL_MEMORY_SIZE =
            "org.wso2.carbon.metrics:name=jvm.os.physical.memory.total.size";
    private static final String ATTRIBUTE_PHYSICAL_MEMORY_FREE =
            "org.wso2.carbon.metrics:name=jvm.os.physical.memory.free.size";
    private static final String ATTRIBUTE_HEAP_MEMORY_SIZE = "org.wso2.carbon.metrics:name=jvm.memory.heap.max";
    private static final String ATTRIBUTE_HEAP_MEMORY_USED = "org.wso2.carbon.metrics:name=jvm.memory.heap.used";

    public MemoryStatsProvider() {
        super(StatType.MEMORY);
    }

    @Override
    public Stat getStat() {
        long physicalMemorySize = getAttribute(ATTRIBUTE_PHYSICAL_MEMORY_SIZE).longValue();
        long physicalMemoryUsed = physicalMemorySize - getAttribute(ATTRIBUTE_PHYSICAL_MEMORY_FREE).longValue();
        long heapMemorySize = getAttribute(ATTRIBUTE_HEAP_MEMORY_SIZE).longValue();
        long heapMemoryUsed = getAttribute(ATTRIBUTE_HEAP_MEMORY_USED).longValue();
        return new MemoryStat(Instant.now(), physicalMemorySize, physicalMemoryUsed, heapMemorySize, heapMemoryUsed);
    }
}
