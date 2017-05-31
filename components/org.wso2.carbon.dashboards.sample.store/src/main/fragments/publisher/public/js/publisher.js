(function () {
    "use strict";
    var bind = function (containerId) {
        $("#" + containerId + " .sendMsg").click(function() {
           var instanceID = $(this).closest(".dashboard-component-box").attr("id");
           //TODO Remove following if else after moving to the common component
           if (portal.dashboards.functions.designer) {
                portal.dashboards.functions.designer.publishToTopics($("#" + containerId + " .msg").val(), instanceID);
           } else {
                portal.dashboards.functions.view.publishToTopics($("#" + containerId + " .msg").val(), instanceID);
           }
        });
    }

    portal.dashboards.widgets['org.wso2.carbon.dashboards.sample.store.publisher'].actions = {
        bind:bind
    }
}());
