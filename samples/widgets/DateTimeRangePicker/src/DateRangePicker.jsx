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

import React from 'react';
import Widget from '@wso2-dashboards/widget';
import {MuiThemeProvider, MenuItem, SelectField, FlatButton} from 'material-ui';
import {NotificationSync, NotificationSyncDisabled} from 'material-ui/svg-icons'
import GranularityModeSelector from "./GranularityModeSelector";
import Moment from 'moment';
import {Scrollbars} from 'react-custom-scrollbars';

export default class DateRangePicker extends Widget {

    constructor(props) {
        super(props);
        this.state = {
            id: props.widgetID,
            width: props.glContainer.width,
            height: props.glContainer.height,
            granularityMode: null,
            granularityValue: '',
            options: this.props.configs.options,
            enableSync: false,
            btnType: <NotificationSyncDisabled color='#BDBDBD'/>
        };

        this.handleResize = this.handleResize.bind(this);
        this.props.glContainer.on('resize', this.handleResize);
        this.handleGranularityChange = this.handleGranularityChange.bind(this);
        this.publishTimeRange = this.publishTimeRange.bind(this);
        this.getTimeIntervalDescriptor = this.getTimeIntervalDescriptor.bind(this);
        this.generateGranularitySelector = this.generateGranularitySelector.bind(this);
        this.getStartTimeAndGranularity = this.getStartTimeAndGranularity.bind(this);
        this.lowerCaseFirstChar = this.lowerCaseFirstChar.bind(this);
        this.capitalizeCaseFirstChar = this.capitalizeCaseFirstChar.bind(this);
        this.generateGranularityMenuItems = this.generateGranularityMenuItems.bind(this);
        this.getSelectedGranularities = this.getSelectedGranularities.bind(this);
        this.verifyDefaultGranularity = this.verifyDefaultGranularity.bind(this);
        this.autoSyncClick = this.autoSyncClick.bind(this);
        this.setRefreshInterval = this.setRefreshInterval.bind(this);
        this.clearRefreshInterval = this.clearRefreshInterval.bind(this);
    }

    handleResize() {
        this.setState({
            width: this.props.glContainer.width,
            height: this.props.glContainer.height
        });
    }

    publishTimeRange(message) {
        super.publish(message);
    }

    handleGranularityChange(mode) {
        this.clearRefreshInterval();
        let granularity = '';
        let startTime = null;

        if (mode !== 'custom') {
            let startTimeAndGranularity = this.getStartTimeAndGranularity(mode);
            granularity = this.verifyDefaultGranularity(startTimeAndGranularity['granularity']);
            startTime = startTimeAndGranularity['startTime'];
            this.publishTimeRange({
                granularity: granularity,
                from: startTime.getTime(),
                to: new Date().getTime()
            });
            this.setRefreshInterval();
        }
        this.setState({
            granularityMode: mode,
            granularityValue: granularity,
            startTime: startTime,
            endTime: new Date()
        });
    }

    getStartTimeAndGranularity(mode) {
        let granularity = '';
        let startTime = null;

        switch (mode) {
            case '1 Min':
                startTime = Moment().subtract(1, 'minutes').toDate();
                granularity = 'minute';
                break;
            case '15 Min':
                startTime = Moment().subtract(15, 'minutes').toDate();
                granularity = 'minute';
                break;
            case '1 Hour' :
                startTime = Moment().subtract(1, 'hours').toDate();
                granularity = 'minute';
                break;
            case '1 Day':
                startTime = Moment().subtract(1, 'days').toDate();
                granularity = 'hour';
                break;
            case '7 Days':
                startTime = Moment().subtract(7, 'days').toDate();
                granularity = 'day';
                break;
            case '1 Month':
                startTime = Moment().subtract(1, 'months').toDate();
                granularity = 'day';
                break;
            case '3 Months':
                startTime = Moment().subtract(3, 'months').toDate();
                granularity = 'month';
                break;
            case '6 Months':
                startTime = Moment().subtract(6, 'months').toDate();
                granularity = 'month';
                break;
            case '1 Year':
                startTime = Moment().subtract(1, 'years').toDate();
                granularity = 'month';
                break;
        }
        return {startTime: startTime, granularity: granularity};
    }

    verifyDefaultGranularity(granularity) {
        let availableGranularities = this.getSelectedGranularities();
        if (availableGranularities.indexOf(this.capitalizeCaseFirstChar(granularity)) > -1) {
            return granularity;
        } else {
            return this.lowerCaseFirstChar(availableGranularities[0]);
        }
    }

    componentDidMount() {
        this.handleGranularityChange(this.state.options.defaultValue);
    }

    componentWillUnmount() {
        clearInterval(this.state.refreshIntervalId);
    }

    render() {
        let {granularityMode, width, height} = this.state;
        return (
            <MuiThemeProvider
                theme={this.props.muiTheme}>
                <Scrollbars
                    style={{width, height}}>
                    <div
                        style={{
                            margin: '2%',
                            maxWidth: 840
                        }}>
                        <GranularityModeSelector
                            onChange={this.handleGranularityChange}
                            options={this.state.options}
                            publishTimeRange={this.publishTimeRange}/>
                        {this.getTimeIntervalDescriptor(granularityMode)}
                    </div>
                </Scrollbars>
            </MuiThemeProvider>
        );
    }

