var pref = new gadgets.Prefs();
var delay;
var chartData = [];
var options;
var plot;
var node = pref.getString("node") || undefined;
var start = '2015-06-07 18:24';
var end  = '2015-07-06 18:24';

$(function () {

    var pauseBtn = $("button.pause");
    pauseBtn.click(function () {
        $(this).toggleClass('btn-warning');
        togglePause($(this));
    });
    $(".reset").click(function () {
        fetchData();
    });

    fetchData();

    if (pref.getString("pause").toLowerCase() == "yes") {
        document.getElementById("pauseBtn").style.visibility = 'visible';
    }


});

function togglePause(btnElm) {
    var pauseBtn = btnElm;
    if (pauseBtn.hasClass('btn-warning')) {
        clearTimeout(delay);
    }
    else {
        if (isNumber(pref.getString("updateGraph")) && !(pref.getString("updateGraph") == "0")) {
            delay = setTimeout(function () {
                fetchData()
            },
            pref.getString("updateGraph") * 1000);
        }
    }
}

var drawChart = function (data, options) {

    if(data[0]["data"].length == 0){
        $('#placeholder').html("<div class='no-data'>No data available for selected options..!</div>");
        return;
    }

    plot = $.plot("#placeholder", data, options);

    var previousPoint = null;
    $("#placeholder").bind("plothover", function (event, pos, item) {

        if ($("#enablePosition:checked").length > 0) {
            var str = "(" + pos.x.toFixed(2) + ", " + pos.y.toFixed(2) + ")";
            $("#hoverdata").text(str);
        }


        if (item) {
            if (previousPoint != item.dataIndex) {

                previousPoint = item.dataIndex;

                $("#tooltip").remove();
                var x = item.datapoint[0],
                    y = item.datapoint[1];

                showTooltip(item.pageX, item.pageY,y);
            }
        } else {
            $("#tooltip").remove();
            previousPoint = null;
        }
    });


    // connect graph and overview graph

    $("#placeholder").bind("plotselected", function (event, ranges) {

        // clamp the zooming to prevent eternal zoom

        if (ranges.xaxis.to - ranges.xaxis.from < 0.00001) {
            ranges.xaxis.to = ranges.xaxis.from + 0.00001;
        }

        if (ranges.yaxis.to - ranges.yaxis.from < 0.00001) {
            ranges.yaxis.to = ranges.yaxis.from + 0.00001;
        }

        // do the zooming

        plot = $.plot("#placeholder", data,
            $.extend(true, {}, options, {
                xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to },
                yaxis: { min: ranges.yaxis.from, max: ranges.yaxis.to }
            })
        );

        overview.setSelection(ranges, true);
    });

    $("#overview").bind("plotselected", function (event, ranges) {
        plot.setSelection(ranges);
    });
}

function fetchData() {
    var url = '/portal/store/carbon.super/gadget/response-time/api/as-data.jag';

    var data = {
        start_time: start,
        end_time: end,
        action: 'error'
    };
    if(node) {
        data.node = node;
    }
    var appname = pref.getString("appname");
    if(appname!=""){
        data.appname = appname;
    }
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        data: data,
        success: onDataReceived
    });
    var pauseBtn = $("button.pause");
    togglePause(pauseBtn);
}
function onDataReceived(series) {
    chartData = series[0];
    options = $.extend(true, {}, chartConfigs(), series[1]);
    var chartOptions = options;
    var _chartData = [];
    addSeriesCheckboxes(chartData);
    $.each(chartData, function (key, val) {
        _chartData.push(chartData[key]);
    });
    //console.info(chartData);
    drawChart(_chartData, chartOptions);
    var seriesContainer = $("#optionsRight");
    seriesContainer.find(":checkbox").click(function () {
        filterSeries(chartData);
    });
}

function showTooltip(x, y, contents) {
    $("<div id='tooltip'>" + contents + "</div>").css({
        top: y + 10,
        left: x + 10
    }).appendTo("body").fadeIn(200);
}
function addSeriesCheckboxes(data) {
    // insert checkboxes
    var seriesContainer = $("#optionsRight .series-toggle");
    seriesContainer.html("");
    var objCount = 0;
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            objCount++;
        }
    }
    if (objCount > 1) {
        $.each(data, function (key, val) {
            seriesContainer.append("<li><input type='checkbox' name='" + key +
                "' checked='checked' id='id" + key + "'></input>" +
                "<label for='id" + key + "' class='seriesLabel'>"
                + val.label + "</label></li>");
        });
    }
}
function filterSeries(data) {
    var filteredData = [];
    var seriesContainer = $("#optionsRight");
    seriesContainer.find("input:checked").each(function () {
        var key = $(this).attr("name");
        if (key && data[key]) {
            var pausebtn = $("button.pause");
            if (!pausebtn.hasClass('btn-warning')) {
                $(pausebtn).toggleClass('btn-warning');
            }
            togglePause(pausebtn);
            filteredData.push(data[key]);
        }
        drawChart(filteredData, options);
    });
}
function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}


gadgets.HubSettings.onConnect = function () {

    gadgets.Hub.subscribe('date-selected', function(topic, date, subscriberData) {
        start = moment(date.from).format('YYYY-MM-DD HH:mm');
        end = moment(date.to).format('YYYY-MM-DD HH:mm');
        fetchData();
    });

    gadgets.Hub.subscribe('server-selected', function(topic, server, subscriberData) {
        node = server;
        fetchData();
    });

};
