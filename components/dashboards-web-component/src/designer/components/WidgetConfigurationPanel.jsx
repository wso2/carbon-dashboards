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

import Drawer from 'material-ui/Drawer';
import Checkbox from 'material-ui/Checkbox';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import {dashboardLayout} from '../../utils/WidgetLoadingComponent';
import {pubsubComponent} from '../../utils/PubSubComponent';

// import notify from '../../utils/DashboardOptionListener';

// import {FormattedMessage} from 'react-intl';


const styles = {
    widgetDrawer: {
        background: '#192830',
        zIndex: 0
    }
};

class WidgetConfigurationPanel extends React.Component {

    constructor(props) {
        super(props);
        this.getPublishers = this.getPublishers.bind(this);
        this.getPreferences = this.getPreferences.bind(this);
        this.handlePublisherCheckBoxEvent = this.handlePublisherCheckBoxEvent.bind(this);
        this.handlePreferenceCheckBoxEvent = this.handlePreferenceCheckBoxEvent.bind(this);
        this.handlePreferenceTextBoxEvent = this.handlePreferenceTextBoxEvent.bind(this);
        this.handlePreferenceTextBoxEvent = _.debounce(this.handlePreferenceTextBoxEvent.bind(this), 900);
        this.handlePreferenceSelectListEvent = this.handlePreferenceSelectListEvent.bind(this);

        this.state = {
            checked: false,
            options: null,
            id: null
        }
    }

