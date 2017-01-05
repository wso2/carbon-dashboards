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
    var session = getSession();
    var user = {
        userName: session.getUser().getUsername(),
        domain: "carbon.super",
        isEditor: true,
        isOwner: true
    };
    var isUserAvailable = false;
    var isSuperUser = false;
    var sharedDashboard = true;

    if (user) {
        isUserAvailable = true;
    }

    if (!env.isAnonView
        && (env.urlDomain == user.domain
        || (user.domain == env.superDomain
        && (!env.urlDomain || env.urlDomain == env.superDomain)))) {
        isSuperUser = true;
    }

    if (sharedDashboard && user.domain != env.superDomain) {
        sharedDashboard = true;
    }

    var userName = user ? user.userName : "anon";
    return {
        isUserAvailable: isUserAvailable,
        isPersonalizeEnabled: false,
        dashboardName: env.params.dashboard.name,
        userName: userName,
        isSuperUser: isSuperUser,
        sharedDashboard: sharedDashboard,
        ownerOrEditor: user.isEditor || user.isOwner,
        isThemeDark: true
    };
}