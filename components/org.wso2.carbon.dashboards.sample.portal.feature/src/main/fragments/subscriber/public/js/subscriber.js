(function () {
    'use strict';

    widget.renderer.setWidgetName(portal.dashboards.widgets.SUBSCRIBER.id, portal.dashboards.widgets.SUBSCRIBER.name);

    if (portal.dashboards.widgets.SUBSCRIBER.pubsub.isSubscriber) {
        pubsub.subscribe(portal.dashboards.widgets.PUBLISHER.id, function (topic, data) {
            console.log(topic, data);
            $('.messages').append(data + "<br/>");
        });
    }
}());