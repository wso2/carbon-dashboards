/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package org.wso2.carbon.dashboards.core.internal.database;

import com.google.gson.Gson;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.wso2.carbon.dashboards.core.bean.widget.GeneratedWidgetConfigs;
import org.wso2.carbon.dashboards.core.exception.DashboardException;

import java.nio.charset.StandardCharsets;
import java.sql.Blob;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.stream.Stream;
import javax.sql.DataSource;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Test cases for {@link WidgetMetadataDaoTest} class.
 *
 * @since 4.0.0
 */
public class WidgetMetadataDaoTest {

    private static final Gson GSON = new Gson();

    private static Stream<Arguments> sqlAutoCloseablesProvider() throws Exception {
        return Stream.of(
                Arguments.of(null, null, null),
                Arguments.of(mock(Connection.class), mock(PreparedStatement.class), mock(ResultSet.class)),
                Arguments.of(throwSqlExceptionWhenClosing(mock(Connection.class)), null, null),
                Arguments.of(null, throwSqlExceptionWhenClosing(mock(PreparedStatement.class)), null),
                Arguments.of(null, null, throwSqlExceptionWhenClosing(mock(ResultSet.class)))
        );
    }

    private static AutoCloseable throwSqlExceptionWhenClosing(AutoCloseable autoCloseableMock) throws Exception {
        doThrow(SQLException.class).when(autoCloseableMock).close();
        return autoCloseableMock;
    }

    private static Stream<Connection> sqlConnectionsProvider() throws SQLException {
        Connection exceptionThrowingConnection = mock(Connection.class);
        doThrow(SQLException.class).when(exceptionThrowingConnection).rollback();
        return Stream.of(
                null, mock(Connection.class), exceptionThrowingConnection
        );
    }

    private static WidgetMetadataDao createDao(Connection mockedConnection) throws SQLException {
        DataSource dataSource = mock(DataSource.class);
        when(dataSource.getConnection()).thenReturn(mockedConnection);
        QueryManager queryManager = mock(QueryManager.class);
        when(queryManager.getQuery(any(), anyString())).thenReturn("");
        return new WidgetMetadataDao(dataSource, queryManager);
    }

    private static Connection createConnection(PreparedStatement mockPreparedStatement) throws SQLException {
        Connection connection = mock(Connection.class);
        when(connection.prepareStatement(anyString())).thenReturn(mockPreparedStatement);
        when(connection.createBlob()).thenReturn(mock(Blob.class));
        return connection;
    }

    @ParameterizedTest
    @MethodSource("sqlAutoCloseablesProvider")
    void testCloseQuietly(Connection connection, PreparedStatement preparedStatement, ResultSet resultSet)
            throws SQLException {
        WidgetMetadataDao.closeQuietly(connection, preparedStatement, resultSet);

        if (connection != null) {
            verify(connection).close();
        }
        if (preparedStatement != null) {
            verify(preparedStatement).close();
        }
        if (resultSet != null) {
            verify(resultSet).close();
        }
    }

    @ParameterizedTest
    @MethodSource("sqlConnectionsProvider")
    void testRollbackQuietly(Connection connection) throws SQLException {
        WidgetMetadataDao.rollbackQuietly(connection);

        if (connection != null) {
            verify(connection).rollback();
        }
    }

    @Test
    void testGetGeneratedWidgetConfigsForIdThrowException() throws Exception {
        PreparedStatement preparedStatement = mock(PreparedStatement.class);
        when(preparedStatement.executeQuery()).thenThrow(SQLException.class);
        Connection connection = createConnection(preparedStatement);
        WidgetMetadataDao dao = createDao(connection);

        Assertions.assertThrows(DashboardException.class, () -> dao.getGeneratedWidgetConfigsForId("foo"));
        verify(preparedStatement).close();
        verify(connection).close();
    }

    @Test
    void testGetGeneratedWidgetConfigsForIdWhenNoResult() throws Exception {
        ResultSet resultSet = mock(ResultSet.class);
        when(resultSet.next()).thenReturn(false);
        PreparedStatement preparedStatement = mock(PreparedStatement.class);
        when(preparedStatement.executeQuery()).thenReturn(resultSet);
        Connection connection = createConnection(preparedStatement);
        WidgetMetadataDao dao = createDao(connection);

        Assertions.assertFalse(dao.getGeneratedWidgetConfigsForId("foo") != null);
        verify(preparedStatement).close();
        verify(connection).close();
        verify(resultSet).close();
    }

    @Test
    void testGetGeneratedWidgetConfigsForId() throws Exception {
        Blob blob = mock(Blob.class);
        GeneratedWidgetConfigs generatedWidgetConfigs = new GeneratedWidgetConfigs();
        when(blob.getBytes(anyLong(), anyInt())).thenReturn(GSON.toJson(generatedWidgetConfigs)
                .getBytes(StandardCharsets.UTF_8));
        ResultSet resultSet = mock(ResultSet.class);
        when(resultSet.next()).thenReturn(true);
        when(resultSet.getBlob(anyString())).thenReturn(blob);
        PreparedStatement preparedStatement = mock(PreparedStatement.class);
        when(preparedStatement.executeQuery()).thenReturn(resultSet);
        Connection connection = createConnection(preparedStatement);
        WidgetMetadataDao dao = createDao(connection);

        Assertions.assertTrue(dao.getGeneratedWidgetConfigsForId("foo") != null);
        verify(preparedStatement).close();
        verify(connection).close();
        verify(resultSet).close();
    }

