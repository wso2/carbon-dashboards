$(function () {

    var dashboardsApi = ues.utils.tenantPrefix() + 'apis/dashboards';

    var rolesApi = ues.utils.relativePrefix() + 'apis/roles';
    console.log("rolesApi is -----> "+rolesApi);

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

        console.log("getOauthSettings -- ");
        $.ajax({
            url: "/portal/saml/saml-at-settings.jag",
            type: "GET",
            dataType: "json",
            data: {
                id: dashboard.id,
                isUrl: dashboard.identityServerUrl
            }
        }).success(function (data) {
            $("#ues-access-token-url").val(data.accessTokenUrl);
            $("#ues-api-key").val(data.key);
            $("#ues-api-secret").val(data.secret);
        }).error(function () {
            console.log('error saving dashboard');
        });
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

    var initExistingRoles = function () {

        console.log("init existing roles")

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

    //edit here
    var initUI = function () {
        var viewerRoles = new Bloodhound({
            name: 'roles',
            limit: 10,
            prefetch: {
                url: rolesApi,
                filter: function (roles) {
                    console.log("filter function ----- " + roles);
                    roles.push(ues.global.anonRole);
                    return $.map(roles, function (role) {
                        return {name: role};
                    });
                },
                ttl: 60
            },
            datumTokenizer: function (d) {
                console.log("datumTokenizer -- " + JSON.stringify(d));
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
            }
        });

        $('#ues-is-url').on('change', function () {
            dashboard.identityServerUrl = $(this).val();
            getOauthSettings();
        });

        var menu = $('.ues-context-menu');
        menu.find('.ues-tiles-menu-toggle').click(function () {
            menu.find('.ues-tiles-menu').slideToggle();
        });
    };

    initUI();
    initExistingRoles();
});
