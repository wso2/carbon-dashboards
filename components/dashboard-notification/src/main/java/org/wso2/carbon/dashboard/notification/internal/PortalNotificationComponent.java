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
package org.wso2.carbon.dashboard.notification.internal;


import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.osgi.service.component.ComponentContext;
import org.wso2.carbon.dashboard.notification.BackUpTask;
import org.wso2.carbon.dashboard.notification.NotificationConstants;
import org.wso2.carbon.dashboard.notification.NotificationManagementException;
import org.wso2.carbon.dashboard.portal.core.datasource.DSDataSourceManager;
import org.wso2.carbon.ntask.common.TaskException;
import org.wso2.carbon.ntask.core.TaskInfo;
import org.wso2.carbon.ntask.core.TaskManager;
import org.wso2.carbon.ntask.core.service.TaskService;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

/**
 * @scr.component name="dashboard.notification" immediate="true"
 * @scr.reference name="ntask.component" interface="org.wso2.carbon.ntask.core.service.TaskService"
 * cardinality="1..1" policy="dynamic" bind="setTaskService" unbind="unsetTaskService"
 */

public class PortalNotificationComponent  {

    private static final Log log = LogFactory.getLog(org.wso2.carbon.dashboard.notification.internal.PortalNotificationComponent.class);

    protected void activate(ComponentContext ctx) {
        if (log.isDebugEnabled()) {
            log.debug("Activating Portal notification Component.");
        }
        try {
            DSDataSourceManager.getInstance();
            BackupConfiguration backupConfiguration = BackupConfiguration.getInstance();
            ServiceHolder.getTaskService().registerTaskType(NotificationConstants.PORTAL_NOTIFICATION_TASK);
            TaskManager taskManager = org.wso2.carbon.dashboard.notification.internal.ServiceHolder.getTaskService().getTaskManager(NotificationConstants.PORTAL_NOTIFICATION_TASK);
            taskManager.deleteTask(NotificationConstants.PORTAL_NOTIFICATION_BACKUP_TASK);
            TaskInfo.TriggerInfo triggerInfo = new TaskInfo.TriggerInfo(null, null,backupConfiguration.getInterval(), -1);
            triggerInfo.setDisallowConcurrentExecution(true);
            TaskInfo taskInfo = new TaskInfo(NotificationConstants.PORTAL_NOTIFICATION_BACKUP_TASK,
                    BackUpTask.class.getCanonicalName(), null, triggerInfo);
            taskManager.registerTask(taskInfo);

        } catch (TaskException exception) {
            log.error("Error while registering the task type : " + NotificationConstants.PORTAL_NOTIFICATION_TASK, exception);
        } catch (NotificationManagementException exception){
            log.error("Error while loading the back up task configurations from  "
                    + NotificationConstants.PORTAL_CONFIG_NAME, exception);
        } catch (Throwable throwable) {
            log.error("Error while loading the portal core component. ", throwable);
        }
    }

    protected void deactivate(ComponentContext ctx) {
    }
    protected void setTaskService(TaskService taskService) {
        org.wso2.carbon.dashboard.notification.internal.ServiceHolder.setTaskService(taskService);
    }
    protected void unsetTaskService(TaskService taskService) {
        org.wso2.carbon.dashboard.notification.internal.ServiceHolder.setTaskService(null);
    }



}

