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

import React, {Component} from 'react';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {Card, CardHeader, CardText, Checkbox, MenuItem, SelectField} from 'material-ui';
import GoldenLayoutContentUtils from '../../utils/GoldenLayoutContentUtils';

const styles = {
    fadedText: {paddingTop: 10, opacity: 0.4},
};

export default class WidgetPubSubConfiguration extends Component {
    constructor(props) {
        super(props);
        this.state = {
            /**
             * Currently subscribed publishers' IDs with their output names arrays.
             * @type {Map<string, string[]>}
             */
            subscribedPublishers: null,
            /**
             * Current widget input-outputs mappings.
             * @type {Map<string, {subscriberWidgetInput: string, publisherId: string, publisherWidgetOutput: string}>}
             */
            widgetInputsOutputsMappings: null,
        };

        this.getSelectedPageAllWidgetsConfigurations = this.getSelectedPageAllWidgetsConfigurations.bind(this);
        this.getSelectedPagePublisherWidgetsContents = this.getSelectedPagePublisherWidgetsContents.bind(this);
        this.getPublisherWidgetsConfigurations = this.getPublisherWidgetsConfigurations.bind(this);
        this.getSelectedWidget = this.getSelectedWidget.bind(this);
        this.getSelectedWidgetConfiguration = this.getSelectedWidgetConfiguration.bind(this);
        this.isSelectedWidgetASubscriber = this.isSelectedWidgetASubscriber.bind(this);
        this.handlePublisherCheckboxClick = this.handlePublisherCheckboxClick.bind(this);
        this.handlePubSubWiringSelectFieldChange = this.handlePubSubWiringSelectFieldChange.bind(this);
        this.updateSelectedWidgetInputOutputMapping = this.updateSelectedWidgetInputOutputMapping.bind(this);
        this.initializePublisherDropDowns = this.initializePublisherDropDowns.bind(this);
        this.initializeWidgetInputOutputMappings = this.initializeWidgetInputOutputMappings.bind(this);
    }

    componentWillReceiveProps(props) {
        this.initializeWidgetInputOutputMappings(props.selectedWidget);
        this.initializePublisherDropDowns(props.selectedWidget);
    }

    getSelectedPageAllWidgetsConfigurations() {
        const referredWidgets = GoldenLayoutContentUtils.getReferredWidgets(this.props.selectedPageGoldenLayoutContent);
        return this.props.allWidgetsConfigurations.filter((widgetConfiguration) => {
            return (referredWidgets.find(widget => (widgetConfiguration.id === widget.id)) != null);
        });
    }

    getSelectedPagePublisherWidgetsContents() {
        return GoldenLayoutContentUtils.getPublisherWidgetsContents(this.props.selectedPageGoldenLayoutContent);
    }

    getPublisherWidgetsConfigurations() {
        return this.getSelectedPageAllWidgetsConfigurations().filter((widgetConfiguration) => {
            const configs = widgetConfiguration.configs;
            return (configs && configs.pubsub && Array.isArray(configs.pubsub.types) &&
                (configs.pubsub.types.indexOf('publisher') !== -1));
        });
    }

    getSelectedWidget() {
        return this.props.selectedWidget;
    }

    getSelectedWidgetConfiguration() {
        return this.props.selectedWidgetConfiguration;
    }

    initializeWidgetInputOutputMappings(selectedWidget) {
        const widgetInputs = _.get(this.getSelectedWidgetConfiguration(), 'configs.pubsub.subscriberWidgetInputs');
        if (!Array.isArray(widgetInputs)) {
            return null; // This widget doesn't have any inputs.
        }
        const widgetInputsOutputsMappings = new Map();
        const selectedWidgetPubSub = selectedWidget.props.configs.pubsub;
        if (selectedWidgetPubSub.widgetInputOutputMapping) {
            selectedWidgetPubSub.widgetInputOutputMapping.forEach((mapping) => {
                widgetInputsOutputsMappings.set(mapping.subscriberWidgetInput, mapping);
            });
        } else {
            selectedWidgetPubSub.widgetInputOutputMapping = [];
        }
        widgetInputs.forEach((inputName) => {
            if (!widgetInputsOutputsMappings.has(inputName)) {
                widgetInputsOutputsMappings.set(inputName, {
                    subscriberWidgetInput: inputName,
                    publisherId: null,
                    publisherWidgetOutput: null,
                });
            }
        });
        this.state.widgetInputsOutputsMappings = widgetInputsOutputsMappings;
    }

