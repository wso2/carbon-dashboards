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
import { VictoryLabel } from 'victory';
import VizGError from '../VizGError';

export default class NumberCharts extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            height: props.config.height || 450,
            width: props.config.width || 800,
            value: null,
            prevValue: null,
        };
    }

    componentDidMount() {
        this._handleData(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this._handleData(nextProps);
    }

    /**
     * handles data received by the props
     * @param props
     * @private
     */
    _handleData(props) {
        const { config, data, metadata } = props;
        let { prevValue, value } = this.state;
        const xIndex = metadata.names.indexOf(config.x);

        if (xIndex === -1) {
            throw new VizGError('MapChart', "Unknown 'x' field defined in the Number Chart config.");
        }

        if (data.length > 0) {
            prevValue = value;
            value = data[data.length - 1][xIndex];
        }

        this.setState({ value, prevValue });
    }

    render() {

        const { config } = this.props;
        const { width, height, prevValue, value } = this.state;
        const highValueColor = '#109618';
        const lowValueColor = '#B82E2E';

        return (
            <svg height={'100%'} width={'100%'} viewBox={`0 0 ${width} ${height}`}>
                <VictoryLabel
                    textAnchor="middle"
                    verticalAnchor="middle"
                    x={width / 2}
                    y={(height / 2) - 50}
                    text={config.title}
                    style={{ fill: '#4d4d4d', fontSize: width / 25}}
                />
                <VictoryLabel
                    textAnchor="middle"
                    verticalAnchor="middle"
                    x={width / 2}
                    y={(height / 2) - 10}
                    text={(value === null ? value : value.toFixed(3))}
                    style={{ fill: '#919191', fontSize: width / 15}}
                />
                <VictoryLabel
                    textAnchor="middle"
                    verticalAnchor="middle"
                    x={width / 2}
                    y={(height / 2) + 10}
                    text={(Math.abs(eval(prevValue - value))).toFixed(3)}
                    style={{ fill: '#919191', fontSize: width / 15}}
                />
                <VictoryLabel
                    textAnchor="middle"
                    verticalAnchor="middle"
                    x={width / 2}
                    y={(height / 2) + 50}
                    text={(Math.abs((100 * ((value - prevValue) / prevValue))).toFixed(2)) + '%'}
                    style={{ fill: prevValue < value ? highValueColor : lowValueColor, fontSize: width / 20}}
                />
                <VictoryLabel
                    textAnchor="middle"
                    verticalAnchor="middle"
                    x={(width / 2) + 50}
                    y={((height / 2) + 50)}
                    text={prevValue < value ? '↑' : prevValue === value ? '' : '↓'}
                    style={{ fill: prevValue < value ? highValueColor : lowValueColor, fontSize: width / 20}}
                />
            </svg>
        );
    }
}

NumberCharts.propTypes = {
    config: PropTypes.object.isRequired,
    metadata: PropTypes.object.isRequired,
    data: PropTypes.array
};
