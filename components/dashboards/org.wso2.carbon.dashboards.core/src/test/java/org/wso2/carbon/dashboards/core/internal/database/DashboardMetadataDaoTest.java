/*
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package org.wso2.carbon.dashboards.core.internal.database;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.wso2.carbon.dashboards.core.bean.DashboardMetadata;
import org.wso2.carbon.dashboards.core.bean.DashboardMetadataContent;
import org.wso2.carbon.dashboards.core.exception.DashboardException;

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
 * Test cases for {@link DashboardMetadataDao} class.
 *
 * @since 4.0.0
 */
public class DashboardMetadataDaoTest {

    @ParameterizedTest
    @MethodSource("sqlAutoCloseablesProvider")
    void testCloseQuietly(Connection connection, PreparedStatement preparedStatement, ResultSet resultSet)
            throws SQLException {
        DashboardMetadataDao.closeQuietly(connection, preparedStatement, resultSet);

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

    @ParameterizedTest
    @MethodSource("sqlConnectionsProvider")
    void testRollbackQuietly(Connection connection) throws SQLException {
        DashboardMetadataDao.rollbackQuietly(connection);

        if (connection != null) {
            verify(connection).rollback();
        }
    }

    private static Stream<Connection> sqlConnectionsProvider() throws SQLException {
        Connection exceptionThrowingConnection = mock(Connection.class);
        doThrow(SQLException.class).when(exceptionThrowingConnection).rollback();
        return Stream.of(
                null, mock(Connection.class), exceptionThrowingConnection
        );
    }

    @Test
    void testGetThrowException() throws Exception {
        PreparedStatement preparedStatement = mock(PreparedStatement.class);
        when(preparedStatement.executeQuery()).thenThrow(SQLException.class);
        Connection connection = createConnection(preparedStatement);
        DashboardMetadataDao dao = createDao(connection);

        Assertions.assertThrows(DashboardException.class, () -> dao.get("foo"));
        verify(preparedStatement).close();
        verify(connection).close();
    }

    @Test
    void testGetWhenNoResult() throws Exception {
        ResultSet resultSet = mock(ResultSet.class);
        when(resultSet.next()).thenReturn(false);
        PreparedStatement preparedStatement = mock(PreparedStatement.class);
        when(preparedStatement.executeQuery()).thenReturn(resultSet);
        Connection connection = createConnection(preparedStatement);
        DashboardMetadataDao dao = createDao(connection);

        Assertions.assertFalse(dao.get("foo").isPresent());
        verify(preparedStatement).close();
        verify(connection).close();
        verify(resultSet).close();
    }

    @Test
    void testGet() throws Exception {
        Blob blob = mock(Blob.class);
        when(blob.getBytes(anyLong(), anyInt())).thenReturn(new byte[]{});
        ResultSet resultSet = mock(ResultSet.class);
        when(resultSet.next()).thenReturn(true);
        when(resultSet.getBlob(anyString())).thenReturn(blob);
        PreparedStatement preparedStatement = mock(PreparedStatement.class);
        when(preparedStatement.executeQuery()).thenReturn(resultSet);
        Connection connection = createConnection(preparedStatement);
        DashboardMetadataDao dao = createDao(connection);

        Assertions.assertTrue(dao.get("foo").isPresent());
        verify(preparedStatement).close();
        verify(connection).close();
        verify(resultSet).close();
    }

    @Test
    void testGetAllThrowException() throws Exception {
        PreparedStatement preparedStatement = mock(PreparedStatement.class);
        when(preparedStatement.executeQuery()).thenThrow(SQLException.class);
        Connection connection = createConnection(preparedStatement);
        DashboardMetadataDao dao = createDao(connection);

        Assertions.assertThrows(DashboardException.class, dao::getAll);
        verify(preparedStatement).close();
        verify(connection).close();
    }

    @Test
    void testGetAll() throws Exception {
        ResultSet resultSet = mock(ResultSet.class);
        when(resultSet.next()).thenReturn(true, false);
        PreparedStatement preparedStatement = mock(PreparedStatement.class);
        when(preparedStatement.executeQuery()).thenReturn(resultSet);
        Connection connection = createConnection(preparedStatement);
        DashboardMetadataDao dao = createDao(connection);

        Assertions.assertEquals(1, dao.getAll().size());
        verify(preparedStatement).close();
        verify(connection).close();
        verify(resultSet).close();
    }

    @Test
    void testAddThrowException() throws Exception {
        PreparedStatement preparedStatement = mock(PreparedStatement.class);
        when(preparedStatement.executeUpdate()).thenThrow(SQLException.class);
        Connection connection = createConnection(preparedStatement);
        DashboardMetadataDao dao = createDao(connection);

        Assertions.assertThrows(DashboardException.class, () -> dao.add(createDashboardMetadata()));
        verify(connection).setAutoCommit(false);
        verify(connection).rollback();
        verify(preparedStatement).close();
        verify(connection).close();
    }

    @Test
    void testAdd() throws Exception {
        PreparedStatement preparedStatement = mock(PreparedStatement.class);
        Connection connection = createConnection(preparedStatement);
        DashboardMetadataDao dao = createDao(connection);

        dao.add(createDashboardMetadata());
        verify(connection).setAutoCommit(false);
        verify(preparedStatement).executeUpdate();
        verify(connection).commit();
        verify(preparedStatement).close();
        verify(connection).close();
    }

    @Test
    void testUpdateThrowException() throws Exception {
        PreparedStatement preparedStatement = mock(PreparedStatement.class);
        when(preparedStatement.executeUpdate()).thenThrow(SQLException.class);
        Connection connection = createConnection(preparedStatement);
        DashboardMetadataDao dao = createDao(connection);

        Assertions.assertThrows(DashboardException.class, () -> dao.update(createDashboardMetadata()));
        verify(connection).setAutoCommit(false);
        verify(connection).rollback();
        verify(preparedStatement).close();
        verify(connection).close();
    }

    @Test
    void testUpdate() throws Exception {
        PreparedStatement preparedStatement = mock(PreparedStatement.class);
        Connection connection = createConnection(preparedStatement);
        DashboardMetadataDao dao = createDao(connection);

        dao.update(createDashboardMetadata());
        verify(connection).setAutoCommit(false);
        verify(preparedStatement).executeUpdate();
        verify(connection).commit();
        verify(preparedStatement).close();
        verify(connection).close();
    }

    @Test
    void testDeleteThrowException() throws Exception {
        PreparedStatement preparedStatement = mock(PreparedStatement.class);
        when(preparedStatement.executeUpdate()).thenThrow(SQLException.class);
        Connection connection = createConnection(preparedStatement);
        DashboardMetadataDao dao = createDao(connection);

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
        DashboardMetadataDao dao = createDao(connection);

        dao.delete("foo");
        verify(connection).setAutoCommit(false);
        verify(preparedStatement).executeUpdate();
        verify(connection).commit();
        verify(preparedStatement).close();
        verify(connection).close();
    }

    private static DashboardMetadataDao createDao(Connection mockedConnection) throws SQLException {
        DataSource dataSource = mock(DataSource.class);
        when(dataSource.getConnection()).thenReturn(mockedConnection);
        QueryManager queryManager = mock(QueryManager.class);
        when(queryManager.getQuery(any(), anyString())).thenReturn("");
        return new DashboardMetadataDao(dataSource, queryManager);
    }

    private static Connection createConnection(PreparedStatement mockPreparedStatement) throws SQLException {
        Connection connection = mock(Connection.class);
        when(connection.prepareStatement(anyString())).thenReturn(mockPreparedStatement);
        when(connection.createBlob()).thenReturn(mock(Blob.class));
        return connection;
    }

    private static DashboardMetadata createDashboardMetadata() {
        DashboardMetadata dashboardMetadata = new DashboardMetadata();
        dashboardMetadata.setContent(new DashboardMetadataContent());
        return dashboardMetadata;
    }
}
