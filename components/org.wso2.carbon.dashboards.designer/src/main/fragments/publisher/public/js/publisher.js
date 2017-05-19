(function () {
    "use strict";
    var bind = function (containerId) {
	    $("#" + containerId + " .sendMsg").click(function() {
	       var instanceID = $(this).closest(".dashboard-component-box").attr("id");
	        portal.dashboards.functions.designer.publishToTopics($("#" + containerId + " .msg").val(), instanceID);
	    });
    }

    portal.dashboards.widgets['org.wso2.carbon.dashboards.designer.publisher'].actions = {
        bind:bind
    }
}());
