(function () {
    'use strict';

    widget.renderer.setWidgetName(portal.dashboards.widgets.PUBLISHER.id, portal.dashboards.widgets.PUBLISHER.name);

    if (portal.dashboards.widgets.PUBLISHER.pubsub.isPublisher) {
        portal.dashboards.publishers.push(portal.dashboards.widgets.PUBLISHER.id);
    }

    $(".send").click(function () {
        pubsub.publish($(".msg").val(), portal.dashboards.widgets.PUBLISHER.id);
    });
}());