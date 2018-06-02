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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {IconButton, Paper} from 'material-ui';
import {NavigationArrowForward} from 'material-ui/svg-icons';
import {Event} from '../../utils/Constants';
import Subheader from 'material-ui/Subheader';
import List, {ListItem} from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import GoldenLayoutContentUtils from '../../utils/GoldenLayoutContentUtils';

const labelStyle = {
    fontSize: 12
};

const stylePanelHeader = {
    color: '#d7dbdd',
    fontWeight: 'bold',
    fontSize: 16
};

const styleListHeader = {
    marginTop: 10,
    backgroundColor: '#071921',
    fontWeight: 'lighter',
    fontSize: 14
};

const itemBackgroundStyle = {
    backgroundColor: '#131a1f',
    paddingLeft: 10
};

const styles = {
    backdrop: {
        position: 'fixed',
        height: '100%',
        width: '100%',
        top: '0px',
        left: '0px',
        opacity: 1,
        willChange: 'opacity',
        transform: 'translateZ(0px)',
        transition: 'left 0ms cubic-bezier(0.23, 1, 0.32, 1) 0ms, opacity 400ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
        pointerEvents: 'auto',
    },
};

export default class WidgetConfigurationPane extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clickedOnBackdrop: false,
            checked: new Map(),
            widgetDropDownMenuMap: new Map(),
            dropDownValues: new Map()
        };

        this.getSelectedPageAllWidgetsConfigurations = this.getSelectedPageAllWidgetsConfigurations.bind(this);
        this.getSelectedPagePublisherWidgetsContents = this.getSelectedPagePublisherWidgetsContents.bind(this);
        this.getPublisherWidgetsConfigurations = this.getPublisherWidgetsConfigurations.bind(this);
        this.getSelectedWidget = this.getSelectedWidget.bind(this);
        this.getSelectedWidgetConfiguration = this.getSelectedWidgetConfiguration.bind(this);
        this.triggerEvent = this.triggerEvent.bind(this);
        this.handlePaneClose = this.handlePaneClose.bind(this);
        this.updateWidget = this.updateWidget.bind(this);
        this.handleCheckBox = this.handleCheckBox.bind(this);
        this.getPublisherWiringUI = this.getPublisherWiringUI.bind(this);
        this.persistWiringConfigsInDashboardJSON = this.persistWiringConfigsInDashboardJSON.bind(this);
        this.unpersistWiringConfigsInDashboardJSON = this.unpersistWiringConfigsInDashboardJSON.bind(this);
        this.handlePublisherDropDown = this.handlePublisherDropDown.bind(this)
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
        const widgetContent = this.props.selectedWidgetGoldenLayoutContent.config;
        let widgetId = widgetContent.props.configs.widgetID;
        if (!widgetId) {
            widgetId = widgetContent.component;
            widgetContent.props.configs.widgetID = widgetId; // Sets the widgetID so it will be added to the DB.
        }
        return {
            id: widgetId,
            name: widgetContent.title,
            className: widgetContent.component,
            props: widgetContent.props,
        };
    }

    getSelectedWidgetConfiguration() {
        const selectedWidgetId = this.getSelectedWidget().id;
        return this.getSelectedPageAllWidgetsConfigurations().find((widgetConfiguration) => {
            return (widgetConfiguration.id === selectedWidgetId);
        });
    }

    triggerEvent(eventName, parameter) {
        this.props.selectedWidgetGoldenLayoutContent.layoutManager.eventHub.trigger(eventName, parameter);
    }

    handlePaneClose() {
        this.setState({clickedOnBackdrop: true});
        this.props.paneCloseEventListener();
    }

    updateWidget() {
        const newConfig = this.props.selectedWidgetGoldenLayoutContent.config;
        this.triggerEvent(Event.DASHBOARD_DESIGNER_WIDGET_CONFIG_UPDATE, newConfig);
    }

    renderBackdrop(theme) {
        return (
            <div
                style={{
                    ...styles.backdrop,
                    backgroundColor: theme.overlay.backgroundColor,
                    zIndex: theme.zIndex.drawerOverlay,
                }}
                onClick={this.handlePaneClose}
            />
        );
    }

    handleCheckBox(event, isChecked) {
        let widgetDropDownMenuMap = this.state.widgetDropDownMenuMap;
        this.state.checked.set(event.currentTarget.id, isChecked);
        let publisher = this.getSelectedPagePublisherWidgetsContents().find(publisher => {
            return event.currentTarget.id === publisher.props.id
        });
        let subscriberConfig = this.getSelectedWidget().props;
        if (isChecked) {
            widgetDropDownMenuMap.set(publisher.props.id, publisher.props.configs.pubsub.publisherWidgetOutputs)
            if (!subscriberConfig.configs.pubsub.publishers) {
                subscriberConfig.configs.pubsub.publishers = [];
            }
            subscriberConfig.configs.pubsub.publishers.push(event.currentTarget.id)
        } else {
            widgetDropDownMenuMap.delete(publisher.props.id);
            let position = subscriberConfig.configs.pubsub.publishers.indexOf(event.currentTarget.id);
            this.unpersistWiringConfigsInDashboardJSON(subscriberConfig.configs.pubsub, event.currentTarget.id);
            subscriberConfig.configs.pubsub.publishers.splice(position, 1);
        }
        this.updateWidget();
        this.setState({checked: this.state.checked});
    }

    persistWiringConfigsInDashboardJSON(pubsubConfigs) {
        pubsubConfigs.widgetInputOutputMapping = [];
        for (let [subscriberInput, widgetPubsubMapping] of this.state.dropDownValues.entries()) {
            pubsubConfigs.widgetInputOutputMapping.push({
                subscriberWidgetInput: subscriberInput,
                publisherWidgetOutput: widgetPubsubMapping.value,
                publisherId: widgetPubsubMapping.publisherID
            })
        }
        this.updateWidget();
    }

    unpersistWiringConfigsInDashboardJSON(pubsubConfigs, publisherID) {
        pubsubConfigs.widgetInputOutputMapping = pubsubConfigs.widgetInputOutputMapping.filter(
            widgetInputOutputMapping => {
                return widgetInputOutputMapping.publisherWidgetOutput !== publisherID;
            });
        return pubsubConfigs.widgetInputOutputMapping;
    }

    getPublisherWiringUI() {
        let pubsubWiringUI = [];
        const selectedWidgetConfigs = this.getSelectedWidgetConfiguration().configs;
        const pubsub = selectedWidgetConfigs ? selectedWidgetConfigs.pubsub : null;
        if (pubsub && Array.isArray(pubsub.types) && (pubsub.types.indexOf('subscriber') !== -1) &&
            pubsub.subscriberWidgetInputs) {
            pubsubWiringUI = pubsub.subscriberWidgetInputs.map(
                subscriberInput => {
                    return (<div>
                        <div style={{
                            display: 'inline-block',
                            float: 'left',
                            marginLeft: 10,
                            marginTop: 30
                        }}>{subscriberInput}</div>
                        <SelectField
                            onChange={this.handlePublisherDropDown}
                            value={this.state.dropDownValues.get(subscriberInput) ?
                                this.state.dropDownValues.get(subscriberInput).value : ""}
                            style={{
                                display: 'inline-block',
                                margin: 10,
                                marginLeft: 30,
                                width: '50%'
                            }}>{
                            this.getWidgetOutputDropDown(this.state.widgetDropDownMenuMap, subscriberInput)
                        }</SelectField>
                    </div>);
                });
        }
        return pubsubWiringUI;
    }

    handlePublisherDropDown(event, key, payload) {
        let subscriberInput = event.target.parentElement.parentElement.parentElement.getAttribute("subscriberInput");
        let publisherId = event.target.parentElement.parentElement.parentElement.getAttribute("publisherId");
        this.state.dropDownValues.set(subscriberInput, {value: payload, publisherID: publisherId});
        this.persistWiringConfigsInDashboardJSON(this.getSelectedWidget().props.configs.pubsub);
        this.updateWidget();
        this.setState({dropDownValues: this.state.dropDownValues});
    }

    getWidgetOutputDropDown(widgetDropDownMenuMap, subscriberInput) {
        let widgetOutputDropdown = [];
        for (let [key, widgetOutputs] of widgetDropDownMenuMap.entries()) {
            widgetOutputs.map((widgetOutput, index) => {
                widgetOutputDropdown.push(<MenuItem key={key} subscriberInput={subscriberInput}
                                                    publisherId={key} value={widgetOutput}
                                                    primaryText={widgetOutput}/>);
            });
        }
        return widgetOutputDropdown;
    }

    getPublishers() {
        let publishers = [];
        const selectedWidgetConfigs = this.getSelectedWidgetConfiguration().configs;
        if (selectedWidgetConfigs && selectedWidgetConfigs.pubsub &&
            Array.isArray(selectedWidgetConfigs.pubsub.types) &&
            (selectedWidgetConfigs.pubsub.types.indexOf('subscriber') !== -1)) {
            this.getSelectedPagePublisherWidgetsContents().map(pubsubConfig => {
                publishers.push(<Checkbox id={pubsubConfig.props.id}
                                          label={pubsubConfig.title}
                                          labelStyle={labelStyle}
                                          name={pubsubConfig.title}
                                          onCheck={this.handleCheckBox}
                                          checked={this.state.checked.get(pubsubConfig.props.id)}
                                          className="publishers-list"/>)

            });
        }
        return publishers;
    }

    render() {
        if (!this.props.selectedWidgetGoldenLayoutContent) {
            return null;
        }

        const theme = this.props.theme;
        const isOpen = this.state.clickedOnBackdrop ? false : this.props.isOpen;
        this.state.clickedOnBackdrop = false;
        return (
            <span>
                <Paper
                    style={{
                        position: 'fixed',
                        top: theme.appBar.height,
                        width: 300,
                        right: (isOpen ? 0 : -300),
                        height: '100%',
                        paddingBottom: 80,
                        overflowX: 'hidden',
                        overflowY: 'auto',
                        backgroundColor: theme.drawer.color,
                        zIndex: theme.zIndex.drawer,
                    }}
                >
                    <div>
                        <IconButton tooltip="Back" onClick={this.handlePaneClose}>
                            <NavigationArrowForward/>
                        </IconButton>
                        <div style={{display: 'inline-block'}}>
                            {this.getSelectedWidget().name}
                        </div>
                        <div>
                            <Subheader style={stylePanelHeader}
                                       className="options-list-header">Widget Configuration</Subheader>
                                <ListItem
                                    primaryText="Publishers"
                                    initiallyOpen={true}
                                    primaryTogglesNestedList={true}
                                    nestedItems={this.getPublishers()}
                                    nestedListStyle={itemBackgroundStyle}
                                    className="options-list-header"
                                    style={styleListHeader}
                                />
                            {this.getPublisherWiringUI()}
                        </div>
                    </div>
                </Paper>
                {isOpen ? this.renderBackdrop(theme) : null}
            </span>
        );
    }
}

WidgetConfigurationPane.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    selectedWidgetGoldenLayoutContent: PropTypes.shape({}).isRequired,
    selectedPageGoldenLayoutContent: PropTypes.shape({}).isRequired,
    allWidgetsConfigurations: PropTypes.arrayOf({
        name: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired,
        configs: PropTypes.shape({}).isRequired,
    }).isRequired,
    theme: PropTypes.shape({}).isRequired,
    paneCloseEventListener: PropTypes.func.isRequired,
};
