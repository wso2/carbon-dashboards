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
import { Paper } from 'material-ui';
import { EditorInsertChart } from 'material-ui/svg-icons';

const styles = {
    widgetCard: {
        cursor: 'pointer',
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
        textAlign: 'center',
        width: '40%',
    },
    widgetCardTitle: {
        fontSize: 14,
        padding: 10,
        height: 30,
        display: 'flex',
        justifyContent: 'center',
        overflow: 'hidden',
    },
};

export default class WidgetCard extends Component {
    renderWidgetCardThumbnailImage(widget) {
        const url1 = `url(${widget.thumbnailURL})`;
        const url2 = `url(${window.contextPath}/public/extensions/widgets/${widget.id}/${widget.thumbnailURL})`;
        return (
            <div
                style={{
                    width: '100%',
                    height: 100,
                    backgroundImage: `${url1}, ${url2}`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                }}
            />
        );
    }

    renderWidgetCardDefaultThumbnail() {
        return (
            <div style={{ width: '100%', height: 100 }}>
                <EditorInsertChart style={{ width: '100%', height: '100%', opacity: 0.4 }} />
            </div>
        );
    }

    render() {
        const widget = this.props.widget;
        const widgetCardStyle = styles.widgetCard;
        widgetCardStyle.display = this.props.isHidden ? 'none' : 'inline-block';
        return (
            <Paper id={widget.id} style={widgetCardStyle}>
                {widget.thumbnailURL ?
                    this.renderWidgetCardThumbnailImage(widget) :
                    this.renderWidgetCardDefaultThumbnail()}
                <div style={styles.widgetCardTitle}>{widget.name}</div>
            </Paper>
        );
    }
}

WidgetCard.propTypes = {
    isHidden: PropTypes.bool,
    widget: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        thumbnailURL: PropTypes.string.isRequired,
    }).isRequired,
};

WidgetCard.defaultProps = {
    isHidden: false,
};
