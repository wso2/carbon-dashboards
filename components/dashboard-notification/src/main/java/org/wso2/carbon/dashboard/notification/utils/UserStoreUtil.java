/*
*  Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*  WSO2 Inc. licenses this file to you under the Apache License,
*  Version 2.0 (the "License"); you may not use this file except
*  in compliance with the License.
*  You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*
*/
package org.wso2.carbon.dashboard.notification.utils;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.wso2.carbon.user.api.UserStoreException;
import org.wso2.carbon.user.api.UserStoreManager;
import org.wso2.carbon.user.core.service.RealmService;
import org.wso2.carbon.context.PrivilegedCarbonContext;
import org.wso2.carbon.utils.multitenancy.MultitenantUtils;

import static java.lang.Integer.parseInt;

public class UserStoreUtil {
    private static Log log = LogFactory.getLog(UserStoreUtil.class);

    public static UserStoreManager getUserStoreManager(String tenantId) throws UserStoreException {
        RealmService realmService;
        UserStoreManager userStoreManager;
        PrivilegedCarbonContext.startTenantFlow();
        PrivilegedCarbonContext.getThreadLocalCarbonContext().setTenantId(parseInt(tenantId), true);
        PrivilegedCarbonContext ctx = PrivilegedCarbonContext.getThreadLocalCarbonContext();
        realmService = (RealmService) ctx.getOSGiService(RealmService.class, null);
        if (realmService == null) {
            String msg = "Realm service has not initialized.";
            log.error(msg);
            throw new IllegalStateException(msg);
        }
        userStoreManager = realmService.getTenantUserRealm(Integer.parseInt(tenantId)).getUserStoreManager();
        return userStoreManager;
    }

    public static String getAuthenticatedUser() {
        PrivilegedCarbonContext threadLocalCarbonContext = PrivilegedCarbonContext.getThreadLocalCarbonContext();
        String username = threadLocalCarbonContext.getUsername();
        String tenantDomain = threadLocalCarbonContext.getTenantDomain();
        if (username.endsWith(tenantDomain)) {
            return MultitenantUtils.getTenantAwareUsername(username);
        }
        return username;
    }

    public static String getUserTenantDomain(String tenantId) {
        PrivilegedCarbonContext.startTenantFlow();
        PrivilegedCarbonContext.getThreadLocalCarbonContext().setTenantId(parseInt(tenantId), true);
        PrivilegedCarbonContext threadLocalCarbonContext = PrivilegedCarbonContext.getThreadLocalCarbonContext();
        String tenantDomain = threadLocalCarbonContext.getTenantDomain();
        PrivilegedCarbonContext.endTenantFlow();
        return tenantDomain;
    }
}
