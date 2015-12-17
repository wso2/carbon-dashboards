var gadgetConfig = {
    "id": "ds-sample-smart-home-data",
    "title": "ds-sample-smart-home-data",
    "type": "batch",
    "columns": [{
        "name": "house_id",
        "type": "INT"
    },{
        "name": "metro_area",
        "type": "STRING"
    },{
        "name": "state",
        "type": "STRING"
    },{
        "name": "device_id",
        "type": "INT"
    },{
        "name": "power_reading",
        "type": "FLOAT"
    }, {
        "name": "is_peak",
        "type": "BOOLEAN"
    }],
    "maxUpdateValue": 0,
    "chartConfig": {
        "yAxis": [4],
        "xAxis": 1,
        "interpolationMode": "monotone"
    },
    "domain": "carbon.super"
};
var getChartType = function(){
        var prefs = new gadgets.Prefs();
    return  prefs.getString('ChartType');
};
gadgetConfig.chartConfig["chartType"] = getChartType();

