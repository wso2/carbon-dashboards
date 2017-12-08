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
import React from 'react';
import PropTypes from 'prop-types';
import { VictoryChart, VictoryAxis, VictoryVoronoiContainer, VictoryLabel, VictoryBrushContainer } from 'victory';
import { timeFormat } from 'd3';
import victoryLightTheme from './resources/themes/victoryLightTheme';
import victoryDarkTheme from './resources/themes/victoryDarkTheme';

// TODO: should be switchable with parent's respective light or dark themes
const currentTheme = victoryLightTheme;

/**
 * This class will render a skeleton that's required for a Line, Area or Bar Chart
 */
export default class ChartSkeleton extends React.Component {
    render() {
        const { width, height, xScale, config, yDomain, xDomain, xRange, dataSets } = this.props;
        let arr = null;
        if (xScale === 'ordinal' && config.charts[0].type === 'bar') {
            arr = dataSets[Object.keys(dataSets)[0]];
        }
        return (
            <VictoryChart
                width={width}
                height={height}
                container={<VictoryVoronoiContainer dimension="x" />}
                padding={{ left: 100, top: 30, bottom: 50, right: 30 }}
                scale={{ x: xScale === 'ordinal' ? null : xScale, y: 'linear' }}
                domain={{
                    x: config.brush && xDomain[0] ? xDomain : null,
                    y: yDomain || null,
                }}
                theme={currentTheme}
            >
                {this.props.children}
                <VictoryAxis
                    crossAxis
                    theme={currentTheme}
                    style={{
                        axis: {
                            stroke: config.style ? config.style.axisColor : currentTheme.axis.style.axis.stroke,
                        },
                        axisLabel: {
                            fill: config.style ? config.style.axisLabelColor : currentTheme.axis.style.axisLabel.fill,
                        },
                    }}
                    gridComponent={config.disableVerticalGrid ?
                        <g /> :
                        <line
                            style={{
                                stroke: config.gridColor || currentTheme.line.style.data.stroke,
                                strokeOpacity: 0.1,
                                fill: 'transparent',
                            }}
                        />
                    }
                    label={config.xAxisLabel || config.x}
                    tickFormat={(() => {
                        if (xScale === 'time' && config.timeFormat) {
                            return (date) => {
                                return timeFormat(config.timeFormat)(new Date(date));
                            };
                        } else if (xScale === 'ordinal' && config.charts[0].type === 'bar') {
                            return (data) => {
                                if ((data - Math.floor(data)) !== 0) {
                                    return '';
                                } else {
                                    return arr[Number(data) - 1].x;
                                }
                            };
                        } else {
                            return null;
                        }
                    })()}
                    standalone={false}
                    tickLabelComponent={
                        <VictoryLabel
                            angle={config.style ? config.style.xAxisTickAngle || 0 : 0}
                            theme={currentTheme}
                            style={{
                                fill: config.style ?
                                    config.style.tickLabelColor : currentTheme.axis.style.tickLabels.fill,
                            }}
                        />
                    }
                    tickCount={(xScale === 'ordinal' && config.charts[0].type === 'bar') ? arr.length : config.xAxisTickCount}
                />
                <VictoryAxis
                    dependentAxis
                    crossAxis
                    theme={currentTheme}
                    style={{
                        axis: {
                            stroke: config.style ? config.style.axisColor : currentTheme.axis.style.axis.stroke,
                        },
                        axisLabel: {
                            fill: config.style ? config.style.axisLabelColor : currentTheme.axis.style.axisLabel.fill,
                        },
                    }}
                    gridComponent={config.disableHorizontalGrid ? <g /> :
                    <line
                        style={{
                            stroke: config.gridColor || currentTheme.line.style.data.stroke,
                            strokeOpacity: 0.1,
                            fill: 'transparent',
                        }}
                    />}
                    label={config.yAxisLabel || config.charts.length > 1 ? '' : config.charts[0].y}
                    standalone={false}
                    tickLabelComponent={
                        <VictoryLabel
                            angle={config.style ? config.style.yAxisTickAngle || 0 : 0}
                            theme={currentTheme}
                            style={{
                                fill: config.style ?
                                    config.style.tickLabelColor : currentTheme.axis.style.tickLabels.fill,
                            }}
                        />
                    }
                    tickCount={config.yAxisTickCount}
                />
            </VictoryChart>
        );
    }
}

ChartSkeleton.defaultProps = {
    yDomain: null,
};

ChartSkeleton.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    xScale: PropTypes.string.isRequired,
    config: PropTypes.shape({
        x: PropTypes.string,
        charts: PropTypes.arrayOf(PropTypes.shape({
            type: PropTypes.string.isRequired,
            y: PropTypes.string.isRequired,
            fill: PropTypes.string,
            color: PropTypes.string,
            colorScale: PropTypes.arrayOf(PropTypes.string),
            colorDomain: PropTypes.arrayOf(PropTypes.string),
            mode: PropTypes.string,
        })),
        tickLabelColor: PropTypes.string,
        legendTitleColor: PropTypes.string,
        legendTextColor: PropTypes.string,
        axisColor: PropTypes.string,
        height: PropTypes.number,
        width: PropTypes.number,
        maxLength: PropTypes.number,
    }).isRequired,
    yDomain: PropTypes.number,
    children: PropTypes.element.isRequired,
};

