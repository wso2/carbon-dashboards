package org.wso2.carbon.dashboards.api;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.wso2.carbon.dashboards.core.provider.MetadataProvider;

/**
 * This is the MetaDataProviderComponent for dashboards
 */
@Component(name = "org.wso2.carbon.dashboards.api",
        immediate = true)
public class MetaDataProviderComponent {

    @Reference(name = "metadataProvider",
            service = MetadataProvider.class,
            cardinality = ReferenceCardinality.MANDATORY,
            policy = ReferencePolicy.DYNAMIC,
            unbind = "unsetMetadataProvider")
    public void setMetadataProvider(MetadataProvider metadataProvider) {
        DataHolder.getInstance().setMetadataProvider(metadataProvider);
    }

    public void unsetMetadataProvider(MetadataProvider metadataProvider) {
        DataHolder.getInstance().setMetadataProvider(null);
    }
}
