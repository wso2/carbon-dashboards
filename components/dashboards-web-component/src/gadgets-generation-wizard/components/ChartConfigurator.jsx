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

import React, {Component} from 'react';
// Material UI Components
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Snackbar from 'material-ui/Snackbar';
import RaisedButton from 'material-ui/RaisedButton';
import PollIcon from 'material-ui/svg-icons/social/poll';
// App Utils
import Types from '../utils/Types';
import Configurations from '../utils/Configurations';
import Constants from '../utils/Constants';
// App Components
import LineAreaBarChart from './chartPropertyGenerators/main/LineAreaBarChart';
import PieChart from './chartPropertyGenerators/main/PieChart';
import ScatterChart from './chartPropertyGenerators/main/ScatterChart';
import NumberChart from './chartPropertyGenerators/main/NumberChart';
import GeographicalChart from './chartPropertyGenerators/main/GeographicalChart';
import TableChart from './chartPropertyGenerators/main/TableChart';
// App Utils
import UtilFunctions from '../utils/UtilFunctions';
import DataPublishingComponent from './DataPublishingComponent';

/**
 * Displays chart type selection, and the properties related to the selected chart type
 */
class ChartConfigurator extends Component {
    constructor(props) {
        super(props);
        this.handlePublisherConfigs = this.handlePublisherConfigs.bind(this);
        this.state = {
            // Data related
            chartType: '',
            metadata: props.metadata,
            chartConfiguration: {},
            previewConfiguration: {},
            data: [],
            // UI related
            isSnackbarOpen: false,
            snackbarMessage: '',
        };
    }

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    /**
     * Assigns selected chart type in the state and loads its default configuration
     * @param mainChartType
     */
    handleChartTypeChange(mainChartType) {
        const state = this.state;
        state.chartType = mainChartType;
        state.chartConfiguration = JSON.parse(JSON.stringify(Configurations.charts[mainChartType]));
        this.setState(state);
        this.props.onConfigurationChange(state.chartConfiguration);
    }

    handlePublisherConfigs(widgetOutputConfigs) {
        this.state.chartConfiguration.widgetOutputConfigs = widgetOutputConfigs;
    }

    /**
     * Displays properties related to the selected chart type
     * @returns {XML}
     */
    displayChartProperties() {
        if (this.state.chartType !== '') {
            switch (this.state.chartType) {
                case (Types.chart.lineAreaBarChart):
                    return (
                        <LineAreaBarChart
                            metadata={this.props.metadata}
                            configuration={this.state.chartConfiguration}
                            onConfigurationChange={configuration => this.props.onConfigurationChange(configuration)}
                        />
                    );
                case (Types.chart.pieChart):
                    return (
                        <PieChart
                            metadata={this.props.metadata}
                            configuration={this.state.chartConfiguration}
                            onConfigurationChange={configuration => this.props.onConfigurationChange(configuration)}
                        />
                    );
                case (Types.chart.scatterChart):
                    return (
                        <ScatterChart
                            metadata={this.props.metadata}
                            configuration={this.state.chartConfiguration}
                            onConfigurationChange={configuration => this.props.onConfigurationChange(configuration)}
                        />
                    );
                case (Types.chart.numberChart):
                    return (
                        <NumberChart
                            metadata={this.props.metadata}
                            configuration={this.state.chartConfiguration}
                            onConfigurationChange={configuration => this.props.onConfigurationChange(configuration)}
                        />
                    );
                case (Types.chart.geographicalChart):
                    return (
                        <GeographicalChart
                            metadata={this.props.metadata}
                            configuration={this.state.chartConfiguration}
                            onConfigurationChange={configuration => this.props.onConfigurationChange(configuration)}
                        />
                    );
                case (Types.chart.tableChart):
                    return (
                        <TableChart
                            metadata={this.props.metadata}
                            configuration={this.state.chartConfiguration}
                            onConfigurationChange={configuration => this.props.onConfigurationChange(configuration)}
                        />
                    );
                default:
                    return (<div/>);
            }
        }
        return (<div/>);
    }

