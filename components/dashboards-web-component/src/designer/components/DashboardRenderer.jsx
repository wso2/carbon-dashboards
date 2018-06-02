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
import { Paper } from 'material-ui';
import PropTypes from 'prop-types';
import _ from 'lodash';
import GoldenLayout from 'golden-layout';
import 'golden-layout/src/css/goldenlayout-base.css';
import GoldenLayoutContentUtils from '../../utils/GoldenLayoutContentUtils';
import WidgetRenderer from '../../common/WidgetRenderer';

import '../../common/styles/custom-goldenlayout-dark-theme.css';
import glDarkTheme from '!!css-loader!../../common/styles/custom-goldenlayout-dark-theme.css';
import './dashboard-container-styles.css';

import WidgetConfigurationPane from './WidgetConfigurationPane';
import DashboardUtils from '../../utils/DashboardUtils';
import { Event } from '../../utils/Constants';

const glDarkThemeCss = glDarkTheme.toString();
const dashboardContainerId = 'dashboard-design-container';
const styles = {
    message: {
        width: '100%',
        height: '100%',
        textAlign: 'center',
        fontSize: 20,
        paddingTop: '10%',
        backgroundColor: 'transparent',
    },
};
const blockDropOnStack = function (stack) {
    // From: https://github.com/golden-layout/golden-layout/issues/228#issuecomment-330948156
    stack._$highlightDropZone = function (x, y) {
        let segment, area;
        for (segment in this._contentAreaDimensions) {
            area = this._contentAreaDimensions[segment].hoverArea;
            if (area.x1 < x && area.x2 > x && area.y1 < y && area.y2 > y) {
                if (segment !== 'header') {
                    this._resetHeaderDropZone();
                    this._highlightBodyDropZone(segment);
                }
                return;
            }
        }
    };
};

