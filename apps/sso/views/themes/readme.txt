Overriding the default look and feel
--------------------------------------

1 - Create a new folder inside <sso-app-root>/views/themes/ folder ( say "sample" ). This is our theme name.

2 - Add an entry to <sso-app-root>/jaggery.conf with "theme" as the key and "sample" as the value.

    "theme":"sample"

3 - Now you can override the files in <sso-app-root>/views/ folder from  <sso-app-root>/views/themes/sample/.
    For an example, sso-app-root>/views/themes/sample/images/logo.png can override the original logo in
    <sso-app-root>/views/images/logo.png


    Note: All files are not supported. Files inside the following folders are supported.
     <sso-app-root>/views/css/
     <sso-app-root>/views/js/
     <sso-app-root>/views/includes/
     <sso-app-root>/views/images/
