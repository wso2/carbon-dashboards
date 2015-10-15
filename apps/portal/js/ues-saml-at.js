function fetchAccessToken() {
    var url =  "../saml/saml-access-token.jag";

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: onAccessTokenReceived
    });
}

function onAccessTokenReceived(data) {
    var samlAT = data.accessToken;
    publishAccessToken(samlAT);
}

function publishAccessToken(samlAccessToken) {
    ues.hub.publish("token-channel", samlAccessToken);
}