/*
 *  Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */

import React, {Component} from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    title: {
        color: theme.palette.textColor,
        fontFamily: theme.typography.fontFamily
    },
    wrapper: {
        margin: '0 auto',
        width: 400,
        paddingBottom: 15,
        paddingTop: 30
    }
});

class FormPanel extends Component {

    render() {
        const {classes} = this.props;
        return (
            <div className={classes.wrapper}>
                <form method="post" onSubmit={this.props.onSubmit}>
                    <h1 className={classes.title}>{this.props.title}</h1>
                    {this.props.children}
                </form>
            </div>
        );
    }
}

FormPanel.propTypes = {
    title: PropTypes.string,
    onSubmit: PropTypes.func,
    width: PropTypes.number,
    paddingTop: PropTypes.number,
    classes: PropTypes.object.isRequired,
};

FormPanel.defaultProps = {
    title: '',
    width: 400,
    paddingTop: 30
};

export default withStyles(styles)(FormPanel);