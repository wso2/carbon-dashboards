$(function () {

    var overridden = false;

    var generateUrl = function (title) {
        return title.replace(/[^\w]/g, '-').toLowerCase();
    };

    var updateUrl = function () {
        if (overridden) {
            return;
        }
        var title = $('#ues-dashboard-title').val();
        $('#ues-dashboard-id').val(generateUrl(title));
    };

    $('#ues-dashboard-title').on('keyup', function () {
        updateUrl();
    }).on('change', function () {
        updateUrl();
    });

    $('#ues-dashboard-id').on('keyup', function () {
        overridden = overridden || true;
    });

    $('#ues-dashboard-create').on('click', function () {
        var form = $('#ues-dashboard-form');
        var action = form.attr('action');
        form.attr('action', action + '/' + $('#ues-dashboard-id').val());
    });

    var menu = $('.ues-context-menu');
    menu.find('.ues-tiles-menu-toggle').click(function () {
        menu.find('.ues-tiles-menu').slideToggle();
    });
});