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
        title = title.substring(0,100);
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
     * Sanitize the given input of a user input controller.
     * @param input
     * @return string
     * @private
     * */
    var sanitizeInput = function (input) {
        return input.replace(/[^a-z0-9-\s]/gim, "");
    };

    /**
     * Sanitize the given event's key code.
     * @param event
     * @return boolean
     * @private
     * */
    var sanitizeOnKeyPress = function (element, event, regEx) {
        var code;
        if (event.keyCode) {
            code = event.keyCode;
        } else if (event.which) {
            code = event.which;
        }

        var character = String.fromCharCode(code);
        if (character.match(regEx) && code != 8 && code != 46) {
            return false;
        } else {
            return !($.trim($(element).val()) == '' && character.match(/[\s]/gim));
        }
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
                open: {height: 'toggle'},
                close: {height: 'toggle'},
                easing: 'swing',
                speed: 500
            }
        });
    };

    /**
     * Show error style for given element
     * @param1 element
     * @param2 errorElement
     * @private
     * */
    var showInlineError = function (element, errorElement) {
        element.val('');
        element.parent().addClass("has-error");
        element.addClass("has-error");
        element.parent().find("span.glyphicon").removeClass("hide");
        element.parent().find("span.glyphicon").addClass("show");
        errorElement.removeClass("hide");
        errorElement.addClass("show");
    };

    /**
     * Hide error style for given element
     * @param1 element
     * @param2 errorElement
     * @private
     * */
    var hideInlineError = function (element, errorElement) {
        element.parent().removeClass("has-error");
        element.removeClass("has-error");
        element.parent().find("span.glyphicon").removeClass("show");
        element.parent().find("span.glyphicon").addClass("hide");
        errorElement.removeClass("show");
        errorElement.addClass("hide");
    };

    $('#ues-dashboard-title').on("keypress", function (e) {
        return sanitizeOnKeyPress(this, e, /[^a-z0-9-\s]/gim);
    }).on('keyup', function () {
        if ($(this).val()) {
            hideInlineError($(this), $("#title-error"));
        }

        updateUrl();
    }).on('change', function () {
        var sanitizedInput = sanitizeInput($(this).val());
        $(this).val(sanitizedInput);
        updateUrl();
    });

    $('#ues-dashboard-id').on("keypress", function (e) {
        return sanitizeOnKeyPress(this, e, /[^a-z0-9-\s]/gim);
    }).on('keyup', function () {
        overridden = overridden || true;
        if ($(this).val()) {
            hideInlineError($(this), $("#id-error"));
        }

        $(this).val(generateUrl($(this).val()));
    });

    $('#ues-dashboard-description').on("keypress", function (e) {
        return sanitizeOnKeyPress(this, e, /[^a-z0-9-.\s]/gim);
    });

    $('#ues-dashboard-create').on('click', function () {
        var title = $("#ues-dashboard-title"),
            id = $("#ues-dashboard-id"),
            form = $('#ues-dashboard-form'),
            url = $("#create-dashboard-url").val() + "/" + id.val(),
            titleError = $("#title-error"),
            idError = $("#id-error");

        if (!$.trim(title.val()) || !$.trim(id.val())) {
            !$.trim(title.val()) ? showInlineError(title, titleError) : showInlineError(id, idError);
        } else {
            form.attr('action', url);
            console.log("[Sending AJAX request to " + url);

            $.ajax({
                url: url,
                method: "GET",
                contentType: "application/json",
                success: function (data) {
                    generateMessage('error', "A dashboard with same URL already exists. Please select a different dashboard URL.");
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

    var breadcrumbs = $("#ues-breadcrumbs");
    breadcrumbs.append("<li><a href='" + ues.utils.tenantPrefix() + "./dashboards'>Dashboards</a></li>");
    breadcrumbs.append("<li class='active'>Create Dashboard</li>");
});