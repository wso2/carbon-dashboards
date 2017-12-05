package org.wso2.carbon.dashboards.core.bean.widget;

import java.io.Serializable;

/**
 * Configuration bean class for generated widget configuration.
 */
public class GeneratedWidgetConfigs implements Serializable {
    private static final long serialVersionUID = 1L;
    private String name;
    private String id;
    private String chartConfig;
    private String providerConfig;

    public String getChartConfig() {
        return chartConfig;
    }

    public void setChartConfig(String chartConfig) {
        this.chartConfig = chartConfig;
    }

    public String getProviderConfig() {
        return providerConfig;
    }

    public void setProviderConfig(String providerConfig) {
        this.providerConfig = providerConfig;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
}
