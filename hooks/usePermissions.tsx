import React from 'react';
import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { useBPState } from './useBPState';

export type Permission =
  | 'view_room'
  | 'edit_bp_state'
  | 'manage_room'
  | 'delete_room'
  | 'transfer_ownership'
  | 'invite_users'
  | 'remove_participants';

export interface RolePermissions {
  owner: Permission[];
  participant: Permission[];
  anonymous: Permission[];
}

export const rolePermissions: RolePermissions = {
  owner: [
    'view_room',
    'edit_bp_state',
    'manage_room',
    'delete_room',
    'transfer_ownership',
    'invite_users',
    'remove_participants'
  ],
  participant: [
    'view_room',
    'invite_users'
  ],
  anonymous: [
    'view_room'
  ]
};

export interface PermissionResult {
  hasPermission: boolean;
  role: 'owner' | 'participant' | 'anonymous' | null;
  permissions: Permission[];
  canEdit: boolean;
  canManageRoom: boolean;
  canDeleteRoom: boolean;
  canInviteUsers: boolean;
  canRemoveParticipants: boolean;
}

export const usePermissions = (roomId?: string): PermissionResult => {
  const { user, isConfigured } = useAuth();
  const { isOwner, isOnlineMode, canEdit } = useBPState(roomId);

  const permissions = useMemo(() => {
    // 如果不是在线模式，返回匿名用户权限
    if (!isOnlineMode || !roomId) {
      return {
        hasPermission: true,
        role: 'anonymous' as const,
        permissions: rolePermissions.anonymous,
        canEdit: true, // 本地模式总是可编辑
        canManageRoom: false,
        canDeleteRoom: false,
        canInviteUsers: false,
        canRemoveParticipants: false
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
        canDeleteRoom: false,
        canInviteUsers: false,
        canRemoveParticipants: false
      };
    }

    // 根据用户角色确定权限
    let userRole: 'owner' | 'participant' = 'participant';
    let userPermissions = rolePermissions.participant;

    if (isOwner) {
      userRole = 'owner';
      userPermissions = rolePermissions.owner;
    }

    return {
      hasPermission: true,
      role: userRole,
      permissions: userPermissions,
      canEdit: canEdit, // 来自useBPState的权限检查
      canManageRoom: userRole === 'owner',
      canDeleteRoom: userRole === 'owner',
      canInviteUsers: userRole === 'owner' || userRole === 'participant',
      canRemoveParticipants: userRole === 'owner'
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