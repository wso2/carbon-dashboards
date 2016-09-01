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

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.osgi.service.component.ComponentContext;
import org.wso2.carbon.dashboard.portal.core.HouseKeepingTask;
import org.wso2.carbon.dashboard.portal.core.DashboardPortalException;
import org.wso2.carbon.dashboard.portal.core.PortalConstants;
import org.wso2.carbon.dashboard.portal.core.datasource.DSDataSourceManager;
import org.wso2.carbon.ndatasource.core.DataSourceService;
import org.wso2.carbon.ntask.common.TaskException;
import org.wso2.carbon.ntask.core.TaskInfo;
import org.wso2.carbon.ntask.core.TaskManager;
import org.wso2.carbon.ntask.core.service.TaskService;

/**
 * @scr.component name="dashboard.portal.core" immediate="true"
 * @scr.reference name="ntask.component" interface="org.wso2.carbon.ntask.core.service.TaskService"
 * cardinality="1..1" policy="dynamic" bind="setTaskService" unbind="unsetTaskService"
 * @scr.reference name="datasource.service" interface="org.wso2.carbon.ndatasource.core.DataSourceService"
 * cardinality="1..1" policy="dynamic"  bind="setDataSourceService" unbind="unsetDataSourceService"
 */

public class PortalDSComponent {

    private static final Log log = LogFactory.getLog(PortalDSComponent.class);

    protected void activate(ComponentContext ctx) {
        if (log.isDebugEnabled()) {
            log.debug("Activating Portal Core Component.");
        }
        try {
            HouseKeepingConfiguration houseKeepingConfiguration = HouseKeepingConfiguration.getInstance();
            ServiceHolder.getTaskService().registerTaskType(PortalConstants.TASK_TYPE);
            TaskManager taskManager = ServiceHolder.getTaskService().getTaskManager(PortalConstants.TASK_TYPE);
            taskManager.deleteTask(PortalConstants.PORTAL_HOUSE_KEEPING_TASK);
            TaskInfo.TriggerInfo triggerInfo = new TaskInfo.TriggerInfo(null, null,
                    houseKeepingConfiguration.getInterval(), -1);
            triggerInfo.setDisallowConcurrentExecution(true);
            TaskInfo taskInfo = new TaskInfo(PortalConstants.PORTAL_HOUSE_KEEPING_TASK,
                    HouseKeepingTask.class.getCanonicalName(), null, triggerInfo);
            taskManager.registerTask(taskInfo);
        } catch (TaskException exception) {
            log.error("Error while registering the task type : " + PortalConstants.TASK_TYPE, exception);
        } catch (DashboardPortalException exception) {
            log.error("Error while loading the house keeping task configurations from  "
                    + PortalConstants.PORTAL_CONFIG_NAME, exception);
        } catch (Throwable throwable) {
            log.error("Error while loading the portal core component. ", throwable);
        }
    }

    protected void deactivate(ComponentContext ctx) {
    }

    protected void setTaskService(TaskService taskService) {
        ServiceHolder.setTaskService(taskService);
    }

    protected void unsetTaskService(TaskService taskService) {
        ServiceHolder.setTaskService(null);
    }

    protected void setDataSourceService(DataSourceService service) {
        ServiceHolder.setDataSourceService(service);
    }

    protected void unsetDataSourceService(DataSourceService service) {
        ServiceHolder.setDataSourceService(null);
    }
}
