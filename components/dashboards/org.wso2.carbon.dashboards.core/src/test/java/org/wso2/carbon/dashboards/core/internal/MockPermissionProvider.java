package org.wso2.carbon.dashboards.core.internal;

import org.wso2.carbon.analytics.permissions.PermissionProvider;
import org.wso2.carbon.analytics.permissions.bean.Permission;
import org.wso2.carbon.analytics.permissions.bean.PermissionString;
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
    public String addPermissionAPI(Permission permission) throws PermissionException {
        // TODO: 11/16/17 Need to implement in-memory permission store.
        return new String();
    }

    @Override
    public void deletePermission(Permission permission) throws PermissionException {
        // TODO: 11/16/17 Need to implement in-memory permission store.
    }

    @Override
    public void deletePermission(String permissionID) throws PermissionException {
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
    public void revokePermission(String permissionID) throws PermissionException {
        // TODO: 11/16/17 Need to implement in-memory permission store.
    }

    @Override
    public void revokePermission(Permission permission, Role role) throws PermissionException {
        // TODO: 11/16/17 Need to implement in-memory permission store.
    }

    @Override
    public void revokePermission(Permission permission, String roleID) throws PermissionException {
        // TODO: 11/16/17 Need to implement in-memory permission store.
    }

    @Override
    public boolean hasPermission(String s, Permission permission) throws PermissionException {
        // TODO: 11/16/17 Need to implement in-memory permission store.
        return false;
    }

    @Override
    public boolean hasPermission(String s, String permissionID) throws PermissionException {
        // TODO: 11/16/17 Need to implement in-memory permission store.
        return false;
    }

    @Override
    public List<Role> getGrantedRoles(Permission permission) throws PermissionException {
        // TODO: 11/16/17 Need to implement in-memory permission store.
        return new ArrayList<>();
    }

    @Override
    public List<Role> getGrantedRoles(String permissionID) throws PermissionException {
        // TODO: 11/16/17 Need to implement in-memory permission store.
        return new ArrayList<>();
    }

    @Override
    public boolean isPermissionExists(Permission permission) throws PermissionException {
        // TODO: 12/8/17 Need to implement in-memory permission store.
        return false;
    }

    @Override
    public List<PermissionString> getPermissionStrings(String appName) {
        // TODO: 12/8/17 Need to implement in-memory permission store.
        return new ArrayList<>();
    }
}

