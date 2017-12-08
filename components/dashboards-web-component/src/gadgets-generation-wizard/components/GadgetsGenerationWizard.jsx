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
import { FormattedMessage } from 'react-intl';
// Material UI Components
import { Step, StepLabel, Stepper } from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import ExpandTransition from 'material-ui/internal/ExpandTransition';
import Paper from 'material-ui/Paper';
import Snackbar from 'material-ui/Snackbar';
import { darkBaseTheme, getMuiTheme, MuiThemeProvider } from 'material-ui/styles';
// App Components
import { FormPanel, Header } from '../../common';
import ChartConfigurator from './ChartConfigurator';
import ProviderConfigurator from './ProviderConfigurator';
import UtilFunctions from '../utils/UtilFunctions';
import GadgetDetailsConfigurator from './GadgetDetailsConfigurator';
// API
import GadgetsGenerationAPI from '../../utils/apis/GadgetsGenerationAPI';

const appContext = window.contextPath;

/**
 * Material UI theme
 */
const muiTheme = getMuiTheme(darkBaseTheme);

/**
 * Style constants
 */
const styles = {
    messageBox: { textAlign: 'center', color: 'white' },
    errorMessage: { backgroundColor: '#FF5722', color: 'white' },
    successMessage: { backgroundColor: '#4CAF50', color: 'white' },
    completedStepperText: {color: 'white'},
    activeStepperText: { color: '#0097A7' },
    inactiveStepperText: { color: '#9E9E9E' },
};

/**
 * Represents a main chart, that can have Line / Bar / Area as sub charts
 */
class GadgetsGenerationWizard extends Component {
    constructor() {
        super();
        this.state = {
            // Data related
            isGadgetDetailsValid: false,
            isProviderConfigurationValid: false,
            gadgetDetails: {
                name: '',
            },
            providerType: '',
            providersList: [],
            providerConfiguration: {},
            chartConfiguration: {},
            metadata: {
                names: ['rpm', 'torque', 'horsepower', 'EngineType'],
                types: ['LINEAR', 'LINEAR', 'LINEAR', 'ORDINAL'],
            },
            data: [],
            // UI related
            isSnackbarOpen: false,
            snackbarMessage: '',
            snackbarMessageType: '',
            loading: false,
            finished: false,
            stepIndex: 0,
            previewChart: false,
        };
        this.handleGadgetDetailsChange = this.handleGadgetDetailsChange.bind(this);
        this.handleProviderTypeChange = this.handleProviderTypeChange.bind(this);
        this.handleProviderConfigPropertyChange = this.handleProviderConfigPropertyChange.bind(this);
        this.updateChartConfiguration = this.updateChartConfiguration.bind(this);
        this.toggleChartPreview = this.toggleChartPreview.bind(this);
        this.updateChartPreview = this.updateChartPreview.bind(this);
        this.dummyAsync = this.dummyAsync.bind(this);
        this.handleNext = this.handleNext.bind(this);
        this.handlePrev = this.handlePrev.bind(this);
    }

    componentDidMount() {
        const api = new GadgetsGenerationAPI()
        api.getProvidersList().then((response) => {
            this.setState({
                providersList: response.data,
            });
        });
    }

    /**
     * Updates the value of a detail related to the gadget
     * @param key
     * @param value
     */
    handleGadgetDetailsChange(key, value) {
        const state = this.state;
        state.gadgetDetails[key] = value;
        this.setState(state);
    }

    /**
     * Updates the selected provider's type, and specific configuration in the state when a provider is selected
     * @param providerType
     */
    handleProviderTypeChange(providerType) {
        const apis = new GadgetsGenerationAPI();
        apis.getProviderConfiguration(providerType).then((response) => {
            this.setState({
                providerType,
                providerConfiguration: response.data,
            });
        }).catch(() => {
            this.displaySnackbar('Failed to load provider configurations', 'errorMessage');
        });
    }

    /**
     * Sets changed property value of provider configuration in state
     * @param propertyKey
     * @param propertyValue
     */
    handleProviderConfigPropertyChange(propertyKey, propertyValue) {
        const state = this.state;
        state.providerConfiguration[propertyKey] = propertyValue;
        this.setState(state);
    }

    /**
     * Updates the chart configuration
     * @param chartConfiguration
     */
    updateChartConfiguration(chartConfiguration) {
        this.setState({ chartConfiguration });
    }

    /**
     * Toggles the chart preview
     */
    toggleChartPreview() {
        this.setState({ previewChart: (!this.state.previewChart) });
    }

