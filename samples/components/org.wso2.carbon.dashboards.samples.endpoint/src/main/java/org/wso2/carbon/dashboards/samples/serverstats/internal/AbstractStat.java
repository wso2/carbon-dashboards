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

package org.wso2.carbon.dashboards.samples.serverstats.internal;

import org.wso2.carbon.dashboards.samples.serverstats.api.StatType;
import org.wso2.carbon.dashboards.samples.serverstats.spi.Stat;

import java.time.Instant;

/**
 * Abstract stat.
 *
 * @since 4.0.0
 */
public abstract class AbstractStat implements Stat {

    private final Instant timestamp;
    private final StatType type;

    /**
     * Creates a new stat.
     *
     * @param timestamp time stamp
     * @param type      type of the stat
     */
    public AbstractStat(Instant timestamp, StatType type) {
        this.timestamp = timestamp;
        this.type = type;
    }

    /**
     * Returns the time stamp of this stat.
     *
     * @return time stamp of the stat
     */
    public Instant getTimestamp() {
        return timestamp;
    }

    @Override
    public StatType getType() {
        return type;
    }
}
