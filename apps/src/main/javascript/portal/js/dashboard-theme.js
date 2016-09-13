/*
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

$(function () {
    /**
     * url for update theme properties
     * @const
     */
    var themeApi = ues.utils.tenantPrefix() + 'apis/theme';

    /**
     * JSON object ot store Themedata
     * @type JSON
     */
    var dashboardTheme = {};

    /**
     * update the dashboard theme with given theme.
     * @return {null}
     * @private
     */
    var updateThemeProperties = function () {
        var method = 'PUT';
        var url = themeApi + '/' + dashboard.id;
        var isRedirect = false;
        $.ajax({
            url: url,
            method: method,
            data: JSON.stringify(dashboardTheme),
            async: false,
            contentType: 'application/json'
        }).success(function (data) {
            console.log("Dashboard saved successfully.");
            if (isRedirect) {
                isRedirect = false;
                window.location = dashboardsUrl + '/' + dashboard.id + "?editor=true";
            }
        }).error(function (xhr, status, err) {
            if (xhr.status === 403) {
                window.location.reload();
                return;
            }
        });
    };

    function updateSidebarNav(target) {
        $(target).show();
        $(target).siblings().hide();
        nanoScrollerSelector[0].nanoscroller.reset();
    }

    if (!ues.global.renderFromExtension && typeof(isStandAloneGadget) === 'undefined') {
        ues.dashboards.render($('.ues-components-grid'), ues.global.dashboard, ues.global.page);
    }

    var iframesReadyInterval = setInterval(function () {
        if (!ues.dashboards.getDashboardLoadingState() === true) {
            clearInterval(iframesReadyInterval);
            updateGadgetTheme();
            $('.body-wrapper').loading('hide');
        }
    }, 200);

    $(document).ready(function () {
        if ($('.gadget-body').length > 0) {
            $('.body-wrapper').loading('show');
        }
        if ((ues.global.dashboard.theme.properties.lightDark == 'dark') ||
            (ues.global.dashboard.theme.properties.lightDark == '') || !(ues.global.dashboard.theme.properties.lightDark)) {
            $('[data-toggle="theme"]').attr('checked', 'checked');
            $('body').addClass('dark');
        }
        else {
            $('[data-toggle="theme"]').removeAttr('checked');
            $('body').removeClass('dark');
        }
    });

    /**
     * update the gadget theme of gadgets
     */
    var updateGadgetTheme = function () {
        if ((ues.global.dashboard.theme.properties.lightDark == 'dark') ||
            (ues.global.dashboard.theme.properties.lightDark == '') || !(ues.global.dashboard.theme.properties.lightDark)) {
            $('iframe').contents().find('body').addClass('dark');
        }
        else {
            $('iframe').contents().find('body').removeClass('dark');
        }
    };

    /**
     * hide the left-side bar in view mode
     */
    var hideSideBar = function () {
        $(".page-content-wrapper").css('padding-left', '0');
        $("#left-sidebar").css('left', '-260px');
        $(".sidebar-toggle-button").removeClass('active');
        $(".sidebar-toggle-button").attr('aria-expanded', false)
    }

    /**
     * toggles the product logo according to the event type
     * @param sidebarEventType
     */
    function toggleProductLogo(sidebarEventType) {
        var logo = $('#product-logo');

        if (sidebarEventType == 'hidden') {
            logo.show();
        }
        else if (sidebarEventType == 'shown') {
            logo.hide();
        }
    }

    /**
     * generate theme data to send to backend in order to update the theme
     */
    function generateThemeData() {
        var showSideBar = $(".sidebar-toggle-button").attr('aria-expanded');
        var lightDark = $('body').hasClass('dark') ? 'dark' : 'light';
        dashboardTheme.properties = {};
        dashboardTheme.properties.lightDark = lightDark;
        dashboardTheme.properties.showSideBar = showSideBar;
        dashboardTheme.name = ues.global.dashboard.theme.name;
        return dashboardTheme;
    }

    $('#left-sidebar').on('hidden.sidebar', function (e) {
        ues.global.dashboard.theme.properties.showSideBar = true;
        generateThemeData()
        updateThemeProperties();
        toggleProductLogo(e.type)
    });

    $('#left-sidebar').on('shown.sidebar', function (e) {
        ues.global.dashboard.theme.properties.showSideBar = false;
        generateThemeData();
        updateThemeProperties();
        toggleProductLogo(e.type)
    });

    $('[data-toggle="theme"]').change(function () {
        if ($(this).prop('checked') == true) {
            $('[data-toggle="theme"]').each(function () {
                $('[data-toggle="theme"]').attr('checked', 'checked');
            });
            $('body').addClass('dark');
            $('iframe[id^="sandbox-gadget"]').contents().find('body').addClass('dark');
            ues.global.dashboard.theme.properties.lightDark = 'dark';
            generateThemeData();
            updateThemeProperties();
        }
        else {
            $('[data-toggle="theme"]').each(function () {
                $(this).removeAttr('checked');
            });
            $('body').removeClass('dark');
            $('iframe[id^="sandbox-gadget"]').contents().find('body').removeClass('dark');
            ues.global.dashboard.theme.properties.lightDark = 'light';
            generateThemeData();
            updateThemeProperties();
        }
    });

    if (typeof(isStandAloneGadget) === 'undefined') {
        var nanoScrollerSelector = $(".nano");
        nanoScrollerSelector.nanoScroller();
    }

    if (ues.global.dashboard.theme.properties.showSideBar === "false") {
        hideSideBar();
    }
});