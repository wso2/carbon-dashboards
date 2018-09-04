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
import org.wso2.carbon.dashboards.core.internal.database.WidgetMetadataDao;
import org.wso2.carbon.uiserver.api.App;
import org.wso2.carbon.uiserver.api.Extension;

import java.util.Collections;

import static org.mockito.Mockito.mock;

/**
 * Test cases for {@link WidgetMetadataProviderImpl} class.
 *
 * @since 4.0.0
 */
public class WidgetMetadataProviderImplTest {

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

    private static App createPortalApp() {
        Extension chartWidget = new Extension("LineChart", "widgets", "src/test/resources/LineChart");
        return new App("portal", "/portal", Collections.emptySortedSet(), Collections.singleton(chartWidget),
                       Collections.emptySet(), Collections.emptySet(), null, null);
    }

    private static WidgetMetadataProviderImpl createWidgetInfoProvider() {
        App portalApp = createPortalApp();
        WidgetMetadataDao dao = mock(WidgetMetadataDao.class);
        return new WidgetMetadataProviderImpl(portalApp, dao);
    }
}
