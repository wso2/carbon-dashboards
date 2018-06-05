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
import _ from 'lodash';

export default class WidgetOptionsConfiguration extends Component {
    constructor(props) {
        super(props);

        this.doesSelectedWidgetHasOptions = this.doesSelectedWidgetHasOptions.bind(this);
    }

    doesSelectedWidgetHasOptions() {
        const contentOptions = _.get(this.props.selectedWidget.props, 'configs.options');
        const configurationOptions = _.get(this.props.selectedWidgetConfiguration, 'configs.options');
        return (!_.isEmpty(contentOptions) && !_.isEmpty(configurationOptions));
    }

    render() {
        if (!this.doesSelectedWidgetHasOptions()) {
            return null;
        }
        return <span>widget options UI goes here</span>;
    }
}

WidgetOptionsConfiguration.propTypes = {
    selectedWidget: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        className: PropTypes.string.isRequired,
        props: PropTypes.shape({}).isRequired,
    }).isRequired,
    selectedWidgetConfiguration: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        configs: PropTypes.shape({}).isRequired,
    }).isRequired,
};
