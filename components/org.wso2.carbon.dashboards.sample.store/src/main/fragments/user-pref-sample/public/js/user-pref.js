(function () {
	var bgColor = portal.dashboards.widgets['org.wso2.carbon.dashboards.sample.store.user-pref-sample'].userpref.bgcolor;
	$('#content-template').css("background-color", bgColor);

	$( "#color-select" ).change(function(e) {
		var selectedColor = $("#color-select option:selected").attr('value');
		portal.dashboards.widgets['org.wso2.carbon.dashboards.sample.store.user-pref-sample'].userpref.bgcolor = selectedColor;
		portal.dashboards.functions.view.update();
	});
}());