package org.wso2.carbon.siddhi.apps.api.rest.config;

import org.wso2.carbon.analytics.idp.client.core.api.AnalyticsHttpClientBuilderService;
import org.wso2.carbon.config.provider.ConfigProvider;

public class DataHolder {
    private static DataHolder instance = new DataHolder();
    private ConfigProvider configProvider;
    private AnalyticsHttpClientBuilderService clientBuilderService;

    private DataHolder(){
    }

    public static DataHolder getInstance(){
        return instance;
    }

    public AnalyticsHttpClientBuilderService getClientBuilderService() {
        return clientBuilderService;
    }

    public void setClientBuilderService(AnalyticsHttpClientBuilderService clientBuilderService) {
        this.clientBuilderService = clientBuilderService;
    }

    public ConfigProvider getConfigProvider(){
        return this.configProvider;
    }

    public void setConfigProvider(ConfigProvider configProvider) {
        this.configProvider = configProvider;
    }
}
