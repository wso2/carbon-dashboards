/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import GoldenLayoutContentUtils from 'src/utils/GoldenLayoutContentUtils';
import salesDashboard from 'test/sales-dashboard';

const homePageGoldenLayoutContent = salesDashboard.dashboard.content.pages[0].content;

describe('GoldenLayoutContentUtils', () => {
    describe('getWidgetContent', () => {
        const revenueByCountryWidgetContent = homePageGoldenLayoutContent[0].content[0].content[0];

        test('should return the correct content of an existing widget UUID', () => {
            expect(GoldenLayoutContentUtils.getWidgetContent('00755b59-1ebb-fd91-f7a1-63fec587075d',
                homePageGoldenLayoutContent)).toBe(revenueByCountryWidgetContent);
        });

        test('should return null for an non-existing widget UUID', () => {
            expect(GoldenLayoutContentUtils.getWidgetContent('00000000-0000-0000-0000-000000000000',
                homePageGoldenLayoutContent)).toBe(null);
        });

        test('should return null if the GoldenLayout content is not an array', () => {
            expect(GoldenLayoutContentUtils.getWidgetContent('00755b59-1ebb-fd91-f7a1-63fec587075d', '')).toBe(null);
            expect(GoldenLayoutContentUtils.getWidgetContent('00000000-0000-0000-0000-000000000000', {})).toBe(null);
        });
    });

    test('should return all referred widgets', () => {
        const referredWidgets = [
            { className: 'RevenueByCountry', id: 'RevenueByCountry', name: 'RevenueByCountry' },
            { className: 'OverallProductInfo', id: 'OverallProductInfo', name: 'OverallProductInfo' },
            { className: 'OverallRevenueInfo', id: 'OverallRevenueInfo', name: 'OverallRevenueInfo' },
        ];
        expect(GoldenLayoutContentUtils.getReferredWidgets(homePageGoldenLayoutContent)).toEqual(referredWidgets);
    });

    test('should return class names of all referred widgets', () => {
        const referredWidgetsClassNames = ['RevenueByCountry', 'OverallProductInfo', 'OverallRevenueInfo'];
        expect(GoldenLayoutContentUtils.getReferredWidgetClassNames(homePageGoldenLayoutContent))
            .toEqual(referredWidgetsClassNames);
    });

    test('should return contents of the publisher widgets', () => {
        const publisherWidgetsContents = [{
            component: 'RevenueByCountry',
            componentName: 'lm-react-component',
            header: { show: true },
            isClosable: false,
            props: {
                configs: {
                    isGenerated: false,
                    pubsub: {
                        types: ['publisher'],
                    },
                },
                id: '00755b59-1ebb-fd91-f7a1-63fec587075d',
            },
            reorderEnabled: true,
            title: 'RevenueByCountry',
            type: 'component',
        }];
        expect(GoldenLayoutContentUtils.getPublisherWidgetsContents(homePageGoldenLayoutContent))
            .toEqual(publisherWidgetsContents);
    });
});
