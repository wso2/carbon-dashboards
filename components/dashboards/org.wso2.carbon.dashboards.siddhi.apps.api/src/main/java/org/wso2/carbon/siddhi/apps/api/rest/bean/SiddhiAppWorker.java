package org.wso2.carbon.siddhi.apps.api.rest.bean;

public class SiddhiAppWorker implements Comparable<SiddhiAppWorker>{
    private String appName;
    private String worker;

    public SiddhiAppWorker() {
    }

    public SiddhiAppWorker(String appName, String worker) {
        this.appName = appName;
        this.worker = worker;
    }

    public String getAppName() {
        return appName;
    }

    public void setAppName(String appName) {
        this.appName = appName;
    }

    public String getWorker() {
        return worker;
    }

    public void setWorker(String worker) {
        this.worker = worker;
    }

    @Override
    public int compareTo(SiddhiAppWorker s) {
        return this.getAppName().compareTo(s.appName);
    }

    @Override
    public String toString() {
        return "SiddhiAppWorker{" +
                "appName='" + appName + '\'' +
                ", worker='" + worker + '\'' +
                '}';
    }
}