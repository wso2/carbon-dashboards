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

import org.wso2.carbon.dashboards.samples.serverstats.api.StatType;
import org.wso2.carbon.dashboards.samples.serverstats.internal.AbstractServerStatsProvider;
import org.wso2.carbon.dashboards.samples.serverstats.spi.Stat;

import java.time.Instant;

/**
 * Server statistics provider.
 *
 * @since 4.0.0
 */
public class CpuStatsProvider extends AbstractServerStatsProvider {

    private static final String ATTRIBUTE_CPU_LOAD_PROCESS = "org.wso2.carbon.metrics:name=jvm.os.cpu.load.process";
    private static final String ATTRIBUTE_CPU_LOAD_SYSTEM = "org.wso2.carbon.metrics:name=jvm.os.cpu.load.system";
    private static final String ATTRIBUTE_CPU_LOAD_AVERAGE = "org.wso2.carbon.metrics:name=jvm.os.system.load.average";

    public CpuStatsProvider() {
        super(StatType.CPU);
    }

    @Override
    public Stat getStat() {
        double processLoad = getAttribute(ATTRIBUTE_CPU_LOAD_PROCESS).doubleValue();
        double systemLoad = getAttribute(ATTRIBUTE_CPU_LOAD_SYSTEM).doubleValue();
        double systemLoadAverage = getAttribute(ATTRIBUTE_CPU_LOAD_AVERAGE).doubleValue();
        return new CpuStat(Instant.now(), processLoad, systemLoad, systemLoadAverage);
    }
}
