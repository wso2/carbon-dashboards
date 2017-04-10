(function () {
    "use strict";
    function _callbackPrint(topic, data){
    	$("#subscriber1").text(data);
    }

    portal.dashboards.subscribers.subscriber1 = {
    	_callback:_callbackPrint
    }
}());