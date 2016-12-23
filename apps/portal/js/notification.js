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
var ApiUrl = "https://localhost:9443/notification/services/notifications/notificationApi";
var CREATE_PROXY = 'apis/login';
var UUID = "";
var notification = {
    "notification": {
        "notificationId": "33",
        "title": "invitation",
        "message": "its an invitation to update the vresion",
        "directUrl": "https://localhost:9443/portal",
        "users": ["admin@carbon.super"],
        "roles": ["admin"]
    }
};

login();
function login() {
    $.ajax({
        url: ues.utils.relativePrefix() + CREATE_PROXY,
        method: "GET",
        contentType: "text/plain",
        async: false,
        success: function (data) {
            UUID = data;
            console.log(UUID);
        },
        error: function (error) {
            console.log(error);
        }
    });
}


$('#notification').click(function () {
    $('#right-sidebar').slideToggle();
    //updateNotificationList();
    displayNotifications();
    /* $.ajax({
     url: 'https://localhost:9443/notification/services/notifications/notificationApi/notifications/' + '?uuid=' + UUID + '&username=' + userName + '&tenantId=-1234',
     method: 'POST',
     data: JSON.stringify(notification),
     async: false,
     contentType: "application/json",
     success: function (data) {
     console.log("notification added successfully" + data);

     },
     error: function (error) {
     console.log(error);
     }
     });*/
});

//display notifications in tha slide bar
function displayNotifications() {
    var notificationDetailsHbs = Handlebars.compile($('#all-notification-hbs').html());
    var details = getNotificationDetail();
    if (details) {
        $("#allNotifications").html(notificationDetailsHbs(details));
    }

}


/////get notification details for particular notification Id
function getNotificationDetail() {
    var detail;
    $.ajax({
        url: ApiUrl + '/notifications/detail/' + '?uuid=' + UUID + '&username=' + userName + '&tenantId=-1234',
        method: 'GET',
        async: false,
        contentType: "application/xml",
        success: function (response) {
            console.log("xxxxx");
            console.log(response.type);
            detail = (response);
        },
        error: function (error) {
            console.log("errorrrr");
            console.log(error);
        }
    });
    return detail;
}


function updateNotificationList() {
    $.ajax({
        url: ApiUrl + '/notifications/update/?notificationId=' + '1' + '&uuid=' + UUID + '&username=' + userName + '&tenantId=-1234',
        method: 'PUT',
        async: false,
        contentType: "text/plain",
        success: function (response) {
            console.log("xxxxx");
            console.log(response.type);

        },
        error: function (error) {
            console.log("errorrrr");
            console.log(error);
        }
    });
}



