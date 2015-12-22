function fetchAccessToken() {
    var dashboard = ues.global.dashboard;
    var url = "/portal/saml/saml-access-token.jag";

    $.ajax({
        url: url,
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