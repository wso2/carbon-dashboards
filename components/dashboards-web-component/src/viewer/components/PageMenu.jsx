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

import { List, ListItem } from 'material-ui/List';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

/**
 * Generates page menu in viewer.
 */
class PageMenu extends Component {
    /**
     * Generate pages menu.
     *
     * @param {{}} page Page object
     * @param {string} parentUrl URL of the parent page
     * @returns {XML} HTML content
     */
    generateMenu(page, parentUrl) {
        // Generate the URL of the current page.
        const url = parentUrl ? parentUrl + '/' + page.id : page.id;

        let listItemStyleObject;

        if (this.props.selectedPage === url) {
            listItemStyleObject = {backgroundColor: "#37474F"};
        } else {
            listItemStyleObject = {};
        }

        // Generate sub-pages.
        let subpages = [];
        if (page.pages) {
            subpages = page.pages.map((subpage) => {
                return this.generateMenu(subpage, url);
            });
        }

        // Build and return the page structure.
        return (
            <ListItem
                initiallyOpen
                primaryText={page.name}
                nestedItems={subpages}
                style={listItemStyleObject}
                onClick={() => {
                    this.props.history.push(`/dashboards/${this.props.dashboard.url}/${url}`);
                }}
            />
        );
    }

    /**
     * Renders menu.
     *
     * @returns {XML} HTML content
     */
    render() {
        return (
            <div>
                {
                    this.props.dashboard.pages.map((page) => {
                        return (
                            <List>
                                {this.generateMenu(page)}
                            </List>
                        );
                    })
                }
            </div>
        );
    }
}

PageMenu.propTypes = {
    dashboard: PropTypes.shape({
        url: PropTypes.string.isRequired,
        pages: PropTypes.array,
    }).isRequired,
};

export default withRouter(PageMenu);
