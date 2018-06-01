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
import { TextField } from 'material-ui';
import PropTypes from 'prop-types';
import _ from 'lodash';

import LeftSidePane from './LeftSidePane';
import WidgetCard from './WidgetCard';
import WidgetAPI from '../../utils/apis/WidgetAPI';

const styles = {
    message: { textAlign: 'center', paddingTop: 10 },
};

export default class WidgetsSidePane extends Component {
    constructor(props) {
        super(props);
        this.widgets = null;
        this.state = {
            widgetsLoadingStatus: 'loading',
            filter: null,
        };
    }

    componentDidMount() {
        WidgetAPI.getWidgets()
            .then((response) => {
                this.widgets = response.data || [];
                this.widgets.sort((widgetA, widgetB) => {
                    return (widgetA.name.toLowerCase() < widgetB.name.toLowerCase()) ? -1 : 1;
                });
                this.props.setWidgetsConfigurations(this.widgets);
                _.remove(this.widgets, widget => (widget.id === 'UniversalWidget'));
                this.setState({ widgetsLoadingStatus: 'success' });
            })
            .catch(() => {
                this.props.setWidgetsConfigurations([]);
                this.setState({ widgetsLoadingStatus: 'fail' });
            });
    }

    renderWidgetCard(widget) {
        const filter = this.state.filter;
        const isHidden = filter && (filter.length > 0) &&
            (widget.name.toLowerCase().indexOf(filter.toLowerCase()) === -1);
        return <WidgetCard key={widget.id} widget={widget} isHidden={isHidden} />;
    }

    render() {
        let innerContent;
        if (this.state.widgetsLoadingStatus === 'loading') {
            innerContent = (
                <div style={styles.message}>
                    <FormattedMessage id="widgets.loading" defaultMessage="Loading..." />
                </div>
            );
        } else if (this.state.widgetsLoadingStatus === 'fail') {
            innerContent = (
                <div style={styles.message}>
                    <FormattedMessage id="widgets.loading-failed" defaultMessage="Widgets Loading failed!" />
                </div>
            );
        } else if (this.state.widgetsLoadingStatus === 'success') {
            if (this.widgets.length === 0) {
                innerContent = (
                    <div style={styles.message}>
                        <FormattedMessage id="no.widgets.found" defaultMessage="No Widgets Found" />
                    </div>
                );
            } else {
                innerContent = (
                    <span>
                        <div style={styles.message}>
                            <TextField
                                hintText={<FormattedMessage id="search.hint.text" defaultMessage="Search widgets" />}
                                value={this.state.filter}
                                onChange={event => this.setState({ filter: event.target.value })}
                            />
                        </div>
                        <div>{this.widgets.map(widget => this.renderWidgetCard(widget))}</div>
                    </span>
                );
            }
        }
        return (
            <LeftSidePane isHidden={this.props.isHidden} isOpen={this.props.isOpen} theme={this.props.theme}>
                {innerContent}
            </LeftSidePane>
        );
    }
}

WidgetsSidePane.propTypes = {
    isHidden: PropTypes.bool,
    isOpen: PropTypes.bool,
    theme: PropTypes.shape({}).isRequired,
    setWidgetsConfigurations: PropTypes.func.isRequired,
};

WidgetsSidePane.defaultProps = {
    isHidden: false,
    isOpen: false,
};
