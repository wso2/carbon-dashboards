(function () {
    "use strict";

    var render = function (divId) {
        var data = [
            {
                "metadata": {
                    "names": ["Hits", "site"],
                    "types": ["linear", "ordinal"]
                },
                "data": [
                    [103025, "Facebook"],
                    [98253, "Google"],
                    [10124, "Yahoo"],
                    [68598, "Youtube"]
                ]
            }
        ];

        var width = document.getElementById(divId).offsetWidth; //canvas width
        var height = 270;   //canvas height

        var config = {
            charts: [{type: "arc", x: "Hits", color: "site", mode: "pie"}],
            width: width,
            height: height
        };

        widget.renderer.setWidgetName(portal.dashboards.widgets['org.wso2.carbon.dashboards.sample.store.pie-chart'].info.id,
            portal.dashboards.widgets['org.wso2.carbon.dashboards.sample.store.pie-chart'].info.name);
        var lineChart = new vizg(data, config);
        lineChart.draw("#" + divId);
    }

    portal.dashboards.widgets['org.wso2.carbon.dashboards.sample.store.pie-chart'].actions = {
        render: render
    }
}());