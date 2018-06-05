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
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { IconButton, Paper } from 'material-ui';
import { NavigationArrowForward } from 'material-ui/svg-icons';

import { Event } from '../../utils/Constants';
import WidgetPubSubConfiguration from './WidgetPubSubConfiguration';
import WidgetOptionsConfiguration from './WidgetOptionsConfiguration';

const styles = {
    header: {
        paddingTop: 12,
        paddingBottom: 12,
        paddingLeft: 0,
        paddingRight: 5,
        display: 'inline-block',
        lineHeight: '24px',
        fontSize: 18,
        opacity: 0.8,
    },
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
        };

        this.getSelectedWidget = this.getSelectedWidget.bind(this);
        this.getSelectedWidgetConfiguration = this.getSelectedWidgetConfiguration.bind(this);
        this.triggerEvent = this.triggerEvent.bind(this);
        this.handlePaneClose = this.handlePaneClose.bind(this);
        this.updateWidget = this.updateWidget.bind(this);
    }

    getSelectedWidget() {
        const widgetContent = this.props.selectedWidgetGoldenLayoutContent.config;
        return {
            id: widgetContent.props.widgetID || widgetContent.component,
            name: widgetContent.title,
            className: widgetContent.component,
            props: widgetContent.props,
        };
    }

    getSelectedWidgetConfiguration(selectedWidget) {
        return this.props.allWidgetsConfigurations.find((widgetConfiguration) => {
            return (widgetConfiguration.id === selectedWidget.id);
        });
    }

    triggerEvent(eventName, parameter) {
        this.props.selectedWidgetGoldenLayoutContent.layoutManager.eventHub.trigger(eventName, parameter);
    }

    handlePaneClose() {
        this.setState({ clickedOnBackdrop: true });
        this.updateWidget();
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

    renderHeader(selectedWidget) {
        return (
            <div style={{ display: 'flex' }}>
                <IconButton tooltip="Save and close" onClick={this.handlePaneClose}>
                    <NavigationArrowForward />
                </IconButton>
                <div style={styles.header}>
                    <FormattedMessage
                        id='widget-configuration.title'
                        defaultMessage='{name} Configurations'
                        values={{ name: selectedWidget.name }}
                    />
                </div>
            </div>
        );
    }

    render() {
        if (!this.props.selectedWidgetGoldenLayoutContent) {
            return null;
        }

        const theme = this.props.theme;
        const isOpen = this.state.clickedOnBackdrop ? false : this.props.isOpen;
        this.state.clickedOnBackdrop = false;
        const selectedWidget = this.getSelectedWidget();
        const selectedWidgetConfiguration = this.getSelectedWidgetConfiguration(selectedWidget);
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
                        {this.renderHeader(selectedWidget)}
                        <WidgetPubSubConfiguration
                            selectedWidget={selectedWidget}
                            selectedWidgetConfiguration={selectedWidgetConfiguration}
                            selectedPageGoldenLayoutContent={this.props.selectedPageGoldenLayoutContent}
                            allWidgetsConfigurations={this.props.allWidgetsConfigurations}
                        />
                        <WidgetOptionsConfiguration
                            selectedWidget={selectedWidget}
                            selectedWidgetConfiguration={selectedWidgetConfiguration}
                        />
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
