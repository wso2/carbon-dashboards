var datasource, datasourceType;
var previewData = [];
var columns = [];
var done = false;
var isPaginationSupported = true;
var selectedTableCoulumns = [];
var defaultTableColumns = [];

///////////////////////////////////////////// event handlers //////////////////////////////////////////
$(document).ready(function() {
    // $("#dsList").select2({
    //     placeholder: "Select a datasource",
    //     templateResult: formatDS
    // });
});

function formatDS(item) {
    if (!item.id) {
        return item.text;
    }
    var type = $(item.element).data("type");
    var $item;
    if (type === "realtime") {
        $item = $('<div><i class="fa fa-bolt"> </i> ' + item.text + '</div>');
    } else {
        $item = $('<div><i class="fa fa-clock-o"> </i> ' + item.text + '</div>');
    }
    // var $item = $(
    //     '<span><img src="vendor/images/flags/' + item.element.value.toLowerCase() + '.png" class="img-flag" /> ' + item.text + '</span>'
    //   );
    return $item;
};

$('#rootwizard').bootstrapWizard({
    onTabShow: function(tab, navigation, index) {
        //console.log("** Index : " + index);
        done = false;
        if (index == 0) {
            getDatasources();
            $("#btnPreview").hide();
            $('#rootwizard').find('.pager .next').addClass("disabled");
            $('#rootwizard').find('.pager .finish').hide();
        } else if (index == 1) {
            $('#rootwizard').find('.pager .finish').show();
            $("#previewChart").hide();
            done = true;
            if (datasourceType === "batch" && isPaginationSupported) {
                fetchData();
            }
            renderChartConfig();
        }
    }
});

