function fetchAccessToken() {
    var dashboard = ues.global.dashboard;
    var tokenUrl = ues.utils.tenantPrefix() + 'apis/accesstokens/' + dashboard.id;

    $.ajax({
        url: tokenUrl,
        type: "GET",
        dataType: "json",
        data: {
            id: dashboard.id
        },
        success: onAccessTokenReceived
    });
}

function onAccessTokenReceived(data) {
    var samlAT = data.accessToken;
    publishAccessToken(samlAT);
}

function publishAccessToken(samlAccessToken) {
    if (samlAccessToken != null && samlAccessToken != "") {
        ues.hub.publish("token-channel", samlAccessToken);
    }
}