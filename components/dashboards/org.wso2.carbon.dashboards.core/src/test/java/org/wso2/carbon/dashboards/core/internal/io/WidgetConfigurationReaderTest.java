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

package org.wso2.carbon.dashboards.core.internal.io;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.wso2.carbon.dashboards.core.bean.widget.WidgetMetaInfo;
import org.wso2.carbon.dashboards.core.exception.DashboardRuntimeException;
import org.wso2.carbon.uis.api.Extension;

/**
 * Test cases for {@link WidgetConfigurationReader} class.
 *
 * @since 4.0.0
 */
public class WidgetConfigurationReaderTest {

    private static final String EXTENSION_TYPE_WIDGETS = "widgets";

    @Test
    void testGetConfigurationWhenConfigurationFileAbsent() {
        Extension widget = new Extension("foo", EXTENSION_TYPE_WIDGETS, "/bar");
        Assertions.assertThrows(DashboardRuntimeException.class,
                                () -> new WidgetConfigurationReader().getConfiguration(widget));
    }

    @Test
    void testGetConfigurationWhenConfigurationFileInvalid() {
        Extension widget = new Extension("CorruptedLineChart", EXTENSION_TYPE_WIDGETS,
                                         "src/test/resources/CorruptedLineChart");
        Assertions.assertThrows(DashboardRuntimeException.class,
                                () -> new WidgetConfigurationReader().getConfiguration(widget));
    }

    @Test
    void testGetConfiguration() {
        final String widgetName = "LineChart";
        Extension widget = new Extension(widgetName, EXTENSION_TYPE_WIDGETS, "src/test/resources/" + widgetName);
        WidgetMetaInfo widgetMetaInfo = new WidgetConfigurationReader().getConfiguration(widget);

        Assertions.assertEquals(widgetMetaInfo.getId(), widgetName);
        Assertions.assertEquals(widgetMetaInfo.getName(), widgetName);
    }
}