    /**
     * Updates the chart preview by passing random values
     */
    updateChartPreview(data) {
        this.setState({ data });
    }

    /**
     * Submits gadget configuration
     */
    submitGadgetConfig() {
        if (!UtilFunctions.isEmpty(this.state.chartConfiguration)) {
            const submittableConfig = {
                name: this.state.gadgetDetails.name,
                id: '',
                chartConfig: this.state.chartConfiguration,
                providerConfig: {
                    configs: {
                        type: this.state.providerType,
                        config: this.state.providerConfiguration
                    }
                }
            };
            const apis = new GadgetsGenerationAPI();
            apis.addGadgetConfiguration(JSON.stringify(submittableConfig)).then((response) => {
                if (response.status === 201) {
                    this.displaySnackbar(`Gadget ${this.state.gadgetDetails.name} was created successfully!`,
                        'successMessage');
                    setTimeout(() => {
                        window.location.href = appContext;
                    }, 1000);
                } else {
                    this.displaySnackbar('Failed to save the gadget', 'errorMessage');
                }
            }).catch(() => {
                this.displaySnackbar('Failed to save the gadget', 'errorMessage');
            });
        } else {
            this.displaySnackbar('Please fill in required values', 'errorMessage');
        }
    }

    /* Wizard pages navigation related functions [START] */

    dummyAsync(cb) {
        this.setState({ loading: true }, () => {
            this.asyncTimer = setTimeout(cb, 500);
        });
    }

    /**
     * Handles onClick of Next button, including validations
     */
    handleNext() {
        const { stepIndex } = this.state;
        const apis = new GadgetsGenerationAPI();
        switch (stepIndex) {
            case (0):
                // Validate gadget details & proceed for selecting provider
                if (this.state.gadgetDetails.name !== '') {
                    apis.validateWidgetName(this.state.gadgetDetails.name).then((response) => {
                        if (response.status === 200) {
                            if (!this.state.loading) {
                                this.dummyAsync(() => this.setState({
                                    loading: false,
                                    isGadgetDetailsValid: true,
                                    stepIndex: stepIndex + 1,
                                    finished: stepIndex >= 2,
                                }));
                            }
                        }
                    }).catch((error) => {
                        if (error.response) {
                            if (error.response.status === 409) {
                                this.displaySnackbar('The widget name already exists', 'errorMessage');
                            } else {
                                this.displaySnackbar('Unable to proceed to the next step', 'errorMessage');
                            }
                        } else {
                            this.displaySnackbar('Unable to process your request', 'errorMessage');
                        }
                    });
                } else {
                    this.displaySnackbar('Gadget name can not be empty', 'errorMessage');
                }
                break;
            case (1):
                // Validate provider configuration and get metadata
                let isProviderConfigurationValid = true;
                if (!UtilFunctions.isEmpty(this.state.providerConfiguration)) {
                    for (const property in this.state.providerConfiguration) {
                        if (Object.prototype.hasOwnProperty.call(this.state.providerConfiguration, property)) {
                            if (this.state.providerConfiguration[property] === '') {
                                isProviderConfigurationValid = false;
                                break;
                            }
                        }
                    }
                    if (isProviderConfigurationValid) {
                        apis.getProviderMetadata(this.state.providerType,
                            this.state.providerConfiguration).then((response) => {
                            if (!this.state.loading) {
                                this.dummyAsync(() => this.setState({
                                    loading: false,
                                    isGadgetDetailsValid: true,
                                    stepIndex: stepIndex + 1,
                                    finished: stepIndex >= 2,
                                    metadata: response.data,
                                }));
                            }
                        }).catch(() => {
                            this.displaySnackbar('Unable to process your request', 'errorMessage');
                        });
                    } else {
                        this.displaySnackbar('Please fill in values for all the fields', 'errorMessage');
                    }
                } else {
                    this.displaySnackbar('Please select a data provider and configure details', 'errorMessage');
                }
                break;
            case (2):
                this.submitGadgetConfig();
                break;
            default:
                this.displaySnackbar('Invalid step', 'errorMessage');
        }
    }

    handlePrev() {
        const { stepIndex } = this.state;
        if (!this.state.loading) {
            this.dummyAsync(() => this.setState({
                loading: false,
                stepIndex: stepIndex - 1,
            }));
        }
    }

