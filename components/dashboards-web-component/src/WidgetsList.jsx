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
import TextField from 'material-ui/TextField';
import Divider from 'material-ui/Divider';

import WidgetListThumbnail from './WidgetListThumbnail';

class WidgetsList extends React.Component {
    constructor(props) {
        super(props);
        this.searchWidget = this.searchWidget.bind(this);
        this.state = {
            widgetList: this.props.widgetList,
            filteredWidgetSet: new Set(this.props.widgetList)
        };
        this.isDisplayed = this.isDisplayed.bind(this);

    }

    searchWidget(event, value) {
        let filteredWidgetList = this.props.widgetList.filter(function (widget) {
            return widget.name.toLowerCase().includes(value.toLowerCase());
        });
        this.state.filteredWidgetSet = new Set(filteredWidgetList.map((widget) => {
            return widget.name
        }));
        this.setState({widgetList: filteredWidgetList});
    }

    componentWillReceiveProps(props) {
        this.state = {
            widgetList: this.props.widgetList,
            filteredWidgetSet: new Set(props.widgetList.map((widget) => {
                return widget.name
            }))
        }
    }

    isDisplayed(widgetId) {
        if (this.state.filteredWidgetSet.has(widgetId)) {
            return "block";
        } else {
            return "none";
        }
    }

    render() {
        return (<div>
            <Drawer width={250} open={this.props.widgetListToggled} containerClassName="designer-widget-list-panel">
                <div className="widget-list-header">WIDGETS LIST</div>
                <div className="widget-search-div">
                    <TextField onChange={this.searchWidget} hintText="Search.."
                               className="widget-search-textfield"></TextField>
                </div>
                <Divider/>
                {
                    this.props.widgetList.map(widget => {
                        return <WidgetListThumbnail data={this.state.widgetList} widgetID={widget.name}
                                                    isDisplayed={this.isDisplayed(widget.name)}
                                                    widgetName={widget.name}></WidgetListThumbnail>;
                    })
                }
            </Drawer>
        </div>);
    }


}

export default WidgetsList;