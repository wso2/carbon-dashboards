$(function () {

    var dashboardsApi = ues.utils.tenantPrefix() + 'apis/dashboards';

    var dashboardsListHbs = Handlebars.compile($("#ues-dashboards-list-hbs").html());

    var dashboardThumbnailHbs = Handlebars.compile($("#ues-dashboard-thumbnail-hbs").html());

    var dashboardConfirmHbs = Handlebars.compile($("#ues-dashboard-confirm-hbs").html());

    var dashboardsEmptyHbs = Handlebars.compile($("#ues-dashboards-empty-hbs").html());

    Handlebars.registerPartial('ues-dashboard-thumbnail-hbs', dashboardThumbnailHbs);

    var dashboards = [];

    var nextStart = 0;

    var PAGE_COUNT = 10;

    var hasMore = true;

    var findDashboard = function (id) {
        var i;
        var dashboard;
        var length = dashboards.length;
        for (i = 0; i < length; i++) {
            dashboard = dashboards[i];
            if (dashboard.id === id) {
                return dashboard;
            }
        }
    };

    var deleteDashboard = function (el) {
        var button = Ladda.create(el[0]);
        button.start();
        var id = el.closest('.ues-dashboard').data('id');
        $.ajax({
            url: dashboardsApi + '/' + id,
            method: 'DELETE',
            success: function () {
                button.stop();
                location.reload();
            },
            error: function () {
                button.stop();
            }
        });
    };

    var loadDashboards = function () {
        if (!hasMore) {
            return;
        }
        ues.store.assets('dashboard', {
            start: nextStart,
            count: PAGE_COUNT
        }, function (err, data) {
            var dashboardsEl = $('#ues-portal').find('.ues-dashboards');
            hasMore = data.length;
            if (!hasMore && nextStart === 0) {
                dashboardsEl.append(dashboardsEmptyHbs());
                return;
            }

            nextStart += PAGE_COUNT;
            dashboards = dashboards.concat(data);
            dashboardsEl.append(dashboardsListHbs(data));

            var win = $(window);
            var doc = $(document);
            if (doc.height() > win.height()) {
                return;
            }
            loadDashboards();
        });
    };

    var initUI = function () {
        var portal = $('#ues-portal');
        portal.on('click', '.ues-dashboards .ues-dashboard-trash-handle', function () {
            var thiz = $(this);
            var dashboardEl = thiz.closest('.ues-dashboard');
            var id = dashboardEl.data('id');
            var dashboard = findDashboard(id);
            dashboardEl.html(dashboardConfirmHbs(dashboard));
        });

        portal.on('click', '.ues-dashboards .ues-dashboard-trash-confirm', function () {
            deleteDashboard($(this));
        });

        portal.on('click', '.ues-dashboards .ues-dashboard-trash-cancel', function () {
            var thiz = $(this);
            var dashboardEl = thiz.closest('.ues-dashboard');
            var id = dashboardEl.data('id');
            var dashboard = findDashboard(id);
            dashboardEl.html(dashboardThumbnailHbs(dashboard));
        });

        var menu = $('.ues-context-menu');
        menu.find('.ues-tiles-menu-toggle').click(function () {
            menu.find('.ues-tiles-menu').slideToggle();
        });

        $(window).scroll(function () {
            var win = $(window);
            var doc = $(document);
            if (win.scrollTop() + win.height() < doc.height() - 100) {
                return;
            }
            loadDashboards();
        });
    };

    initUI();
    loadDashboards();
});