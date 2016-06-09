/*
 *  Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
package org.wso2.carbon.dashboard.deployment.util;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.wso2.carbon.CarbonConstants;
import org.wso2.carbon.dashboard.deployment.internal.ServiceHolder;
import org.wso2.carbon.registry.core.exceptions.RegistryException;
import org.wso2.carbon.registry.core.utils.AuthorizationUtils;
import org.wso2.carbon.user.api.UserRealm;
import org.wso2.carbon.user.api.UserStoreException;
import org.wso2.carbon.utils.multitenancy.MultitenantUtils;

/**
 * This class validates the user based on the permission of the respective user
 */
public class AuthorizationUtil {
    private static final Log logger = LogFactory.getLog(AuthorizationUtils.class);

    /**
     * @param tenantId   Tenant ID of the user
     * @param username   User name of the user
     * @param permission Required permission to access the particular component
     * @return true if the user has the required permission, unless false
     * @throws UserStoreException,RegistryException
     */
    public static boolean isUserAuthorized(int tenantId, String username, String permission)
            throws UserStoreException, RegistryException {
        if (logger.isDebugEnabled()) {
            logger.debug("User[" + username + "] calling method (" + Thread.currentThread().getStackTrace()[2]
                    .getMethodName() + ") with permission[" + permission + "]");
        }

        try {
            UserRealm userRealm = ServiceHolder.getRegistryService().getUserRealm(tenantId);
            return userRealm.getAuthorizationManager()
                    .isUserAuthorized(MultitenantUtils.getTenantAwareUsername(username), permission,
                            CarbonConstants.UI_PERMISSION_ACTION);
        } catch (UserStoreException e) {
            logger.error(e);
            throw new UserStoreException(
                    "Unable to get user permission information for user[" + username + "] due to " +
                            e.getMessage(), e);
        } catch (RegistryException e) {
            logger.error(e);
            throw new RegistryException(e.getMessage(), e);
        }
    }
}