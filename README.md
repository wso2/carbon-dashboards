# WSO2 Dashboard Component

WSO2 Dashboards , allows you to create any custom dashboard, with a preferred layout, and manage and visualize these gadgets, which renders the data that you are interested in, as shown in the below diagram. 


![Intro Image](https://cloud.githubusercontent.com/assets/10518715/23993643/65926430-0a67-11e7-8af6-beb0e39437a3.png)

## Architecture

The following diagram illustrates the high level architecture of WSO2 Dashboard component.

![Archi Image](https://cloud.githubusercontent.com/assets/10518715/23993698/95c44ca4-0a67-11e7-8ac2-caaa8a911a3e.png)

## Getting Started

This repository consists of set of UUF components which can be used to create,design and view dashboards. So users need to add these components into UUF app in order to tryout these dashboard components. Please follow instructions given here in order to get an understanding about creating UUF app. 

Please use following maven dependency within a UUF based application in order to tryout these dashboard components.

```xml
<dependency>
    <groupId>org.wso2.carbon.dashboards</groupId>
    <artifactId>org.wso2.carbon.dashboards.view</artifactId>
    <version>3.0.0-SNAPSHOT</version>
    <type>zip</type>
    <classifier>uuf-component</classifier>
</dependency>
<dependency>
    <groupId>org.wso2.carbon.dashboards</groupId>
    <artifactId>org.wso2.carbon.dashboards.designer</artifactId>
    <version>3.0.0-SNAPSHOT</version>
    <type>zip</type>
    <classifier>uuf-component</classifier>
</dependency>
<dependency>
    <groupId>org.wso2.carbon.dashboards</groupId>
    <artifactId>org.wso2.carbon.dashboards.api.feature</artifactId>
    <version>3.0.0-SNAPSHOT</version>
    <type>zip</type>
</dependency>
```

## License

Carbon dashboards is available under the Apache 2 License.

## How To Contribute

* Please report issues at [WSO2 Carbon Dashboard Issues](https://github.com/wso2/carbon-dashboards/issues)
* Send your pull requests.
* You can find more instructions on howto contribute on community site (http://wso2.com/community).

## Contact Us

WSO2 developers can be contacted via the mailing lists:
* WSO2 Developers List : dev@wso2.org
* WSO2 Architecture List : architecture@wso2.org

