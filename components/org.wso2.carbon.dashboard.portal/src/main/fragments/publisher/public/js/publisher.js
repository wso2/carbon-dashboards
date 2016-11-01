(function () {
	'use strict';

	if(portal.dashboards.gadgets.PUBLISHER.pubsub.isPublisher){
		portal.dashboards.publishers.push(portal.dashboards.gadgets.PUBLISHER.id);
	}

	$(".send").click(function() {
  		pubsub.publish($(".msg").val(), portal.dashboards.gadgets.PUBLISHER.id);
	});

})();