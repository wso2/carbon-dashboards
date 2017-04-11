(function () {
    "use strict";
    $("#sendMsg").click(function(){
        pubsub.publish($('#msg').val(), 'PUBLISHER');
    }); 
}());