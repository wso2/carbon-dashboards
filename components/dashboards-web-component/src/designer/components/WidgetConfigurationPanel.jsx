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

import Drawer from 'material-ui/Drawer';
import Checkbox from 'material-ui/Checkbox';

import {dashboardLayout} from '../../utils/WidgetLoadingComponent';
import {pubsubComponent} from '../../utils/PubSubComponent';

class WidgetConfigurationPanel extends React.Component {

    constructor(props) {
        super(props);
        this.getPublishers = this.getPublishers.bind(this);
        this.onCheck = this.onCheck.bind(this);
        this.state = {
            checked: false
        }
    }

    onCheck(event, isInputChecked) {
        let selectedWidget = dashboardLayout.selectedItem;
        if (isInputChecked) {
            pubsubComponent.wire(selectedWidget.config.content[0].props.id, event.currentTarget.id);
            this.wirePubSubInDashboardJSON(dashboardLayout.toConfig().content, selectedWidget.config.content[0].props.id,
                event.currentTarget.id);
            this.setState({checked: true});
        } else {
            if (pubsubComponent.unwire(selectedWidget.config.content[0].props.id, event.currentTarget.id)) {
                this.unWirePubSubInDashboardJSON(dashboardLayout.toConfig().content,
                    selectedWidget.config.content[0].props.id, event.currentTarget.id);
                this.setState({checked: false});
            }
        }
    }

    wirePubSubInDashboardJSON(content, subscriberId, publisherId) {
        content.forEach(contentItem => {
            if (!(contentItem.type === 'component')) {
                this.wirePubSubInDashboardJSON(contentItem.content, subscriberId, publisherId)
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

    unWirePubSubInDashboardJSON(content, subscriberId, publisherId) {
        content.forEach(contentItem => {
            if (!(contentItem.type === 'component')) {
                this.unWirePubSubInDashboardJSON(contentItem.content, subscriberId, publisherId)
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
                                          onCheck={this.onCheck}
                                          checked={this.state.checked}
                                          className="publishers-list"/>)
            }
        }
        return publishers;
    }

    render() {
        return <Drawer open={this.props.open} openSecondary={true}
                       containerClassName="widget-configuration-panel">
            <div className="widget-configuration-panel-header">Widget Configuration</div>
            <div>Publishers</div>
            {this.getPublishers()}
        </Drawer>;
    }

}
export default WidgetConfigurationPanel;