function showContent() {

    var prefs = new gadgets.Prefs();
    var isSouqEnabled = prefs.getString("Souq");
    var isFacebookEnabled = prefs.getString("Facebook");
    var isTwitterEnabled = prefs.getString("Twitter");
    var isGulfEnabled = prefs.getString("GulfNews");
    var isDubaiEnabled = prefs.getString("DubaiOne");
    $("#cont").show();

    console.log(isGulfEnabled);
    console.log(isSouqEnabled);

    if (isGulfEnabled == "true") {
        displayGulfNews();
        $("#gulf-news").show();
    }

    if (isSouqEnabled == "true") {
        displaySouqUpdates();
        $("#souq").show();
    }

    if (isTwitterEnabled == "true") {
        displayTwitterUpdates();
        $("#twitter").show();
    }

    if (isFacebookEnabled == "true") {
        displayFacebookUpdates();
        $("#facebook").show();
    }

    if (isDubaiEnabled == "true") {
        displayDubaiOneUpdates();
        $("#dubai-one").show();
    }

}

function displayGulfNews() {
    $.get('https://203.94.95.213:8244/notifications/1.0.0', function onSuccess(data) {

        var interval = 20000;
        var counter = 1;
        var initial = true;
        var el = $(data);
        var count = el.find("item").length;

        var item = el.find("item")[0];
        var titleVal = $(item).find("title").text();
        $('#gulf-list').html(titleVal);

        var readRssFeed = setInterval(function () {
            var item = el.find("item")[counter];
            var titleVal = $(item).find("title").text();
            $('#gulf-list').html(titleVal);
            counter++;
            if (counter == count) {
                clearInterval(readRssFeed);
                displayGulfNews();
            }
        }, interval);

    }, 'xml');
}

function displaySouqUpdates() {
    $.get('https://203.94.95.213:8244/souq/1.0.0', function onSuccess(data) {

        var interval = 10000;
        var counter = 1;
        var initial = true;
        var el = $(data);
        var count = el.find("item").length;

        var item = el.find("item")[0];
        var titleVal = $(item).find("title").text();
        $('#souq-list').html(titleVal);

        setInterval(function () {
            var item = el.find("item")[counter];
            var titleVal = $(item).find("title").text();
            $('#souq-list').html(titleVal);
            counter++;
            if (counter == count) {
                counter = 0;
            }
        }, interval);

    }, 'xml');
}

function displayTwitterUpdates() {
    twttr.widgets.createTimeline(
        "645893140499443712",
        document.getElementById("twitter"),
        {
            listOwnerScreenName: "testWick12345",
            listSlug: "PC-List",
            chrome: "noheader",
            tweetLimit: "1"
        }
    );
}

function displayFacebookUpdates() {
    //TODO facebook
}

function displayDubaiOneUpdates() {
    //TODO dubai one
}





