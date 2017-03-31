(function () {
    "use strict";
    var data = [
        {
            "metadata": {
                "names": ["Country", "Area", "GDP", "Inflation", "Life.expect", "Military", "Pop.growth", "Unemployment"],
                "types": ['ordinal', 'linear', 'linear', 'linear', 'linear', 'linear', 'linear', 'linear']
            },
            "data": [
                ["Austria", 83871, 41600, 3.5, 79.91, 0.8, 0.03, 4.2],
                ["Belgium", 30528, 37800, 3.5, 79.65, 1.3, 0.06, 7.2],
                ["Bulgaria", 110879, 13800, 4.2, 73.84, 2.6, -0.8, 9.6],
                ["Croatia", 56594, 18000, 2.3, 75.99, 2.39, -0.09, 17.7],
                ["Czech Republic", 78867, 27100, 1.9, 77.38, 1.15, -0.13, 8.5],
                ["Denmark", 43094, 37000, 2.8, 78.78, 1.3, 0.24, 6.1],
                ["Estonia", 45228, 20400, 5, 73.58, 2, -0.65, 12.5],
                ["Finland", 338145, 36000, 3.3, 79.41, 2, 0.07, 7.8],
                ["Germany", 357022, 38100, 2.5, 80.19, 1.5, -0.2, 6],
                ["Greece", 131957, 26300, 3.3, 80.05, 4.3, 0.06, 17.4],
                ["Hungary", 93028, 19600, 3.9, 75.02, 1.75, -0.18, 10.9],
                ["Iceland", 103000, 38100, 4, 81, 0, 0.67, 7.4],
                ["Ireland", 70273, 40800, 2.6, 80.32, 0.9, 1.11, 14.4],
                ["Italy", 301340, 30500, 2.9, 81.86, 1.8, 0.38, 8.4],
                ["Latvia", 64589, 16800, 4.4, 72.93, 1.1, -0.6, 12.8]
            ]
        }
    ];

    var width = document.getElementById("bar").offsetWidth; //canvas width
    var height = 270;   //canvas height
    var config = {
        x: "Country",
        charts: [
            {type: "bar", range: "true", y: "Area", color: "GDP"}
        ],
        maxLength: 50,
        width: width,
        height: height
    };

    widget.renderer.setWidgetName(portal.dashboards.widgets.BARCHART.id, portal.dashboards.widgets.BARCHART.name);
    var lineChart = new vizg(data, config);
    lineChart.draw("#bar");
}());