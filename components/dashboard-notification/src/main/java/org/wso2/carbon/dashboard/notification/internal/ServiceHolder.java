package org.wso2.carbon.dashboard.notification.internal;

import org.wso2.carbon.ndatasource.core.DataSourceService;
import org.wso2.carbon.ntask.core.service.TaskService;

public class ServiceHolder {
    private static TaskService taskService;

    public static TaskService getTaskService() {
        return taskService;
    }

    public static void setTaskService(TaskService taskService) {
        ServiceHolder.taskService = taskService;
    }
}