    handlePublisherCheckBoxEvent(event, isInputChecked) {
        let selectedWidget = dashboardLayout.selectedItem;
        if (isInputChecked) {
            pubsubComponent.wire(selectedWidget.config.content[0].props.id, event.currentTarget.id);
            this.persistPubSubWiringInDashboardJSON(dashboardLayout.toConfig().content, selectedWidget.config.content[0].props.id,
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

    handlePreferenceCheckBoxEvent(event, isInputChecked) {
        /**
         * helper function to get the page from a given dashboard given the pageId
         * */
        function getPage(dashboard, pageID) {
            let pages = dashboard.pages;
            if (pages) {
                for (let i = 0; i < pages.length; i++) {
                    let page = pages[i];
                    if (page.id === pageID) {
                        return page;
                    }
                }
            }
            return null;
        }

        /**
         * helper function to get the widget from a given page given the widgetId
         * */
        function search(page, id) {
            let obj = page;
            if (obj.type && obj.type === "component" && obj.props && obj.props.id && obj.props.id === id) {
                return obj;
            }
            else if (obj.content) {
                let x = null;
                for (let i = 0; i < obj.content.length; i++) {
                    x = x || search(obj.content[i], id);
                }
                return x;
            }
        }

        let dashboard = this.props.getDashboard()
        let pageId = this.props.getPageId()
        let page = getPage(dashboard, pageId);
        let widgetId = dashboardLayout.selectedItem.config.content[0].props.id;
        let widget = search(page, widgetId);

        let optionId = event.target.id;
        let options = widget.props.configs.options;

        for (let i = 0; i < options.length; i++) {
            if (options[i].id === optionId) {
                options[i].defaultData = isInputChecked;
                let stateObject = this.state;
                stateObject.options = options;
                this.setState(stateObject);
            }
        }
        this.props.updateDashboardByWidgetConfPanel(dashboard);
    }


    handlePreferenceTextBoxEvent(event, newValue) {
        event.persist();

        /**
         * helper function to get the page from a given dashboard given the pageId
         * */
        function getPage(dashboard, pageID) {
            let pages = dashboard.pages;
            if (pages) {
                for (let i = 0; i < pages.length; i++) {
                    let page = pages[i];
                    if (page.id === pageID) {
                        return page;
                    }
                }
            }
            return null;
        }

        /**
         * helper function to get the widget from a given page given the widgetId
         * */
        function search(page, id) {
            let obj = page;
            if (obj.type && obj.type === "component" && obj.props && obj.props.id && obj.props.id === id) {
                console.log(obj.props.id);
                return obj;
            }
            else if (obj.content) {
                let x = null;
                for (let i = 0; i < obj.content.length; i++) {
                    x = x || search(obj.content[i], id);
                }
                return x;
            }
        }

        var WidgetId = dashboardLayout.selectedItem.config.content[0].props.id;
        let dashboard = this.props.getDashboard();
        let pageId = this.props.getPageId();
        let page = getPage(dashboard, pageId);
        let widget = search(page, WidgetId);

        let options = widget.props.configs.options;
        let optionId = event.target.id;

        for (let i = 0; i < options.length; i++) {
            if (options[i].id === optionId) {
                options[i].defaultData = newValue;
                let stateObject = this.state;
                stateObject.options = options;
                this.setState(stateObject);
            }
        }
        this.props.updateDashboardByWidgetConfPanel(dashboard);
    }

    handlePreferenceSelectListEvent(event, key, payload) {

        /**
         * helper function to get the page from a given dashboard given the pageId
         * */
        function getPage(dashboard, pageID) {
            let pages = dashboard.pages;
            if (pages) {
                for (let i = 0; i < pages.length; i++) {
                    let page = pages[i];
                    if (page.id === pageID) {
                        return page;
                    }
                }
            }
            return null;
        }

        /**
         * helper function to get the widget from a given page given the widgetId
         * */
        function search(page, id) {
            let obj = page;
            if (obj.type && obj.type === "component" && obj.props && obj.props.id && obj.props.id === id) {
                console.log(obj.props.id);
                return obj;
            }
            else if (obj.content) {
                let x = null;
                for (let i = 0; i < obj.content.length; i++) {
                    x = x || search(obj.content[i], id);
                }
                return x;
            }
        }

        let WidgetId = dashboardLayout.selectedItem.config.content[0].props.id;
        let dashboard = this.props.getDashboard();
        let pageId = this.props.getPageId();
        let page = getPage(dashboard, pageId);
        let widget = search(page, WidgetId);

        let options = widget.props.configs.options;
        let optionId = event.target.parentElement.parentElement.parentElement.id;

        for (let i = 0; i < options.length; i++) {
            if (options[i].id === optionId) {
                options[i].defaultData = payload;
                let stateObject = this.state;
                stateObject.options = options;
                this.setState(stateObject);
                }
        }
        this.props.updateDashboardByWidgetConfPanel(dashboard);
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
                    contentItem.props.configs.pubsub.publishers.splice(position, 1);
                }
            }
        });
    }

    getPublishers() {
        let publishers = [];
        if (dashboardLayout.selectedItem &&
            dashboardLayout.selectedItem.config.content[0].props.configs.pubsub.types.indexOf("subscriber") !== -1) {
            for (let [key, val] of pubsubComponent.getPublishersMap().entries()) {
                this.state.checked = !!(dashboardLayout.selectedItem.config.content[0].props.configs.pubsub.publishers &&
                    dashboardLayout.selectedItem.config.content[0].props.configs.pubsub.publishers.indexOf(val) !== -1);
                publishers.push(<Checkbox id={val}
                                          label={key.substring(0, key.length - 4)}
                                          name={key}
                                          onCheck={this.handlePublisherCheckBoxEvent}
                                          checked={this.state.checked}
                                          className="publishers-list"/>)
            }
        }
        return publishers;
    }


    getPreferences() {
        let preferences = [];
        if (!(dashboardLayout.selectedItem && dashboardLayout.selectedItem.config.content[0].props.configs)) {
            return <div>No Configurable Options</div>;
        }

        let options = dashboardLayout.selectedItem.config.content[0].props.configs.options;
        let newId = dashboardLayout.selectedItem.config.content[0].props.id;

        if (this.state.id !== newId) {
            let newState = this.state;
            newState.options =  options;
            newState.id = newId;
            this.setState(newState);
        }

        if (options) {
            for (let i = 0; i < options.length; i++) {
                switch (options[i].type) {
                    case "TypeText":
                        preferences.push(<div>
                            {options[i].title} :<TextField id={options[i].id}
                                                           defaultValue={this.state.options[i].defaultData}
                                                           onChange={(event, newValue) => {
                                                               event.persist();
                                                               this.handlePreferenceTextBoxEvent(event, newValue)
                                                           }    }
                                                           name={options[i].title}/>
                        </div>);
                        break;
                    case "TypeEnum":
                        let items = [];
                        if (options[i].possibleValues) {
                            for (let j = 0; j < options[i].possibleValues.length; j++) {
                                items.push(<MenuItem key={options[i].possibleValues[j]} id={options[i].id}
                                                     value={options[i].possibleValues[j]}
                                                     primaryText={options[i].possibleValues[j]}/>)
                                }
                            }
                        preferences.push(<div>
                            {options[i].title} : <SelectField
                            onChange={this.handlePreferenceSelectListEvent}
                            value={this.state.options[i].defaultData}
                            id={options[i].id}>
                            {items}
                        </SelectField>
                        </div>);
                        break;
                    case "TypeBoolean":
                        preferences.push(<div>
                            <Checkbox id={options[i].id}
                                      label={options[i].title}
                                      onCheck={this.handlePreferenceCheckBoxEvent}
                                      checked={this.state.options[i].defaultData}/>
                        </div>);
                        break;
                    default :
                        break;
                }
            }
        }

        return preferences;
    }

    render() {
        return (<Drawer open={this.props.open} openSecondary={true}
                        containerStyle={styles.widgetDrawer}
                        containerClassName="widget-configuration-panel">
            {/*<div className="widget-configuration-panel-header"><FormattedMessage id="widget.configuration" defaultMessage="Widget Configuration"/></div>*/}
            {/*<div><FormattedMessage id="publisher.list.heading" defaultMessage="PublishersList"/></div>*/}
            <div>
                <h1>Widget Configuration</h1>
                <h2>Options</h2>
                {this.getPreferences()}
            </div>

        </Drawer>);
    }
}

export default WidgetConfigurationPanel;
