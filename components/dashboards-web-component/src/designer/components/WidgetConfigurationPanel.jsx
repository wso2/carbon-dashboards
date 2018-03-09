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
        console.log("Props",props)
        super(props);
        this.getPublishers = this.getPublishers.bind(this);
        this.getPreferences = this.getPreferences.bind(this);
        this.handlePublisherCheckBoxEvent = this.handlePublisherCheckBoxEvent.bind(this);
        this.handlePreferenceCheckBoxEvent = this.handlePreferenceCheckBoxEvent.bind(this);
        this.handlePreferenceTextBoxEvent = this.handlePreferenceTextBoxEvent.bind(this);
        this.handlePreferenceTextBoxEvent = _.debounce(this.handlePreferenceTextBoxEvent.bind(this), 900);
        this.handlePreferenceSelectListEvent = this.handlePreferenceSelectListEvent.bind(this);
        this.test = this.test.bind(this);
        // let options = dashboardLayout.selectedItem.config.content[0].props.configs.options;
        let options = dashboardLayout.selectedItem;
        console.log("selectedItem", options);

        this.state = {
            checked: false,
            options: null,
            id: null
            // options: dashboardLayout.selectedItem.config.content[0].props.configs.options
        }
    }

    // /**
    //  * This method publishers the queued messages in the widget. The messages are queued when the widget tried to
    //  * publish before initializing the dashboard.
    //  *
    //  */
    // publishQueuedMessages() {
    //     for (let messageId in this.messageQueue) {
    //         this.publishTest(this.messageQueue[messageId])
    //     }
    // }
    //
    // /**
    //  * This method is called by publisher widgetConfPanel to publish messages.
    //  */
    // publishTest(channel,message) {
    //     if (!this.props.glContainer.layoutManager.isInitialised) {
    //         this.messageQueue.push(message)
    //     } else {
    //         this.props.glEventHub.emit(channel, message);
    //     }
    // }


    componentWillReceiveProps(nextProps) {
        console.log("NEXTPROPSWDTCONF:", nextProps)
        this.setState({user: nextProps.user})
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

        let dashboard = this.props.getDashboard()
        let pageId = this.props.getPageId()
        let page = getPage(dashboard, pageId);
        let widgetId = dashboardLayout.selectedItem.config.content[0].props.id;
        let widget = search(page, widgetId);
        let flag = false;
        if (isInputChecked) {
            flag = true;
        }
        else {
            flag = false;
        }
        console.log(event.target.id);

        let optionId = event.target.id;
        let options = widget.props.configs.options;

        for (let i = 0; i < options.length; i++) {
            if (options[i].id === optionId) {
                options[i].defaultData = flag;
                let stateObject = this.state;

                stateObject.options = options;

                this.setState(stateObject);
                console.log("STATE", this.state);
                console.log("THIS", this)
            }
        }

        console.log(options);
        console.log(widget);
        // var id = dashboardLayout.selectedItem.config.content[0].props.id;
        // var WidgetId = dashboardLayout.selectedItem.config.content[0].props.widgetID;
        // this.publishTest(id+WidgetId,"MESSAGE");
        // //  console.log("+++++++++++++++++++++++++++++/////////////////////+++++++++++++++++++");
        // console.log(dashboardLayout);        
        // console.log(dashboardLayout.selectedItem);        
        // console.log(dashboardLayout.selectedItem.config.content[0].props.id);
        // console.log("+++++++++++++++++++++++++++++/////////////////////+++++++++++++++++++");        
        // console.log("================================================");
        // console.log(this.props.getDashboard());
        // console.log("================================================");
        // console.log("HERE");
        // console.log(this.props.getPageId());
        // console.log("page",page);
        // let widget = search(page,dashboardLayout.selectedItem.config.content[0].props.id);
        // console.log("=================WIDGET===============================");
        // console.log(widget);
        // widget.props.configs.options[0].defaultData ="NEW";
        // console.log(widget);
        // console.log("================================================");
        // console.log("+++++++++++++++++++++++++++++ChangedWIDGET+++++++++++++++++++");
        // let widget2 = search(page,dashboardLayout.selectedItem.config.content[0].props.id);
        //  console.log(widget2);
        // console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");

        console.log(this.props.getDashboard())
        // this.props.updateDashboard(this.props.getDashboard());
        this.props.updateDashboardByWidgetConfPanel(dashboard);
        console.log("HERE", this.props.getDashboard())
        // this.props.updatePageContent();

        // console.log(this.props.getDashboard());
        // // notify(widgetId);

    }


    handlePreferenceTextBoxEvent(event, newValue) {
        event.persist();
        console.log("event", event);
        console.log(newValue);
        let optionId = event.target.id;

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

        for (let i = 0; i < options.length; i++) {
            if (options[i].id === optionId) {
                options[i].defaultData = newValue;
                let stateObject = this.state;

                stateObject.options = options;

                this.setState(stateObject);
                console.log("STATE", this.state);
                console.log("THIS", this)
            }
        }


        console.log("options", options);
        console.log("widget", widget);

        // this.props.updateDashboardByWidgetConfPanel(dashboard);
        // console.log(this.props.getDashboard(),dashboard)
        // this.props.updateDashboard(dashboard);
        // console.log(this.props.getDashboard(),dashboard);
        this.props.updateDashboardByWidgetConfPanel(dashboard);
        // console.log("HERE",this.props.getDashboard())
        // this.props.updatePageContent();

    }

    handlePreferenceSelectListEvent(event, key, payload) {
        console.log("event", event);
        console.log(payload);
        let optionId = event.target.parentElement.parentElement.parentElement.id;

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

            // var customEvent = new CustomEvent(
            //     "newMessage",
            //     {
            //         detail: {
            //             message: "Hello World!",
            //             time: new Date(),
            //         },
            //         bubbles: true,
            //         cancelable: true
            //     }
            // );
            //
            // document.getElementById(optionId).dispatchEvent(customEvent);
            // console.log("Event Fired",customEvent);
        }

        // var beforeTest = JSON.stringify(dashboardLayout.selectedItem.)

        let WidgetId = dashboardLayout.selectedItem.config.content[0].props.id;
        let dashboard = this.props.getDashboard();
        let pageId = this.props.getPageId();
        let page = getPage(dashboard, pageId);
        let widget = search(page, WidgetId);

        let options = widget.props.configs.options;
        for (let i = 0; i < options.length; i++) {
            if (options[i].id === optionId) {
                options[i].defaultData = payload;
                let stateObject = this.state;

                stateObject.options = options;

                this.setState(stateObject);
                console.log("STATE", this.state);
                console.log("THIS", key, this)
            }
        }
        console.log(options);
        console.log(widget);

        // console.log(JSON.stringify(dashboard)===JSON.stringify(this.props.getDashboard()))
        this.props.updateDashboardByWidgetConfPanel(dashboard);

        // this.props.updateDashboardByWidgetConfPanel(dashboard);
        // console.log("updated",dashboard);
        // console.log("HERE",this.props.getDashboard())
        // // this.props.changeParentState(dashboard);
        // this.props.updateDashboard(this.props.getDashboard());

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
            return <div>No Options</div>; //TODO:
        }

        console.log(dashboardLayout.selectedItem.config.content[0].props.configs.options);
        let options = dashboardLayout.selectedItem.config.content[0].props.configs.options;

        let newId = dashboardLayout.selectedItem.config.content[0].props.id;
        console.log("dashboardLayout",dashboardLayout)
        console.log("received ID",newId);

        if (this.state.id !== newId) {
            let newState = this.state;
            newState.options =  options;
            // this.state = newState;
            newState.id = newId;
            this.setState(newState);
            console.log("Options", newState.options);
            console.log("Changing ID",newId);
        }

        console.log("Selected Item: ", dashboardLayout.selectedItem);

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
                                                           }}
                                                           name={options[i].title}/>
                        </div>);
                        console.log("TextField", options[i].defaultData);
                        console.log("TextField", dashboardLayout.selectedItem.config.content[0].props.configs.options[i].defaultData)
                        break;
                    case "TypeEnum":
                        let items = [];
                        if (options[i].possibleValues) {
                            for (let j = 0; j < options[i].possibleValues.length; j++) {
                                items.push(<MenuItem key={options[i].possibleValues[j]} id={options[i].id}
                                                     value={options[i].possibleValues[j]}
                                                     primaryText={options[i].possibleValues[j]}/>)
                            }
                            console.log("SelectField", options[i].defaultData)
                            console.log("SelectField", dashboardLayout.selectedItem.config.content[0].props.configs.options[i].defaultData)
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
                        console.log("Checkbox", options[i].defaultData)
                        console.log("Checkbox", dashboardLayout.selectedItem.config.content[0].props.configs.options[i].defaultData)
                        break;
                    default :
                        break;

                }
            }
        }

        return preferences;
    }

    test(){
        if(this.state.options && this.state.options[0].defaultData){
            // return (this.state.options[0].defaultData)
            return (this.state.options.id)

        }
        return "NO OPs"
    }

    render() {
            console.log("RERENDERING")
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
            <div>
                {this.test()}
            </div>
        </Drawer>);
    }

}

export default WidgetConfigurationPanel;
