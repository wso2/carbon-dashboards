$(function () {

    var dashboardsApi = ues.utils.tenantPrefix() + 'apis/dashboards';

    var dashboardsListHbs = Handlebars.compile($("#ues-dashboards-list-hbs").html());

    var initDashboardList = function () {
        ues.store.assets('dashboard', {
            start: 0,
            count: 20
        }, function (err, data) {
            $('#ues-portal').html(dashboardsListHbs(data))
                .find('.ues-dashboards .ues-trash-handle').on('click', function () {
                    var button = Ladda.create(this);
                    button.start();
                    var id = $(this).closest('.ues-dashboard').data('id');
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
                    })
                });
        });
    };

    initDashboardList();
});