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

import _ from 'lodash';

export default class GoldenLayoutContentUtils {
    /**
     * Extract and returns content for the specified widget from the given GoldenLayout contents.
     * @param {string} widgetUuid widget UUID
     * @param {array} goldenLayoutContents GoldenLayout content
     * @returns {{title: string, component: string, props: {id: string, config: object}} | null} widget content config
     */
    static getWidgetContent(widgetUuid, goldenLayoutContents) {
        return GoldenLayoutContentUtils.traverseWidgetContents(goldenLayoutContents, (widgetContent) => {
            return widgetContent.props && (widgetContent.props.id === widgetUuid);
        });
    }

    /**
     * Returns widgets referred in the given GoldenLayout contents.
     * @param {array} goldenLayoutContents GoldenLayout content
     * @returns {{id: string, name: string, className: string}[]} referred widgets
     */
    static getReferredWidgets(goldenLayoutContents) {
        const widgets = new Map();
        GoldenLayoutContentUtils.traverseWidgetContents(goldenLayoutContents, (widgetContent) => {
            const widget = {
                id: widgetContent.props.widgetID || widgetContent.component,
                name: widgetContent.title,
                className: widgetContent.component,
            };
            widgets.set(widget.id, widget);
            return false;
        });
        return Array.from(widgets.values());
    }

    /**
     * Returns class names of all widgets referred in the given GoldenLayout contents.
     * @param {array} goldenLayoutContents GoldenLayout content
     * @returns {string[]} class names of included widget
     */
    static getReferredWidgetClassNames(goldenLayoutContents) {
        const widgetClassNames = new Set();
        GoldenLayoutContentUtils.traverseWidgetContents(goldenLayoutContents, (widgetContent) => {
            widgetClassNames.add(widgetContent.component);
            return false;
        });
        return Array.from(widgetClassNames.values());
    }

    /**
     * Returns contents of publisher widgets in the given GoldenLayout contents.
     * @param {array} goldenLayoutContents GoldenLayout content
     * @returns {array} publisher widgets contents
     */
    static getPublisherWidgetsContents(goldenLayoutContents) {
        const publisherWidgetsContent = [];
        GoldenLayoutContentUtils.traverseWidgetContents(goldenLayoutContents, (widgetContent) => {
            const types = _.get(widgetContent, 'props.configs.pubsub.types');
            if (Array.isArray(types) && types.includes('publisher')) {
                publisherWidgetsContent.push(widgetContent);
            }
            return false;
        });
        return publisherWidgetsContent;
    }

    /**
     * Traverse through the GoldenLayout contents and consumes widget contents. If the <code>consumer</code> function
     * returns <code>true</code>, then traversal stops.
     * @param {array} goldenLayoutContents GoldenLayout content
     * @param {function(widgetContent: object)} consumer consumer function
     * @returns {null} always returns null
     */
    static traverseWidgetContents(goldenLayoutContents, consumer) {
        if (!Array.isArray(goldenLayoutContents)) {
            return null;
        }

        for (let i = 0; i < goldenLayoutContents.length; i++) {
            let content = goldenLayoutContents[i];
            if (!content) {
                continue; // eslint-disable-line no-continue
            }
            if ((content.type === 'component') && (content.componentName === 'lm-react-component')) {
                if (consumer(content)) {
                    return content;
                }
            } else {
                content = GoldenLayoutContentUtils.traverseWidgetContents(content.content, consumer);
                if (content) {
                    return content;
                }
            }
        }
        return null;
    }
}
