// ** Type import
import { HorizontalNavItemsType, NavGroup, NavLink } from 'src/@core/layouts/types'
import { PermissionType } from 'src/context/types'

export type HNavItemWithPermission =
  | (NavLink & { requiredPermission?: string })
  | (Omit<NavGroup, 'children'> & {
      requiredPermission?: string
      children?: HNavItemWithPermission[]
    })

const navigationData = (): HNavItemWithPermission[] => {
  return [
    {
      title: 'Dashboards',
      icon: 'tabler:smart-home',
      path: '/dashboards',
      requiredPermission: 'view-dashboard'
    },
    {
      title: 'Kanban',
      icon: 'mdi:view-kanban-outline',
      path: '/kanban',
      requiredPermission: 'view-boards'
    },
    {
      title: 'Configuración',
      icon: 'tabler:settings',
      requiredPermission: 'view-settings',
      children: [
        {
          title: 'Roles',
          icon: 'tabler:shield-lock',
          path: '/settings/roles',
          requiredPermission: 'view-roles'
        },
        {
          title: 'Usuarios',
          icon: 'tabler:users',
          path: '/settings/users',
          requiredPermission: 'view-users'
        },
        {
          title: 'Permisos',
          icon: 'fluent-mdl2:permissions',
          path: '/settings/permissions',
          requiredPermission: 'view-permissions'
        }
      ]
    }
  ]
}

/**
 * Filter horizontal navigation items based on user permissions
 * @param permissions User permissions array
 * @returns Filtered navigation items
 */
export const filterHorizontalNavigationByPermissions = (permissions?: PermissionType[]): HorizontalNavItemsType => {
  if (!permissions || permissions.length === 0) {
    return []
  }

  const permissionSlugs = permissions.map(p => p.slug)
  const data = navigationData()

  const filterItems = (items: HNavItemWithPermission[]): HorizontalNavItemsType => {
    return items
      .filter(item => {
        if (item.requiredPermission && !permissionSlugs.includes(item.requiredPermission)) {
          return false
        }

        return true
      })
      .map(item => {
        if ('children' in item && Array.isArray(item.children)) {
          return {
            ...item,
            children: filterItems(item.children as HNavItemWithPermission[])
          }
        }

        return item
      })
  }

  return filterItems(data)
}

const navigation = (): HorizontalNavItemsType => {
  return navigationData()
}

export default navigation
