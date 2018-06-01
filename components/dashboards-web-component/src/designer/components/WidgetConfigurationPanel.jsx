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

import React from 'react';
import _ from 'lodash';

import DashboardUtils from '../../utils/DashboardUtils';

import Drawer from 'material-ui/Drawer';
import Checkbox from 'material-ui/Checkbox';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import List, {ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Subheader from 'material-ui/Subheader';
import {FormattedMessage} from 'react-intl';
import DropDownMenu from 'material-ui/DropDownMenu';

import {dashboardLayout} from '../../utils/WidgetLoadingComponent';
import {pubsubComponent} from '../../utils/PubSubComponent';

const styles = {
    widgetDrawer: {
        background: '#192830',
        zIndex: 0
    }
};

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

const listStyle = {
    marginLeft: -10,
    paddingLeft: 10,
    marginBottom: 10
};

const dividerStyle = {
    marginLeft: -10,
    marginTop: 10,
    marginBottom: 10
};

/**
 * @deprecated
 */
class WidgetConfigurationPanel extends React.Component {

    constructor(props) {
        super(props);
        this.getPublishers = this.getPublishers.bind(this);
        this.getCurrentWidgetOptionsInputs = this.getCurrentWidgetOptionsInputs.bind(this);
        this.handlePublisherCheckBoxEvent = this.handlePublisherCheckBoxEvent.bind(this);
        this.handleWidgetOptionCheckBoxEvent = this.handleWidgetOptionCheckBoxEvent.bind(this);
        this.handleWidgetOptionTextFieldEvent = this.handleWidgetOptionTextFieldEvent.bind(this);
        this.handleWidgetOptionTextFieldEvent = _.debounce(this.handleWidgetOptionTextFieldEvent.bind(this), 900);
        this.handleWidgetOptionSelectFieldEvent = this.handleWidgetOptionSelectFieldEvent.bind(this);
        this.getWidgetConfPanelContent = this.getWidgetConfPanelContent.bind(this);
        this.handleCheckBox = this.handleCheckBox.bind(this);
        this.handlePublisherDropDown = this.handlePublisherDropDown.bind(this);
        this.getWidgetOutputDropDown = this.getWidgetOutputDropDown.bind(this);
        this.getPubsubWiringUI = this.getPubsubWiringUI.bind(this);
        this.persistWiringConfigsInDashboardJSON = this.persistWiringConfigsInDashboardJSON.bind(this);
        this.unpersistWiringConfigsInDashboardJSON = this.unpersistWiringConfigsInDashboardJSON.bind(this);
        this.state = {
            checked: false,
            options: null,
            id: null,
            open: false,
            widgetDropDownMenuMap: new Map(),
            pubsubWiringUI: null,
            dropDownValues: new Map()
        }
    }

    handlePublisherCheckBoxEvent(event, isInputChecked) {
        let selectedWidget = dashboardLayout.selectedItem;
        if (isInputChecked) {
            pubsubComponent.wire(selectedWidget.config.content[0].props.id, event.currentTarget.id);
            this.persistPubSubWiringInDashboardJSON(dashboardLayout.toConfig().content,
                selectedWidget.config.content[0].props.id,
                event.currentTarget.id);
            this.setState({checked: true});
        } else {
            if (pubsubComponent.unwire(selectedWidget.config.content[0].props.id, event.currentTarget.id)) {
                this.unpersistPubSubWiringInDashboardJSON(dashboardLayout.toConfig().content,
                    selectedWidget.config.content[0].props.id, event.currentTarget.id);
                this.setState({checked: false});
            }
        }
    }

    handleCheckBox(event, isChecked) {
        let publisherWidgetId = event.currentTarget.id;
        let widgetKey = event.currentTarget.name;
        let selectedWidget = dashboardLayout.selectedItem;
        let widgetDropDownMenuMap = this.state.widgetDropDownMenuMap;
        if (isChecked) {
            !widgetDropDownMenuMap.get(publisherWidgetId) ? widgetDropDownMenuMap.set(publisherWidgetId,
                pubsubComponent.getPublishersMap().get(widgetKey).widgetOutputs) : "";
            pubsubComponent.wire(selectedWidget.config.content[0].props.id + "_" + publisherWidgetId, publisherWidgetId);
            this.persistPubSubWiringInDashboardJSON(dashboardLayout.toConfig().content,
                selectedWidget.config.content[0].props.id,
                publisherWidgetId);
        } else {
            if (pubsubComponent.unwire(selectedWidget.config.content[0].props.id + "_" + publisherWidgetId,
                    publisherWidgetId)) {
                widgetDropDownMenuMap.delete(publisherWidgetId);
                this.unpersistPubSubWiringInDashboardJSON(dashboardLayout.toConfig().content,
                    selectedWidget.config.content[0].props.id, publisherWidgetId);
                this.setState({checked: false});
            }
        }

        this.setState({widgetDropDownMenuMap: widgetDropDownMenuMap, checked: isChecked});
    }

    getPubsubWiringUI() {
        if (this.state.widgetDropDownMenuMap.size !== 0) {
            let pubsubWiringUI =
                dashboardLayout.selectedItem.config.content[0].props.configs.pubsub.subscriberWidgetInputs.
                map((subscriberInput, index) => {
                    return <div>
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
                            this.getWidgetOutputDropDown(this.state.widgetDropDownMenuMap, subscriberInput)}
                        </SelectField>
                    </div>
                });
            return pubsubWiringUI;
        }
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

    handlePublisherDropDown(event, key, payload) {
        let subscriberInput = event.target.parentElement.parentElement.parentElement.getAttribute("subscriberInput");
        let publisherId = event.target.parentElement.parentElement.parentElement.getAttribute("publisherId");
        let subscriberID = dashboardLayout.selectedItem.config.content[0].props.id;
        this.state.dropDownValues.set(subscriberInput, {value: payload, publisherID: publisherId});
        this.setState({dropDownValues: this.state.dropDownValues},
            this.persistPubSubWiringInDashboardJSON(dashboardLayout.toConfig().content, subscriberID, publisherId));
    }

    handleWidgetOptionCheckBoxEvent(event, isInputChecked, options) {
        let optionId = event.target.id;
        let that = this;
        _.each(options, function (option) {
            if (option.id === optionId) {
                option.defaultData = isInputChecked;
                let stateObject = that.state;
                stateObject.options = options;
                that.setState(stateObject);
            }
        });
        this.props.updateDashboardByWidgetConfPanel(this.props.getDashboard());
    }

    handleWidgetOptionTextFieldEvent(event, newValue, options) {
        let optionId = event.target.id;
        let that = this;
        _.each(options, function (option) {
            if (option.id === optionId) {
                option.defaultData = newValue;
                let stateObject = that.state;
                stateObject.options = options;
                that.setState(stateObject);
            }
        });
        this.props.updateDashboardByWidgetConfPanel(this.props.getDashboard());
    }

    handleWidgetOptionSelectFieldEvent(event, key, payload, options) {
        let optionId = event.target.parentElement.parentElement.parentElement.id;
        let that = this;
        _.each(options, function (option) {
            if (option.id === optionId) {
                option.defaultData = payload;
                let stateObject = that.state;
                stateObject.options = options;
                that.setState(stateObject);
            }
        });
        this.props.updateDashboardByWidgetConfPanel(this.props.getDashboard());
    }

    persistPubSubWiringInDashboardJSON(content, subscriberId, publisherId) {
        content.forEach(contentItem => {
            if (contentItem.type !== 'component') {
                this.persistPubSubWiringInDashboardJSON(contentItem.content, subscriberId, publisherId)
            } else {
                if (subscriberId === contentItem.props.id) {
                    if (!contentItem.props.configs.pubsub.publishers) {
                        contentItem.props.configs.pubsub.publishers = [];
                    }
                    this.persistWiringConfigsInDashboardJSON(contentItem.props.configs.pubsub);
                    contentItem.props.configs.pubsub.publishers.push(publisherId.toString())
                }
            }
        });
    }

    unpersistPubSubWiringInDashboardJSON(content, subscriberId, publisherId) {
        content.forEach(contentItem => {
            if (contentItem.type !== 'component') {
                this.unpersistPubSubWiringInDashboardJSON(contentItem.content, subscriberId, publisherId)
            } else {
                if (subscriberId === contentItem.props.id) {
                    let position = contentItem.props.configs.pubsub.publishers.indexOf(publisherId);
                    this.unpersistWiringConfigsInDashboardJSON(contentItem.props.configs.pubsub, publisherId);
                    contentItem.props.configs.pubsub.publishers.splice(position, 1);
                }
            }
        });
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

    }

    unpersistWiringConfigsInDashboardJSON(pubsubConfigs, publisherID) {
        pubsubConfigs.widgetInputOutputMapping = pubsubConfigs.widgetInputOutputMapping.
        filter(widgetInputOutputMapping => {
            return widgetInputOutputMapping.publisherWidgetOutput !== publisherID;
        });
        return pubsubConfigs.widgetInputOutputMapping;
    }

    getPublishers() {
        let publishers = [];
        if (dashboardLayout.selectedItem &&
            dashboardLayout.selectedItem.config.content[0].props.configs.pubsub.types.indexOf("subscriber") !== -1) {
            for (let [key, val] of pubsubComponent.getPublishersMap().entries()) {
                this.state.checked = !!(dashboardLayout.selectedItem.config.content[0].props.configs.pubsub.publishers
                    && dashboardLayout.selectedItem.config.content[0].props.configs.pubsub.publishers.indexOf(val.id) !== -1);
                publishers.push(<Checkbox id={val.id}
                                          label={key.substring(0, key.length - 4)}
                                          labelStyle={labelStyle}
                                          name={key}
                                          onCheck={this.handleCheckBox}
                                          checked={this.state.checked}
                                          className="publishers-list"/>)
            }
        }
        return publishers;
    }

    getCurrentWidgetOptionsInputs() {
        let CurrentWidgetOptionsInputs = [];
        if (!(dashboardLayout.selectedItem && dashboardLayout.selectedItem.config.content[0].props.configs)) {
            return <div>No Configurable Options</div>;
        }
        let widgetId = dashboardLayout.selectedItem.config.content[0].props.id;
        let dashboard = this.props.getDashboard();
        let pageId = this.props.getPageId();
        let page = DashboardUtils.getPage(dashboard, pageId);
        let widget = DashboardUtils.searchForWidget(page, widgetId);
        let options = widget.props.configs.options;

        if (this.state.id !== widgetId) {
            let newState = this.state;
            newState.options = options;
            newState.id = widgetId;
            this.setState(newState);
        }

        if (options) {
            for (let i = 0; i < options.length; i++) {
                switch (options[i].type) {
                    case "TEXT":
                        CurrentWidgetOptionsInputs.push(
                            <div className="options-list">
                                <TextField id={options[i].id}
                                           floatingLabelText={options[i].title}
                                           defaultValue={this.state.options[i].defaultData}
                                           onChange={(event, newValue) => {
                                               event.persist();
                                               this.handleWidgetOptionTextFieldEvent(event, newValue, options)
                                               this.props.setWidgetConfigPanelDirty(true);
                                           }}
                                           name={options[i].title}/>
                            </div>);
                        break;
                    case "ENUM":
                        let items = [];
                        if (options[i].possibleValues) {
                            for (let j = 0; j < options[i].possibleValues.length; j++) {
                                items.push(
                                    <MenuItem
                                        key={options[i].possibleValues[j]} id={options[i].id}
                                        value={options[i].possibleValues[j]}
                                        primaryText={options[i].possibleValues[j]}
                                    />)
                            }
                        }
                        CurrentWidgetOptionsInputs.push(
                            <div className="options-list">
                                <SelectField
                                    floatingLabelText={options[i].title}
                                    onChange={(event, key, payload,) => {
                                        this.handleWidgetOptionSelectFieldEvent(event, key, payload, options),
                                            this.props.setWidgetConfigPanelDirty(true);
                                    }}
                                    value={this.state.options[i].defaultData}
                                    id={options[i].id}
                                    className="options-list">
                                    {items}
                                </SelectField>
                            </div>);
                        break;
                    case "BOOLEAN":
                        CurrentWidgetOptionsInputs.push(
                            <div className="options-list">
                                <Checkbox
                                    id={options[i].id}
                                    label={options[i].title}
                                    labelStyle={labelStyle}
                                    onCheck={(event, isInputChecked) => {
                                        this.handleWidgetOptionCheckBoxEvent(event, isInputChecked, options),
                                            this.props.setWidgetConfigPanelDirty(true);
                                    }}
                                    checked={this.state.options[i].defaultData}
                                    className="options-list"
                                />
                            </div>);
                        break;
                    default :
                        break;
                }
            }
        }

        return CurrentWidgetOptionsInputs;
    }

    getWidgetConfPanelContent() {
        return (<div>
            <List style={listStyle}>
                <Subheader style={stylePanelHeader} className="options-list-header">Widget Configuration</Subheader>
                <ListItem
                    primaryText="Publishers"
                    initiallyOpen={true}
                    primaryTogglesNestedList={true}
                    nestedItems={this.getPublishers()}
                    nestedListStyle={itemBackgroundStyle}
                    className="options-list-header"
                    style={styleListHeader}
                />
                {this.getPubsubWiringUI()}
                <Divider style={dividerStyle} inset={false}/>
                <ListItem
                    primaryText="Options"
                    initiallyOpen={true}
                    primaryTogglesNestedList={true}
                    nestedItems={this.getCurrentWidgetOptionsInputs()}
                    nestedListStyle={itemBackgroundStyle}
                    className="options-list-header"
                    style={styleListHeader}
                />
            </List>
        </div>);
    }

    WidgetConfDirtyNotifier() {
        const actions = [
            <FlatButton
                label="No"
                primary={true}
                onClick={() => {
                    this.props.handleDialogCloseWithNo()
                }}
            />,
            <FlatButton
                label="Yes"
                primary={true}
                onClick={() => {
                    this.props.handleDialogCloseWithYes()
                }}
            />,
        ];

        return (
            <Dialog
                title="You have unsaved Changes in Widget Configuration Panel"
                actions={actions}
                modal={true}
                open={this.props.isWidgetConfigPanelDirtyNotificationOpen}
            >
                <div>
                    <FormattedMessage
                        id="Widget.Configuration.panel.dirty.message"
                        defaultMessage="Do you want to save the changes ?"/>
                </div>
            </Dialog>
        );
    }

    render() {
        return (<Drawer open={this.props.open} openSecondary={true}
                        containerStyle={styles.widgetDrawer}
                        containerClassName="widget-configuration-panel">
            {this.getWidgetConfPanelContent(this.state.checked)}
            {this.WidgetConfDirtyNotifier()}
        </Drawer>);
    }
}

export default WidgetConfigurationPanel;

