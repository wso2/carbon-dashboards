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
import { FormattedMessage } from 'react-intl';
import { RaisedButton } from 'material-ui';
import DashboardReportGenerator from '../../utils/DashboardReportGenerator';

export default class ReportGenerationButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            includeTime: false,
        };

        this.generateDashboardReport = this.generateDashboardReport.bind(this);
    }

    render() {
        return (
            <div>
                <RaisedButton
                    label={<FormattedMessage id='dashboardReportGeneration.title' defaultMessage='Generate Report' />}
                    onClick={this.generateDashboardReport}
                    disabled={!(this.props.pageList.length > 0)}
                    backgroundColor={'#a4b6c2'}
                />
            </div>

        );
    }

    generateDashboardReport() {
        const title = this.props.dashboardName;
        this.state.includeTime = true;
        DashboardReportGenerator.generateDashboardPdf(this.props.pageSize.toLowerCase(), this.props.pageList,
            this.state.includeTime, title);
    }
}

ReportGenerationButton.propTypes = {
    pageSize: PropTypes.string.isRequired,
    pageList: PropTypes.array.isRequired,
    pages: PropTypes.array.isRequired,
    dashboardName: PropTypes.string.isRequired,
};
