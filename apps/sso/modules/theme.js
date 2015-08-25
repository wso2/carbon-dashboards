/*
 *  Copyright (c) 2014, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

/**
 * Get a url and check weather there is a theme defined. Else load the default theme.
 * If there is a theme then return the theme specific file url
 *
 * @url originalUrl
 * @return url
 */
 var JAGGERY_CONF = "/jaggery.conf";

var getThemedUrl = function (url) {
    var log = new Log("getThemedUrl");

    //get the theme from session
    var theme = session.get('theme');
    if(!theme) {
        //If theme is not in session read it from config
        var file = new File(JAGGERY_CONF);
        file.open("r");
        var message = file.readAll();
        file.close();

        theme = JSON.parse(message).theme;
        session.put('theme',theme);
    }

    // Generate the path for the theme
    var themedUrl = "";
    var splitedUrl = "";
    var resourceFile;
    if(theme){
        //for css,images and js files have to remove the views/ part from the url
        if(url.split('/')[0]=="views"){
            splitedUrl = url.split("views/").pop();
            themedUrl = "views/themes/" + theme + "/" + splitedUrl;
            resourceFile = new File("/"+themedUrl);
            if(resourceFile.isExists()){
                return themedUrl;
            }else{
                return url;
            }
        }else{
            themedUrl = "/views/themes/" + theme + "/" + url;
            resourceFile = new File(themedUrl);
            if(resourceFile.isExists()){
                return themedUrl;
            }else{
                return url;
            }
        }


    }else{
        return url;
    }

};

