/*
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
package org.wso2.carbon.dashboard.shindig.extensions;

import com.google.common.base.Strings;
import com.google.inject.Inject;
import org.apache.shindig.common.logging.i18n.MessageKeys;
import org.apache.shindig.common.servlet.HttpUtil;
import org.apache.shindig.gadgets.servlet.GadgetRenderingServlet;
import org.apache.shindig.gadgets.uri.UriCommon.Param;
import org.apache.shindig.gadgets.uri.UriStatus;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * WSO2 Servlet extension for rendering Gadgets.
 */
public class WSO2GadgetRenderingServlet extends GadgetRenderingServlet {

    private static final long serialVersionUID = -5634040113214794888L;

    private static final int DEFAULT_CACHE_TTL = 60 * 5;
    private static final String classname = WSO2GadgetRenderingServlet.class.getName();
    private static final Logger LOG = Logger.getLogger(classname, MessageKeys.MESSAGES);

    @Inject
    public void setRenderer(WSO2Renderer renderer) {
        checkInitialized();
        this.renderer = renderer;
    }

    protected void onOkRenderingResultsStatus(PostGadgetRenderingParams params)
            throws IOException {
        UriStatus urlStatus = params.getUrlStatus();
        HttpServletResponse resp = params.getResponse();
        if (params.getContext().getIgnoreCache() ||
                urlStatus == UriStatus.INVALID_VERSION) {
            HttpUtil.setCachingHeaders(resp, 0);
        } else if (urlStatus == UriStatus.VALID_VERSIONED) {
            // Versioned files get cached indefinitely
            HttpUtil.setCachingHeaders(resp, true);
        } else {
            // Unversioned files get cached for 5 minutes by default, but this can be overridden
            // with a query parameter.
            int ttl = DEFAULT_CACHE_TTL;
            String ttlStr = params.getRequest().getParameter(Param.REFRESH.getKey());
            if (!Strings.isNullOrEmpty(ttlStr)) {
                try {
                    ttl = Integer.parseInt(ttlStr);
                } catch (NumberFormatException e) {
                    // Ignore malformed TTL value
                    if (LOG.isLoggable(Level.INFO)) {
                        LOG.logp(Level.INFO, classname, "onOkRenderingResultsStatus", MessageKeys.MALFORMED_TTL_VALUE,
                                new Object[]{ttlStr});
                    }
                }
            }
            HttpUtil.setCachingHeaders(resp, ttl, true);
        }
        resp.getWriter().print(getContentWithFinishedLoadingTrigger(params.getResults().getContent()));
    }

    private String getContentWithFinishedLoadingTrigger(String gadgetContent) {
        if (!gadgetContent.contains("wso2.gadgets.controls.finishedLoadingGadget()")) {
            String contents[] = gadgetContent.split("<script>gadgets\\.util\\.runOnLoadHandlers\\(\\);</script>");
            return contents[0] + "<script>wso2.gadgets.controls.finishedLoadingGadget();gadgets.util.runOnLoadHandlers();</script>" + contents[1];
        }
        return gadgetContent;
    }
}
