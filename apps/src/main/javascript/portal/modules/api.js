/*
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var log = new Log();

var authenticate = function (username, password) {
    var utils = require('/modules/utils.js');
    var HTTPConstants = Packages.org.apache.axis2.transport.http.HTTPConstants;
    var AuthStub = Packages.org.wso2.carbon.authenticator.stub.AuthenticationAdminStub;
    var AUTH_SERVICE = "/services/AuthenticationAdmin";
    var authUrl = utils.getCarbonServerAddress('https') + AUTH_SERVICE;
    var authAdminClient = new AuthStub(authUrl);

    if (authAdminClient.login(username, password, "localhost")) {
        var serviceContext = authAdminClient._getServiceClient().getLastOperationContext().getServiceContext();
        var sessionCookie = serviceContext.getProperty(HTTPConstants.COOKIE_STRING);
        log.debug('Session cookie ' + sessionCookie);
        return sessionCookie;
    } else {
        log.info('Authentication failure');
        return false;
    }
};