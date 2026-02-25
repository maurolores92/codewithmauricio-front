import { useAuth } from './useAuth'
import { PermissionType } from 'src/context/types'

export const usePermission = () => {
  const auth = useAuth()

  const hasPermission = (slug: string): boolean => {
    if (!auth.user?.permissions) return false
    
    return auth.user.permissions.some(p => p.slug === slug)
  }

  const hasAnyPermission = (slugs: string[]): boolean => {
    if (!auth.user?.permissions) return false

    return slugs.some(slug => auth.user!.permissions!.some(p => p.slug === slug))
  }

  const hasAllPermissions = (slugs: string[]): boolean => {
    if (!auth.user?.permissions) return false

    return slugs.every(slug => auth.user!.permissions!.some(p => p.slug === slug))
  }

  const getPermissionsByType = (type: 'page' | 'component' | 'action'): PermissionType[] => {
    if (!auth.user?.permissions) return []

    return auth.user.permissions.filter(p => p.type === type)
  }

  const getPagePermissions = (): PermissionType[] => {
    return getPermissionsByType('page')
  }

  const getComponentPermissions = (): PermissionType[] => {
    return getPermissionsByType('component')
  }

  const getActionPermissions = (): PermissionType[] => {
    return getPermissionsByType('action')
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getPermissionsByType,
    getPagePermissions,
    getComponentPermissions,
    getActionPermissions,
    permissions: auth.user?.permissions || []
  }
}
