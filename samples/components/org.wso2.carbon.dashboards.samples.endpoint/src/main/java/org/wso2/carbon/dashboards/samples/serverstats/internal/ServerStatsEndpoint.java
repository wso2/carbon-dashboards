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

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.wso2.carbon.dashboards.samples.serverstats.ServerStatsProvider;
import org.wso2.carbon.dashboards.samples.serverstats.StatsConsumer;
import org.wso2.msf4j.websocket.WebSocketEndpoint;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
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
           immediate = true
)
@ServerEndpoint("/server-stats/{type}")
public class ServerStatsEndpoint implements WebSocketEndpoint {

    private static final Logger LOGGER = LoggerFactory.getLogger(ServerStatsEndpoint.class);

    private final Map<String, String> statsConsumerRegistrations = new HashMap<>();
    private ServerStatsProvider statsProvider;

    @Reference(
            service = ServerStatsProvider.class,
            cardinality = ReferenceCardinality.MANDATORY,
            policy = ReferencePolicy.DYNAMIC,
            unbind = "unbindServerStatsProvider"
    )
    protected void setServerStatsProvider(ServerStatsProvider statsProvider) {
        this.statsProvider = statsProvider;
        LOGGER.debug("An instance of '{}' registered as a {}.", statsProvider.getClass(),
                     ServerStatsProvider.class.getCanonicalName());
    }

    protected void unbindServerStatsProvider(ServerStatsProvider statsProvider) {
        this.statsProvider = null;
        LOGGER.debug("An instance of '{}' unregistered as a {}.", statsProvider.getClass(),
                     ServerStatsProvider.class.getCanonicalName());
    }

    @OnOpen
    protected void onOpen(@PathParam("type") String type, Session session) {
        statsConsumerRegistrations.put(session.getId(),
                                       statsProvider.registerConsumer(new EndpointStatsConsumer(type, session)));
    }

    @OnMessage
    protected double onTextMessage(@PathParam("type") String type, String text, Session session) {
        return statsProvider.getStats(type);
    }

    @OnClose
    protected void onClose(@PathParam("type") String name, CloseReason closeReason, Session session) {
        statsProvider.unregisterConsumer(statsConsumerRegistrations.get(session.getId()));
    }

    @OnError
    protected void onError(Session session, Throwable throwable) {
        LOGGER.error("An error occurred for '{}'.", session.getId(), throwable);
    }

    private static class EndpointStatsConsumer implements StatsConsumer {

        private static final Logger LOGGER = LoggerFactory.getLogger(EndpointStatsConsumer.class);

        private final String type;
        private final Session session;

        public EndpointStatsConsumer(String type, Session session) {
            this.type = type;
            this.session = session;
        }

        @Override
        public String getType() {
            return type;
        }

        @Override
        public void consume(double value) {
            try {
                session.getBasicRemote().sendText(String.valueOf(value));
            } catch (IOException e) {
                LOGGER.error("Cannot send stats to '{}'.", session.getId(), e);
            }
        }
    }
}
