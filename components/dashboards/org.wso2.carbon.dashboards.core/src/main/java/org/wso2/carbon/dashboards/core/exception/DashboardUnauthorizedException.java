package org.wso2.carbon.dashboards.core.exception;

/**
 * Indicates an unauthorized exception occurred in dashboard.
 */
public class DashboardUnauthorizedException extends DashboardException {
    /**
     * Constructs a new exception with {@code null} as its detail message. The cause is not initialized, and may
     * subsequently be initialized by a call to {@link #initCause(Throwable)}.
     */
    public DashboardUnauthorizedException() {
    }

    /**
     * Constructs a new exception with the specified detail message. The cause is not initialized, and may subsequently
     * be initialized by a call to {@link #initCause}.
     *
     * @param message the detail message of the exception
     */
    public DashboardUnauthorizedException(String message) {
        super(message);
    }

    /**
     * Constructs a new exception with the specified cause and a detail message of {@code (cause==null ? null :
     * cause.toString())} which typically contains the class and detail message of the {@code cause}.
     *
     * @param cause the cause of the exception
     */
    public DashboardUnauthorizedException(Throwable cause) {
        super(cause);
    }

    /**
     * Constructs a new exception with the specified detail message and cause.
     *
     * @param message the detail message of the exception
     * @param cause   the cause of the exception
     */
    public DashboardUnauthorizedException(String message, Throwable cause) {
        super(message, cause);
    }
}
