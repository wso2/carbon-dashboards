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
import { withRouter } from 'react-router-dom';
import { Card, CardMedia, CardTitle, Dialog, FlatButton, Snackbar } from 'material-ui';
import { ActionDelete, EditorInsertChart } from 'material-ui/svg-icons';
import WidgetAPI from '../../utils/apis/WidgetAPI';

const styles = {
    card: {
        display: 'inline-block',
        width: 'calc(13% - 13px)',
        height: '85px',
        minWidth: 232,
        margin: '21px 18px 0px 10px',
    },
    cardTitleText: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        fontSize: '0.8em',
        lineHeight: '14px',
        position: 'absolute',
        top: '10px',
    },
    deleteIcon: {
        height: '50px',
        width: '20px',
        marginLeft: '25%',
        marginTop: '14px',
        cursor: 'pointer',
    },
    cardTitle: {
        float: 'right',
        width: '160px',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
};

class WidgetStoreCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isConfirmDeleteShown: false,
            widgetDeleteActionResult: null,
            deleteIconColor: 'darkgrey',
        };
        this.hideDeleteConfirmDialog = this.hideDeleteConfirmDialog.bind(this);
        this.showDeleteConfirmDialog = this.showDeleteConfirmDialog.bind(this);
        this.handleDeletionConfirm = this.handleDeletionConfirm.bind(this);
        this.renderDeleteConfirmDialog = this.renderDeleteConfirmDialog.bind(this);
        this.renderDeletionSuccessMessage = this.renderDeletionSuccessMessage.bind(this);
        this.renderDeletionFailMessage = this.renderDeletionFailMessage.bind(this);
        this.WidgetCardDefaultThumbnail = this.WidgetCardDefaultThumbnail.bind(this);
    }


    WidgetCardDefaultThumbnail() {
        return (
            <div style={{ width: '20px', height: '10px' }}>
                <EditorInsertChart
                    style={{ width: '70px', height: '85px', opacity: 0.5, marginLeft: '5px' }}
                />
            </div>
        );
    }

    hideDeleteConfirmDialog() {
        this.setState({ isConfirmDeleteShown: false });
    }

    handleDeletionConfirm(widget) {
        this.hideDeleteConfirmDialog();
        new WidgetAPI()
            .deleteWidgetByID(widget.id)
            .then(() => this.setState({ widgetDeleteActionResult: 'success' }))
            .catch(() => this.setState({ widgetDeleteActionResult: 'fail' }));
    }

    showDeleteConfirmDialog() {
        this.setState({
            isConfirmDeleteShown: true,
        });
    }

    renderDeleteConfirmDialog(widget) {
        const actionsButtons = [
            <FlatButton
                primary
                label={
                    <FormattedMessage
                        id="dialog-box.confirmation.no"
                        defaultMessage="No"
                    />
                }
                backgroundColor={'#494949'}
                onClick={this.hideDeleteConfirmDialog}
            />,
            <FlatButton
                primary
                label={
                    <FormattedMessage
                        id="dialog-box.confirmation.yes"
                        defaultMessage="Yes"
                    />
                }
                onClick={() => this.handleDeletionConfirm(widget)}
            />,
        ];

        return (
            <Dialog
                title={
                    <h2>
                        <FormattedMessage
                            id='do.you.want.to.delete.widget'
                            defaultMessage="Do you want to delete widget '{widgetName}'?"
                            values={{
                                widgetName: widget.name,
                            }}
                        />
                    </h2>
                }
                actions={actionsButtons}
                open={this.state.isConfirmDeleteShown}
                onRequestClose={this.hideDeleteConfirmDialog}
            >
                <FormattedMessage
                    id="this.action.cannot.be.undone"
                    defaultMessage='This action cannot be undone.'
                />
            </Dialog>
        );
    }

    renderDeletionSuccessMessage(widget) {
        this.state.widgetDeleteActionResult = 'null';
        return (
            <Snackbar
                open
                message={
                    <FormattedMessage
                        id='widget.delete.successfully'
                        defaultMessage='Widget {widgetName} is  deleted successfully.'
                        values={{
                            widgetName: widget.name,
                        }}
                    />

                }
                autoHideDuration={4000}
            />
        );
    }

    renderDeletionFailMessage(widget) {
        return (
            <Snackbar
                open={this.state.widgetDeleteActionResult === 'fail'}
                message={<FormattedMessage
                    id='cannot.delete.widget'
                    defaultMessage='Cannot delete widget {widgetName} '
                    values={{
                        widgetName: widget.name,
                    }}
                />}
                autoHideDuration={4000}
                onRequestClose={() => this.setState({ widgetDeleteActionResult: null })}
            />
        );
    }

    render() {
        const widget = this.props.widget;
        if (this.state.widgetDeleteActionResult === 'success') {
            return this.renderDeletionSuccessMessage(widget);
        }
        const title = widget.name;
        const config = widget.configs;

        return (
            <span>
                <Card
                    expanded={false}
                    expandable={false}
                    actAsExpander={false}
                    style={styles.card}
                    zDepth={1}
                >
                    <CardMedia actAsExpander={false}>
                        {this.WidgetCardDefaultThumbnail()}
                    </CardMedia>
                    <CardTitle
                        actAsExpander={false}
                        showExpandableButton={false}
                        title={
                            <div style={{ width: '218px' }}>
                                <span title={title} style={styles.cardTitle}>
                                    {title}
                                </span>
                                <div>
                                    {config.isGenerated && (
                                        <ActionDelete
                                            onClick={this.showDeleteConfirmDialog}
                                            style={Object.assign(styles.deleteIcon,
                                                { fill: this.state.deleteIconColor })}
                                            onMouseEnter={() => {
                                                this.setState({
                                                    deleteIconColor: 'white',
                                                });
                                            }
                                            }
                                            onMouseLeave={() => {
                                                this.setState({
                                                    deleteIconColor: 'darkgrey',
                                                });
                                            }
                                            }
                                        />
                                    )}
                                </div>
                            </div>
                        }
                        titleStyle={styles.cardTitleText}
                    />
                </Card>
                {this.renderDeleteConfirmDialog(widget)}
                {this.renderDeletionFailMessage(widget)}
            </span>
        );
    }
}

WidgetStoreCard.propTypes = {
    widget: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        thumbnailURL: PropTypes.string.isRequired,
        configs: PropTypes.array.isRequired,
    }).isRequired,
};

export default withRouter(WidgetStoreCard);
