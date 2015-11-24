$(function () {

    var dashboardsApi = ues.utils.tenantPrefix() + 'apis/dashboards';

    var rolesApi = ues.utils.relativePrefix() + 'apis/roles';

    var dashboard = ues.global.dashboard;

    var permissions = dashboard.permissions;

    var viewers = permissions.viewers;

    var editors = permissions.editors;

    var url = dashboardsApi + '/' + dashboard.id;

    var saveDashboard = function () {
        $.ajax({
            url: url,
            method: 'PUT',
            data: JSON.stringify(dashboard),
            contentType: 'application/json'
        }).success(function (data) {
            console.log('dashboard saved successfully');
        }).error(function () {
            console.log('error saving dashboard');
        });
    };

    var getOauthSettings = function () {
        $.ajax({
            url: "/portal/saml/saml-at-settings.jag",
            type: "GET",
            dataType: "json",
            data: {
                id: dashboard.id,
                isUrl: dashboard.identityServerUrl
            }
        }).success(function (data) {
            if ($.trim(data.accessTokenUrl) == '' || $.trim(data.key) == '' || $.trim(data.secret) == '') {
                showOAuthInlineError($("#ues-is-url"), $("#is-url-error"), "Entered URL is not pointed to a valid Identity Server.");
                setOAuthSettingsFields('', '', '');
            } else {
                hideInlineError($("#ues-is-url"), $("#is-url-error"));
                setOAuthSettingsFields(data.accessTokenUrl, data.key, data.secret);
            }
        }).error(function () {
            showOAuthInlineError($("#ues-is-url"), $("#is-url-error"), "Error occured in server.");
            console.log('error saving dashboard');
        });
    };

    /**
     * Set field values for OAuth settings
     * @param1 access token url
     * @param2 api key
     * @param3 api secret
     * @private
     * */
    var setOAuthSettingsFields = function (aturl, ak, as) {
        $("#ues-access-token-url").val(aturl);
        $("#ues-api-key").val(ak);
        $("#ues-api-secret").val(as);
    };

    var sharedRoleHbs = Handlebars.compile($("#ues-shared-role-hbs").html() || '');

    var viewer = function (el, role) {
        var permissions = dashboard.permissions;
        var viewers = permissions.viewers;
        viewers.push(role);
        saveDashboard();
        $('#ues-dashboard-settings').find('.ues-shared-view').append(sharedRoleHbs(role));
        el.typeahead('val', '');
    };

    var editor = function (el, role) {
        var permissions = dashboard.permissions;
        var editors = permissions.editors;
        editors.push(role);
        saveDashboard();
        $('#ues-dashboard-settings').find('.ues-shared-edit').append(sharedRoleHbs(role));
        el.typeahead('val', '');
    };

    /**
     * Sanitize the given event's key code.
     * @param1 event
     * @param1 regEx
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
        if (character.match(regEx)) {
            return false;
        } else {
            return !($.trim($(element).val()) == '' && character.match(/[\s]/gim));
        }
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

    /**
     * Show error style for oauth element
     * @param1 element
     * @param2 errorElement
     * @param3 error message
     * @private
     * */
    var showOAuthInlineError = function (element, errorElement, errorMessage) {
        //element.val('');
        element.parent().addClass("has-error");
        element.addClass("has-error");
        element.parent().find("span.glyphicon").removeClass("hide");
        element.parent().find("span.glyphicon").addClass("show");
        errorElement.removeClass("hide");
        errorElement.addClass("show");
        errorElement.html(errorMessage);
    };

    var initExistingRoles = function () {
        var i;
        var role;

        var html = '';
        var length = viewers.length;
        for (i = 0; i < length; i++) {
            role = viewers[i];
            html += sharedRoleHbs(role);
        }

        var settings = $('#ues-dashboard-settings');
        settings.find('.ues-shared-view').append(html);

        html = '';
        length = editors.length;
        for (i = 0; i < length; i++) {
            role = editors[i];
            html += sharedRoleHbs(role);
        }
        settings.find('.ues-shared-edit').append(html);
    };

    var initUI = function () {
        var viewerRoles = new Bloodhound({
            name: 'roles',
            limit: 10,
            prefetch: {
                url: rolesApi,
                filter: function (roles) {
                    roles.push(ues.global.anonRole);
                    return $.map(roles, function (role) {
                        return {name: role};
                    });
                },
                ttl: 60
            },
            datumTokenizer: function (d) {
                return d.name.split(/[\s\/.]+/) || [];
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace
        });

        viewerRoles.initialize();

        //TODO: improve typeahead to use single prefetch for both editors and viewers
        $('#ues-share-view').typeahead(null, {
            name: 'roles',
            displayKey: 'name',
            source: viewerRoles.ttAdapter()
        }).on('typeahead:selected', function (e, role, roles) {
            viewer($(this), role.name);
        }).on('typeahead:autocomplete', function (e, role) {
            viewer($(this), role.name);
        });

        var editorRoles = new Bloodhound({
            name: 'roles',
            limit: 10,
            prefetch: {
                url: rolesApi,
                filter: function (roles) {
                    return $.map(roles, function (role) {
                        return {name: role};
                    });
                },
                ttl: 60
            },
            datumTokenizer: function (d) {
                return d.name.split(/[\s\/.]+/) || [];
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace
        });

        editorRoles.initialize();

        $('#ues-share-edit').typeahead(null, {
            name: 'roles',
            displayKey: 'name',
            source: editorRoles.ttAdapter()
        }).on('typeahead:selected', function (e, role, roles) {
            editor($(this), role.name);
        }).on('typeahead:autocomplete', function (e, role) {
            editor($(this), role.name);
        });

        $('#ues-dashboard-settings').find('.ues-shared-edit').on('click', '.remove-button', function () {
            var el = $(this).closest('.ues-shared-role');
            var role = el.data('role');
            editors.splice(editors.indexOf(role), 1);
            saveDashboard();
            el.remove();
        }).end().find('.ues-shared-view').on('click', '.remove-button', function () {
            var el = $(this).closest('.ues-shared-role');
            var role = el.data('role');
            viewers.splice(viewers.indexOf(role), 1);
            saveDashboard();
            el.remove();
        });

        $('#ues-dashboard-title').on("keypress", function (e) {
            return sanitizeOnKeyPress(this, e, /[^a-z0-9-\s]/gim)
        }).on('change', function () {
            if ($.trim($(this).val()) == '') {
                showInlineError($(this), $("#title-error"));
            } else {
                hideInlineError($(this), $("#title-error"));
                dashboard.title = $(this).val();
                saveDashboard();
            }
        });

        $('#ues-dashboard-description').on('keypress', function (e) {
            return sanitizeOnKeyPress(this, e, /[^a-z0-9-.\s]/gim);
        }).on('change', function () {
            dashboard.description = $(this).val();
            saveDashboard();
        });

        $('#ues-enable-oauth').on('click', function () {
            dashboard.enableOauth = $(this).is(":checked");
            saveDashboard();
            if (dashboard.enableOauth) {
                $('#ues-is-url').removeAttr("disabled");
            } else {
                $("#ues-is-url").attr("disabled", "disabled");
                hideInlineError($("#ues-is-url"), $("#is-url-error"));
            }
        });

        $('#ues-is-url').on('change', function () {
            if ($.trim($(this).val()) == '') {
                showOAuthInlineError($("#ues-is-url"), $("#is-url-error"), "This field is required.");
                setOAuthSettingsFields('', '', '');
            } else {
                hideInlineError($("#ues-is-url"), $("#is-url-error"));
                dashboard.identityServerUrl = $(this).val();
                getOauthSettings();
            }
        });

        var menu = $('.ues-context-menu');
        menu.find('.ues-tiles-menu-toggle').click(function () {
            menu.find('.ues-tiles-menu').slideToggle();
        });
    };

    initUI();
    initExistingRoles();
});
