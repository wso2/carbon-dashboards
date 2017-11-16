package org.wso2.carbon.dashboards.core.internal;

import org.wso2.carbon.analytics.permissions.PermissionProvider;
import org.wso2.carbon.analytics.permissions.bean.Permission;
import org.wso2.carbon.analytics.permissions.bean.Role;
import org.wso2.carbon.analytics.permissions.exceptions.PermissionException;

import java.util.ArrayList;
import java.util.List;

/**
 * Mock permission provider class.
 */
public class MockPermissionProvider implements PermissionProvider {
    @Override
    public void addPermission(Permission permission) throws PermissionException {
        // TODO: 11/16/17 Need to implement in-memory permission store.
    }

    @Override
    public void deletePermission(Permission permission) throws PermissionException {
        // TODO: 11/16/17 Need to implement in-memory permission store.
    }

    @Override
    public void grantPermission(Permission permission, Role role) throws PermissionException {
        // TODO: 11/16/17 Need to implement in-memory permission store.
    }

    @Override
    public void revokePermission(Permission permission) throws PermissionException {
        // TODO: 11/16/17 Need to implement in-memory permission store.
    }

    @Override
    public void revokePermission(Permission permission, Role role) throws PermissionException {
        // TODO: 11/16/17 Need to implement in-memory permission store.
    }

    @Override
    public boolean hasPermission(String s, Permission permission) throws PermissionException {
        // TODO: 11/16/17 Need to implement in-memory permission store.
        return false;
    }

    @Override
    public List<Role> getGrantedRoles(Permission permission) throws PermissionException {
        // TODO: 11/16/17 Need to implement in-memory permission store.
        return new ArrayList<>();
    }
}
