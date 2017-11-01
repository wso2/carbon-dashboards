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
import org.wso2.carbon.dashboards.samples.serverstats.api.StatType;
import org.wso2.carbon.dashboards.samples.serverstats.internal.cpu.CpuStatsProvider;
import org.wso2.carbon.dashboards.samples.serverstats.internal.memory.MemoryStatsProvider;
import org.wso2.carbon.dashboards.samples.serverstats.spi.ServerStatsProvider;
import org.wso2.carbon.dashboards.samples.serverstats.spi.Stat;
import org.wso2.msf4j.websocket.WebSocketEndpoint;

import java.io.IOException;
import java.util.EnumMap;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import javax.websocket.CloseReason;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;

/**
 * Web socket endpoint for server statistics.
 *
 * @since 4.0.0
 */
@Component(name = "org.wso2.carbon.dashboards.samples.serverstats.internal.ServerStatsEndpoint",
           service = WebSocketEndpoint.class,
           immediate = true)
@ServerEndpoint("/server-stats/{type}")
public class ServerStatsEndpoint implements WebSocketEndpoint {

    private static final Logger LOGGER = LoggerFactory.getLogger(ServerStatsEndpoint.class);

    private final Map<StatType, ServerStatsProvider> serverStatsProviders = new EnumMap<>(StatType.class);
    private final Map<Session, StatType> serverStatsConsumers = new ConcurrentHashMap<>();

    private final ScheduledExecutorService scheduledExecutor = Executors.newScheduledThreadPool(5);

    public ServerStatsEndpoint() {
        serverStatsProviders.put(StatType.CPU, new CpuStatsProvider());
        serverStatsProviders.put(StatType.MEMORY, new MemoryStatsProvider());
    }

    @Activate
    protected void activate(BundleContext bundleContext) {
        start();
        LOGGER.debug("{} activated.", this.getClass().getName());
    }

    @Deactivate
    protected void deactivate(BundleContext bundleContext) {
        stop();
        LOGGER.debug("{} deactivated.", this.getClass().getName());
    }

    @OnOpen
    public void onOpen(@PathParam("type") String type, Session session) {
        serverStatsConsumers.put(session, StatType.valueOf(type.toUpperCase(Locale.US)));
    }

    @OnMessage
    public String onTextMessage(@PathParam("type") String type, String text, Session session) {
        ServerStatsProvider statsProvider = serverStatsProviders.get(StatType.valueOf(type.toUpperCase(Locale.US)));
        return statsProvider.getStat().toJson();
    }

    @OnClose
    public void onClose(@PathParam("type") String type, CloseReason closeReason, Session session) {
        serverStatsConsumers.remove(session);
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        LOGGER.error("An error occurred for '{}'.", session.getId(), throwable);
    }

    private void start() {
        scheduledExecutor.scheduleWithFixedDelay(this::publishStatsToConsumers, 0, 1, TimeUnit.SECONDS);
    }

    private void stop() {
        scheduledExecutor.shutdown();
    }

    private void publishStatsToConsumers() {
        for (Map.Entry<Session, StatType> entry : serverStatsConsumers.entrySet()) {
            ServerStatsProvider statsProvider = serverStatsProviders.get(entry.getValue());
            if (statsProvider != null) {
                Stat stat = statsProvider.getStat();
                try {
                    entry.getKey().getBasicRemote().sendText(stat.toJson());
                } catch (IOException e) {
                    LOGGER.error("Cannot send stats to '{}'.", entry.getKey().getId(), e);
                }
            }
        }
    }
}
