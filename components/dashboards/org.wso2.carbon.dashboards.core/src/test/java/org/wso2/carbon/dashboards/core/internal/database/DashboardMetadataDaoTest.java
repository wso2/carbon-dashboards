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

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.stream.Stream;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

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
}
