(function () {
	'use strict';

	if(portal.dashboards.gadgets.SUBSCRIBER.pubsub.isSubscriber){
		pubsub.subscribe( portal.dashboards.gadgets.PUBLISHER.id, function(topic, data){
    		console.log( topic, data );
    		$('.messages').append(data + "<br/>");
		});
	}
})();