(function () {
	$( "#widget-config-close").click(function(e) {
		e.preventDefault();
		$.sidebar_toggle("hide", "#right-sidebar", ".page-content-wrapper");
	});
}());