package org.wso2.carbon.siddhi.apps.api.rest.config;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ConfigReader {

    private static final Logger log = LoggerFactory.getLogger(ConfigReader.class);
    private static final String USER_NAME = "username";
    private static final String PASSWORD = "password";

    private static final String WORKER_NODES="workerNodes";
    private static final String COMPONENT_NAMESPACE = "wso2.dashboard.datasearch";
    private  Map<String,Object> configs = readConfigs();


    private  static Map<String, Object> readConfigs(){
        try{
            return (Map<String,Object>) DataHolder.getInstance()
                    .getConfigProvider().getConfigurationObject(COMPONENT_NAMESPACE);
        }catch (Exception e){
            log.error("Failed to read deplyment.yaml file",e);
            e.printStackTrace();
        }
        return new HashMap<>();
    }


    public String getUserName() {
        Object username = configs.get(USER_NAME);
        return username != null ? username.toString() : "admin";
    }

    public String getPassword() {
        Object password = configs.get(PASSWORD);
        return password != null ? password.toString() : "admin";
    }

    public ArrayList getWorkerList(){
        return ((ArrayList) configs.get(WORKER_NODES));
    }
}
