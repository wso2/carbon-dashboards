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
package org.wso2.carbon.dashboard.portal.core;

import org.wso2.carbon.context.PrivilegedCarbonContext;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

public class TenantStoreFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
            throws IOException, ServletException {
        HttpServletRequest httpServletRequest = (HttpServletRequest)servletRequest;
        if (httpServletRequest.getRequestURI().startsWith(PortalConstants.STORE) || httpServletRequest.getRequestURI()
                .startsWith(PortalConstants.TEMP)) {
            String stringToReplace = httpServletRequest.getRequestURI().startsWith(PortalConstants.STORE) ?
                    PortalConstants.STORE : PortalConstants.TEMP;
            String uri = httpServletRequest.getRequestURI();
            uri = uri.replace(stringToReplace, "");
            String[] uriComponents = uri.split("/");
            if (uriComponents.length > 1) {
                String tenantDomain = uriComponents[0];
                PrivilegedCarbonContext.startTenantFlow();
                PrivilegedCarbonContext.getThreadLocalCarbonContext().setTenantDomain(tenantDomain, true);
            }
        }
        filterChain.doFilter(servletRequest, servletResponse);
    }

    @Override
    public void destroy() {

    }
}