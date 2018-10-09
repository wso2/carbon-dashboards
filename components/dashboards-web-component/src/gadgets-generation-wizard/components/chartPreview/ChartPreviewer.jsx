/*
 *  Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */

import React, { Component } from 'react';
import '../../../common/styles/custom-goldenlayout-dark-theme.css';
import glDarkTheme from '!!css-loader!../../../common/styles/custom-goldenlayout-dark-theme.css';
import DashboardUtils from '../../../utils/DashboardUtils';
import GoldenLayoutFactory from '../../../utils/GoldenLayoutFactory';
import { darkTheme } from '../../../utils/Theme';

const glDarkThemeCss = glDarkTheme.toString();

const previewContainerId = 'preview-container';
/**
 * Previews the chart according to the values maintained in the state
 */
class ChartPreviewer extends Component {
    constructor(props) {
        super(props);
        this.goldenLayout = null;

        this.destroyGoldenLayout = this.destroyGoldenLayout.bind(this);
        this.renderGoldenLayout = this.renderGoldenLayout.bind(this);
    }

    componentWillUnmount() {
        this.destroyGoldenLayout();
    }

    /**
     * Render goldenLayout instance
     */
    renderGoldenLayout() {
        // This is necessary as this method is called via a ref in render(). Also we cannot pass arguments to here.
        if (this.goldenLayout) {
            return;
        }

        const previewConfig = [
            {
                title: '[' + this.props.config.name + ']',
                type: 'component',
                component: 'UniversalWidget',
                props: {
                    id: DashboardUtils.generateUuid(),
                    configs: {
                        pubsub: {
                            types: [],
                        },
                        isGenerated: true,
                        options: {},
                    },
                    widgetID: this.props.config.id,
                    preview: true,
                    metadata: this.props.config.metadata,
                    chartConfig: this.props.config.chartConfig,
                    providerConfig: this.props.config.providerConfig,
                },
                isClosable: false,
                reorderEnabled: true,
                header: { show: true },
                componentName: 'lm-react-component',
            },
        ];

        this.goldenLayout = GoldenLayoutFactory.createForPreviewer(previewContainerId, previewConfig);
        this.goldenLayout.initialize();
    }

    /**
     * Destroy goldenLayout instance
     */
    destroyGoldenLayout() {
        if (this.goldenLayout) {
            this.goldenLayout.destroy();
            delete this.goldenLayout;
        }
        this.goldenLayout = null;
    }

    render() {
        return (
            <div>
                <style>{glDarkThemeCss}</style>
                <div
                    style={{
                        color: darkTheme.palette.textColor,
                        backgroundColor: darkTheme.palette.canvasColor,
                        fontFamily: darkTheme.fontFamily,
                    }}
                >
                    <div
                        id={previewContainerId}
                        style={{ height: (window.innerHeight * 50 / 100) }}
                        ref={() => {
                            this.renderGoldenLayout();
                        }}
                    />
                </div>
            </div>
        );
    }
}

export default ChartPreviewer;
