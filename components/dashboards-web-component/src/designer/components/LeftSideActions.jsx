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

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { List, ListItem, makeSelectable, Paper } from 'material-ui';
import { DeviceWidgets, EditorInsertDriveFile } from 'material-ui/svg-icons';

import PagesSidePane from './PagesSidePane';
import WidgetsSidePane from './WidgetsSidePane';

const SelectableList = makeSelectable(List);

export default class LeftSideActions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isPagesPaneOpen: true,
            isWidgetsPaneOpen: false,
            clickedPaneName: null,
        };
    }

    renderSideActions(theme) {
        const isPagesPaneOpen = this.state.isPagesPaneOpen;
        const isWidgetsPaneOpen = this.state.isWidgetsPaneOpen;
        return (
            <Paper
                zDepth={1}
                style={{
                    position: 'fixed',
                    width: 55,
                    left: 0,
                    top: theme.appBar.height,
                    height: '100%',
                    borderRight: (isPagesPaneOpen || isWidgetsPaneOpen) ? 'solid #5b5b5b 2px' : 'solid #5b5b5b 0',
                    zIndex: theme.zIndex.drawer,
                }}
            >
                <SelectableList value>
                    <ListItem
                        style={{ height: 48 }}
                        value={isPagesPaneOpen}
                        leftIcon={<EditorInsertDriveFile />}
                        title={'Pages'}
                        onClick={() =>
                            this.setState({
                                isPagesPaneOpen: !isPagesPaneOpen,
                                isWidgetsPaneOpen: false,
                                clickedPaneName: 'pages',
                            })
                        }
                    />
                    <ListItem
                        style={{ height: 48 }}
                        value={isWidgetsPaneOpen}
                        leftIcon={<DeviceWidgets />}
                        title={'Widgets'}
                        onClick={() =>
                            this.setState({
                                isWidgetsPaneOpen: !isWidgetsPaneOpen,
                                isPagesPaneOpen: false,
                                clickedPaneName: 'widgets',
                            })
                        }
                    />
                </SelectableList>
            </Paper>
        );
    }

    renderSidePanes(theme) {
        const isPagesPaneOpen = this.state.isPagesPaneOpen;
        const isWidgetsPaneOpen = this.state.isWidgetsPaneOpen;
        const pagesSidePaneProps = {
            theme,
            dashboard: this.props.dashboard,
            updateDashboard: this.props.updateDashboard,
        };
        const widgetsSidePaneProps = {
            theme,
            setWidgetsConfigurations: this.props.setWidgetsConfigurations,
        };

        if (isPagesPaneOpen && !isWidgetsPaneOpen) {
            return (
                <span>
                    <PagesSidePane isOpen {...pagesSidePaneProps} />
                    <WidgetsSidePane isHidden {...widgetsSidePaneProps} />
                </span>
            );
        } else if (!isPagesPaneOpen && isWidgetsPaneOpen) {
            return (
                <span>
                    <PagesSidePane isHidden {...pagesSidePaneProps} />
                    <WidgetsSidePane isOpen {...widgetsSidePaneProps} />
                </span>
            );
        } else if (!isPagesPaneOpen && !isWidgetsPaneOpen) {
            const clickedPaneName = this.state.clickedPaneName;
            if (clickedPaneName === 'pages') {
                return (
                    <span>
                        <PagesSidePane isOpen={false} {...pagesSidePaneProps} />
                        <WidgetsSidePane isHidden {...widgetsSidePaneProps} />
                    </span>
                );
            } else if (clickedPaneName === 'widgets') {
                return (
                    <span>
                        <PagesSidePane isHidden {...pagesSidePaneProps} />
                        <WidgetsSidePane isOpen={false} {...widgetsSidePaneProps} />
                    </span>
                );
            }
        }
        return null;
    }

    render() {
        const theme = this.props.theme;
        return (
            <span>
                {this.renderSidePanes(theme)}
                {this.renderSideActions(theme)}
            </span>
        );
    }
}

LeftSideActions.propTypes = {
    dashboard: PropTypes.shape({}).isRequired,
    theme: PropTypes.shape({}).isRequired,
    updateDashboard: PropTypes.func.isRequired,
    setWidgetsConfigurations: PropTypes.func.isRequired,
};
