/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React from 'react';
import PropTypes from 'prop-types';
import AppBar from 'material-ui/AppBar';
import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import { Link } from 'react-router-dom';

/**
 * This class will render the card view that will be used to present Charts.
 */
export class ChartWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            children: null,
            title: this.props.title,
            subtitle: this.props.subtitle,
            actionBar: this.props.actionBar,
            chart: this.props.chart
        };
    }

    componentWillReceiveProps(props) {
        this.setState({ children: props.children });
    }

    render() {
        return (
            <Card style={{ marginTop: 50 }} >
                {
                    this.props.media ?
                        <AppBar style={{ marginBottom: 10 }} title={this.state.title} showMenuIconButton={false} /> :
                        <CardTitle title={this.state.title} subtitle={this.state.subtitle} />
                }
                <CardMedia>

                    <div>
                        {this.props.children}
                    </div>

                </CardMedia>
                <CardActions>
                    <Link to={'/' + this.state.chart + '-charts'}>
                        <FlatButton label={this.state.actionBar ? 'View Usage' : ' '} />
                    </Link>
                </CardActions>
            </Card>
        );
    }
}

ChartWrapper.defaultProps = {
    media: false,
    actionBar: false,
};

ChartWrapper.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    children: PropTypes.any.isRequired,
    chart: PropTypes.string.isRequired,
    media: PropTypes.bool,
    actionBar: PropTypes.bool.isRequired
};