    getTimeIntervalDescriptor(granularityMode) {
        if (granularityMode !== 'custom') {
            let startTime = null;
            let endTime = null;

            switch (granularityMode) {
                case '1 Min':
                    startTime = Moment().subtract(1, 'minutes').format("DD-MMM-YYYY hh:mm A");
                    endTime = Moment().format("DD-MMM-YYYY hh:mm A");
                    break;
                case '15 Min':
                    startTime = Moment().subtract(15, 'minutes').format("DD-MMM-YYYY hh:mm A");
                    endTime = Moment().format("DD-MMM-YYYY hh:mm A");
                    break;
                case '1 Hour' :
                    startTime = Moment().subtract(1, 'hours').format("DD-MMM-YYYY hh:mm A");
                    endTime = Moment().format("DD-MMM-YYYY hh:mm A");
                    break;
                case '1 Day':
                    startTime = Moment().subtract(1, 'days').format("DD-MMM-YYYY");
                    endTime = Moment().format("DD-MMM-YYYY");
                    break;
                case '7 Days':
                    startTime = Moment().subtract(7, 'days').format("DD-MMM-YYYY");
                    endTime = Moment().format("DD-MMM-YYYY");
                    break;
                case '1 Month':
                    startTime = Moment().subtract(1, 'months').format("MMM-YYYY");
                    endTime = Moment().format('MMM-YYYY');
                    break;
                case '3 Months':
                    startTime = Moment().subtract(3, 'months').format('MMM-YYYY');
                    endTime = Moment().format('MMM-YYYY');
                    break;
                case '6 Months':
                    startTime = Moment().subtract(6, 'months').format('MMM-YYYY');
                    endTime = Moment().format('MMM-YYYY');
                    break;
                case '1 Year':
                    startTime = Moment().subtract(1, 'years').format('YYYY');
                    endTime = Moment().format('YYYY');
                    break;
            }

            if (granularityMode) {
                return (
                    <div
                        style={{
                            marginTop: 5,
                            width: '100%'
                        }}>
                        <div
                            style={{display: 'inline'}}>
                            {`${startTime}  to  ${endTime}  per  `} {this.generateGranularitySelector()}
                        </div>
                        <div style={{
                            display: 'inline',
                            margin: 10
                        }}>
                            <FlatButton
                                label="Auto-Sync"
                                icon={this.state.btnType}
                                onClick={this.autoSyncClick}
                            />
                        </div>
                    </div>
                )
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    generateGranularitySelector() {
        return (
            <SelectField
                className={'perUnderline'}
                value={this.state.granularityValue}
                onChange={(event, index, value) => {
                    super.publish({
                        granularity: value,
                        from: this.state.startTime.getTime(),
                        to: this.state.endTime.getTime(),
                    });
                    this.setState({granularityValue: value});
                }}
            >
                {this.generateGranularityMenuItems()}
            </SelectField>
        )
    }

    generateGranularityMenuItems() {
        return (this.getSelectedGranularities()).map((view) =>
            <MenuItem
                value={this.lowerCaseFirstChar(view)}
                primaryText={view}/>);
    }

    lowerCaseFirstChar(str) {
        return str.charAt(0).toLowerCase() + str.slice(1);
    }

    capitalizeCaseFirstChar(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    getSelectedGranularities() {
        let minGranularity = this.state.options['availableGranularities'];
        let granularities = [];
        switch (minGranularity) {
            case 'From Second':
                granularities = ['Second', 'Minute', 'Hour', 'Day', 'Month', 'Year'];
                break;
            case 'From Minute':
                granularities = ['Minute', 'Hour', 'Day', 'Month', 'Year'];
                break;
            case 'From Hour':
                granularities = ['Hour', 'Day', 'Month', 'Year'];
                break;
            case 'From Day':
                granularities = ['Day', 'Month', 'Year'];
                break;
            case 'From Month':
                granularities = ['Month', 'Year'];
                break;
            case 'From Year':
                granularities = ['Year'];
                break;
        }
        return granularities;
    }

    autoSyncClick() {
        if (!this.state.enableSync) {
            this.setState({
                enableSync: true,
                btnType: <NotificationSync color='#f17b31'/>
            }, this.setRefreshInterval);
        } else {
            this.setState({
                enableSync: false,
                btnType: <NotificationSyncDisabled color='#BDBDBD'/>
            });
            this.clearRefreshInterval();
        }
    }

    setRefreshInterval() {
        if (this.state.enableSync) {
            let refreshInterval = this.state.options.refreshTimeInterval * 1000;
            let refresh = () => {
                let startTimeAndGranularity = this.getStartTimeAndGranularity(this.state.granularityMode);
                this.publishTimeRange({
                    granularity: this.state.granularityValue,
                    from: startTimeAndGranularity['startTime'].getTime(),
                    to: new Date().getTime(),
                });
            };
            let intervalID = setInterval(refresh, refreshInterval);
            this.setState({
                refreshIntervalId: intervalID,
                endTime: new Date()
            });
        }
    }

    clearRefreshInterval() {
        clearInterval(this.state.refreshIntervalId);
        this.setState({refreshIntervalId: null});
    }

}

global.dashboard.registerWidget("DateRangePicker", DateRangePicker);