    initializePublisherDropDowns(selectedWidget) {
        const availablePublishersContents = this.getSelectedPagePublisherWidgetsContents();
        let selectedWidgetPubSub = selectedWidget.props.configs.pubsub;
        const subscribedPublishers = new Map();
        if (!selectedWidgetPubSub) {
            selectedWidgetPubSub = {};
            selectedWidgetPubSub.publishers = [];
        } else if (!selectedWidgetPubSub.publishers) {
            // Somehow this subscriber widget doesn't have a publishers array. Let's fix that.
            selectedWidgetPubSub.publishers = [];
        }

        selectedWidgetPubSub.publishers.forEach((publisherId) => {
            const publisherContents = availablePublishersContents.find((publisher) => {
                return publisherId === publisher.props.id;
            });
            if (publisherContents) {
                const publisherOutputs = _.get(publisherContents, 'props.configs.pubsub.publisherWidgetOutputs',
                    []);
                subscribedPublishers.set(publisherId, publisherOutputs);
            }
        });
        this.state.subscribedPublishers = subscribedPublishers;
    }

    isSelectedWidgetASubscriber() {
        const contentTypes = _.get(this.getSelectedWidget().props, 'configs.pubsub.types', []);
        const configurationTypes = _.get(this.getSelectedWidgetConfiguration(), 'configs.pubsub.types', []);
        return contentTypes.includes('subscriber') && configurationTypes.includes('subscriber');
    }

    handlePublisherCheckboxClick(publisherId, isChecked) {
        const subscribedPublishers = this.state.subscribedPublishers;
        const widgetInputsOutputsMappings = this.state.widgetInputsOutputsMappings;
        if (isChecked) {
            const publisherContents = this.getSelectedPagePublisherWidgetsContents().find((publisher) => {
                return publisherId === publisher.props.id;
            });
            const publisherOutputs = _.get(publisherContents, 'props.configs.pubsub.publisherWidgetOutputs', []);
            subscribedPublishers.set(publisherId, publisherOutputs);
        } else {
            subscribedPublishers.delete(publisherId);
            if (widgetInputsOutputsMappings) {
                widgetInputsOutputsMappings.forEach((mapping, widgetInputName) => {
                    if (mapping.publisherId === publisherId) {
                        widgetInputsOutputsMappings.set(widgetInputName, {
                            subscriberWidgetInput: mapping.subscriberWidgetInput,
                            publisherId: null,
                            publisherWidgetOutput: null,
                        });
                    }
                });
                this.updateSelectedWidgetInputOutputMapping(widgetInputsOutputsMappings);
            }
        }

        this.getSelectedWidget().props.configs.pubsub.publishers = Array.from(subscribedPublishers.keys());
        this.setState({subscribedPublishers, widgetInputsOutputsMappings});
    }

    handlePubSubWiringSelectFieldChange(subscriberInputName, selectedValueString) {
        const widgetInputsOutputsMappings = this.state.widgetInputsOutputsMappings;
        if (selectedValueString) {
            const selectedValue = JSON.parse(selectedValueString);
            widgetInputsOutputsMappings.set(subscriberInputName, {
                subscriberWidgetInput: subscriberInputName,
                publisherId: selectedValue.publisherId,
                publisherWidgetOutput: selectedValue.publisherWidgetOutput,
            });
        } else {
            widgetInputsOutputsMappings.set(subscriberInputName, {
                subscriberWidgetInput: subscriberInputName,
                publisherId: null,
                publisherWidgetOutput: null,
            });
        }
        this.updateSelectedWidgetInputOutputMapping(widgetInputsOutputsMappings);
        this.setState({widgetInputsOutputsMappings});
    }

    updateSelectedWidgetInputOutputMapping(widgetInputsOutputsMappings) {
        const newWidgetInputOutputMapping = [];
        widgetInputsOutputsMappings.forEach((mapping) => {
            if (mapping.publisherId && mapping.publisherWidgetOutput) {
                newWidgetInputOutputMapping.push(mapping);
            }
        });
        this.getSelectedWidget().props.configs.pubsub.widgetInputOutputMapping = newWidgetInputOutputMapping;
    }

