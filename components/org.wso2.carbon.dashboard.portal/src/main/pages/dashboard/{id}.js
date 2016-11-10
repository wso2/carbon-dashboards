/**
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function onRequest(env) {
    var dashboard = {
        "name": "Nipuna Dashboard",
        "id": "nipuna-dashboard",
        "version": "1.0.2",
        "description": "",
        "content": {
            "hideAllMenuItems": false,
            "banner": {
                "customBannerExists": false,
                "globalBannerExists": false
            },
            "pages": [{
                "id": "page0",
                "title": "Page 0",
                "views": {
                    "content": {
                        "default": {
                            "blocks": [{
                                "height": 3,
                                "id": "a",
                                "width": 12,
                                "x": 0,
                                "y": 0
                            }, {
                                "height": 3,
                                "id": "b",
                                "width": 12,
                                "x": 0,
                                "y": 3
                            }, {
                                "height": 3,
                                "id": "c",
                                "width": 12,
                                "x": 0,
                                "y": 6
                            }],
                            "name": "Default View",
                            "roles": ["Internal/Everyone", "admin"]
                        }
                    },
                    "fluidLayout": false
                }
            }],
            "menu": [{
                "id": "page0",
                "isHidden": false,
                "subordinates": [],
                "title": "Page 0"
            }]
        },
        "theme": {
            "name": "Default Theme",
            "properties": {
                "lightDark": "dark",
                "showSideBar": false
            }
        },
        "isCustomizable": false,
        "isSharable": false,
        "isAnon": false,
        "apiAuth": {
            "accessTokenUrl": "",
            "apiKey": "",
            "apiSecret": "",
            "identityServerUrl": ""
        },
        "permission": {
            "editor": [],
            "viewer": [],
            "owner": []
        }
    };
    return {
        dashboard: dashboard
    };
}