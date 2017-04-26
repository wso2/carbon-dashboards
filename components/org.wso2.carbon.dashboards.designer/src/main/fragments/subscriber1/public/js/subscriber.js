(function () {
    "use strict";
    function _callbackPrint(topic, data){
    	$("#subscriber1").text(data);
    }

    portal.dashboards.subscribers['org.wso2.carbon.dashboards.designer.subscriber1'] = {
    	_callback:_callbackPrint
    }
}());