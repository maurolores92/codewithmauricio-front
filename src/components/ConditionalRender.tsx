import React, { ReactNode } from 'react'
import { usePermission } from 'src/hooks/usePermission'

interface ConditionalRenderProps {
  children: ReactNode
  permission?: string
  permissions?: string[]
  requireAll?: boolean
  fallback?: ReactNode
}

/**
 * Conditionally render content based on permissions
 * 
 * Single permission:
 * <ConditionalRender permission="create-users">
 *   <button>Create User</button>
 * </ConditionalRender>
 * 
 * Multiple permissions (OR logic):
 * <ConditionalRender permissions={['create-users', 'edit-users']}>
 *   <button>Manage Users</button>
 * </ConditionalRender>
 * 
 * Multiple permissions (AND logic):
 * <ConditionalRender 
 *   permissions={['view-users', 'edit-users']} 
 *   requireAll
 * >
 *   <button>Edit User</button>
 * </ConditionalRender>
 */
const ConditionalRender: React.FC<ConditionalRenderProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission()

  let hasAccess = false

  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (permissions) {
    if (requireAll) {
      hasAccess = hasAllPermissions(permissions)
    } else {
      hasAccess = hasAnyPermission(permissions)
    }
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

export default ConditionalRender
