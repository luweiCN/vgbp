import React from 'react';
import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { useBPState } from './useBPState';

export type Permission =
  | 'view_room'
  | 'edit_bp_state'
  | 'manage_room'
  | 'delete_room'
  | 'transfer_ownership';

export interface RolePermissions {
  owner: Permission[];
  anonymous: Permission[];
}

export const rolePermissions: RolePermissions = {
  owner: [
    'view_room',
    'edit_bp_state',
    'manage_room',
    'delete_room',
    'transfer_ownership'
  ],
  anonymous: ['view_room'] // 未登录用户也能查看所有房间
};

export interface PermissionResult {
  hasPermission: boolean;
  role: 'owner' | 'anonymous' | null;
  permissions: Permission[];
  canEdit: boolean;
  canManageRoom: boolean;
  canDeleteRoom: boolean;
}

export const usePermissions = (roomId?: string): PermissionResult => {
  const { user, isConfigured } = useAuth();
  const { isOwner, isOnlineMode, canEdit } = useBPState(roomId, undefined);

  const permissions = useMemo(() => {
    // 如果不是在线模式，返回匿名用户权限
    if (!isOnlineMode || !roomId) {
      return {
        hasPermission: true,
        role: 'anonymous' as const,
        permissions: rolePermissions.anonymous,
        canEdit: true, // 本地模式总是可编辑
        canManageRoom: false,
        canDeleteRoom: false
      };
    }

    // 如果没有认证用户，返回匿名用户权限
    if (!user || !isConfigured) {
      return {
        hasPermission: true,
        role: 'anonymous' as const,
        permissions: rolePermissions.anonymous,
        canEdit: false,
        canManageRoom: false,
        canDeleteRoom: false
      };
    }

    // 根据用户角色确定权限（只有owner和anonymous两种角色）
    if (isOwner) {
      return {
        hasPermission: true,
        role: 'owner' as const,
        permissions: rolePermissions.owner,
        canEdit: canEdit, // 来自useBPState的权限检查
        canManageRoom: true,
        canDeleteRoom: true
      };
    }

    // 非owner用户都是匿名权限（只能查看）
    return {
      hasPermission: true,
      role: 'anonymous' as const,
      permissions: rolePermissions.anonymous,
      canEdit: false,
      canManageRoom: false,
      canDeleteRoom: false
    };
  }, [user, isConfigured, roomId, isOnlineMode, isOwner, canEdit]);

  return permissions;
};

// 便捷的权限检查函数
export const usePermissionCheck = (roomId?: string) => {
  const permissions = usePermissions(roomId);

  return {
    can: (permission: Permission) => permissions.permissions.includes(permission),
    cannot: (permission: Permission) => !permissions.permissions.includes(permission),
    ...permissions
  };
};

// 权限检查高阶组件
export const withPermissionCheck = (
  permission: Permission,
  fallback?: React.ReactNode
) => {
  return (WrappedComponent: React.ComponentType<any>) => {
    return (props: any) => {
      const { can } = usePermissionCheck(props.roomId);

      if (!can(permission)) {
        return fallback || null;
      }

      return <WrappedComponent {...props} />;
    };
  };
};