    getStepContent(stepIndex) {
        switch (stepIndex) {
            case 0:
                return (
                    <GadgetDetailsConfigurator
                        gadgetDetails={this.state.gadgetDetails}
                        handleGadgetDetailsChange={this.handleGadgetDetailsChange}
                    />
                );
            case 1:
                return (
                    <ProviderConfigurator
                        providersList={this.state.providersList}
                        providerType={this.state.providerType}
                        configuration={this.state.providerConfiguration}
                        handleProviderTypeChange={this.handleProviderTypeChange}
                        handleProviderConfigPropertyChange={this.handleProviderConfigPropertyChange}
                    />
                );
            case 2:
                return (
                    <ChartConfigurator
                        metadata={this.state.metadata}
                        onConfigurationChange={this.updateChartConfiguration}
                        previewChart={this.state.previewChart}
                        toggleChartPreview={this.toggleChartPreview}
                        updateChartPreview={this.updateChartPreview}
                    />
                );
            default:
                return 'Invalid step';
        }
    }

    renderNextButton(stepIndex) {
        switch (stepIndex) {
            case 0:
                return (
                    <RaisedButton
                        label="Next"
                        primary
                        onClick={this.handleNext}
                    />
                );
            case 1:
                return (
                    <RaisedButton
                        label="Next"
                        primary
                        onClick={this.handleNext}
                    />
                );
            case 2:
                return (
                    <RaisedButton
                        label="Create"
                        primary
                        onClick={() => this.submitGadgetConfig()}
                    />
                );
            default:
                return null;
        }
    }

    renderContent() {
        const { finished, stepIndex } = this.state;
        const contentStyle = { margin: '0 16px', overflow: 'hidden' };

        if (finished) {
            return (
                <div style={contentStyle}>
                    <p>
                        <a
                            href={appContext}
                            onClick={(event) => {
                                event.preventDefault();
                                this.setState({ stepIndex: 0, finished: false });
                            }}
                        >
                            Reset
                        </a>
                    </p>
                </div>
            );
        }

        return (
            <div style={contentStyle}>
                <div>{this.getStepContent(stepIndex)}</div>
                <div style={{ marginTop: 24, marginBottom: 12 }}>
                    <FlatButton
                        label="Back"
                        disabled={stepIndex === 0}
                        onClick={this.handlePrev}
                        style={{ marginRight: 12 }}
                    />
                    {this.renderNextButton(stepIndex)}
                </div>
            </div>
        );
    }

    /* Wizard pages navigation related functions [END] */

    /**
     * Displays snackbar with the given message, and refers to the style with the provided key
     * @param message
     * @param styleKey
     */
    displaySnackbar(message, styleKey) {
        this.setState({
            snackbarMessage: message,
            isSnackbarOpen: true,
            snackbarMessageType: styleKey,
        });
    }

    /**
     * Returns style for the stepper text based on the given current and self indexes
     * @param currentIndex
     * @param selfIndex
     */
    getStepperTextStyle(currentIndex, selfIndex) {
        if (selfIndex === currentIndex) {
            return styles.activeStepperText;
        } else if (selfIndex < currentIndex) {
            return styles.completedStepperText;
        } else {
            return styles.inactiveStepperText;
        }
    }

    render() {
        const { loading, stepIndex } = this.state;

        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                <div>
                    <Header title={<FormattedMessage id="portal" defaultMessage="Portal" />} />
                    <FormPanel
                        title={<FormattedMessage id="create.gadget" defaultMessage="Create gadget" />}
                        width="800"
                    >

                        <div style={{ align: 'center' }}>
                            <Stepper activeStep={stepIndex}>
                                <Step>
                                    <StepLabel
                                        style={this.getStepperTextStyle(stepIndex, 0)}
                                    >
                                        Enter gadget name
                                    </StepLabel>
                                </Step>
                                <Step>
                                    <StepLabel
                                        style={this.getStepperTextStyle(stepIndex, 1)}
                                    >
                                        Configure data provider
                                    </StepLabel>
                                </Step>
                                <Step>
                                    <StepLabel
                                        style={this.getStepperTextStyle(stepIndex, 2)}
                                    >
                                        Configure chart
                                    </StepLabel>
                                </Step>
                            </Stepper>
                            <ExpandTransition loading={loading} open>
                                {this.renderContent()}
                            </ExpandTransition>
                        </div>
                    </FormPanel>
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
                        contentStyle={styles.messageBox}
                        bodyStyle={styles[this.state.snackbarMessageType]}
                    />
                </div>
            </MuiThemeProvider>
        );
    }
}

export default GadgetsGenerationWizard;
