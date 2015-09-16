	var BAR_CHART_TYPE = "bar";
	var LINE_CHART_TYPE = "line";
	var AREA_CHART_TYPE = "area";
	var TABLE_CHART_TYPE = "tabular";
	var ARC_CHART_TYPE = "arc";
	var SCATTER_CHART_TYPE = "scatter";
	var MAP_CHART_TYPE = "map";

	//initialise all chart types supported by gadget generation wizard
	var charts= [
		{
		    name: 'Bar',
		    type: BAR_CHART_TYPE,
		    value: new BarChart()
		}, {
		    name: 'Line',
		    type: LINE_CHART_TYPE,
		    value: new LineChart()
		}, {
		    name: 'Area',
		    type: AREA_CHART_TYPE,
		    value: new AreaChart()
		}, {
		    name: 'Tabular',
		    type: TABLE_CHART_TYPE,
		    value: new TableChart()
		}, {
		    name: 'Arc',
		    type: ARC_CHART_TYPE,
		    value: new ArcChart()
		}, {
		    name: 'Scatter',
		    type: SCATTER_CHART_TYPE,
		    value: new ScatterChart()
		}, {
		    name: 'Map',
		    type: MAP_CHART_TYPE,
		    value: new MapChart()
		}
	];

	var chartConfig;

	var initCharts = function(columns) {
	    charts.forEach(function(item,i){
	    	var chart = item.value;
	    	chart.bindConfigs(columns);
	    });
	};

	var drawChart = function(config, dataTable) {
	    charts.forEach(function(item,i){
	    	if(config.chartType === item.type) {
	    		var chart = item.value;
	    		chart.draw(config,dataTable);
	    	}
	    });
	};

	var configureChart = function(config) {
	    charts.forEach(function(item,i){
	    	if(config.chartType === item.type) {
	    		var chart = item.value;
	    		chart.configure(config);
	    	}
	    });
	};

	function genericConfigure(config) {
		var xAxis = getColumnIndex($("#xAxis").val());
	    var yAxis = getColumnIndex($("#yAxis").val());
	    var newConfig = {
	        "yAxis": yAxis,
	        "xAxis": xAxis,
	        "width": config.width,
	        "height": config.height,
	        "chartType": config.chartType
	    };
	    chartConfig = newConfig;
	}

	function genericDraw(config, dataTable) {
	    var chart = igviz.setUp("#chartDiv", config, dataTable);
	    chart.setXAxis({
	        "labelAngle": -35,
	        "labelAlign": "right",
	        "labelDy": 0,
	        "labelDx": 0,
	        "titleDy": 25
	    }).setYAxis({
	        "titleDy": -30
	    })
	    chart.plot(dataTable.data);
	};

	/////////////////////////////////////////// Bar chart //////////////////////////////////////////
	function BarChart() {};

	BarChart.prototype.bindConfigs = function(columns) {
	    console.log("****** Initializing BarChart *** ");
	    $("#xAxis").empty();
	    $("#yAxis").empty();
	    columns.forEach(function(column, i) {
	        $("#xAxis").append($('<option></option>')
	            .val(column.name)
	            .html(column.name)
	            .attr("data-type", column.type));
	        $("#yAxis").append($('<option></option>')
	            .val(column.name)
	            .html(column.name)
	            .attr("data-type", column.type));
	    });
	};

	BarChart.prototype.configure = function(config) {
		genericConfigure(config);
	};

	BarChart.prototype.draw = function(config, dataTable) {
	    genericConfigure(config);
	    console.log("Bar:: X " + chartConfig.xAxis + " Y " + chartConfig.yAxis);
	    dataTable.metadata.types[chartConfig.xAxis] = "C";
	    genericDraw(chartConfig, dataTable);
	};

	///////////////////////////////////// Line chart /////////////////////////////////////////////
	function LineChart() {};

	LineChart.prototype.bindConfigs = function(columns) {
		console.log("****** Initializing LineChart *** ");
		$("#xAxis").empty();
		$("#yAxises").empty();
	    columns.forEach(function(column, i) {
	        $("#xAxis").append($('<option></option>')
	            .val(column.name)
	            .html(column.name)
	            .attr("data-type", column.type));
	        $("#yAxises").append($('<option></option>')
	            .val(column.name)
	            .html(column.name)
	            .attr("data-type", column.type));
	    });
	};

	LineChart.prototype.configure = function(config) {
		var axis = [];
	    $('#yAxises :selected').each(function(i, selected) {
	        axis[i] = getColumnIndex($(selected).text());
	    });
	    config.yAxis = axis;
	    config.xAxis = getColumnIndex($("#xAxis").val());
	    config.interpolationMode=$("#interpolationMode").val();
	    chartConfig = config;
	};

	LineChart.prototype.draw = function(config, dataTable) {
	    this.configure(config);
	    genericDraw(config, dataTable);
	};

	///////////////////////////////////////////// Area chart ///////////////////////////////////////////////////
	function AreaChart() {};

	AreaChart.prototype.bindConfigs = function(columns) {
		console.log("****** Initializing AreaChart *** ");
	    $("#xAxis").empty();
	    $("#yAxis").empty();
	    columns.forEach(function(column, i) {
	        $("#xAxis").append($('<option></option>')
	            .val(column.name)
	            .html(column.name)
	            .attr("data-type", column.type));
	        $("#yAxis").append($('<option></option>')
	            .val(column.name)
	            .html(column.name)
	            .attr("data-type", column.type));
	    });
	};

	AreaChart.prototype.configure = function(config) {
		genericConfigure(config);
	};

	AreaChart.prototype.draw = function(config, dataTable) {
	    genericConfigure(config);
	    console.log("Area:: X " + chartConfig.xAxis + " Y " + chartConfig.yAxis);
	    // dataTable.metadata.types[chartConfig.xAxis] = "C";
	    genericDraw(chartConfig, dataTable);
	};

	////////////////////////////////////////////////// Table chart /////////////////////////////////////////
	function TableChart() {};

	TableChart.prototype.bindConfigs = function(columns) {
		console.log("****** Initializing TableChart *** ");
	    columns.forEach(function(column, i) {
	        $("#column").append($('<option></option>')
	            .val(column.name)
	            .html(column.name)
	            .attr("data-type", column.type));
	    });
	};

	TableChart.prototype.configure = function(config) {
		config.chartType = "tabular";
	    config.xAxis = getColumnIndex($("#column").val());;
	    var style = $("#tableStyle").val();
	    if (style === "color") {
	        config.colorBasedStyle = true;
	    } else if (style === "font") {
	        config.fontBasedStyle = true;
	    }
	    chartConfig = config;
	};

	TableChart.prototype.draw = function(config, dataTable) {
	    this.configure(config);
	    var chart = igviz.draw("#chartDiv", chartConfig, dataTable);
	    chart.plot(dataTable.data);
	};

	//////////////////////////////////////////////// Scatter Chart ////////////////////////////////////////////////
	function ScatterChart() {};

	ScatterChart.prototype.bindConfigs = function(columns) {
		$("#xAxis").empty();
	    $("#yAxis").empty();
	    columns.forEach(function(column, i) {
	        $("#xAxis").append($('<option></option>')
	            .val(column.name)
	            .html(column.name)
	            .attr("data-type", column.type));
	        $("#yAxis").append($('<option></option>')
	            .val(column.name)
	            .html(column.name)
	            .attr("data-type", column.type));
	        $("#pointColor").append($('<option></option>')
	            .val(column.name)
	            .html(column.name)
	            .attr("data-type", column.type));
	        $("#pointSize").append($('<option></option>')
	            .val(column.name)
	            .html(column.name)
	            .attr("data-type", column.type));
	    });
	};

	ScatterChart.prototype.configure = function(config) {
		var xAxis = getColumnIndex($("#xAxis").val());
	    var yAxis = getColumnIndex($("#yAxis").val());
	    var pointSize = getColumnIndex($("#pointSize").val());
	    var pointColor = getColumnIndex($("#pointColor").val());
	    console.log("Scatter:: X " + xAxis + " Y " + yAxis + " pointColor: " + 
	    	pointColor + " pointSize: " + pointSize);
	    // dataTable.metadata.types[xAxis] = "C";
	    var newConfig = {
	        "yAxis": yAxis,
	        "xAxis": xAxis,
	        "pointColor": pointColor,
			"pointSize": pointSize,
	        "width": config.width,
	        "height": config.height,
	        "maxColor":"#ffff00",
            "minColor":"#ff00ff",
	        "chartType": config.chartType
	    };
	    chartConfig = newConfig;
	};

	ScatterChart.prototype.draw = function(config, dataTable) {
		this.configure(config);
	    genericDraw(chartConfig, dataTable);
	};

	//////////////////////////////////////////// Arc chart ////////////////////////////////////////////////////////
	function ArcChart() {};

	ArcChart.prototype.bindConfigs = function(columns) {
		columns.forEach(function(column, i) {
	        $("#percentage").append($('<option></option>')
	            .val(column.name)
	            .html(column.name)
	            .attr("data-type", column.type));
	    });
	};

	ArcChart.prototype.configure = function(config) {
		config.percentage = getColumnIndex($("#percentage").val());
		chartConfig = config;
	};

	ArcChart.prototype.draw = function(config, dataTable) {
		this.configure(config);
		igviz.draw("#chartDiv", config, dataTable);
	};

	///////////////////////////////////////////////////// Map ///////////////////////////////////////////////////////////
	function MapChart() {};

	MapChart.prototype.bindConfigs = function(columns) {
		// body...
	};

	MapChart.prototype.configure = function(config) {
		var region = 5;
		if ($("#region").val().trim() != "") {
		    region = $("#region").val();
		}
		config.xAxis = getColumnIndex($("#xAxis").val());
        config.yAxis = getColumnIndex($("#yAxis").val())
        config.region = region;
        if ($("#legendGradientLevel").val().trim() == ""){
            config.legendGradientLevel = 5;
        } else {
            config.legendGradientLevel = $("#legendGradientLevel").val();
        }
        chartConfig = config;
	};

	MapChart.prototype.draw = function(config, dataTable) {
		this.configure(config);
		var chart = igviz.draw("#chartDiv", chartConfig, dataTable);
        chart.plot(dataTable.data,null,0);
	};

	

	