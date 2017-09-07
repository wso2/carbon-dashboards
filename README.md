# WSO2 Dashboard Component

## Getting Started

Please follow the below steps to setup the WSO2 Dashboard Component.
1. Clone and build carbon-dashboards repository. You need to build the "react-based-dashboard" branch
2. Clone and build the carbon-ui-server repository available here ( Carbon-UI-Server - https://github
.com/wso2/carbon-ui-server/ )
3. Install Dashboard Core API Feature and Dashboard Portal Feature in to distribution available in carbon-ui-server.
4. You can add following properties to pom file available in Carbon-UI-Server/tests/distribution directory.

```xml
        <dependency>
            <groupId>org.wso2.carbon.dashboards</groupId>
            <artifactId>org.wso2.carbon.dashboards.api.feature</artifactId>
            <version>4.0.0-SNAPSHOT</version>
            <type>zip</type>
        </dependency>
        <dependency>
            <groupId>org.wso2.carbon.dashboards</groupId>
            <artifactId>org.wso2.carbon.dashboards.portal.feature</artifactId>
            <version>4.0.0-SNAPSHOT</version>
            <type>zip</type>
        </dependency>
```

```xml
        <feature>
            <id>org.wso2.carbon.dashboards.api.feature</id>
            <version>4.0.0-SNAPSHOT</version>
        </feature>
        <feature>
            <id>org.wso2.carbon.dashboards.portal.feature</id>
            <version>4.0.0-SNAPSHOT</version>
        </feature>

```

5. Unzip the distribution and run the server. You can access the dashboard component from
https://localhost:9292/portal/
http://localhost:9090/portal/

## License
Carbon dashboards is available under the Apache 2 License.

## How To Contribute
    Please report issues at WSO2 Carbon Dashboard Issues
    Send your pull requests.
    You can find more instructions on howto contribute on community site (http://wso2.com/community).

## Contact Us

WSO2 developers can be contacted via the mailing lists:

    WSO2 Developers List : dev@wso2.org
    WSO2 Architecture List : architecture@wso2.org
