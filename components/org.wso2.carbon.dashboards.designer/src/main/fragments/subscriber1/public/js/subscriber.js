(function () {
    "use strict";
    function callbackPrint(topic, data, divId){
        $("#" + divId + " .subscriber1").text(topic + " : " + data);
    }

    portal.dashboards.subscribers['org.wso2.carbon.dashboards.designer.subscriber1'] = {
        _callback: callbackPrint,
    }
}());