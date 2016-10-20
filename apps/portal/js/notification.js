
/**
 *  Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */


var NOTIFICATION_API =  'apis/notification';

$('#notification').click(function(){
    $('#right-sidebar').slideToggle();
})

var notification = {
    "notificationId": "id133",
    "title": "invitation",
    "message": "its an invitation to update the vresion",
    "directUrl": "https://localhost:9443/portal",
    "toWhom": {
        "users":{
            "userName":[ "user"]
        },
        "roles":{
            "roleName": [ "abc","admin"]
        }

    }

}
var notificationCount = getNotificationCount();
$('#notification-bubble').html(notificationCount);


if(getNotificationCount()==0){
    $('#notification_count').html("There is no new Notifications ");
}else {
    $('#notification_count').html((getNotificationCount() + " new Notifications are there"));
}


function displayNotifications(){
    var notificationDetailsHbs = Handlebars.compile($('#all-notification-hbs').html());
    var notificationIdsForUserName = getNotificationsForUser();
    var detailsAsObject = {};
    for (var i= 0; i<notificationIdsForUserName.length; i++){
        var note = 'note3';
        var details = getNotificationDetail(notificationIdsForUserName[i]);
        detailsAsObject[i]={};
        detailsAsObject[i]["title"]=details[0];
        detailsAsObject[i]["message"]=details[1];
        detailsAsObject[i]["directUrl"]= details[2];
    }

    $("#allNotifications").html(notificationDetailsHbs(detailsAsObject));

}

////// show notification
$('#notification').click(function () {
    /*$.ajax({
     url: ues.utils.tenantPrefix() + NOTIFICATION_API + '?action=addNotification',
     method: "POST",
     data: JSON.stringify(notification),
     contentType: 'application/json',
     async: false,
     success: function () {
     console.log("notification added successfully");
     }
     });*/
    displayNotifications();
});

/////get notification details for particular notification Id
function getNotificationDetail(notificationId){
    var detail;
    $.ajax({
        url : ues.utils.tenantPrefix() + NOTIFICATION_API + '/'+ notificationId + '?action=getNotificationDetails' ,
        method : "GET",
        async: false,
        contentType: "application/json",
        success : function(data){
            detail = JSON.parse(data);
        }
    });
    return detail;
}

//get unread notification count of user
function getNotificationCount(){
    var count;
    $.ajax({
        url : ues.utils.tenantPrefix() + NOTIFICATION_API + '/user/'+ '?action=getNotificationCount',
        method: "GET",
        async : false,
        success : function(data){
            count = data;
        }
    });
    return count;
}

/////get notificationIds for particular user
function getNotificationsForUser(){
    var notificationIds;
    $.ajax({
        url : ues.utils.tenantPrefix() + NOTIFICATION_API + '/user/'  + '?action=notificationsForUserName',
        method : "GET",
        async: false,
        contentType: "application/json",
        success : function(data){
            console.log("action=notificationsForUserName    " + data);
            notificationIds = JSON.parse(data);
        }
    });

    return notificationIds;
}

