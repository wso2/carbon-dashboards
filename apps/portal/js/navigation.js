$(function () {

    var generateUrl = function (title) {
        return title.replace(/[^\w]/g, '-').toLowerCase();
    };

    var initDashboardCreate = function () {
        $('#dashboard-title').on('keyup', function () {
            var title = $(this).val();
            $('#dashboard-id').val(generateUrl(title));
        });
        $('#dashboard-create').on('click', function () {
            var form = $('#dashboard-form');
            var action = form.attr('action');
            form.attr('action', action + '/' + $('#dashboard-id').val());
        });
    };

    var init = function () {
        $('.ues-dashboard-create').on('click', function (e) {
            e.preventDefault();
            initDashboardCreate();
            return false;
        });
    };

    init();
});