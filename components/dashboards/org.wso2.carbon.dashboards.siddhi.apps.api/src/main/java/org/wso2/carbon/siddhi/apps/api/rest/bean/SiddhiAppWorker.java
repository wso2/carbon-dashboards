/*
 *   Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *   WSO2 Inc. licenses this file to you under the Apache License,
 *   Version 2.0 (the "License"); you may not use this file except
 *   in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing,
 *   software distributed under the License is distributed on an
 *   "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *   KIND, either express or implied.  See the License for the
 *   specific language governing permissions and limitations
 *   under the License.
 *
 */

package org.wso2.carbon.siddhi.apps.api.rest.bean;

/**
 * Bean class to hold appName and deployed worker of a SiddhiApp
 */
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
