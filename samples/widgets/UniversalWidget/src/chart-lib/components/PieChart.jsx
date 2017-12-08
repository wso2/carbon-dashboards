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
// TODO: Implement interactive legend
// TODO: Implement onClick events
import React from 'react';
import {
    VictoryTooltip,
    VictoryContainer,
    VictoryLegend,
    VictoryPie,
    VictoryLabel,
} from 'victory';
import PropTypes from 'prop-types';
import { getDefaultColorScale } from './helper';
import VizGError from '../VizGError';
import { getLegendComponent } from './ComponentGenerator';

const LEGEND_DISABLED_COLOR = '#d3d3d3';

export default class PieCharts extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            height: props.height || props.config.height || 450,
            width: props.width || props.config.width || 800,
            dataSets: {},
            chartArray: [],
            initialized: false,
            xScale: 'linear',
            orientation: 'bottom',
            legend: true,
            scatterPlotRange: [],
            randomUpdater: 0,
        };
        this.config = props.config;
        this._handleAndSortData = this._handleAndSortData.bind(this);
        this._handleMouseEvent = this._handleMouseEvent.bind(this);
        this._legendInteraction = this._legendInteraction.bind(this);
    }

    componentDidMount() {
        if (this.props.metadata !== null) {
            this._handleAndSortData(this.props);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.append) {
            this.state.dataSets = {};
            this.state.chartArray = [];
            this.state.initialized = false;
        }
        if (this.props.metadata !== null) {
            this._handleAndSortData(nextProps);
        }
    }

    componentWillUnmount() {
        this.setState({});
    }

    _handleMouseEvent(evt) {
        const { onClick } = this.props;

        return onClick && onClick(evt);
    }

    /**
     * Function used to disable a chart component when clicked on it's name in the legend.
     * @param {Object} props parameters recieved from the legend component
     */
    _legendInteraction(props) {
        const { ignoreArray } = this.state;
        const ignoreIndex = ignoreArray
            .map(d => d.name)
            .indexOf(props.datum.name);
        if (ignoreIndex > -1) {
            ignoreArray.splice(ignoreIndex, 1);
        } else {
            ignoreArray.push({ name: props.datum.name });
        }
        this.setState({
            ignoreArray,
        });
        const fill = props.style ? props.style.fill : null;
        return fill === LEGEND_DISABLED_COLOR ?
            null :
            { style: { fill: LEGEND_DISABLED_COLOR } };
    }

    /**
     * Handles the sorting of data and populating the dataset
     * @param props
     * @private
     */
    _handleAndSortData(props) {
        const { config, metadata, data } = props;
        let { dataSets, chartArray, initialized, xScale, orientation, legend, scatterPlotRange, randomUpdater } = this.state;
        config.charts.forEach(() => {
            const arcConfig = config.charts[0];
            const xIndex = metadata.names.indexOf(arcConfig.x);
            const colorIndex = metadata.names.indexOf(arcConfig.color);

            if (xIndex === -1) {
                throw new VizGError('PieChart', "Unknown 'x' field defined in the Pie Chart config.");
            }

            if (colorIndex === -1) {
                throw new VizGError('PieChart', "Unknown 'x' field defined in the Pie Chart config.");
            }

            if (!config.percentage) {
                if (!initialized) {
                    chartArray.push({
                        type: arcConfig.type,
                        dataSetNames: {},
                        mode: arcConfig.mode,
                        colorScale: Array.isArray(arcConfig.colorScale) ? arcConfig.colorScale : getDefaultColorScale(),
                        colorIndex: 0,

                    });
                }
                data.forEach((datum) => {
                    randomUpdater++;
                    const dataSetName = datum[colorIndex];

                    if (dataSets[dataSetName]) {
                        dataSets[dataSetName].y += datum[xIndex];
                    } else {
                        chartArray[0].colorIndex = chartArray[0].colorIndex >= chartArray[0].colorScale.length ? 0 : chartArray[0].colorIndex;
                        if (arcConfig.colorDomain) {
                            const colorDomIndex = arcConfig.colorDomain.indexOf(dataSetName);

                            if (colorDomIndex > -1 && colorDomIndex < chartArray[0].colorScale.length) {
                                dataSets[dataSetName] = {
                                    x: dataSetName,
                                    y: datum[xIndex],
                                    fill: chartArray[0].colorScale[colorDomIndex],
                                };
                                chartArray[0].dataSetNames[dataSetName] = chartArray[0].colorIndex++;
                            } else {
                                dataSets[dataSetName] = {
                                    x: dataSetName,
                                    y: datum[xIndex],
                                    fill: chartArray[0].colorScale[chartArray[0].colorIndex],
                                };
                            }
                        } else {
                            dataSets[dataSetName] = {
                                x: dataSetName,
                                y: datum[xIndex],
                                fill: chartArray[0].colorScale[chartArray[0].colorIndex],
                            };
                        }

                        if (!chartArray[0].dataSetNames[dataSetName]) {
                            chartArray[0].dataSetNames[dataSetName] = chartArray[0].colorScale[chartArray[0].colorIndex++];
                        }
                    }
                });
            } else {
                legend = false;
                if (!initialized) {
                    chartArray.push({
                        type: arcConfig.type,
                        colorScale: Array.isArray(arcConfig.colorScale) ? arcConfig.colorScale : getDefaultColorScale(),
                    });
                }
                data.map((datum) => {
                    dataSets = this._getPercentDataForPieChart(datum[xIndex]);
                });
            }
        });

        initialized = true;

        this.setState({
            dataSets,
            chartArray,
            initialized,
            xScale,
            orientation,
            legend,
            scatterPlotRange,
            randomUpdater,
        });
    }

    /**
     * generates a data set for the given value
     * @param value for data set should be generated
     * @private
     */
    _getPercentDataForPieChart(value) {
        return [{ x: 'primary', y: value }, { x: 'secondary', y: 100 - value }];
    }

    render() {
        const { config } = this.props;
        const { height, width, chartArray, dataSets, xScale, legend, randomUpdater } = this.state;
        const chartComponents = [];
        const legendItems = [];

        chartArray.map((chart) => {
            const pieChartData = [];
            let total = 0;
            if (!config.percentage) {
                Object.keys(chart.dataSetNames).map((dataSetName) => {
                    legendItems.push({ name: dataSetName, symbol: { fill: chart.dataSetNames[dataSetName] } });
                    total += dataSets[dataSetName].y;
                    pieChartData.push(dataSets[dataSetName]);
                });
            }

            chartComponents.push((
                <svg
                    viewBox={`0 0 ${height > width ? width : height} ${height > width ? width : height}`}
                >
                    <VictoryPie
                        height={height > width ? width : height}
                        width={height > width ? width : height}
                        colorScale={chart.colorScale}
                        data={config.percentage ? dataSets : pieChartData}
                        labelComponent={config.percentage ? <VictoryLabel text={''} /> :
                            <VictoryTooltip
                                orientation='top'
                                pointerLength={4}
                                cornerRadius={2}
                                flyoutStyle={{ fill: '#000', fillOpacity: '0.8', strokeWidth: 0 }}
                                style={{ fill: '#b0b0b0' }}
                            />}
                        labels={config.percentage === 'percentage' ? '' : d => `${d.x} : ${((d.y / total) * 100).toFixed(2)}%`}
                        style={{ labels: { fontSize: 6 } }}
                        labelRadius={height / 4}
                        innerRadius={chart.mode === 'donut' || config.percentage ? (height > width ? width : height / 4) + (config.innerRadius || 0) : 0}
                        events={[{
                            target: 'data',
                            eventHandlers: {
                                onClick: () => {
                                    return [
                                        {
                                            target: 'data',
                                            mutation: this._handleMouseEvent,
                                        },
                                    ];
                                },
                            },
                        }]}
                        randomUpdater={randomUpdater}
                        animate={
                            config.animate ?
                                {
                                    onEnter: {
                                        duration: 100,
                                    },
                                } : null
                        }
                    />
                    {
                        config.percentage ?
                            <VictoryLabel
                                textAnchor="middle"
                                verticalAnchor="middle"
                                x="50%"
                                y="50%"
                                text={`${Math.round(dataSets[0].y)}%`}
                                style={{ fontSize: 45, fill: config.labelColor || 'black' }}
                            /> : null
                    }
                </svg>
            ));
        });
        return (
            <div style={{ overflow: 'visible', height: this.props.height || height, width: this.props.width || width }}>
                {
                    (config.legend || legend) && (config.legendOrientation && config.legendOrientation === 'top') ?
                        getLegendComponent(config, legendItems, [], null, height, width) :
                        null
                }
                <div
                    style={{
                        width: !(config.legend || legend) ? '100%' :
                            (() => {
                                if (!config.legendOrientation) return '80%';
                                else if (config.legendOrientation === 'left' || config.legendOrientation === 'right') {
                                    return '80%';
                                } else return '100%';
                            })(),
                        display: !config.legendOrientation ? 'inline' :
                            (() => {
                                if (config.legendOrientation === 'left' || config.legendOrientation === 'right') {
                                    return 'inline';
                                } else return null;
                            })(),
                        float: !config.legendOrientation ? 'left' : (() => {
                            if (config.legendOrientation === 'left') return 'right';
                            else if (config.legendOrientation === 'right') return 'left';
                            else return null;
                        })(),
                    }}
                >
                    {chartComponents}
                </div>
                {
                    (config.legend || legend) && (!config.legendOrientation || config.legendOrientation !== 'top') ?
                        getLegendComponent(config, legendItems, [], null, height, width) :
                        null
                }
            </div>
        );
    }
}

PieCharts.propTypes = {
    data: PropTypes.array,
    config: PropTypes.object.isRequired,
    metadata: PropTypes.object.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    onClick: PropTypes.func,
};