$("#dsList").change(function() {
    datasource = $("#dsList").val();
    if (datasource != "-1") {
        $('#rootwizard').find('.pager .next').removeClass("disabled");
        datasourceType = $("#dsList option:selected").attr("data-type");
        getColumns(datasource, datasourceType)

        if(datasourceType != "realtime") {

            //check whether the seleced datasource supports pagination as well
            //first, get the recordstore for this table
            var recordStore;
            var tableName = datasource;
            var url = "/portal/apis/analytics?type=27&tableName=" + tableName;
            $.getJSON(url, function (data) {
                if (data.status === "success") {
                    recordStore = data.message;
                    //then check for pagination support on this recordstore
                    recordStore = recordStore.replace(/"/g, "");
                    checkPaginationSupported(recordStore);
                }
            });
        }
    } else {
        $('#rootwizard').find('.pager .next').addClass("disabled");
    }
});

$("#btnPreview").click(function() {
    if ($("dsList").val() != -1) {
        fetchData(renderPreviewPane);
    }
});

$("#previewChart").click(function() {

    var chartType = $("#chartType").val();
    var notFilled = false;
    $("#title").css("border-color", "");

    $("."+chartType).find("input[type=text]").each(function(){
        if( $(this).attr("id") != "title" && $(this).attr("id").indexOf("cusId") == -1 && $(this).val().length == 0){
            $(this).css("border-color", "red");
            notFilled = true;
        }else{
            $(this).css("border-color", "");
        }
    });

    $("."+chartType+" select").each(function(){
        if( $(this).attr("id") != "color" && $(this).attr("id") != "tblColor" && $(this).attr("id") != "columns" && $(this).val() == -1){
            $(this).css("border-color", "red");
            notFilled = true;
        }else{
            $(this).css("border-color", "");
        }
    });

    if(notFilled){
        generateMessage("Please Provide Required Fields !", null, null, "error", "topCenter", 3500, ['button', 'click']);
        return;
    }

    var selectedCoulmnValue = $("#columns").val();

    if(chartType == "tabular" && selectedCoulmnValue != -1 && selectedTableCoulumns.length == 0){
        generateMessage("Please select all attributes or add custom columns !", null, null, "error", "topCenter", 3500, ['button', 'click']);
        return;
    }

    if (datasourceType === "realtime") {
        var streamId = $("#dsList").val();
        var url = "/portal/apis/rt?action=publisherIsExist&streamId=" + streamId;
        $.getJSON(url, function(data) {
            if (!data) {
                generateMessage("You have not deployed a Publisher adapter UI Corresponding to selected StreamID:" + streamId +
                    " Please deploy an adapter to Preview Data.", null, null, "error", "topCenter", 3500, ['button', 'click']);
            } else {
                chart = null;
                //TODO DOn't do this! read this from a config file
                subscribe(streamId.split(":")[0], streamId.split(":")[1], '10', window.location.pathname.split('/')[3],
                    onRealTimeEventSuccessRecieval, onRealTimeEventErrorRecieval,  location.hostname, location.port,
                    'WEBSOCKET', "SECURED");
                var source = $("#wizard-zeroevents-hbs").html();;
                var template = Handlebars.compile(source);
                $("#chartDiv").empty();
                $("#chartDiv").append(template());
            }
        });
    } else {
        drawBatchChart(previewData);
    }

});

$("#chartType").change(function() {
    bindChartconfigs(columns,this.value);
    selectedTableCoulumns = [];
    $(".attr").hide();
    var className = jQuery(this).children(":selected").val();
    var chartType = this.value;

    if(chartType == "tabular"){
        $("#dynamicElements").empty();
    }

    $("."+chartType).find("input[type=text]").each(function(){
        $(this).val("");
        $(this).css("border-color", "");
    });

    $("."+chartType+" select").each(function(){
        $(this).val(-1);
        $(this).css("border-color", "");
    });

    $("." + className).show();
    $("#previewChart").show();
    $('#rootwizard').find('.pager .finish').removeClass('disabled');

});

$(".pager .finish").click(function() {
    //do some validations
    var chartType = $("#chartType").val();

    if ($("#title").val() == "") {
        $("#title").css("border-color", "red");
        generateMessage("Please Provide Required Fields !", null, null, "error", "topCenter", 3500, ['button', 'click']);
        return;
    }else {
        var notFilled = false;
        $("#title").css("border-color", "");


        $("."+chartType).find("input[type=text]").each(function(){
            if( $(this).attr("id").indexOf("cusId") == -1 && $(this).val().length == 0){
                $(this).css("border-color", "red");
                notFilled = true;
            }else{
                $(this).css("border-color", "");
            }
        });

        $("."+chartType+" select").each(function(){
            if( $(this).attr("id") != "color" && $(this).attr("id") != "tblColor" && $(this).attr("id") != "columns" && $(this).val() == -1){
                $(this).css("border-color", "red");
                notFilled = true;
            }else{
                $(this).css("border-color", "");
            }
        });

        if(notFilled){
            generateMessage("Please Provide Required Fields !", null, null, "error", "topCenter", 3500, ['button', 'click']);
            return;
        }

        var selectedCoulmnValue = $("#columns").val();

        if(chartType == "tabular" && selectedCoulmnValue != -1 && selectedTableCoulumns.length == 0){
            generateMessage("Please select all attributes or add custom columns !", null, null, "error", "topCenter", 3500, ['button', 'click']);
            return;
        }
    }
    if (done) {
        console.log("*** Posting data for gadget [" + $("#title").val() + "]");
        //building the chart config depending on the chart type
        var config = {
            chartType: $("#chartType").val()
        };
        configureChart(config);
        config = chartConfig;
        var request = {
            id: $("#title").val().replace(/ /g, "_"),
            title: $("#title").val(),
            datasource: $("#dsList").val(),
            type: $("#dsList option:selected").attr("data-type"),
            filter: $("#txtFilter").val(),
            columns: columns,
            chartConfig: config

        };
        $.ajax({
            url: "/portal/apis/gadgetgen",
            method: "POST",
            data: JSON.stringify(request),
            contentType: "application/json",
            success: function(d) {
                console.log("***** Gadget [ " + $("#title").val() + " ] has been generated. " + d);
                window.location.href = "/portal/";
            }
        });
    } else {
        //console.log("Not ready");
    }
});

function onRealTimeEventSuccessRecieval(streamId, data) {
    drawRealtimeChart(data);
};

function onRealTimeEventErrorRecieval(dataError) {
    console.log(dataError);
};

////////////////////////////////////////////////////// end of event handlers ///////////////////////////////////////////////////////////

function getDatasources() {
    $.ajax({
        url: "/portal/apis/rt?action=getDatasources",
        method: "GET",
        contentType: "application/json",
        success: function(data) {
            if (data.length == 0) {
                var source = $("#wizard-zerods-hbs").html();
                var template = Handlebars.compile(source);
                $("#rootwizard").empty();
                $("#rootwizard").append(template());
                return;
            }
            var datasources = data.map(function(element, index) {
                var item = {
                    name: element.name,
                    type: element.type
                };
                return item;
            });
            $("#dsList").empty();
            $("#dsList").append($('<option/>').val("-1")
                    .html("--Select a table/stream--")
                    .attr("type", "-1")
            );
            datasources.forEach(function(datasource, i) {
                var item = $('<option></option>')
                    .val(datasource.name)
                    .html(datasource.name + " [" + datasource.type + "]")
                    .attr("data-type", datasource.type);
                $("#dsList").append(item);
            });
        },
        error: function(xhr,message,errorObj) {

            //When 401 Unauthorized occurs user session has been log out
            if (xhr.status == 401) {
                //reload() will redirect request to login page with set current page to redirect back page
                location.reload();
            }

            var source = $("#wizard-error-hbs").html();;
            var template = Handlebars.compile(source);
            $("#rootwizard").empty();
            $("#rootwizard").append(template({
                error: xhr.responseText
            }));
        }
    });
};

function getColumns(datasource, datasourceType) {
    if (datasourceType === "realtime") {
        console.log("Fetching stream definition for stream: " + datasource);
        var url = "/portal/apis/rt?action=getDatasourceMetaData&type=" + datasourceType + "&dataSource=" + datasource;
        $.getJSON(url, function(data) {
            if (data) {
                columns = data;
            }
        });
    } else {
        console.log("Fetching schema for table: " + datasource);
        var url = "/portal/apis/analytics?type=10&tableName=" + datasource;
        $.getJSON(url, function(data) {
            if (data) {
                columns = parseColumns(JSON.parse(data.message));
            }
        });
    }
};

function checkPaginationSupported(recordStore) {
    console.log("Checking pagination support on recordstore : " + recordStore);
    var url = "/portal/apis/analytics?type=18&recordStore=" + recordStore;
    $.getJSON(url, function(data) {
        if (data.status==="success") {
            if(data.message==="true" && datasourceType==="batch") {
                console.log("Pagination supported for recordstore: " + recordStore);
                $("#btnPreview").show();
                isPaginationSupported = true;
            } else {
                $("#btnPreview").hide();
                isPaginationSupported = false;
            }
        }
    });
};

function fetchData(callback) {
    var timeFrom = new Date("1970-01-01").getTime();
    var timeTo = new Date().getTime();
    var request = {
        type: 8,
        tableName: $("#dsList").val(),
        timeFrom: timeFrom,
        timeTo: timeTo,
        start: 0,
        count: 10
    };
    $.ajax({
        url: "/portal/apis/analytics",
        method: "GET",
        data: request,
        contentType: "application/json",
        success: function(data) {
            var records = JSON.parse(data.message);
            previewData = makeRows(records);
            if (callback != null) {
                callback(previewData);
            }
        }
    });
};

function renderPreviewPane(rows) {
    $("#previewPane").empty();
    $('#previewPane').show();
    var table = jQuery('<table/>', {
        id: 'tblPreview',
        class: 'table table-bordered'
    }).appendTo('#previewPane');

    //add column headers to the table
    var thead = jQuery("<thead/>");
    thead.appendTo(table);
    var th = jQuery("<tr/>");
    columns.forEach(function(column, idx) {
        var td = jQuery('<th/>');
        td.append(column.name);
        td.appendTo(th);
    });
    th.appendTo(thead);

    rows.forEach(function(row, i) {
        var tr = jQuery('<tr/>');
        columns.forEach(function(column, idx) {
            var td = jQuery('<td/>');
            td.append(row[idx]);
            td.appendTo(tr);
        });

        tr.appendTo(table);

    });
};

function renderChartConfig() {
    //hide all chart controls
    $(".attr").hide();
};

function getColumnIndex(columnName) {
    for (var i = 0; i < columns.length; i++) {
        if (columns[i].name == columnName) {
            return i;
        }
    }
};

/////////////////////////////////////////////////////// data formatting related functions ///////////////////////////////////////////////////////

function parseColumns(data) {
    if (data.columns) {
        var keys = Object.getOwnPropertyNames(data.columns);
        var columns = keys.map(function(key, i) {
            return column = {
                name: key,
                type: data.columns[key].type
            };
        });
        return columns;
    }
};

function makeRows(data) {
    var rows = [];
    for (var i = 0; i < data.length; i++) {
        var record = data[i];
        var row = [];
        for (var j = 0; j < columns.length; j++) {
            row.push("" + record.values[columns[j].name]);
        }
        rows.push(row);
    };
    return rows;
};

function makeMapDataTable(data) {
    var dataTable = new igviz.DataTable();
    if (columns.length > 0) {
        columns.forEach(function (column, i) {
            var type = "N";
            if (column.type == "STRING" || column.type == "string") {
                type = "C";
            }
            dataTable.addColumn(column.name, type);
        });
    }
    data.forEach(function (row, index) {
        for (var i = 0; i < row.length; i++) {
            if (dataTable.metadata.types[i] == "N") {
                data[index][i] = parseInt(data[index][i]);
            }
        }
    });
    dataTable.addRows(data);
    return dataTable;
};

var dataTable;
var chart;
var counter = 0;
var globalDataArray = [];
function drawRealtimeChart(data) {
    console.log("+++++++++++ drawRealtimeChart ");

    var config = constructChartConfigurations();

    if (chart != null) {
        var persistedChartType = chart.chart.config.charts[0].type;
        if(config.charts[0].type != persistedChartType){
            chart = null;
        }
    }

    if (chart == null) {
        $("#chartDiv").empty();

        if(config.charts[0].type == "map"){
            var mapType = config.charts[0].mapType;

            if(mapType == "world"){
                config.helperUrl = document.location.protocol+"//"+document.location.host + '/portal/geojson/countryInfo/';
                config.geoCodesUrl = document.location.protocol+"//"+document.location.host + '/portal/geojson/world/';
            }else if(mapType == "usa"){
                config.helperUrl = document.location.protocol+"//"+document.location.host + '/portal/geojson/usaInfo/';
                config.geoCodesUrl = document.location.protocol+"//"+document.location.host + '/portal/geojson/usa/';
            }else if(mapType == "europe"){
                gadgetConfig.chartConfig.helperUrl = document.location.protocol+"//"+document.location.host + '/portal/geojson/countryInfo/';
                gadgetConfig.chartConfig.geoCodesUrl = document.location.protocol+"//"+document.location.host + '/portal/geojson/europe/';
            }
        }
        chart = new vizg(createDatatable(convertData(data)), config);
        chart.draw("#chartDiv");
    } else {
        chart.insert(convertData(data));
    }

};

function drawBatchChart(data){
    console.log("+++++++++++ drawBatchChart ");
    $("#chartDiv").empty();

    var config = constructChartConfigurations();

    if(config.charts[0].type == "map"){
        var mapType = config.charts[0].mapType;

        if(mapType == "world"){
            config.helperUrl = document.location.protocol+"//"+document.location.host + '/portal/geojson/countryInfo/';
            config.geoCodesUrl = document.location.protocol+"//"+document.location.host + '/portal/geojson/world/';
        }else if(mapType == "usa"){
            config.helperUrl = document.location.protocol+"//"+document.location.host + '/portal/geojson/usaInfo/';
            config.geoCodesUrl = document.location.protocol+"//"+document.location.host + '/portal/geojson/usa/';
        }else if(mapType == "europe"){
            gadgetConfig.chartConfig.helperUrl = document.location.protocol+"//"+document.location.host + '/portal/geojson/countryInfo/';
            gadgetConfig.chartConfig.geoCodesUrl = document.location.protocol+"//"+document.location.host + '/portal/geojson/europe/';
        }
    }

    chart = new vizg(createDatatable(convertData(data)), config);
    chart.draw("#chartDiv");
}

function createDatatable(data) {
    var names = [];
    var types = [];

    for(var i =0; i < columns.length; i++) {
        var type;
        names.push(columns[i]["name"]);

        var type = columns[i]["type"].toUpperCase();

        if(type === "INT" || type === "INTEGER" || type === "FLOAT" ||
            type === "DOUBLE") {
            type = "linear";
        } else if (type == "TIME") {
            type = "time";
        } else {
            type = "ordinal";
        }

        types.push(type);
    }

    var datatable =  [
        {
            "metadata" : {
                "names" : names,
                "types" : types
            },
            "data": data
        }
    ];

    return datatable;
}

function convertData(data) {
    for (var i = 0; i < data.length; i++) {
        for (var x = 0; x < data[i].length; x++) {

            var type = columns[x]["type"].toUpperCase();
            if(type != "STRING" && type != "BOOLEAN" ){
                data[i][x] = parseFloat(data[i][x]);
            }
        }
    }

    return data;
}

function constructChartConfigurations(){

    var config = {};
    var chartType = $("#chartType").val();
    var xAxis = $("#xAxis").val();
    var yAxis = $("#yAxis").val();
    var maxDataLength = $("#maxDataLength").val();

    config.x = xAxis;
    config.maxLength = maxDataLength;
    config.padding = {top:30,left:45,bottom:38,right:55};

    if (chartType == "bar") {
        config.charts = [{type: chartType,  y : yAxis}];
    } else if (chartType === "line") {
        var colorAxis = $("#color").val();

        if(colorAxis != -1){
            config.charts = [{type: chartType,  y : yAxis, color:colorAxis}];
        }else{
            config.charts = [{type: chartType,  y : yAxis}];
        }
    } else if (chartType === "area") {
        config.charts = [{type: chartType,  y : yAxis}];
    } else if (chartType === "tabular") {
        var columns = [];
        var columnTitles = [];
        var key = $("#key").val();
        var colorColumn = $("#tblColor").val();

        if(selectedTableCoulumns.length != 0){
            for(i=0;i<selectedTableCoulumns.length;i++){
                var cusId = "#cusId"+selectedTableCoulumns[i]+"";
                columns.push(selectedTableCoulumns[i]);
                if($(cusId).val() != ""){
                    columnTitles.push($(cusId).val());
                }else{
                    columnTitles.push(selectedTableCoulumns[i]);
                }
            }
        }else{
            for(i=0;i<defaultTableColumns.length;i++){
                columns.push(defaultTableColumns[i]);
                columnTitles.push(defaultTableColumns[i]);
            }
        }
        config.charts = [{type: "table", key : key, maxLength : maxDataLength, color:colorColumn, columns: columns, columnTitles:columnTitles}];
    } else if (chartType === "scatter") {
        var pointSize = $("#pointSize").val();
        var pointColor = $("#pointColor").val();

        config.charts = [{type: chartType,  y : yAxis,color: pointColor, size: pointSize,
            "maxColor":"#ffff00","minColor":"#ff00ff"}];
    } else if (chartType === "map") {
        var region;
        if ($("#region").val().trim() != "") {
            region = $("#region").val();
        }
        config.charts = [{type: chartType, y : yAxis, mapType: region}];
    } else if (chartType === "number") {
        var attrDescription = $("#attrDescription").val();
        config.charts = [{type: chartType, title:attrDescription}];
    }

    config.width = document.getElementById("chartDiv").offsetWidth; - 110;
    config.height = 240 - 40;

    return config;
}


function addCustomColumns(selectedValue){

    if(selectedValue != -1){
        var index = selectedTableCoulumns.indexOf(selectedValue);

        if (index == -1) {
            selectedTableCoulumns.push(selectedValue);
            $("#dynamicElements").append('<tr id="'+selectedValue+'">'+
                '<td><div class="left"><input name="originalValue" type="text" value="'+selectedValue+'" style="width: 128px"id="title" readonly></div></td>' +
                '<td><div class="middle"><b style="padding-left: 4px;padding-right: 4px">AS</b></div></td>' +
                '<td><div class="right"><input name="cusId'+selectedValue+'" id="cusId'+selectedValue+'" type="text" style="width: 128px"id="title" placeholder="Column Name"></div></td>' +
                '<td><div class="buttonRemove" style="padding-left: 3px;"><input type="button" value="-" onclick="removeRow(\''+selectedValue+'\');" /></div></td>' +
                '</tr>');
        }
    }

}

function removeRow(rowId){
    var arrayIndex = selectedTableCoulumns.indexOf(rowId);
    selectedTableCoulumns.splice(arrayIndex, 1);
}

$('#dynamicElements').on('click', 'input[type="button"]', function () {
    $(this).closest('tr').remove();
});



/**
 * Generate Noty Messages as to the content given parameters
 * @param1 text {String}
 * @param2 ok {Object}
 * @param3 cancel {Object}
 * @param4 type {String}
 * @param5 layout {String}
 * @param6 timeout {Number}
 * @return {Object}
 * @private
 * */
var generateMessage = function (text, funPrimary, funSecondary, type, layout, timeout, close,mode) {
    var properties = {};
    properties.text = text;

    if(mode == undefined){

        if (funPrimary || funSecondary) {
            properties.buttons = [
                {
                    addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) {
                    $noty.close();
                    if (funPrimary) {
                        funPrimary();
                    }
                }
                },
                {
                    addClass: 'btn btn-danger', text: 'Cancel', onClick: function ($noty) {
                    $noty.close();
                    if (funSecondary) {
                        funSecondary();
                    }
                }
                }
            ];
        }

    }else if(mode == "DEL_BLOCK_OR_ALL"){

        if (funPrimary || funSecondary) {
            properties.buttons = [
                {
                    addClass: 'btn btn-primary', text: 'Gadget & Block', onClick: function ($noty) {
                    $noty.close();
                    if (funPrimary) {
                        funPrimary();
                    }
                }
                },
                {
                    addClass: 'btn btn-primary', text: 'Gadget Only', onClick: function ($noty) {
                    $noty.close();
                    if (funSecondary) {
                        funSecondary();
                    }
                }
                },
                {
                    addClass: 'btn btn-danger', text: 'Cancel', onClick: function ($noty) {
                    $noty.close();
                }
                }
            ];
        }
    }


    if (timeout) {
        properties.timeout = timeout;
    }

    if (close) {
        properties.closeWith = close;
    }

    properties.layout = layout;
    properties.theme = 'wso2';
    properties.type = type;
    properties.dismissQueue = true;
    properties.killer = true;
    properties.maxVisible = 1;
    properties.animation = {
        open: {height: 'toggle'},
        close: {height: 'toggle'},
        easing: 'swing',
        speed: 500
    };

    return noty(properties);
};