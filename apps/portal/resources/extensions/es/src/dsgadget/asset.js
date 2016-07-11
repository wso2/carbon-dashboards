/**
 *  Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

asset.manager = function (ctx) {
    /**
     * Name of the asset.
     * @const
     * @private
     */
    var ASSET_NAME = 'dsgadget';

    /**
     * Root directory for the gadget extension.
     * @const
     * @private
     */
    var GADGET_EXT_PATH = "/extensions/assets/" + ASSET_NAME;
    var utils = require(GADGET_EXT_PATH + '/modules/utils.js').api;
    var constants = require(GADGET_EXT_PATH + '/modules/constants.js').constants;
    var lifecycleApi = require('lifecycle').api;

    return {
        update: function (options) {
            options.attributes.gadget_thumbnail = constants.THUMBNAIL_FILE_NAME;
            this._super.update.call(this, options);
        },
        remove: function (id) {
            utils.deleteGadget(id);
            this._super.remove.call(this, id);
        },
        invokeLcAction: function (asset, action, lcName, userArgs) {
            var lc = lifecycleApi.getLifecycle(asset.lifecycle, ctx.tenantId);
            var states = lc.nextStates(asset.lifecycleState);
            var success;

            if (asset.lifecycleState === constants.INITIAL_LIFECYCLE_STATE) {
                utils.addThumbnail(asset, ctx.tenantId);
            }
            for (var index = 0; index < states.length; states++) {
                if (states[index].action === action) {
                    if (states[index].state === constants.PUBLISHED_LIFECYCLE_STATE) {
                        if (utils.buildGadgetJson(asset, ctx.tenantId)) {
                            utils.uploadGadgetToDS(asset.id, asset.attributes.overview_id, asset.attributes.overview_version);
                        }
                        break;
                    }
                    if (states[index].state === constants.UNPUBLISHED_LIFECYCLE_STATE && states[index].action === action) {
                        if (utils.buildGadgetJson(asset, ctx.tenantId)) {
                            utils.removeGadgetFromDS(asset.attributes.overview_id, asset.attributes.overview_version);
                        }
                        break;
                    }
                }
            }
            if (lcName) {
                success = this._super.invokeLcAction.call(this, asset, action, lcName, userArgs);
            } else {
                success = this._super.invokeLcAction.call(this, asset, action);
            }
            return success;
        }
    }
};

asset.server = function (ctx) {
    return {
        onUserLoggedIn: function () {
        },
        endpoints: {
            apis: [{
                url: 'gadgets',
                path: 'gadgets.jag'
            }]
        }
    };
};

asset.configure = function () {
    return {
        table: {
            gadget: {
                fields: {
                    gadgetarchive: {
                        type: 'file'
                    },
                    thumbnail: {
                        hidden: true
                    }
                }
            },
            overview: {
                fields: {
                    createdtime: {
                        hidden: true
                    }
                }
            }
        },
        meta: {
            lifecycle: {
                name: 'SampleLifeCycle2',
                commentRequired: false,
                defaultLifecycleEnabled: true,
                defaultAction: 'Promote',
                deletableStates: ['Unpublished'],
                publishedStates: ['Published'],
                lifecycleEnabled: true
            },
            ui: {
                icon: 'fw fw-web-app'
            },
            notifications: {
                enabled: true
            },
            thumbnail: 'gadget_thumbnail',
            nameAttribute: 'overview_name',
            versionAttribute: 'overview_version',
            providerAttribute: 'overview_provider',
            timestamp: 'overview_createdtime',
            grouping: {
                groupingEnabled: false,
                groupingAttributes: ['overview_name']
            },
            permissions: {
                configureRegistryPermissions: function (ctx) {
                }
            }
        }
    };
};