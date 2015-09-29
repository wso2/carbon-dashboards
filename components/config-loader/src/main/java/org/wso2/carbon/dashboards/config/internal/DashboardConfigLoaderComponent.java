package org.wso2.carbon.dashboards.config.internal;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceRegistration;
import org.osgi.service.component.ComponentContext;
import org.wso2.carbon.registry.core.service.RegistryService;
import org.wso2.carbon.utils.Axis2ConfigurationContextObserver;
import org.wso2.carbon.dashboards.config.util.*;
import org.wso2.carbon.context.PrivilegedCarbonContext;
import org.wso2.carbon.registry.core.exceptions.RegistryException;
import org.wso2.carbon.registry.core.internal.RegistryCoreServiceComponent;

/**
 * @scr.component name="org.wso2.carbon.dashboards.config.services" immediate="true"
 * @scr.reference name="registry.service"
 * interface="org.wso2.carbon.registry.core.service.RegistryService"
 * cardinality="1..1" policy="dynamic"  bind="setRegistryService" unbind="unsetRegistryService"
**/



public class DashboardConfigLoaderComponent {
    private static final Log log = LogFactory.getLog(DashboardConfigLoaderComponent.class);

    protected void activate(ComponentContext componentContext) throws RegistryException {
        BundleContext bundleCtx = componentContext.getBundleContext();
        int tenantId = PrivilegedCarbonContext.getThreadLocalCarbonContext().getTenantId();
        RegistryService service = RegistryCoreServiceComponent.getRegistryService();
        Util.loadPortalConfigs(service.getConfigSystemRegistry(tenantId), tenantId);
    }

    protected void setRegistryService(RegistryService registryService) {
        if (log.isDebugEnabled()) {
            log.debug("Registry service initialized");
        }
    }

    protected void unsetRegistryService(RegistryService registryService) {
        if (log.isDebugEnabled()) {
            log.debug("Registry service unset");
        }
    }

}