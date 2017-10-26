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

import org.osgi.framework.BundleContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.carbon.dashboards.samples.serverstats.ServerStatsProvider;
import org.wso2.carbon.dashboards.samples.serverstats.StatsConsumer;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.MemoryUsage;
import java.lang.management.OperatingSystemMXBean;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Server statistics provider.
 *
 * @since 4.0.0
 */
@Component(name = "org.wso2.carbon.dashboards.samples.serverstats.internal.DefaultServerStatsProvider",
           service = ServerStatsProvider.class,
           immediate = true
)
public class DefaultServerStatsProvider implements ServerStatsProvider {

    private static final Logger LOGGER = LoggerFactory.getLogger(DefaultServerStatsProvider.class);

    private final ConcurrentMap<String, StatsConsumer> statsConsumers = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduledExecutor = Executors.newScheduledThreadPool(5);
    private final OperatingSystemMXBean osMXBean = ManagementFactory.getOperatingSystemMXBean();
    private final MemoryMXBean memoryMXBean = ManagementFactory.getMemoryMXBean();


    @Activate
    protected void activate(BundleContext bundleContext) {
        start();
        LOGGER.debug("{} activated.", DefaultServerStatsProvider.class.getName());
    }

    @Deactivate
    protected void deactivate(BundleContext bundleContext) {
        stop();
        LOGGER.debug("{} deactivated.", DefaultServerStatsProvider.class.getName());
    }

    private void start() {
        scheduledExecutor.scheduleWithFixedDelay(this::publishStatsToConsumers, 0, 1, TimeUnit.SECONDS);
    }

    private void stop() {
        scheduledExecutor.shutdown();
    }

    @Override
    public String registerConsumer(StatsConsumer statsConsumer) {
        String key = key(statsConsumer);
        statsConsumers.put(key, statsConsumer);
        return key;
    }

    @Override
    public void unregisterConsumer(String key) {
        statsConsumers.remove(key);
    }

    @Override
    public double getStats(String type) {
        switch (type) {
            case "cpu":
                return 0;
            case "memory":
                MemoryUsage memoryUsage = memoryMXBean.getHeapMemoryUsage();
                return ((double) memoryUsage.getUsed() / (double) memoryUsage.getMax());
            case "load-avg":
                return osMXBean.getSystemLoadAverage();
            default:
                return -1;
        }
    }

    private void publishStatsToConsumers() {
        for (StatsConsumer statsConsumer : statsConsumers.values()) {
            statsConsumer.consume(getStats(statsConsumer.getType()));
        }
    }


    private static String key(StatsConsumer statsConsumer) {
        return String.valueOf(statsConsumer.hashCode());
    }
}