export default class DashboardRenderer extends Component {
    constructor(props) {
        super(props);
        this.goldenLayout = null;
        this.selectedWidgetGoldenLayoutContent = null;
        this.state = {
            isWidgetConfigurationPaneOpen: false,
        };

        this.onGoldenLayoutInitializedEvent = this.onGoldenLayoutInitializedEvent.bind(this);
        this.onGoldenLayoutComponentAddEvent = this.onGoldenLayoutComponentAddEvent.bind(this);
        this.hideWidgetConfigurationPane = this.hideWidgetConfigurationPane.bind(this);
        this.onWidgetConfigurationPaneClose = this.onWidgetConfigurationPaneClose.bind(this);
        this.getRenderingPage = this.getRenderingPage.bind(this);
        this.highlightSelectedWidgetContainer = this.highlightSelectedWidgetContainer.bind(this);
        this.unhighlightSelectedWidgetContainer = this.unhighlightSelectedWidgetContainer.bind(this);
        this.cleanDashboardJSON = this.cleanDashboardJSON.bind(this);
        this.destroyGoldenLayout = this.destroyGoldenLayout.bind(this);
        this.handleWindowResize = this.handleWindowResize.bind(this);
        this.updateDashboard = this.updateDashboard.bind(this);
        this.renderGoldenLayout = this.renderGoldenLayout.bind(this);
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleWindowResize);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.pageId !== nextProps.pageId) {
            // Receiving a new page to render.
            this.destroyGoldenLayout();
            return true;
        } else if (this.state !== nextState) {
            return true;
        }
        return false;
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowResize);
        this.destroyGoldenLayout();
    }

    onGoldenLayoutInitializedEvent() {
        this.props.widgetsConfigurations.forEach((widget) => {
            const dragSourceElement = document.getElementById(widget.id);
            const itemConfig = {
                title: widget.name,
                type: 'react-component',
                component: widget.configs.isGenerated ? 'UniversalWidget' : widget.id,
                props: { id: DashboardUtils.generateguid(), configs: widget.configs, widgetID: widget.id },
                isClosable: false,
                reorderEnabled: true,
                header: { show: true },
            };
            this.goldenLayout.createDragSource(dragSourceElement, itemConfig);
            try {
                this.goldenLayout.registerComponent(itemConfig.component, WidgetRenderer);
            } catch (e) {
                // Seems like this widget is already registered, hence ignoring.
            }
        });
    }

    onGoldenLayoutComponentAddEvent(component) {
        if (!component.parent || !component.parent.header) {
            return;
        }

        const settingsButton = document.createElement('i');
        settingsButton.title = 'settings';
        settingsButton.className = 'fw fw-configarations widget-configuration-button';
        settingsButton.addEventListener('click', () => {
            this.unhighlightSelectedWidgetContainer();
            this.selectedWidgetGoldenLayoutContent = component;
            this.highlightSelectedWidgetContainer();
            this.setState({ isWidgetConfigurationPaneOpen: true });
        });
        component.parent.header.controlsContainer.prepend(settingsButton);
    }

    onWidgetConfigurationPaneClose() {
        this.unhighlightSelectedWidgetContainer();
        this.updateDashboard();
    }

    getRenderingPage() {
        return this.props.dashboard.pages.find(page => (page.id === this.props.pageId));
    }

    hideWidgetConfigurationPane() {
        this.unhighlightSelectedWidgetContainer();
        this.setState({ isWidgetConfigurationPaneOpen: false });
    }

    highlightSelectedWidgetContainer() {
        const content = this.selectedWidgetGoldenLayoutContent;
        if (content) {
            const zIndex = this.props.theme.zIndex.drawerOverlay + 10;
            content.parent.header.element.css('z-index', zIndex);
            content.container._contentElement.css('z-index', zIndex);
        }
    }

    unhighlightSelectedWidgetContainer() {
        const content = this.selectedWidgetGoldenLayoutContent;
        if (content) {
            content.parent.header.element.css('z-index', 1);
            content.container._contentElement.css('z-index', 'auto');
            this.selectedWidgetGoldenLayoutContent = null;
            this.state.isWidgetConfigurationPaneOpen = false;
        }
    }

    cleanDashboardJSON(content) {
        if (!Array.isArray(content)) {
            delete content.reorderEnabled;
            delete content.componentState;
            if (content.content) {
                delete content.activeItemIndex;
                delete content.componentName;
                delete content.header;
                this.cleanDashboardJSON(content.content);
            }
        } else {
            content.forEach((item) => {
                this.cleanDashboardJSON(item);
            });
        }
        return content;
    }

    destroyGoldenLayout() {
        if (this.goldenLayout) {
            this.goldenLayout.destroy();
            delete this.goldenLayout;
        }
        this.goldenLayout = null;
    }

    handleWindowResize() {
        if (this.goldenLayout) {
            this.goldenLayout.updateSize();
        }
    }

    updateDashboard() {
        const updatingPage = this.getRenderingPage();
        const newPageContent = this.cleanDashboardJSON(this.goldenLayout.toConfig().content);
        if (!_.isEqual(updatingPage.content, newPageContent)) {
            updatingPage.content = newPageContent;
            this.props.updateDashboard();
        }
    }

    renderGoldenLayout() {
        // This is necessary as this method is called via a ref in render(). Also we cannot pass arguments to here.
        if (this.goldenLayout) {
            return;
        }

        const goldenLayoutContents = this.getRenderingPage().content || [];
        const config = {
            settings: {
                constrainDragToContainer: false,
                reorderEnabled: false,
                selectionEnabled: false,
                popoutWholeStack: false,
                blockedPopoutsThrowError: true,
                closePopoutsOnUnload: true,
                responsiveMode: 'always',
                hasHeaders: true,
                showPopoutIcon: false,
                showMaximiseIcon: false,
                showCloseIcon: true,
            },
            dimensions: {
                headerHeight: 37,
            },
            content: goldenLayoutContents,
        };
        const dashboardContainer = document.getElementById(dashboardContainerId);
        const goldenLayout = new GoldenLayout(config, dashboardContainer);
        const renderingWidgetClassNames = GoldenLayoutContentUtils.getReferredWidgetClassNames(goldenLayoutContents);
        renderingWidgetClassNames.forEach(widgetName => goldenLayout.registerComponent(widgetName, WidgetRenderer));

        goldenLayout.on('initialised', this.onGoldenLayoutInitializedEvent);
        goldenLayout.on('stackCreated', blockDropOnStack);
        goldenLayout.on('itemDropped', this.updateDashboard);
        goldenLayout.on('itemDropped', this.onGoldenLayoutComponentAddEvent);
        goldenLayout.on('componentCreated', this.onGoldenLayoutComponentAddEvent);
        goldenLayout.on('itemDestroyed', this.hideWidgetConfigurationPane);
        goldenLayout.eventHub.on(Event.DASHBOARD_DESIGNER_WIDGET_RESIZE, this.updateDashboard);

        // Workaround suggested in https://github.com/golden-layout/golden-layout/pull/348#issuecomment-350839014
        setTimeout(() => goldenLayout.init(), 0);
        this.goldenLayout = goldenLayout;
    }

    renderErrorMessage() {
        return (
            <Paper style={styles.message}>
                <FormattedMessage
                    id='designer.page-not-found'
                    defaultMessage="Page for URL '{url}' does not exists in {dashboard}!"
                    values={{ url: this.props.pageId, dashboard: this.props.dashboard.name }}
                />
            </Paper>
        );
    }

    render() {
        const renderingPage = this.getRenderingPage();
        if (renderingPage) {
            return (
                <div>
                    <style>{glDarkThemeCss}</style>
                    <div
                        id={dashboardContainerId}
                        className='dashboard-design-container'
                        ref={() => this.renderGoldenLayout()}
                    />
                    <WidgetConfigurationPane
                        theme={this.props.theme}
                        isOpen={this.state.isWidgetConfigurationPaneOpen}
                        selectedWidgetGoldenLayoutContent={this.selectedWidgetGoldenLayoutContent}
                        selectedPageGoldenLayoutContent={renderingPage.content}
                        allWidgetsConfigurations={this.props.widgetsConfigurations}
                        paneCloseEventListener={this.onWidgetConfigurationPaneClose}
                    />
                </div>
            );
        } else {
            return this.renderErrorMessage();
        }
    }
}

DashboardRenderer.propTypes = {
    dashboard: PropTypes.arrayOf({
        name: PropTypes.string.isRequired,
        pages: PropTypes.arrayOf({
            id: PropTypes.string.isRequired,
            content: PropTypes.arrayOf({}).isRequired,
        }).isRequired,
    }).isRequired,
    widgetsConfigurations: PropTypes.arrayOf({
        name: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired,
        configs: PropTypes.shape({}).isRequired,
    }).isRequired,
    pageId: PropTypes.string.isRequired,
    updateDashboard: PropTypes.func.isRequired,
    theme: PropTypes.shape({}).isRequired,
};
