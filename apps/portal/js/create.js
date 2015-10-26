/**
 * Functionality of the Create Dashboard defined in create.js.
 * */
$(function () {

    var overridden = false;

    /**
     * Generate URL from the user entered title.
     * @param title
     * @return string
     * @private
     * */
    var generateUrl = function (title) {
        return title.replace(/[^\w]/g, '-').toLowerCase();
    };

    /**
     * Update the URL in id textbox.
     * @private
     * */
    var updateUrl = function () {
        if (overridden) {
            return;
        }
        var title = $('#ues-dashboard-title').val();
        $('#ues-dashboard-id').val(generateUrl(title));
    };

    /**
     * Generate message box according to the type.
     * @param1 type
     * @param2 text
     * @private
     * */
    var generateMessage = function (type, text) {
        return noty({
            text: text,
            type: type,
            closeWith: ['button', 'click'],
            layout: 'topCenter',
            theme: 'wso2',
            timeout: '3500',
            dismissQueue: true,
            killer: true,
            maxVisible: 1,
            animation: {
                open: {height: 'toggle'}, // jQuery animate function property object
                close: {height: 'toggle'}, // jQuery animate function property object
                easing: 'swing', // easing
                speed: 500 // opening & closing animation speed
            }
        });
    };

    /**
     * Show error style for given element
     * @param1 element
     * @param2 error_element
     * @private
     * */
    var showError = function (element, error_element) {
        element.parent().addClass("has-error");
        element.addClass("has-error");
        element.parent().find("span.glyphicon").removeClass("hide");
        element.parent().find("span.glyphicon").addClass("show");
        error_element.removeClass("hide");
        error_element.addClass("show");
    };

    /**
     * Hide error style for given element
     * @param1 element
     * @param2 error_element
     * @private
     * */
    var hideError = function (element, error_element) {
        element.parent().removeClass("has-error");
        element.removeClass("has-error");
        element.parent().find("span.glyphicon").removeClass("show");
        element.parent().find("span.glyphicon").addClass("hide");
        error_element.removeClass("show");
        error_element.addClass("hide");
    };

    $('#ues-dashboard-title').on('keyup', function () {
        if ($(this).val()) {
            hideError($(this), $("#title-error"));
        }
        updateUrl();
    }).on('change', function () {
        updateUrl();
    });

    $('#ues-dashboard-id').on('keyup', function () {
        overridden = overridden || true;
        if ($(this).val()) {
            hideError($(this), $("#id-error"));
        }
    });

    $('#ues-dashboard-create').on('click', function () {
        var title = $("#ues-dashboard-title"),
            id = $("#ues-dashboard-id"),
            url = "/portal/dashboards/" + id.val(),
            form = $('#ues-dashboard-form'),
            action = form.attr('action'),
            title_error = $("#title-error"),
            id_error = $("#id-error");

        if (!title.val() || !id.val()) {
            !title.val() ? showError(title, title_error) : showError(id, id_error);
        } else {
            form.attr('action', action + '/' + id.val());
            console.log("[Sending AJAX request to " + url);

            $.ajax({
                url: url,
                method: "GET",
                contentType: "application/json",
                success: function (data) {
                    generateMessage('error', "A dashboard with same name already exists. Please select a different dashboard name.");
                },
                error: function (xhr) {
                    if (xhr.status == 404) {
                        //There's no dashboard exists with same id. We are good to go.
                        $("#ues-dashboard-form").submit();
                    }
                }
            });
        }
    });

    var menu = $('.ues-context-menu');
    menu.find('.ues-tiles-menu-toggle').click(function () {
        menu.find('.ues-tiles-menu').slideToggle();
    });
});