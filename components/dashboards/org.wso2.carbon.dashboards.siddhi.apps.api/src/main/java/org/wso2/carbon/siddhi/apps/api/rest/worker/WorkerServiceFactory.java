package org.wso2.carbon.siddhi.apps.api.rest.worker;

import org.wso2.carbon.siddhi.apps.api.rest.config.DataHolder;

public class WorkerServiceFactory {

    public static WorkerServiceStub getWorkerHttpsClient(String url, String username, String password){
        return DataHolder.getInstance().getClientBuilderService().build(username,password,
                10000,10000,WorkerServiceStub.class,url);
    }
}
