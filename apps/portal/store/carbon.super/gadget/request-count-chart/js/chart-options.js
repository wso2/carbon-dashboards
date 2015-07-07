(function () {

    chartConfigs = function () {
        return {
            "legend": {
                "show": false
            },
            "series": {
                "stack": true,
                "lines": {
                    "show": true,
                    "fill": true
                }
            },
            "colors": ["#3da0ea", "#bacf0b", "#e7912a", "#4ec9ce", "#f377ab", "#ec7337", "#bacf0b", "#f377ab", "#3da0ea", "#e7912a", "#bacf0b"],
            "grid": {
                "show": true,
                "aboveData": false,
                "color": "#aaa",
                "backgroundColor": "#FFFFFF",
                "labelMargin": 8,
                "axisMargin": null,
                "markings": null,
                "borderWidth": 0.2,
                "borderColor": "#aaa",
                "minBorderMargin": null,
                "clickable": false,
                "hoverable": true,
                "autoHighlight": true,
                "mouseActiveRadius": 0.1
            },
            "yaxis": {

                "show": true,
                "position": "left",
                "mode": null,

                "color": null,
                "tickColor": null,

                "font": null,
                "min": null,
                "max": null,
                "autoscaleMargin": 0.05,

                "transform": null,
                "inverseTransform": null,

                "ticks": null,
                "tickLength": 0,
                "tickDecimals": 0,
                "tickFormatter": null,
                "tickLength": null,

                "labelWidth": null,
                "labelHeight": null,
                "reserveSpace": null,

                "axisLabel": "",
                "axisLabelUseCanvas": true,
                "axisLabelFontSizePixels": 14,
                "axisLabelFontFamily": "Arial",
                "axisLabelPadding": 5,

                "panRange": null,
                "zoomRange": false
            },
            "xaxis": {

                "show": true,
                "position": "bottom",
                "mode": "time",

                "color": null,
                "tickColor": null,

                "font": null,
                "min": null,
                "max": null,
                "autoscaleMargin": 0.1,

                "transform": null,
                "inverseTransform": null,

                "ticks": null,
                "tickDecimals": null,
                "tickFormatter": null,
                "tickLength": null,

                "labelWidth": null,
                "labelHeight": null,
                "reserveSpace": null,

                "axisLabel": "Time",
                "axisLabelUseCanvas": true,
                "axisLabelFontSizePixels": 12,
                "axisLabelFontFamily": "Arial",
                "axisLabelPadding": 5,

                "panRange": null,

                "rotateTicks": 0
            },
            "pan": {
                "interactive": true
            },
            "zoom": {
                "interactive": true
            },
            "selection": {
                "mode": null
            }
        }
    }
}());