    @Test
    void testGetGeneratedWidgetIdSetThrowException() throws Exception {
        PreparedStatement preparedStatement = mock(PreparedStatement.class);
        when(preparedStatement.executeQuery()).thenThrow(SQLException.class);
        Connection connection = createConnection(preparedStatement);
        WidgetMetadataDao dao = createDao(connection);

        Assertions.assertThrows(DashboardException.class, dao::getGeneratedWidgetIdSet);
        verify(preparedStatement).close();
        verify(connection).close();
    }

    @Test
    void testGetGeneratedWidgetIdSetWhenNoResult() throws Exception {
        ResultSet resultSet = mock(ResultSet.class);
        when(resultSet.next()).thenReturn(false);
        PreparedStatement preparedStatement = mock(PreparedStatement.class);
        when(preparedStatement.executeQuery()).thenReturn(resultSet);
        Connection connection = createConnection(preparedStatement);
        WidgetMetadataDao dao = createDao(connection);

        Assertions.assertFalse(!dao.getGeneratedWidgetIdSet().isEmpty());
        verify(preparedStatement).close();
        verify(connection).close();
        verify(resultSet).close();
    }

    @Test
    void testGetGeneratedWidgetIdSet() throws Exception {
        Blob blob = mock(Blob.class);
        GeneratedWidgetConfigs generatedWidgetConfigs = new GeneratedWidgetConfigs();
        when(blob.getBytes(anyLong(), anyInt())).thenReturn(GSON.toJson(generatedWidgetConfigs)
                .getBytes(StandardCharsets.UTF_8));
        ResultSet resultSet = mock(ResultSet.class);
        when(resultSet.next()).thenReturn(true, false);
        //when(resultSet.getString(anyString())).thenReturn("foo");
        when(resultSet.getBlob(anyString())).thenReturn(blob);
        PreparedStatement preparedStatement = mock(PreparedStatement.class);
        when(preparedStatement.executeQuery()).thenReturn(resultSet);
        Connection connection = createConnection(preparedStatement);
        WidgetMetadataDao dao = createDao(connection);

        Assertions.assertTrue(!dao.getGeneratedWidgetIdSet().isEmpty());
        verify(preparedStatement).close();
        verify(connection).close();
        verify(resultSet).close();
    }

    @Test
    void testAddGeneratedWidgetConfigsThrowException() throws Exception {
        PreparedStatement preparedStatement = mock(PreparedStatement.class);
        when(preparedStatement.executeUpdate()).thenThrow(SQLException.class);
        Connection connection = createConnection(preparedStatement);
        WidgetMetadataDao dao = createDao(connection);
        GeneratedWidgetConfigs generatedWidgetConfigs = new GeneratedWidgetConfigs();
        generatedWidgetConfigs.setName("foo");
        Assertions.assertThrows(DashboardException.class, () -> dao.addGeneratedWidgetConfigs(generatedWidgetConfigs));
        verify(preparedStatement).close();
        verify(connection).close();
    }

    @Test
    void testAddGeneratedWidgetConfigs() throws Exception {
        GeneratedWidgetConfigs generatedWidgetConfigs = new GeneratedWidgetConfigs();
        generatedWidgetConfigs.setName("Foo Widget");
        generatedWidgetConfigs.setProviderConfig(GSON.toJsonTree("{\"providerId\": \"sample-provider\"}"));
        generatedWidgetConfigs.setChartConfig(GSON.toJsonTree("{\"chartId\": \"sample-chart\"}"));
        PreparedStatement preparedStatement = mock(PreparedStatement.class);
        when(preparedStatement.executeUpdate()).thenReturn(1);
        Connection connection = createConnection(preparedStatement);
        WidgetMetadataDao dao = createDao(connection);
        dao.addGeneratedWidgetConfigs(generatedWidgetConfigs);
        verify(preparedStatement).close();
        verify(connection).close();
    }

    @Test
    void testDeleteThrowException() throws Exception {
        PreparedStatement preparedStatement = mock(PreparedStatement.class);
        when(preparedStatement.executeUpdate()).thenThrow(SQLException.class);
        Connection connection = createConnection(preparedStatement);
        WidgetMetadataDao dao = createDao(connection);

        Assertions.assertThrows(DashboardException.class, () -> dao.delete("foo"));
        verify(connection).setAutoCommit(false);
        verify(connection).rollback();
        verify(preparedStatement).close();
        verify(connection).close();
    }

    @Test
    void testDelete() throws Exception {
        PreparedStatement preparedStatement = mock(PreparedStatement.class);
        Connection connection = createConnection(preparedStatement);
        WidgetMetadataDao dao = createDao(connection);

        dao.delete("foo");
        verify(connection).setAutoCommit(false);
        verify(preparedStatement).executeUpdate();
        verify(connection).commit();
        verify(preparedStatement).close();
        verify(connection).close();
    }

}
