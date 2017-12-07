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

package org.wso2.carbon.dashboards.core.internal;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.wso2.carbon.dashboards.core.exception.DashboardException;
import org.wso2.carbon.dashboards.core.exception.DashboardRuntimeException;
import org.wso2.carbon.uis.api.App;
import org.wso2.carbon.uis.api.Extension;
import org.wso2.carbon.uis.spi.Server;

import java.util.Collections;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Test cases for {@link WidgetMetadataProviderImpl} class.
 *
 * @since 4.0.0
 */
public class WidgetMetadataProviderImplTest {

    @Test
    void testGetWidgetConfigurationWithoutPortalApp() {
        Server server = mock(Server.class);
        when(server.getApp(anyString())).thenReturn(Optional.empty());
        WidgetMetadataProviderImpl widgetInfoProvider = new WidgetMetadataProviderImpl();
        widgetInfoProvider.setCarbonUiServer(server);

        Assertions.assertThrows(DashboardRuntimeException.class,
                                () -> widgetInfoProvider.getWidgetConfiguration("foo"));
    }

    @Test
    void testGetWidgetConfigurationOfAbsentWidget() throws DashboardException {
        WidgetMetadataProviderImpl widgetInfoProvider = createWidgetInfoProvider();
        Assertions.assertFalse(widgetInfoProvider.getWidgetConfiguration("table").isPresent(),
                               "No configuration for non-existing widget 'table'");
    }

    @Test
    void testGetWidgetConfiguration() throws DashboardException {
        WidgetMetadataProviderImpl widgetInfoProvider = createWidgetInfoProvider();
        Assertions.assertTrue(widgetInfoProvider.getWidgetConfiguration("LineChart").isPresent(),
                              "Configuration should available for widget 'LineChart'");
    }

    @Test
    void testGetAllWidgetConfigurations() throws DashboardException {
        WidgetMetadataProviderImpl widgetInfoProvider = createWidgetInfoProvider();
        Assertions.assertEquals(1, widgetInfoProvider.getAllWidgetConfigurations().size());
    }

    @Test
    void testOthers() {
        Server server = mock(Server.class);
        WidgetMetadataProviderImpl widgetInfoProvider = new WidgetMetadataProviderImpl();
        widgetInfoProvider.activate(null);
        widgetInfoProvider.setCarbonUiServer(server);
        widgetInfoProvider.unsetCarbonUiServer(server);
        widgetInfoProvider.deactivate(null);
    }

    private static App createPortalApp() {
        Extension chartWidget = new Extension("LineChart", "widgets", "src/test/resources/LineChart");
        return new App("portal", "/portal", Collections.emptySortedSet(), Collections.singleton(chartWidget),
                       Collections.emptySet(), Collections.emptySet(), null, null);
    }

    private static WidgetMetadataProviderImpl createWidgetInfoProvider() {
        App portalApp = createPortalApp();
        Server server = mock(Server.class);
        when(server.getApp(eq(portalApp.getName()))).thenReturn(Optional.of(portalApp));
        WidgetMetadataProviderImpl widgetInfoProvider = new WidgetMetadataProviderImpl();
        widgetInfoProvider.setCarbonUiServer(server);
        return widgetInfoProvider;
    }
}