    renderPublisherCheckboxes() {
        const availablePublishersContents = this.getSelectedPagePublisherWidgetsContents();
        const selectedWidgetPubSub = this.getSelectedWidget().props.configs.pubsub;
        if (!selectedWidgetPubSub.publishers) {
            // Somehow this subscriber widget doesn't have a publishers array. Let's fix that.
            selectedWidgetPubSub.publishers = [];
        }

        if (!this.state.subscribedPublishers) {
            // Initialize state.
            this.initializePublisherDropDowns(this.getSelectedWidget());
        }

        return availablePublishersContents.map((publisherContent) => {
            const publisherId = publisherContent.props.id;
            return (
                <Checkbox
                    key={publisherId}
                    label={publisherContent.title}
                    name={publisherContent.title}
                    checked={selectedWidgetPubSub.publishers.includes(publisherId)}
                    onCheck={(event, isChecked) => this.handlePublisherCheckboxClick(publisherId, isChecked)}
                />
            );
        });
    }

    renderWidgetInputDropdownItems(subscriberInputName) {
        const elements = [<MenuItem value={null} primaryText=''/>];
        this.state.subscribedPublishers.forEach((publisherOutputsNames, publisherId) => {
            publisherOutputsNames
                .map((publisherOutputName) => {
                    const valueString = JSON.stringify({
                        subscriberWidgetInput: subscriberInputName,
                        publisherId,
                        publisherWidgetOutput: publisherOutputName,
                    });
                    return (
                        <MenuItem
                            key={`${subscriberInputName}:${publisherId}:${publisherOutputName}`}
                            value={valueString}
                            primaryText={publisherOutputName}
                        />
                    );
                })
                .forEach(element => elements.push(element));
        });
        return elements;
    }

    renderPubSubWiring() {
        const widgetInputs = _.get(this.getSelectedWidgetConfiguration(), 'configs.pubsub.subscriberWidgetInputs');
        if (!Array.isArray(widgetInputs)) {
            return null; // This widget doesn't have any inputs.
        }
        if (this.state.subscribedPublishers.size < 1) {
            return (
                <div style={styles.fadedText}>
                    <FormattedMessage
                        id='widget-configuration.pubsub.no-selected-publishers'
                        defaultMessage='Please select at least one publisher'
                    />
                </div>
            );
        }

        if (!this.state.widgetInputsOutputsMappings) {
            // Initialize state.
            this.initializeWidgetInputOutputMappings(this.getSelectedWidget());
        }
        const elements = [];
        this.state.widgetInputsOutputsMappings.forEach((mapping) => {
            const subscriberInputName = mapping.subscriberWidgetInput;
            const element = (
                <div key={subscriberInputName}>
                    <div style={{display: 'inline-block', float: 'left', marginLeft: 10, marginTop: 30}}>
                        {subscriberInputName}
                    </div>
                    <SelectField
                        style={{
                            display: 'inline-block',
                            margin: 10,
                            marginLeft: 30,
                            width: '50%',
                        }}
                        value={JSON.stringify(mapping)}
                        onChange={(e, k, value) => this.handlePubSubWiringSelectFieldChange(subscriberInputName, value)}
                    >
                        {this.renderWidgetInputDropdownItems(subscriberInputName)}
                    </SelectField>
                </div>
            );
            elements.push(element);
        });
        return elements;
    }

    renderCardContent() {
        const availablePublishersContents = this.getSelectedPagePublisherWidgetsContents();
        if (availablePublishersContents.length < 1) {
            return (
                <div style={styles.fadedText}>
                    <FormattedMessage
                        id='widget-configuration.pubsub.no-publishers'
                        defaultMessage='No publishers found in this dashboard page.'
                    />
                </div>
            );
        } else {
            return (
                <span>
                    {this.renderPublisherCheckboxes()}
                    {this.renderPubSubWiring()}
                </span>
            );
        }
    }

    render() {
        if (!this.isSelectedWidgetASubscriber()) {
            return null;
        }

        return (
            <Card style={{margin: 10}} initiallyExpanded>
                <CardHeader
                    title={<FormattedMessage id='widget-configuration.pubsub.title' defaultMessage='Publishers'/>}
                    style={{paddingBottom: 0}}
                    actAsExpander={false}
                    showExpandableButton={false}
                />
                <CardText expandable>
                    {this.renderCardContent()}
                </CardText>
            </Card>
        );
    }
}

WidgetPubSubConfiguration.propTypes = {
    selectedWidget: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        className: PropTypes.string.isRequired,
        props: PropTypes.shape({}).isRequired,
    }).isRequired,
    selectedWidgetConfiguration: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        configs: PropTypes.shape({}).isRequired,
    }).isRequired,
    selectedPageGoldenLayoutContent: PropTypes.shape({}).isRequired,
    allWidgetsConfigurations: PropTypes.arrayOf({
        name: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired,
        configs: PropTypes.shape({}).isRequired,
    }).isRequired,
};
