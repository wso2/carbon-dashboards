package org.wso2.carbon.siddhi.apps.api.rest.worker;

import feign.Headers;
import feign.Param;
import feign.RequestLine;
import feign.Response;

public interface WorkerServiceStub {

    @RequestLine("GET /siddhi-apps")
    @Headers("Content-Type: application/json")
    Response getSiddhiAppNames();

    @RequestLine("GET /siddhi-apps/{appName}")
    @Headers("Content-Type: application/json")
    Response getSiddhiAppContent(@Param("appName") String appName);
}
