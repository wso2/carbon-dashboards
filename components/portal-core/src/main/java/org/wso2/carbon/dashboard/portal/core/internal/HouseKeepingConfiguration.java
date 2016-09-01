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
package org.wso2.carbon.dashboard.portal.core.internal;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.wso2.carbon.dashboard.portal.core.DashboardPortalException;
import org.wso2.carbon.dashboard.portal.core.PortalConstants;
import org.wso2.carbon.dashboard.portal.core.PortalUtils;
import org.wso2.carbon.utils.CarbonUtils;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;

public class HouseKeepingConfiguration {
    private static HouseKeepingConfiguration instance;
    private int interval;
    private int maxFileLifeTime;
    private String location;

    private static final int DEFAULT_INTERVAL = 60;
    private static final int DEFAULT_MAX_FILE_LIFE_TIME = 60;
    private static final String DEFAULT_LOCATION = File.separator + "temp" + File.separator;

    public static HouseKeepingConfiguration getInstance() throws DashboardPortalException {
        if (instance == null){
            synchronized (HouseKeepingConfiguration.class){
                if (instance == null){
                    instance = new HouseKeepingConfiguration();
                }
            }
        }
        return instance;
    }

    private HouseKeepingConfiguration() throws DashboardPortalException {
        this.interval = DEFAULT_INTERVAL;
        this.maxFileLifeTime = DEFAULT_MAX_FILE_LIFE_TIME;
        this.location = DEFAULT_LOCATION;
        try {
            JSONObject houseKeepingConfig = PortalUtils.getConfiguration(PortalConstants.HOUSE_KEEPING_CONFIG_PROPERTY);
            this.interval = Integer.parseInt(houseKeepingConfig.
                    get(PortalConstants.HOUSE_KEEPING_INTERVAL_CONFIG_PROPERTY).toString()) * 60 * 1000;
            this.maxFileLifeTime = Integer.parseInt(houseKeepingConfig.
                    get(PortalConstants.HOUSE_KEEPTING_MAX_FILE_LIFE_TIME_CONFIG_PROPERTY).toString());
            this.location = houseKeepingConfig.get(PortalConstants.HOUSE_KEEPING_LOCATION).
                    toString().replace("/", File.separator);
        } catch (IOException e) {
            throw new DashboardPortalException("Error while loading the "+ PortalConstants.PORTAL_CONFIG_NAME + ". ", e);
        } catch (ParseException e) {
            throw new DashboardPortalException("Error while loading the "+ PortalConstants.PORTAL_CONFIG_NAME + ". ", e);
        }
    }

    public int getInterval() {
        return interval;
    }

    public int getMaxFileLifeTime() {
        return maxFileLifeTime;
    }

    public String getLocation() {
        return location;
    }
}
