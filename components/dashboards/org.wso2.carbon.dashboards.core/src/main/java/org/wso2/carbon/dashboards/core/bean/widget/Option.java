/*
 *
 * Conversation opened. 2 messages. All messages read.
 *
 * Skip to content
 * Using WSO2, Inc. Mail with screen readers
 * Click here to enable desktop notifications for WSO2, Inc. Mail.   Learn more  Hide
 *
 * Fwd: Copyright Template of WSO2 for IntelliJ
 * Inbox
 * 	x
 * 1. Me
 * 	x
 * Dilini Muthumala <dilini@wso2.com>
 *
 * AttachmentsJan 24
 *
 * to me
 *
 * ---------- Forwarded message ----------
 * From: Gobinath Loganathan <gobinath@wso2.com>
 * Date: Thu, Jul 28, 2016 at 10:55 AM
 * Subject: Copyright Template of WSO2 for IntelliJ
 * To: Sirojan Tharmakulasingam <sirojan@wso2.com>, Prakhash Sivakumar <prakhash@wso2.com>, Dilini Muthumala <dilini@wso2.com>, Anoukh Jayawardena <anoukh@wso2.com>
 *
 *
 * Hi,
 * According to the mail thread Issue With WSO2 License Header in Engineering group, the attached copyright template is the correct one to use.
 *
 * To add the template to IntelliJ:
 * Inline image 1
 *
 * For more details: [1]
 *
 * [1] https://groups.google.com/a/wso2.com/forum/#!topic/engineering-group/Ga4YOPxMQpw/discussion
 *
 *
 *
 * Thanks & Regards,
 * Gobinath
 * Attachments area
 * Irindu Nugawela <irindu@wso2.com>
 *
 * Jan 24
 *
 * to Dilini
 * Thank you very much Akka
 *
 * Click here to Reply or Forward
 * Using 23.44 GB
 * Manage
 * Program Policies
 * Powered by
 * Google
 * Last account activity: 54 minutes ago
 * Details
 *
 *
 *
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 * Intellij Copyright Template.txt
 * Displaying Intellij Copyright Template.txt.
 */
package org.wso2.carbon.dashboards.core.bean.widget;

import java.util.List;

/**
 * Configuration bean class for options in widget conf file.
 */
public class Option {

    enum Types {
        TypeText, TypeEnum, TypeBoolean
    }

    private String id;
    private String title;
    private Types type;
    private List<String> possibleValues;
    private Object defaultData;

    public String getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public Types getType() {
        return type;
    }

    public Object getDefaultData() {
        return defaultData;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setType(Types type) {
        this.type = type;
    }
    public void setDefaultData(Object defaultData) {
        this.defaultData = defaultData;
    }

    public void setPossibleValues(List<String> possibleValues) {
        this.possibleValues = possibleValues;
    }

    public List<String> getPossibleValues() {
        return this.possibleValues;
    }


}

