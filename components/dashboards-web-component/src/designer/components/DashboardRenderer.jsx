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
import 'golden-layout/src/css/goldenlayout-base.css';
import WidgetRenderer from '../../common/WidgetRenderer';
import { ResizableBox } from 'react-resizable';

import '../../common/styles/custom-goldenlayout-dark-theme.css';
import glDarkTheme from '!!css-loader!../../common/styles/custom-goldenlayout-dark-theme.css';
import './dashboard-container-styles.css';

import WidgetConfigurationPane from './WidgetConfigurationPane';
import DashboardUtils from '../../utils/DashboardUtils';
import { Event } from '../../utils/Constants';
import GoldenLayoutFactory from '../../utils/GoldenLayoutFactory';
import './react-resizable-styles.css';

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
        this.onWidgetConfigurationPaneClose = this.onWidgetConfigurationPaneClose.bind(this);
        this.getRenderingPage = this.getRenderingPage.bind(this);
        this.addWidgetSettingsButton = this.addWidgetSettingsButton.bind(this);
        this.hideWidgetConfigurationPane = this.hideWidgetConfigurationPane.bind(this);
        this.highlightSelectedWidgetContainer = this.highlightSelectedWidgetContainer.bind(this);
        this.unhighlightSelectedWidgetContainer = this.unhighlightSelectedWidgetContainer.bind(this);
        this.cleanDashboardJSON = this.cleanDashboardJSON.bind(this);
        this.destroyGoldenLayout = this.destroyGoldenLayout.bind(this);
        this.handleWindowResize = this.handleWindowResize.bind(this);
        this.updateDashboardOnConfigChange = this.updateDashboardOnConfigChange.bind(this);
        this.updateDashboardOnContentChanged = this.updateDashboardOnContentChanged.bind(this);
        this.renderGoldenLayout = this.renderGoldenLayout.bind(this);
        this.unmounted = false;
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleWindowResize);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.pageId !== nextProps.pageId) {
            // Receiving new page to render.
            this.pageHeight = nextProps.dashboard.pages.find(p => p.id == nextProps.pageId).height;
            this.destroyGoldenLayout();
            return true;
        }
        if (this.props.pageId === nextProps.pageId) {
            // Check whether the page height is difference for the same page.
            let changingPage = nextProps.dashboard.pages.find(p => p.id === nextProps.pageId);
            let newHeight = (changingPage === undefined) ? undefined:changingPage.height;
            if(newHeight != undefined){
                if (this.pageHeight !== newHeight) {
                    this.pageHeight = newHeight;
                    this.destroyGoldenLayout();
                    return true;
                }
            }            
        }
        if (this.state !== nextState) {
            return true;
        }
        return false;
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowResize);
        this.destroyGoldenLayout();
        this.unmounted = true;
    }

    onGoldenLayoutInitializedEvent() {
        this.props.widgetsConfigurations.forEach((widget) => {
            const options = {};
            if (widget.configs && widget.configs.options) {
                widget.configs.options.forEach((option) => {
                    options[option.id] = option.defaultValue;
                });
            }
            const itemConfig = {
                title: '[' + (widget.displayName || widget.name) + ']',
                type: 'react-component',
                component: widget.configs.isGenerated ? 'UniversalWidget' : widget.id,
                props: {
                    id: DashboardUtils.generateUuid(),
                    configs: { pubsub: widget.configs.pubsub, isGenerated: widget.configs.isGenerated, options },
                    widgetID: widget.id,
                },
                isClosable: false,
                reorderEnabled: true,
                header: { show: true },
            };
            this.goldenLayout.createDragSource(document.getElementById(widget.id), itemConfig);
            try {
                this.goldenLayout.registerComponent(itemConfig.component, WidgetRenderer);
            } catch (e) {
                // Seems like this widget is already registered, hence ignoring.
            }
        });
    }

    onWidgetConfigurationPaneClose() {
        this.unhighlightSelectedWidgetContainer();
        this.updateDashboardOnConfigChange();
    }

    getRenderingPage() {
        return this.props.dashboard.pages.find(page => (page.id === this.props.pageId));
    }

    addWidgetSettingsButton(component) {
        if (!component.parent || !component.parent.header) {
            return; // Added component is not a widget.
        }

        this.goldenLayout._dragSources.forEach((dragSource) => {
            if (dragSource._itemConfig.props.id === component.config.props.id) {
                dragSource._itemConfig.props.id = DashboardUtils.generateUuid();
            }
        });

        if (!(_.isEmpty(_.get(component, 'config.props.configs.options')) &&
                !_.get(component, 'config.props.configs.pubsub.types', []).includes('subscriber'))) {
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

    updateDashboardOnConfigChange() {
        const updatingPage = this.getRenderingPage();
        updatingPage.content = this.cleanDashboardJSON(this.goldenLayout.toConfig().content);
        this.props.updateDashboard();
    }

    updateDashboardOnContentChanged() {
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

        const goldenLayoutContents = this.getRenderingPage().content;
        const goldenLayout = GoldenLayoutFactory.createForDesigner(dashboardContainerId, goldenLayoutContents);

        goldenLayout.on('initialised', this.onGoldenLayoutInitializedEvent);
        goldenLayout.on('stackCreated', blockDropOnStack);
        goldenLayout.on('componentCreated', this.addWidgetSettingsButton);
        goldenLayout.on('itemDropped', this.addWidgetSettingsButton);
        goldenLayout.on('itemDropped', this.updateDashboardOnContentChanged);
        goldenLayout.on('itemDestroyed', this.hideWidgetConfigurationPane);
        goldenLayout.on(Event.DASHBOARD_DESIGNER_LAST_WIDGET_DELETED, this.updateDashboardOnContentChanged);
        goldenLayout.eventHub.on(Event.DASHBOARD_DESIGNER_WIDGET_RESIZE, this.updateDashboardOnContentChanged);

        goldenLayout.initialize();
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
        const { theme } = this.props;
        // Calculate optimal page height for the current screen.
        const pageHeight = renderingPage.height ? parseInt(renderingPage.height) : undefined;
        const containerHeight = window.innerHeight - 90;
        const height = pageHeight && pageHeight > containerHeight ? pageHeight : containerHeight;

        if (renderingPage) {
            return (
                <div style={{
                    color: theme.palette.textColor,
                    backgroundColor: theme.palette.canvasColor,
                    fontFamily: theme.fontFamily,
                }}
                >
                    <style>{glDarkThemeCss}</style>
                    <ResizableBox
                        height={height}
                        minConstraints={['100%', containerHeight]}
                        onResizeStart={() => this.setState({ resizeStarted: true })}
                        onResize={(e, data) => this.setState({ resizingHeight: data.size.height })}
                        onResizeStop={(e, data) => {
                            this.setState({ resizeStarted: false });
                            if (this.goldenLayout) {
                                this.goldenLayout.updateSize();
                            }
                            renderingPage.height = data.size.height;
                            this.updateDashboardOnConfigChange();
                        }}
                        axis="y"
                    >
                        <div
                            id={dashboardContainerId}
                            style={{ height: '100%' }}
                            ref={() => {
                                if (!this.unmounted) {
                                    this.renderGoldenLayout();
                                }
                            }}
                        />
                        {
                            this.state.resizeStarted &&
                            <div style={{ height: '100%' }}>
                                <div
                                    style={{
                                        position: 'fixed',
                                        top: 55,
                                        right: 15,
                                        fontSize: 18,
                                        fontWeight: 'bold',
                                        padding: 10,
                                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                    }}
                                >
                                    <FormattedMessage id="page.height.overlay" defaultMessage="Reset height" />:
                                    {this.state.resizingHeight}px
                                </div>
                            </div>

                        }
                    </ResizableBox>
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
