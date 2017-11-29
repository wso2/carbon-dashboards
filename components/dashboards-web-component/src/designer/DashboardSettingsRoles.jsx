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

import React, { Component } from 'react';
import { AutoComplete, Chip } from 'material-ui';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import AuthenticationAPI from '../utils/apis/AuthenticationAPI';
import DashboardAPI from '../utils/apis/DashboardAPI';

/**
 * Actors
 */
const actors = ['owners', 'editors', 'viewers'];
const actorLabels = {
    owners: 'Owners',
    editors: 'Editors',
    viewers: 'Viewers',
};

/**
 * Renders roles in the dashboard settings page.
 */
export default class DashboardSettingsRoles extends Component {
    /**
     * Initialize roles in component state.
     * 
     * @returns {{}} Roles state
     */
    static initializeRolesState() {
        const roles = { all: [] };
        actors.forEach((a) => {
            roles[a] = {
                current: [],
                available: [],
                text: '',
            };
        });
        return roles;
    }

    /**
     * Constructor.
     * 
     * @param {{}} props Props
     */
    constructor(props) {
        super(props);
        this.state = {
            roles: DashboardSettingsRoles.initializeRolesState(),
        };
    }

    /**
     * Initialize the component.
     */
    componentDidMount() {
        // Get all the roles available.
        AuthenticationAPI
            .getRoles()
            .then((response) => {
                this.state.roles.all = response.data.map((r) => {
                    return r.displayName;
                });
                this.setState({ roles: this.state.roles });
                this.refreshAvailableRoles();
            });
    }

    /**
     * Component will receive props.
     * 
     * @param {{}} nextProps New props
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.dashboard && nextProps.dashboard.url) {
            // Get roles allocated for the current dashboard.
            DashboardAPI
                .getDashboardRoles(nextProps.dashboard.url)
                .then((response) => {
                    actors.forEach((actor) => {
                        this.state.roles[actor].current = response.data[actor].map((r) => {
                            return r.name;
                        });
                    });
                    this.setState({ roles: this.state.roles });
                    this.refreshAvailableRoles();
                });
        }
    }

    /**
     * Refresh available roles in the state.
     */
    refreshAvailableRoles() {
        if (this.state.roles.all.length === 0) {
            return;
        }

        actors.forEach((actor) => {
            const roles = this.state.roles[actor];
            roles.available = this.state.roles.all.slice();
            roles.current.forEach((role) => {
                const idx = roles.available.indexOf(role);
                if (idx !== -1) {
                    roles.available.splice(idx, 1);
                }
            });
        });
    }

    /**
     * Add role to an actor.
     * 
     * @param {string} actor Actor 
     * @param {string} role Role
     */
    addRole(actor, role) {
        // Check whether the role is there in the available role list. If so add it to the current list.
        const actorRoles = this.state.roles[actor];
        const idx = actorRoles.available.indexOf(role);
        if (idx !== -1) {
            actorRoles.current.push(actorRoles.available.splice(idx, 1)[0]);
            actorRoles.text = '';
            // this.state.dirty.roles = true;
            this.setState({
                roles: this.state.roles,
                // dirty: this.state.dirty,
            });
        }
    }

    /**
     * Delete role from an actor.
     * 
     * @param {string} actor Actor
     * @param {string} role Role 
     */
    deleteRole(actor, role) {
        // Check whether the role is there in the current role list. If so remove it from the current list.
        const actorRoles = this.state.roles[actor];
        const idx = actorRoles.current.indexOf(role);
        if (idx !== -1) {
            actorRoles.available.push(actorRoles.current.splice(idx, 1)[0]);
            // this.state.dirty.roles = true;
            this.setState({
                roles: this.state.roles,
                // dirty: this.state.dirty,
            });
        }
    }

    /**
     * Save roles.
     * 
     * @returns {Promise} Promise
     */
    saveRoles() {
        const { roles } = this.state;
        const obj = {
            owner: roles.owners.current,
            editor: roles.editors.current,
            viewer: roles.viewers.current,
        };

        return new Promise((resolve, reject) => {
            DashboardAPI
                .updateDashboardRoles(this.props.dashboard.url, obj)
                .then(() => resolve())
                .catch(() => reject());
        });
    }

    /**
     * Renders dashboard settings roles.
     * 
     * @return {XML} HTML content
     */
    render() {
        const { muiTheme } = this.props;
        return (
            <div>
                {
                    actors.map((actor) => {
                        return (
                            <div>
                                <h3 style={{ fontFamily: muiTheme.fontFamily, color: muiTheme.palette.textColor }}>
                                    {actorLabels[actor]}
                                </h3>
                                <AutoComplete
                                    floatingLabelText={<FormattedMessage id="settings.add.role" defaultMessage="Add Role"/>}
                                    filter={AutoComplete.fuzzyFilter}
                                    dataSource={this.state.roles[actor].available}
                                    searchText={this.state.roles[actor].text}
                                    maxSearchResults={5}
                                    onNewRequest={t => this.addRole(actor, t)}
                                    onUpdateInput={(t) => {
                                        this.state.roles[actor].text = t;
                                        this.setState({ roles: this.state.roles });
                                    }}
                                />
                                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                    {
                                        this.state.roles[actor].current.map((role) => {
                                            return (
                                                <Chip
                                                    key={role}
                                                    style={{ margin: 4 }}
                                                    onRequestDelete={() => this.deleteRole(actor, role)}
                                                >{role}</Chip>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        );
    }
}

DashboardSettingsRoles.propTypes = {
    muiTheme: PropTypes.shape({}).isRequired,
    dashboard: PropTypes.shape({
        id: PropTypes.string.isRequired,
    }).isRequired,
};
