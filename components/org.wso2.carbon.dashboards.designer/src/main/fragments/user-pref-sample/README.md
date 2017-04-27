Follow the official guide on creating an UUF fragment | WSO2 widget spec to construct the directory structure for the widget. 

Assume the name of the widget which we are going to create is "user-pref-sample" hence following will be our directory structure.

![image_0](https://cloud.githubusercontent.com/assets/1343257/25468594/7337e9f6-2b06-11e7-89ff-1dfb48eaa04b.png)

Steps to create the widget

* widgetConf.json should reflects that this is a user-pref enabled widget, this configuration will be used by the view component to apply user-pref features to this widget.

```
{
  "info": {
    "id": "org.wso2.carbon.dashboards.designer.user-pref-sample",
    "displayName": "User-pref Sample",
    "thumbnail": "widget-thumbnail.jpg"
  },
  "userpref": {
    "enable": true
  },
  "permission": {
    
  }
}

```  

* Following is the template for the user-pref-sample.hbs.

```
<div id="template-container">
    <div id="content-template" class="user-pref content-template"></div>
    <div id="user-pref-template" class="user-pref user-pref-template" style="display: none"></div>
</div>

<script src="{{public "js/user-pref.js"}}" type="text/javascript"></script>
```

Widget author should follow the same template(div id’s, inline styles ) . These information will be used by the view component in order to do the rendering. 

"content-template" div should includes the widget content while “user-pref-template” div should includes the user-preferences content.

* Widget author can set and retrieve user preferences from the following global object.

portal.dashboard.widgets[<widget-id>].userpref.<name>

Eg:-

```
portal.dashboards.widgets['org.wso2.carbon.dashboards.designer.user-pref-sample'].userpref
```

* If widget author is setting an user-pref, that operation should follows with the following function invocation.

```
portal.dashboards.functions.view.update();
```

This will notify the view component to update and save the user-pref accordingly.

Eg:- 

```
$( "#color-select" ).change(function(e) {
  var selectedColor = $("#color-select option:selected").attr('value');
  portal.dashboards.widgets['org.wso2.carbon.dashboards.designer.user-pref-sample'].userpref.bgcolor = selectedColor;
  portal.dashboards.functions.view.update();
});
```