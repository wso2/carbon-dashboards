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

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.wso2.carbon.utils.CarbonUtils;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;

/**
 * To handle common utils functions in portal
 */
public class PortalUtils {

    /**
     * To get the configuration for the particular property
     *
     * @param propertyName Property to get the configuration
     * @return Property configuration
     * @throws IOException
     * @throws ParseException
     */
    public static JSONObject getConfiguration(String propertyName) throws IOException, ParseException {
        String configLocation =
                CarbonUtils.getCarbonConfigDirPath() + File.separator + PortalConstants.PORTAL_CONFIG_LOCATION;
        JSONParser jsonParser = new JSONParser();
        JSONObject portalConfig = (JSONObject) jsonParser.parse(new FileReader(configLocation));
        return (JSONObject) portalConfig.get(propertyName);
    }
}
