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

export default class GoldenLayoutContentUtils {

    /**
     * Extract and returns content for the specified widget from the given GoldenLayout contents.
     * @param {string} widgetUuid widget UUID
     * @param {array} goldenLayoutContents GoldenLayout content
     * @returns {{title: string, component: string, props: {id: string, config: object}} | null} widget content config
     */
    static getWidgetContent(widgetUuid, goldenLayoutContents) {
        return GoldenLayoutContentUtils._traverseWidgetContents(goldenLayoutContents, function (widgetContent) {
            return widgetContent.props && (widgetContent.props.id === widgetUuid);
        });
    }

    /**
     * Returns names of all widgets referred in the given GoldenLayout contents.
     * @param {array} goldenLayoutContents GoldenLayout content
     * @returns {Set} mentioned widget names
     */
    static getReferredWidgetNames(goldenLayoutContents) {
        const widgetNames = new Set();
        GoldenLayoutContentUtils._traverseWidgetContents(goldenLayoutContents, widgetContent => {
            widgetNames.add(widgetContent.title);
            return false;
        });
        return Array.from(widgetNames.values());
    }

    /**
     * Returns names of all widgets referred in the given GoldenLayout contents.
     * @param {array} goldenLayoutContents GoldenLayout content
     * @returns {Set} mentioned widget names
     */
    static getReferredWidgetClassNames(goldenLayoutContents) {
        const widgetClassNames = new Set();
        GoldenLayoutContentUtils._traverseWidgetContents(goldenLayoutContents, widgetContent => {
            widgetClassNames.add(widgetContent.component);
            return false;
        });
        return Array.from(widgetClassNames.values());
    }

    static _traverseWidgetContents(goldenLayoutContents, consumer) {
        if (!Array.isArray(goldenLayoutContents)) {
            return null;
        }

        for (let i = 0; i < goldenLayoutContents.length; i++) {
            let content = goldenLayoutContents[i];
            if (!content) {
                continue;
            }
            if ((content.type === 'component') && (content.componentName === 'lm-react-component')) {
                if (consumer(content)) {
                    return content;
                }
            } else {
                content = GoldenLayoutContentUtils._traverseWidgetContents(content.content, consumer);
                if (content) {
                    return content;
                }
            }
        }
        return null;
    }
}
