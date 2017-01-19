$(document).ready(function() {
    $("#ues-dashboard-url").change(function() {
        var url = $('#ues-dashboard-url').val();
        url = url.replace(/\s/g, '');
        url = encodeURIComponent(url);
        $('#ues-dashboard-url').val(url);
    });
    $('#ues-dashboard-form').validate({
        rules: {
            title: {
                required: true
            },
            url: {
                minlength: 5,
                required: true
            }

        },
        submitHandler: function(form) { // for demo
            alert('valid form');
            return false;
        }
    });

    $("#ues-dashboard-create").on("click", function() {
        if ($('#ues-dashboard-form').valid()) {
            isUrlExist();
        }
    });

    function addDashboard() {
        var url = $('#ues-dashboard-url').val();
        var name = $('#ues-dashboard-title').val()
        var description = $('#ues-dashboard-description').val()
        var owner = $('#ues-dashboard-user').val();

        var data = {};
        data.url = url;
        data.name = name;
        data.description = description;
        data.owner = owner;

        $.ajax({
            url: '../../view/apis/dashboard/add',
            data: JSON.stringify(data),
            type: 'POST',
            contentType: 'application/json',
            success: function() {
                alert('ues-dashboard-create 1');
            },
            error: function() {
                alert('ues-dashboard-create 3');
            }
        });
    }

    function isUrlExist() {
        var url = $('#ues-dashboard-url').val();
        var data = {};
        data.url = url;

        $.ajax({
            url: '../../view/apis/dashboard/exists',
            data: JSON.stringify(data),
            type: 'POST',
            contentType: 'application/json',
            success: function(response) {
                if (response === false) {
                    addDashboard();
                } else {
                    alert('Dashboard URL is already exist');
                }
            },
            error: function() {
                alert('Dashboard URL is already exist');
            }
        });

    }
}());
