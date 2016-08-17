package org.wso2.carbon.dashboard.portal.core.datasource;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.wso2.carbon.dashboard.portal.core.DashboardPortalException;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class DataBaseHandler {
    private static final Log log = LogFactory.getLog(DataBaseHandler.class);
    private static DataBaseHandler instance;
    private DataBaseInitializer dataBaseInitializer;

    public static DataBaseHandler getInstance() throws DashboardPortalException {
        if (instance == null) {
            synchronized (DataBaseInitializer.class) {
                if (instance == null) {
                    instance = new DataBaseHandler();
                }
            }
        }
        return instance;
    }

    private DataBaseHandler() {
        try {
            dataBaseInitializer = DataBaseInitializer.getInstance();
        } catch (Throwable throwable) {
            log.error("Error while getting the database initializer instance. ", throwable);
        }
    }

    /**
     * Method to insert a gadget usage info
     *
     * @param tenantID    Tenant ID of the user
     * @param dashboardID Dashboard ID of the dashboard
     * @param gadgetId    Gadget ID that is used in the dashboard
     * @param gadgetState State of the gadget whether it is exist or not
     * @param usageData   Representation of the usage info of the particular gadget in the dashboard
     * @throws DashboardPortalException
     */
    public void insertGadgetUsageInfo(int tenantID, String dashboardID, String gadgetId, boolean gadgetState,
            String usageData) throws DashboardPortalException {
        try {
            Connection connection = dataBaseInitializer.getDBConnection();
            PreparedStatement preparedStatement = connection.prepareStatement(DataSourceConstants.SQL_INSERT_USAGE_OPERATION);
            preparedStatement.setInt(1, tenantID);
            preparedStatement.setString(2, dashboardID);
            preparedStatement.setString(3, gadgetId);
            preparedStatement.setBoolean(4, gadgetState);
            preparedStatement.setString(5, usageData);
            preparedStatement.executeUpdate();
            if (!connection.getAutoCommit()) {
                connection.commit();
            }
        } catch (SQLException e) {
            log.error("Cannot insert the gadget usage info ", e);
        }

    }
}
