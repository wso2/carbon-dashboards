/*
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import GoldenLayout from 'golden-layout';
import WidgetRenderer from '../common/WidgetRenderer';
import GoldenLayoutContentUtils from './GoldenLayoutContentUtils';
import WidgetPubSubHub from './WidgetPubSubHub';
import { Event } from './Constants';

export default class GoldenLayoutFactory {
    /**
     * Creates a GoldenLayout object for the given container with given configs.
     * @param {string} dashboardContainerId container ID
     * @param {{settings: object, dimensions: object, content: object}} glConfig config
     * @returns {module:golden-layout.GoldenLayout} created GoldenLayout
     */
    static create(dashboardContainerId, glConfig, dashboard) {
        const dashboardContainer = document.getElementById(dashboardContainerId);
        const goldenLayout = new GoldenLayout(glConfig, dashboardContainer);
        // Set dashboard content to be passed into a widget (as props)
        if (dashboard) {
            goldenLayout.dashboard = {
                properties: dashboard.content.properties || {}
            }
        }

        const renderingWidgetClassNames = GoldenLayoutContentUtils.getReferredWidgetClassNames(glConfig.content);
        renderingWidgetClassNames.forEach(widgetName => goldenLayout.registerComponent(widgetName, WidgetRenderer));

        goldenLayout.pubSubHub = new WidgetPubSubHub(goldenLayout.eventHub);
        goldenLayout.initialize = () => {
            // Workaround suggested in https://github.com/golden-layout/golden-layout/pull/348#issuecomment-350839014
            setTimeout(() => {
                goldenLayout.init();
                GoldenLayoutFactory.patchRootItemRemoveChildFunction(goldenLayout);
            }, 0);
        };

        return goldenLayout;
    }

    /**
     * Creates a GoldenLayout for the generation wizard preview.
     * @param {string} dashboardContainerId container ID
     * @param {object} glContent content
     * @returns {module:golden-layout.GoldenLayout} created GoldenLayout
     */
    static createForPreviewer(dashboardContainerId, glContent) {
        const config = {
            settings: {
                constrainDragToContainer: false,
                reorderEnabled: false,
                selectionEnabled: false,
                popoutWholeStack: false,
                blockedPopoutsThrowError: true,
                closePopoutsOnUnload: true,
                responsiveMode: 'always',
                hasHeaders: true,
                showPopoutIcon: false,
                showMaximiseIcon: false,
                showCloseIcon: false,
            },
            dimensions: {
                headerHeight: 25,
            },
            content: glContent || [],
        };
        return GoldenLayoutFactory.create(dashboardContainerId, config);
    }

    /**
     * Creates a GoldenLayout for the dashboard viewer.
     * @param {string} dashboardContainerId container ID
     * @param {object} glContent content
     * @returns {module:golden-layout.GoldenLayout} created GoldenLayout
     */
    static createForViewer(dashboardContainerId, glContent, dashboard) {
        const config = {
            settings: {
                constrainDragToContainer: false,
                reorderEnabled: false,
                selectionEnabled: false,
                popoutWholeStack: false,
                blockedPopoutsThrowError: true,
                closePopoutsOnUnload: true,
                responsiveMode: 'always',
                hasHeaders: true,
                showPopoutIcon: false,
                showMaximiseIcon: true,
                showCloseIcon: false,
            },
            dimensions: {
                headerHeight: 25,
            },
            content: glContent || [],
        };
        return GoldenLayoutFactory.create(dashboardContainerId, config, dashboard);
    }

    /**
     * Creates a GoldenLayout for the dashboard viewer.
     * @param {string} dashboardContainerId container ID
     * @param {object} glContent content
     * @returns {module:golden-layout.GoldenLayout} created GoldenLayout
     */
    static createForDesigner(dashboardContainerId, glContent, dashboard) {
        const config = {
            settings: {
                constrainDragToContainer: false,
                reorderEnabled: true,
                selectionEnabled: false,
                popoutWholeStack: false,
                blockedPopoutsThrowError: true,
                closePopoutsOnUnload: true,
                responsiveMode: 'always',
                hasHeaders: true,
                showPopoutIcon: false,
                showMaximiseIcon: false,
                showCloseIcon: true,
            },
            dimensions: {
                headerHeight: 25,
            },
            content: glContent || [],
        };
        return GoldenLayoutFactory.create(dashboardContainerId, config, dashboard);
    }

    /**
     * Patches the removeChild function of the root item of the given GoldenLayout.
     * @param {module:golden-layout.GoldenLayout} goldenLayout GoldenLayout
     * @private
     */
    static patchRootItemRemoveChildFunction(goldenLayout) {
        const root = goldenLayout.root;
        const originalRemoveChildFunction = root.removeChild;
        root.removeChild = function () {
            originalRemoveChildFunction.apply(root, arguments);
            goldenLayout.emit(Event.DASHBOARD_DESIGNER_LAST_WIDGET_DELETED);
        };
    }
}
