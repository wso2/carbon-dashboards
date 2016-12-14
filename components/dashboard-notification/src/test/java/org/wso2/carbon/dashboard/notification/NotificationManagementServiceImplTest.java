package org.wso2.carbon.dashboard.notification;

import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.BasicConfigurator;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;


import javax.net.ssl.*;
import javax.xml.xpath.XPathExpressionException;

public class NotificationManagementServiceImplTest {

    private static Log log = LogFactory.getLog(NotificationManagementServiceImplTest.class);
    public NotificationManagementServiceImplTest() throws XPathExpressionException {
    }

    @org.testng.annotations.BeforeMethod
    public void setUp() throws Exception {
        TrustManager[] trustAllCerts = new TrustManager[] {
                new X509TrustManager() {
                    public java.security.cert.X509Certificate[] getAcceptedIssuers() {
                        return null;
                    }

                    public void checkClientTrusted(X509Certificate[] certs, String authType) {  }

                    public void checkServerTrusted(X509Certificate[] certs, String authType) {  }

                }
        };

        SSLContext sc = SSLContext.getInstance("SSL");
        sc.init(null, trustAllCerts, new java.security.SecureRandom());
        HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());


    }

    @org.testng.annotations.AfterMethod
    public void tearDown() throws Exception {

    }

    @org.testng.annotations.Test
    //@Test(description = "test the login ", priority = 1)
    public void testLogin() throws Exception {
        BasicConfigurator.configure();
        //logout();
        /*AutomationContext automationContext = new AutomationContext("EMM", TestUserMode.TENANT_USER);
        String webAppUrl = automationContext.getContextUrls().getWebAppURL();*/

        /*URL url = new URL( TestConstants.AUTHENTICATION_REQUEST_URL +"?tenantId="+ TestConstants.TENANT_ID);
        HttpsURLConnection connection = (HttpsURLConnection) url.openConnection();
        connection.setRequestMethod(TestConstants.HTTP_POST_METHOD);
        connection.setRequestProperty("encoded", TestConstants.ENCODED_STRING);

        connection.setDoOutput(true);
        connection.setDoInput(true);
        connection.setHostnameVerifier(new HostnameVerifier() {
            @Override
            public boolean verify(String s, SSLSession sslSession) {
                return true;
            }
        });
        int response = connection.getResponseCode();
        String xxx = connection.getResponseMessage();

        log.info(response + xxx);
        connection.disconnect();
*/
        //logout();


    }

    @org.testng.annotations.Test
    public void testAddNotification() throws Exception {
        /*BasicConfigurator.configure();
        URL url = new URL(TestConstants.ADD_NOTIFICATION_REQUEST_URL);
        Notification notification = new Notification();
        notification.setNotificationId("3244");
        notification.setDirectUrl("45345345gdgsfgsd");
        notification.setTitle("werwwrew");
        notification.setMessage("sfdsdf");
        List<String> users = new ArrayList<String>();
        users.add("user");
        users.add("admin");
        notification.setUsers(users);
        HttpsURLConnection connection = (HttpsURLConnection) url.openConnection();
        connection.setRequestProperty("uuid", "dfksmdfkmdsfm");
        connection.setRequestProperty("username","admin");
        connection.setDoOutput(true);
        connection.setDoInput(true);
        connection.setHostnameVerifier(new HostnameVerifier() {
            @Override
            public boolean verify(String s, SSLSession sslSession) {
                return true;
            }
        });
        int response = connection.getResponseCode();
        log.info(response);
        connection.disconnect();*/



    }

    @org.testng.annotations.Test
    public void testGetNotificationDetails() throws Exception {

    }

    @org.testng.annotations.Test
    public void testUpdateStatusOfNotification() throws Exception {

    }

    @org.testng.annotations.Test
    public void testGetUnreadNotificationCount() throws Exception {

    }

    public void logout() throws Exception {
        /*URL url = new URL( TestConstants.LOGOUT_REQUEST_URL+ "?username="+ TestConstants.USERNAME);
        HttpsURLConnection connection = (HttpsURLConnection) url.openConnection();
        connection.setDoOutput(true);
        connection.setDoInput(true);
        connection.setHostnameVerifier(new HostnameVerifier() {
            @Override
            public boolean verify(String s, SSLSession sslSession) {
                return true;
            }
        });
        int response = connection.getResponseCode();
        String xxx = connection.getResponseMessage();

        log.info(response + xxx+"kkkkk");
        connection.disconnect();
    }
*/
    }
}