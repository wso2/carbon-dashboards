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

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.wso2.carbon.dashboard.portal.core.internal.HouseKeepingConfiguration;
import org.wso2.carbon.ntask.core.Task;
import org.wso2.carbon.utils.CarbonUtils;

import java.io.File;
import java.util.Map;

public class HouseKeepingTask implements Task {
    private static final Log log = LogFactory.getLog(HouseKeepingTask.class);

    @Override
    public void setProperties(Map<String, String> map) {
    }

    @Override
    public void init() {
        String portalLocation = CarbonUtils.getCarbonRepository() + File.separator + PortalConstants.PORTAL;
        try {
            String houseKeepingLocation = HouseKeepingConfiguration.getInstance().getLocation();
            if (houseKeepingLocation.startsWith("/")) {
                houseKeepingLocation = portalLocation + houseKeepingLocation;
            } else {
                houseKeepingLocation = portalLocation + File.separator + houseKeepingLocation;
            }
            deleteFiles(houseKeepingLocation, HouseKeepingConfiguration.getInstance().getMaxFileLifeTime());
        } catch (DashboardPortalException e) {
            log.error("Error while performing house keeping task for the portal application. ", e);
        }
    }

    private void deleteFiles(String location, int maxFileLifeTime){
        File dir = new File(location);
        long timeStamp = System.currentTimeMillis() - maxFileLifeTime * 60 * 1000;
        showFiles(dir.listFiles(), timeStamp);
    }

    private void showFiles(File[] files, long maxTimeStamp ) {
        for (File file : files) {
            if (file.isDirectory()) {
                System.out.println("Directory: " + file.getName());
                showFiles(file.listFiles(), maxTimeStamp);
            } else {
                if (file.lastModified() < maxTimeStamp){
                    if (!file.delete()){
                        log.warn("Unable to delete the file : "+ file.getPath() + "during the house keeping task " +
                                "for the portal application");
                    }
                }
            }
        }
    }

    @Override
    public void execute() {

    }
}
