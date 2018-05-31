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
import { Paper } from 'material-ui';

export default class WidgetConfigurationPane extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clickedOnBackdrop: false,
        };

        this.handleBackdropOnClick = this.handleBackdropOnClick.bind(this);
    }

    handleBackdropOnClick() {
        console.log('---- backdrop on click');
        this.setState({ clickedOnBackdrop: true });
        this.props.paneCloseEventListener();
    }

    renderBackdrop(theme) {
        return (
            <div
                style={{
                    position: 'fixed',
                    height: '100%',
                    width: '100%',
                    top: '0px',
                    left: '0px',
                    opacity: 1,
                    backgroundColor: theme.overlay.backgroundColor,
                    '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)',
                    willChange: 'opacity',
                    transform: 'translateZ(0px)',
                    transition: 'left 0ms cubic-bezier(0.23, 1, 0.32, 1) 0ms, opacity 400ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
                    zIndex: 1200,
                    pointerEvents: 'auto',
                }}
                onClick={this.handleBackdropOnClick}
            />
        );
    }

    render() {
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
                    {this.props.widgetGoldenLayoutContent ? this.props.widgetGoldenLayoutContent.config.component : null}
                </Paper>
                {isOpen ? this.renderBackdrop(theme) : null}
            </span>
        );
    }
}

WidgetConfigurationPane.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    widgetGoldenLayoutContent: PropTypes.shape({}).isRequired,
    theme: PropTypes.shape({}).isRequired,
    paneCloseEventListener: PropTypes.func.isRequired,
};
