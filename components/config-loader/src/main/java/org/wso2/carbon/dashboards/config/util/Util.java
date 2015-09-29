package org.wso2.carbon.dashboards.config.util;

import java.io.File;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.FileNotFoundException;
import java.io.IOException;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.wso2.carbon.utils.CarbonUtils;
import org.wso2.carbon.registry.core.Collection;
import org.wso2.carbon.registry.core.Registry;
import org.wso2.carbon.registry.core.RegistryConstants;
import org.wso2.carbon.registry.core.Resource;
import org.wso2.carbon.registry.core.config.RegistryContext;
import org.wso2.carbon.registry.core.exceptions.RegistryException;
import org.wso2.carbon.registry.core.session.CurrentSession;
import org.wso2.carbon.registry.core.utils.RegistryUtils;
import org.wso2.carbon.utils.FileUtil;

public class Util {
    private static final Log log = LogFactory.getLog(Util.class);

    public static void loadPortalConfigs(Registry configRegistry, int tenantId) {

        try {
            String [] configFiles = ConfigurationConstants.configFiles;
            String path = ConfigurationConstants.configRegistryPath;
            for (String config : configFiles) {
                Resource r = configRegistry.newResource();
                String rPath = "/" + path + "/" + config;
                if (!configRegistry.resourceExists(rPath)) {
                    String resourceLocation = "/" + config;
                    r.setContentStream(Util.class.getResourceAsStream(resourceLocation));
                    r.setMediaType(ConfigurationConstants.jsonMediaType);
                    configRegistry.put(rPath, r);
                }
            }
        } catch (RegistryException e) {
            log.error("Failed to find the registry.xml", e);
        }
    }
}