    /**
     * Returns the gadget to be submitted after validation. Empty object is returned when the gadget is not valid
     * @returns {{}}
     */
    getValidatedConfiguration() {
        let configuration = this.state.chartConfiguration;
        let isGadgetConfigurationValid = false;
        switch (this.state.chartType) {
            case (Types.chart.lineAreaBarChart):
                if (UtilFunctions.validateLineChartConfiguration(configuration)) {
                    configuration = UtilFunctions.prepareLineChartConfiguration(configuration);
                    isGadgetConfigurationValid = true;
                }
                break;
            case (Types.chart.pieChart):
                if (UtilFunctions.validatePieChartConfiguration(configuration)) {
                    configuration = UtilFunctions.preparePieChartConfiguration(configuration);
                    isGadgetConfigurationValid = true;
                }
                break;
            case (Types.chart.scatterChart):
                if (UtilFunctions.validateScatterChartConfiguration(configuration)) {
                    configuration = UtilFunctions.prepareScatterChartConfiguration(configuration);
                    isGadgetConfigurationValid = true;
                }
                break;
            case (Types.chart.numberChart):
                if (UtilFunctions.validateNumberChartConfiguration(configuration)) {
                    configuration = UtilFunctions.prepareNumberChartConfiguration(configuration);
                    isGadgetConfigurationValid = true;
                }
                break;
            case (Types.chart.geographicalChart):
                if (UtilFunctions.validateGeographicalChartConfiguration(configuration)) {
                    configuration = UtilFunctions.prepareGeographicalChartConfiguration(configuration);
                    isGadgetConfigurationValid = true;
                }
                break;
            case (Types.chart.tableChart):
                if (UtilFunctions.validateTableChartConfiguration(configuration)) {
                    configuration = UtilFunctions.prepareTableChartConfiguration(configuration);
                    isGadgetConfigurationValid = true;
                }
                break;
            default:
                break;
        }

        // Send valid chart config object or empty object when not valid, to parent
        let submittableConfig = {};
        if (isGadgetConfigurationValid) {
            submittableConfig = configuration;
        }
        return submittableConfig;
    }

    /**
     * Displays snackbar with the given message
     * @param message
     */
    displaySnackbar(message) {
        this.setState({
            snackbarMessage: message,
            isSnackbarOpen: true,
        });
    }

    render() {
        return (
            <div>
                <div style={{margin: 10, fontFamily: 'Roboto, sans-serif', color: 'white'}}>
                    <SelectField
                        floatingLabelText='Select a chart type & configure its properties'
                        value={this.state.chartType}
                        onChange={(e, i, v) => this.handleChartTypeChange(v)}
                        fullWidth
                    >
                        <MenuItem
                            value={Types.chart.lineAreaBarChart}
                            primaryText={Constants.CHART_NAMES.LINE_AREA_BAR_CHART}
                        />
                        <MenuItem
                            value={Types.chart.pieChart}
                            primaryText={Constants.CHART_NAMES.PIE_CHART}
                        />
                        <MenuItem
                            value={Types.chart.scatterChart}
                            primaryText={Constants.CHART_NAMES.SCATTER_CHART}
                        />
                        <MenuItem
                            value={Types.chart.numberChart}
                            primaryText={Constants.CHART_NAMES.NUMBER_CHART}
                        />
                        <MenuItem
                            value={Types.chart.geographicalChart}
                            primaryText={Constants.CHART_NAMES.GEOGRAPHICAL_CHART}
                        />
                        <MenuItem
                            value={Types.chart.tableChart}
                            primaryText={Constants.CHART_NAMES.TABLE_CHART}
                        />
                    </SelectField>
                    {this.displayChartProperties()}
                    {this.state.chartType !== '' ?
                        <DataPublishingComponent outputAttributes={this.state.metadata.names}
                                                 onConfigurationChange={this.handlePublisherConfigs}/> : ""}
                    <br/>
                    {(this.state.chartType !== '') ?
                        (<RaisedButton
                            label="Preview"
                            labelPosition="before"
                            primary
                            icon={<PollIcon/>}
                            onClick={() => this.props.onPreview()}
                        />) :
                        (null)}
                </div>
                <Snackbar
                    open={this.state.isSnackbarOpen}
                    message={this.state.snackbarMessage}
                    autoHideDuration={4000}
                    onRequestClose={() => {
                        this.setState({
                            snackbarMessage: '',
                            isSnackbarOpen: false,
                        });
                    }}
                />
            </div>
        );
    }
}

export default ChartConfigurator;
