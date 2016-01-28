$(function () {

    var dashboardsApi = ues.utils.tenantPrefix() + 'apis/dashboards';

    var rolesApi = ues.utils.relativePrefix() + 'apis/roles';

    var userApi = ues.utils.relativePrefix() + 'apis/user';

    var searchRolesApi = ues.utils.relativePrefix() + 'apis/roles/search';

    var maxLimitApi = ues.utils.relativePrefix() + 'apis/roles/maxLimit';

    var dashboard = ues.global.dashboard;

    var permissions = dashboard.permissions;

    var viewers = permissions.viewers;

    var editors = permissions.editors;

    var url = dashboardsApi + '/' + dashboard.id;

    var permissionMenuHbs = Handlebars.compile($("#permission-menu-hbs").html() || '');

    var tokenUrl = ues.utils.tenantPrefix() + 'apis/tokensettings/' + dashboard.id;

    var user = null;

    /**
     * Generate Noty Messages as to the content given using parameters.
     * @param1 text {String}
     * @param2 ok {Object}
     * @param3 cancel {Object}
     * @param4 type {String}
     * @param5 layout {String}
     * @param6 timeout {Number}
     * @return {Object}
     * @private
     * */
    var generateMessage = function (text, ok, cancel, type, layout, timeout) {
        var properties = {};
        properties.text = text;
        if (ok || cancel) {
            properties.buttons = [
                {
                    addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) {
                    $noty.close();
                    if (ok) {
                        ok();
                    }
                }
                },
                {
                    addClass: 'btn btn-danger', text: 'Cancel', onClick: function ($noty) {
                    $noty.close();
                    if (cancel) {
                        cancel();
                    }
                }
                }
            ];
        }

        if (timeout) {
            properties.timeout = timeout;
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

    var saveDashboard = function (callback) {
        $.ajax({
            url: url,
            method: 'PUT',
            data: JSON.stringify(dashboard),
            contentType: 'application/json'
        }).success(function (data) {
            generateMessage("Saved Successfully", null, null, "success", "bottom", 2000);
            console.log('dashboard saved successfully');

            if (callback) {
                callback();
            }
        }).error(function () {
            generateMessage("Error Saving Dashboard", null, null, "error", "bottom", 2000);
            console.log('error saving dashboard');
        });
    };

    var getOauthSettings = function () {
        $.ajax({
            url: tokenUrl,
            type: "GET",
            dataType: "json",
            data: {
                id: dashboard.id
            }
        }).success(function (data) {
            if ($.trim(data.accessTokenUrl) == '' || $.trim(data.key) == '' || $.trim(data.secret) == '') {
                setOAuthSettingsFields('', '', '');
            } else {
                setOAuthSettingsFields(data.accessTokenUrl, data.key, data.secret);
                $("#ues-oauth-settings-inputs").show();
                generateMessage("Saved Successfully", null, null, "success", "bottom", 2000);
            }
        }).error(function () {
            generateMessage("Error Getting OAuth settings", null, null, "error", "bottom", 2000);
            console.log('error getting oauth settings');
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
        $("#ues-access-token-url").text(aturl);
        $("#ues-api-key").text(ak);
        $("#ues-api-secret").text(as);
    };

    var sharedRoleHbs = Handlebars.compile($("#ues-shared-role-hbs").html() || '');

    var viewer = function (el, role) {
        var permissions = dashboard.permissions;
        var viewers = permissions.viewers;
        if (!isExistingPermission(viewers, role)) {
            viewers.push(role);
            saveDashboard();
            $('#ues-dashboard-settings').find('.ues-shared-view').append(sharedRoleHbs(role));
        }
        el.typeahead('val', '');
    };

    var editor = function (el, role) {
        var permissions = dashboard.permissions;
        var editors = permissions.editors;
        if (!isExistingPermission(editors, role)) {
            editors.push(role);
            saveDashboard();
            $('#ues-dashboard-settings').find('.ues-shared-edit').append(sharedRoleHbs(role));
        }
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
        if (character.match(regEx) && code != 8 && code != 46) {
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

    var addBreadcrumbs = function (pageName) {
        $('#ues-breadcrumbs').append("<li><a href='" + ues.utils.tenantPrefix() + "./dashboards'>Dashboards</a></li>");
        $('#ues-breadcrumbs').append("<li><a href='" + ues.utils.tenantPrefix() + "./dashboards/" + dashboard.id + "/?editor=true'>" + dashboard.title + "</a></li>");
        $("#ues-breadcrumbs").append("<li class='active'>" + pageName + "</li>");
    };

    /**
     * pops up the export dashboard page
     * @private
     */
    var exportDashboard = function () {
        window.open(dashboardsApi + '/' + dashboard.id, '_blank');
    };

    /**
     *
     * */
    var isExistingPermission = function (permissions, role) {
        var isExist = false;
        for (var i = 0; i < permissions.length; i++) {
            if (permissions[i] == role) {
                isExist = true;
                break;
            }
        }
        return isExist;
    };

    /**
     * Get the user details.
     * @private
     * */
    var getUser = function () {
        $.ajax({
            url: userApi,
            type: "GET",
            dataType: "json",
            async: false,
            success: function (data) {
                if (data) {
                    user = data;
                }
            }
        });
    };

    /**
     * Get number of user roles in the dashboard permissions.
     * @param permission {String}
     * @return number
     * */
    var getNumberOfUserRolesInDashboard = function (permission) {
        var userRoles = 0;
        for (var i = 0; i < user.roles.length; i++) {
            for (var j = 0; j < permission.length; j++) {
                if (user.roles[i] == permission[j]) {
                    userRoles += 1;
                }
            }
        }
        return userRoles;
    };

    var initUI = function () {
        addBreadcrumbs("Dashboard Settings");
        var viewerSearchQuery = '';
        var maxLimit = 10;
        getUser();

        $.ajax({
            url: maxLimitApi,
            type: "GET",
            async: false,
            dataType: "json"
        }).success(function (data) {
            maxLimit = data;
        }).error(function () {
            console.log('Error calling max roles limit');
        });

        var viewerRoles = new Bloodhound({
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
            sufficient: 10,
            remote: {
                url: searchRolesApi +'?maxLimit='+maxLimit+'&query='+viewerSearchQuery,
                filter: function (searchRoles) {
                    return $.map(searchRoles, function (searchRole) {
                        return {name: searchRole};
                    });
                },
                prepare: function (query, settings) {
                    viewerSearchQuery = query;
                    var currentURL = settings.url;
                    settings.url = currentURL + query ;
                    return settings;
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
        $('#ues-share-view').typeahead({
            hint: true,
            highlight: true,
            minLength: 0
        }, {
            name: 'roles',
            displayKey: 'name',
            limit: 10,
            source: viewerRoles.ttAdapter(),
            templates: {
                empty: [
                    '<div class="empty-message">',
                    'No Result Available',
                    '</div>'
                ].join('\n'),
                suggestion: permissionMenuHbs
            }
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
            sufficient: 10,
            remote: {
                url: searchRolesApi +'?maxLimit='+maxLimit+'&query='+viewerSearchQuery,
                filter: function (searchRoles) {
                    return $.map(searchRoles, function (searchRole) {
                        return {name: searchRole};
                    });
                },
                prepare: function (query, settings) {
                    viewerSearchQuery = query;
                    var currentURL = settings.url;
                    settings.url = currentURL + query ;
                    return settings;
                },
                ttl: 60
            },
            datumTokenizer: function (d) {
                return d.name.split(/[\s\/.]+/) || [];
            },
            queryTokenizer: Bloodhound.tokenizers.whitespace
        });

        editorRoles.initialize();

        $('#ues-share-edit').typeahead({
            hint: true,
            highlight: true,
            minLength: 0
        }, {
            name: 'roles',
            displayKey: 'name',
            limit: 10,
            source: editorRoles.ttAdapter(),
            extraInfo: ues.global.dashboard,
            templates: {
                empty: [
                    '<div class="empty-message">',
                    'No Result Available',
                    '</div>'
                ].join('\n'),
                suggestion: permissionMenuHbs
            }
        }).on('typeahead:selected', function (e, role, roles) {
            editor($(this), role.name);
        }).on('typeahead:autocomplete', function (e, role) {
            editor($(this), role.name);
        });

        $('#ues-dashboard-settings').find('.ues-shared-edit').on('click', '.remove-button', function () {
            var el = $(this).closest('.ues-shared-role');
            var role = el.data('role');
            var removePermission = function () {
                editors.splice(editors.indexOf(role), 1);
                var removeElement = function () {
                    el.remove();
                };

                saveDashboard(removeElement);
            };

            if ((editors.length == 1 || getNumberOfUserRolesInDashboard(editors) == 1) && !user.isAdmin) {
                generateMessage("After this permission removal only administrator will be able to edit this dashboard." +
                    " Do you want to continue?", removePermission, null, "confirm", "topCenter", null);
            } else {
                removePermission();
            }
        }).end().find('.ues-shared-view').on('click', '.remove-button', function () {
            var el = $(this).closest('.ues-shared-role');
            var role = el.data('role');
            var removePermission = function () {
                viewers.splice(viewers.indexOf(role), 1);
                var removeElement = function () {
                    el.remove();
                };
                saveDashboard(removeElement);
            };

            if ((viewers.length == 1 || getNumberOfUserRolesInDashboard(viewers) == 1) && !user.isAdmin) {
                generateMessage("After this permission removal only administrator will be able to view this dashboard." +
                    " Do you want to continue?", removePermission, null, "confirm", "topCenter", null);
            } else {
                removePermission();
            }
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
                $("#ues-oauth-settings-inputs").show();
            } else {
                $("#ues-oauth-settings-inputs").hide();
            }
        });

        $('#ues-oauth-refresh').on('click', function () {
            getOauthSettings();
        });

        var menu = $('.ues-context-menu');
        menu.find('.ues-tiles-menu-toggle').click(function () {
            menu.find('.ues-tiles-menu').slideToggle();
        });

        menu.find('.ues-dashboard-export').on('click', function () {
            exportDashboard();
        });
    };

    initUI();
    initExistingRoles();
});
