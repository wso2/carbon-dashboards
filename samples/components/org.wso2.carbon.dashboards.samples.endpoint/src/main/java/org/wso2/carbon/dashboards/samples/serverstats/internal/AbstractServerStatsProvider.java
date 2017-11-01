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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.carbon.dashboards.samples.serverstats.api.StatType;
import org.wso2.carbon.dashboards.samples.serverstats.internal.memory.MemoryStatsProvider;
import org.wso2.carbon.dashboards.samples.serverstats.spi.ServerStatsProvider;

import java.lang.management.ManagementFactory;
import javax.management.MBeanServer;
import javax.management.ObjectName;

/**
 * Abstract server stat provider.
 *
 * @since 4.0.0
 */
public abstract class AbstractServerStatsProvider implements ServerStatsProvider {

    private static final Logger LOGGER = LoggerFactory.getLogger(MemoryStatsProvider.class);

    private final MBeanServer platformMBeanServer;
    private final StatType type;

    /**
     * Creates a server stats provider.
     *
     * @param type type
     */
    public AbstractServerStatsProvider(StatType type) {
        this.platformMBeanServer = ManagementFactory.getPlatformMBeanServer();
        this.type = type;
    }

    @Override
    public StatType getStatType() {
        return type;
    }

    protected Number getAttribute(String attributeName) {
        try {
            return (Number) platformMBeanServer.getAttribute(ObjectName.getInstance(attributeName), "Value");
        } catch (Exception e) {
            LOGGER.error("Cannot retrieve attribute '{}' from PlatformMBeanServer.", attributeName, e);
            return -1;
        }
    }
}
